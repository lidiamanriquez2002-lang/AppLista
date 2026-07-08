"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SelectorCurso from "../../components/SelectorCurso";
import PageHeader from "../../components/PageHeader";

export default function Estadisticas() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    supabase.from("cursos").select("*").order("nombre")
      .then(({ data }) => setCursos(data || []));
  }, []);

  useEffect(() => {
    if (!cursoId) { setFilas([]); return; }
    setCargando(true);
    (async () => {
      const { data: ests } = await supabase.from("estudiantes").select("*")
        .eq("curso_id", cursoId).order("apellido").order("nombre");
      const ids = (ests || []).map((e) => e.id);
      let registros = [];
      if (ids.length > 0) {
        const { data } = await supabase.from("asistencia")
          .select("estudiante_id, fecha, estado").in("estudiante_id", ids).order("fecha");
        registros = data || [];
      }
      const resumen = (ests || []).map((e) => {
        const propios = registros.filter((r) => r.estudiante_id === e.id);
        const presentes = propios.filter((r) => r.estado === "presente").length;
        const ausentes = propios.filter((r) => r.estado === "ausente").length;
        const total = presentes + ausentes;
        return {
          ...e, presentes, ausentes, total,
          pct: total ? Math.round((presentes / total) * 100) : null,
          registros: propios
        };
      });
      setFilas(resumen);
      setCargando(false);
    })();
  }, [cursoId]);

  const conDatos = filas.filter((f) => f.pct !== null);
  const promedio = conDatos.length
    ? Math.round(conDatos.reduce((a, f) => a + f.pct, 0) / conDatos.length)
    : null;

  function badge(pct) {
    if (pct === null) return "bg-paper text-inksoft";
    if (pct >= 85) return "bg-okbg text-okdeep";
    if (pct >= 60) return "bg-amberbg text-amber";
    return "bg-badbg text-bad";
  }
  function barra(pct) {
    if (pct === null) return "bg-line";
    if (pct >= 85) return "grad-ok";
    if (pct >= 60) return "bg-amber";
    return "bg-bad";
  }

  return (
    <div>
      <PageHeader
        emoji="📊"
        kicker="Análisis del curso"
        title="Estadísticas"
        subtitle="Toca a un estudiante para ver su historial"
      />

      <SelectorCurso cursos={cursos} value={cursoId} onChange={setCursoId} />

      {cargando && (
        <p className="mt-12 text-center text-sm font-semibold text-inksoft">Calculando…</p>
      )}

      {!cargando && cursoId && filas.length > 0 && (
        <>
          {/* Resumen del curso */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <div className="grad-primary rounded-xl2 p-4 text-white shadow-primary">
              <p className="text-2xl font-extrabold">
                {promedio === null ? "—" : `${promedio}%`}
              </p>
              <p className="text-[10.5px] font-bold uppercase tracking-wide opacity-85">
                Promedio
              </p>
            </div>
            <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
              <p className="text-2xl font-extrabold text-ok">
                {conDatos.filter((f) => f.pct >= 85).length}
              </p>
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-inksoft">
                Sobre 85%
              </p>
            </div>
            <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
              <p className="text-2xl font-extrabold text-bad">
                {conDatos.filter((f) => f.pct < 60).length}
              </p>
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-inksoft">
                En riesgo
              </p>
            </div>
          </div>

          {/* Estudiantes */}
          <ul className="mt-5 space-y-2.5">
            {filas.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setDetalle(f)}
                  className="w-full rounded-xl2 border border-line bg-white p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-extrabold">
                        {f.nombre} {f.apellido}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-inksoft">
                        {f.presentes} ✓ · {f.ausentes} ✗ · {f.total} clases
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold ${badge(f.pct)}`}>
                      {f.pct === null ? "—" : `${f.pct}%`}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${barra(f.pct)}`}
                      style={{ width: `${f.pct ?? 0}%` }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {cursoId && !cargando && filas.length === 0 && (
        <p className="mt-12 text-center text-sm font-semibold text-inksoft">
          No hay estudiantes en este curso.
        </p>
      )}

      {/* Hoja de detalle */}
      {detalle && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setDetalle(null)}
        >
          <div
            className="modal-pop max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-xl3 bg-white shadow-card sm:rounded-xl3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grad-primary p-5 text-white">
              <h2 className="text-xl font-extrabold">
                {detalle.nombre} {detalle.apellido}
              </h2>
              <p className="text-sm font-medium opacity-90">
                Asistencia:{" "}
                {detalle.pct === null ? "sin registros" : `${detalle.pct}% (${detalle.presentes}/${detalle.total})`}
              </p>
            </div>
            <div className="p-5">
              <ul className="space-y-1.5">
                {detalle.registros.length === 0 && (
                  <li className="text-sm font-medium text-inksoft">
                    Aún no tiene registros de asistencia.
                  </li>
                )}
                {[...detalle.registros].reverse().map((r) => (
                  <li
                    key={r.fecha}
                    className="flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5 text-sm font-bold"
                  >
                    <span className="capitalize">
                      {new Date(r.fecha + "T12:00:00").toLocaleDateString("es-CL", {
                        weekday: "short", day: "numeric", month: "short"
                      })}
                    </span>
                    <span className={r.estado === "presente" ? "text-okdeep" : "text-bad"}>
                      {r.estado === "presente" ? "✓ Presente" : "✗ Ausente"}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setDetalle(null)}
                className="mt-5 w-full rounded-xl2 bg-ink py-3 font-extrabold text-white transition active:scale-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
