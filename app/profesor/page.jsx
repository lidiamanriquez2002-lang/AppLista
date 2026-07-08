"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hoyISO } from "../../lib/supabase";
import PageHeader from "../../components/PageHeader";

export default function Profesor() {
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cursos } = await supabase.from("cursos").select("*").order("nombre");
      const { data: ests } = await supabase.from("estudiantes").select("id, curso_id");
      const { data: regs } = await supabase.from("asistencia")
        .select("estudiante_id, fecha, estado");
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

  const totalEst = resumen.reduce((a, r) => a + r.nEstudiantes, 0);
  const listasHoy = resumen.filter((r) => r.hoy.completa).length;
  const pendientes = resumen.filter((r) => !r.hoy.completa && r.nEstudiantes > 0);

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
