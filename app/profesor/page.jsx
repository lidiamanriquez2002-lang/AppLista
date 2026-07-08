"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hoyISO } from "../../lib/supabase";
import PageHeader from "../../components/PageHeader";

export default function Profesor() {
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Ficha del profesor
  const [perfil, setPerfil] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [form, setForm] = useState({
    nombre: "", correo: "", asignatura: "", establecimiento: "", telefono: ""
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cursos }, { data: ests }, { data: regs }, { data: prof }] =
        await Promise.all([
          supabase.from("cursos").select("*").order("nombre"),
          supabase.from("estudiantes").select("id, curso_id"),
          supabase.from("asistencia").select("estudiante_id, fecha, estado"),
          supabase.from("profesor").select("*").limit(1)
        ]);

      const p = prof?.[0] || null;
      setPerfil(p);
      if (p) {
        setForm({
          nombre: p.nombre || "", correo: p.correo || "",
          asignatura: p.asignatura || "", establecimiento: p.establecimiento || "",
          telefono: p.telefono || ""
        });
      }

      const hoy = hoyISO();
      const filas = (cursos || []).map((c) => {
        const idsCurso = (ests || []).filter((e) => e.curso_id === c.id).map((e) => e.id);
        const propios = (regs || []).filter((r) => idsCurso.includes(r.estudiante_id));
        const presentes = propios.filter((r) => r.estado === "presente").length;
        const total = propios.length;
        const deHoy = propios.filter((r) => r.fecha === hoy);
        const presHoy = deHoy.filter((r) => r.estado === "presente").length;
        return {
          id: c.id,
          nombre: c.nombre,
          nEstudiantes: idsCurso.length,
          pctGeneral: total ? Math.round((presentes / total) * 100) : null,
          clases: [...new Set(propios.map((r) => r.fecha))].length,
          hoy: {
            registrados: deHoy.length,
            presentes: presHoy,
            ausentes: deHoy.length - presHoy,
            completa: idsCurso.length > 0 && deHoy.length >= idsCurso.length
          }
        };
      });
      setResumen(filas);
      setCargando(false);
    })();
  }, []);

  async function guardarPerfil() {
    setGuardandoPerfil(true);
    let error;
    if (perfil?.id) {
      ({ error } = await supabase.from("profesor")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", perfil.id));
    } else {
      const res = await supabase.from("profesor").insert(form).select().single();
      error = res.error;
      if (res.data) setPerfil(res.data);
    }
    setGuardandoPerfil(false);
    if (error) {
      alert(
        "Error al guardar: " + error.message +
        "\n\n¿Ejecutaste supabase/profesor.sql en el SQL Editor?"
      );
      return;
    }
    setPerfil((p) => ({ ...(p || {}), ...form }));
    setEditandoPerfil(false);
  }

  const totalEst = resumen.reduce((a, r) => a + r.nEstudiantes, 0);
  const listasHoy = resumen.filter((r) => r.hoy.completa).length;
  const pendientes = resumen.filter((r) => !r.hoy.completa && r.nEstudiantes > 0);

  const inputCls =
    "w-full rounded-xl2 border border-line bg-white px-4 py-3 text-[15px] font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

  const tienePerfil = perfil && (perfil.nombre || "").trim() !== "";

  return (
    <div>
      <PageHeader
        emoji="🍎"
        kicker="Panel general"
        title="Profesor"
        subtitle={new Date().toLocaleDateString("es-CL", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        })}
      />

      {cargando ? (
        <p className="mt-12 text-center text-sm font-semibold text-inksoft">
          Cargando panel…
        </p>
      ) : (
        <>
          {/* Ficha del profesor */}
          <section className="mb-5 overflow-hidden rounded-xl3 border border-line bg-white shadow-soft">
            {!editandoPerfil ? (
              <div className="flex items-center gap-4 p-5">
                <div className="grad-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white shadow-primary">
                  {tienePerfil
                    ? perfil.nombre.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
                    : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  {tienePerfil ? (
                    <>
                      <p className="truncate font-extrabold">{perfil.nombre}</p>
                      <p className="truncate text-xs font-semibold text-inksoft">
                        {[perfil.asignatura, perfil.establecimiento].filter(Boolean).join(" · ") || "Sin detalles"}
                      </p>
                      {(perfil.correo || perfil.telefono) && (
                        <p className="truncate text-xs font-medium text-inksoft">
                          {[perfil.correo, perfil.telefono].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-extrabold">Completa tus datos</p>
                      <p className="text-xs font-semibold text-inksoft">
                        Aparecerán en el panel y en el Excel exportado
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setEditandoPerfil(true)}
                  className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-extrabold text-primary transition hover:border-primary/50 active:scale-95"
                >
                  {tienePerfil ? "Editar" : "Completar"}
                </button>
              </div>
            ) : (
              <div className="p-5 fade-in">
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
                  Datos del profesor
                </h2>
                <div className="mt-3 space-y-2.5">
                  <input className={inputCls} placeholder="Nombre completo *"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  <input className={inputCls} placeholder="Asignatura (ej: Matemática)"
                    value={form.asignatura}
                    onChange={(e) => setForm({ ...form, asignatura: e.target.value })} />
                  <input className={inputCls} placeholder="Establecimiento"
                    value={form.establecimiento}
                    onChange={(e) => setForm({ ...form, establecimiento: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input className={inputCls} type="email" placeholder="Correo"
                      value={form.correo}
                      onChange={(e) => setForm({ ...form, correo: e.target.value })} />
                    <input className={inputCls} type="tel" placeholder="Teléfono"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setEditandoPerfil(false)}
                    className="rounded-xl2 border border-line bg-white py-3 font-extrabold text-inksoft transition active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarPerfil}
                    disabled={guardandoPerfil || !form.nombre.trim()}
                    className="grad-primary rounded-xl2 py-3 font-extrabold text-white shadow-primary transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
                  >
                    {guardandoPerfil ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="grad-primary rounded-xl2 p-4 text-white shadow-primary">
              <p className="text-[26px] font-extrabold leading-none">{resumen.length}</p>
              <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide opacity-85">
                Cursos
              </p>
            </div>
            <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
              <p className="text-[26px] font-extrabold leading-none text-teal">{totalEst}</p>
              <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-inksoft">
                Estudiantes
              </p>
            </div>
            <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
              <p className="text-[26px] font-extrabold leading-none text-ok">
                {listasHoy}
                <span className="text-base text-inksoft">/{resumen.length}</span>
              </p>
              <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-inksoft">
                Listas hoy
              </p>
            </div>
          </div>

          {/* Recordatorio de pendientes */}
          {pendientes.length > 0 && (
            <Link
              href="/"
              className="mt-4 block rounded-xl2 border border-amber/30 bg-amberbg p-4 transition active:scale-[0.99]"
            >
              <p className="text-sm font-extrabold text-amber">
                ⏰ Tienes {pendientes.length}{" "}
                {pendientes.length === 1 ? "lista pendiente" : "listas pendientes"} hoy
              </p>
              <p className="mt-0.5 text-xs font-semibold text-inksoft">
                {pendientes.map((p) => p.nombre).join(" · ")} — toca para pasar lista
              </p>
            </Link>
          )}

          {/* Cursos */}
          <ul className="mt-5 space-y-2.5">
            {resumen.map((r) => (
              <li key={r.id} className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold">{r.nombre}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide ${
                      r.hoy.completa
                        ? "bg-okbg text-okdeep"
                        : r.hoy.registrados > 0
                        ? "bg-amberbg text-amber"
                        : "bg-paper text-inksoft"
                    }`}
                  >
                    {r.hoy.completa ? "✓ Lista pasada" : r.hoy.registrados > 0 ? "Incompleta" : "Pendiente"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-inksoft">
                  {r.nEstudiantes} estudiantes · {r.clases} clases
                  {r.hoy.registrados > 0 && (
                    <>
                      {" · hoy "}
                      <span className="text-okdeep">{r.hoy.presentes} ✓</span>{" "}
                      <span className="text-bad">{r.hoy.ausentes} ✗</span>
                    </>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="grad-ok h-full rounded-full"
                      style={{ width: `${r.pctGeneral ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-ink">
                    {r.pctGeneral === null ? "—" : `${r.pctGeneral}%`}
                  </span>
                </div>
              </li>
            ))}
            {resumen.length === 0 && (
              <li className="rounded-xl3 border border-dashed border-line bg-white p-8 text-center">
                <p className="text-3xl" aria-hidden>🏫</p>
                <p className="mt-2 font-extrabold">Sin cursos todavía</p>
                <p className="mt-1 text-sm font-medium text-inksoft">
                  Crea tu primer curso en la pestaña <b>Cursos</b>.
                </p>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
