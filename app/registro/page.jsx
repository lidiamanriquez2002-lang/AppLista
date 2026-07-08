"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase, hoyISO } from "../../lib/supabase";
import SelectorCurso from "../../components/SelectorCurso";
import PageHeader from "../../components/PageHeader";

export default function Registro() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    supabase.from("cursos").select("*").order("nombre")
      .then(({ data }) => setCursos(data || []));
  }, []);

  useEffect(() => {
    if (!cursoId) { setEstudiantes([]); setRegistros([]); return; }
    setCargando(true);
    (async () => {
      const { data: ests } = await supabase.from("estudiantes").select("*")
        .eq("curso_id", cursoId).order("apellido").order("nombre");
      const ids = (ests || []).map((e) => e.id);
      let regs = [];
      if (ids.length > 0) {
        const { data } = await supabase.from("asistencia")
          .select("estudiante_id, fecha, estado")
          .in("estudiante_id", ids).order("fecha");
        regs = data || [];
      }
      setEstudiantes(ests || []);
      setRegistros(regs);
      setCargando(false);
    })();
  }, [cursoId]);

  const fechas = [...new Set(registros.map((r) => r.fecha))].sort();
  const curso = cursos.find((c) => c.id === cursoId);

  function estadoDe(estId, fecha) {
    const r = registros.find((x) => x.estudiante_id === estId && x.fecha === fecha);
    return r ? r.estado : null;
  }

  function pctDe(estId) {
    const propios = registros.filter((r) => r.estudiante_id === estId);
    if (propios.length === 0) return null;
    const p = propios.filter((r) => r.estado === "presente").length;
    return Math.round((p / propios.length) * 100);
  }

  function fechaCorta(f) {
    const d = new Date(f + "T12:00:00");
    return {
      dia: d.toLocaleDateString("es-CL", { day: "2-digit" }),
      mes: d.toLocaleDateString("es-CL", { month: "short" }).replace(".", "")
    };
  }

  function descargarExcel() {
    if (!cursoId) return;
    const filas = estudiantes.map((e, i) => {
      const fila = { "N°": i + 1, "Nombre y Apellidos": `${e.nombre} ${e.apellido}` };
      fechas.forEach((f) => {
        const est = estadoDe(e.id, f);
        fila[f] = est === "presente" ? "✓" : est === "ausente" ? "✗" : "";
      });
      const pct = pctDe(e.id);
      fila["% Asistencia"] = pct === null ? "" : pct + "%";
      return fila;
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filas);
    ws["!cols"] = [
      { wch: 4 }, { wch: 28 },
      ...fechas.map(() => ({ wch: 11 })),
      { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Registro");
    XLSX.writeFile(
      wb,
      `Registro_${(curso?.nombre || "curso").replace(/\s+/g, "_")}_${hoyISO()}.xlsx`
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          emoji="📋"
          kicker="Libro de clases"
          title="Registro"
          subtitle="Planilla completa de asistencia del curso"
        />
        {cursoId && estudiantes.length > 0 && (
          <button
            onClick={descargarExcel}
            className="grad-ok mt-1 flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-extrabold text-white shadow-ok transition active:scale-95"
            title="Descargar Excel"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4v10" /><path d="M8 10l4 4 4-4" /><path d="M4 19h16" />
            </svg>
            Excel
          </button>
        )}
      </div>

      <SelectorCurso cursos={cursos} value={cursoId} onChange={setCursoId} />

      {cargando && (
        <p className="mt-12 text-center text-sm font-semibold text-inksoft">
          Cargando registro…
        </p>
      )}

      {cursoId && !cargando && estudiantes.length === 0 && (
        <div className="mt-8 rounded-xl3 border border-dashed border-line bg-white p-8 text-center">
          <p className="text-3xl" aria-hidden>🧑‍🎓</p>
          <p className="mt-2 font-extrabold">Este curso no tiene estudiantes</p>
        </div>
      )}

      {cursoId && !cargando && estudiantes.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-xl3 border border-line bg-white shadow-soft fade-in">
          {/* Encabezado de la planilla */}
          <div className="grad-primary flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-white">
            <div>
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] opacity-85">
                Registro de asistencia
              </p>
              <p className="text-lg font-extrabold leading-tight">{curso?.nombre}</p>
            </div>
            <div className="text-right text-[11px] font-bold opacity-90">
              <p>{estudiantes.length} estudiantes</p>
              <p>{fechas.length} {fechas.length === 1 ? "clase" : "clases"}</p>
            </div>
          </div>

          {fechas.length === 0 ? (
            <p className="p-8 text-center text-sm font-medium text-inksoft">
              Aún no hay asistencia registrada. Pasa la primera lista en la pestaña <b>Lista</b>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-paper">
                    <th className="sticky left-0 z-10 w-9 border-b border-r border-line bg-paper px-2 py-2.5 text-[10.5px] font-extrabold uppercase text-inksoft">
                      N°
                    </th>
                    <th className="sticky left-9 z-10 min-w-[150px] border-b border-r-2 border-line bg-paper px-3 py-2.5 text-left text-[10.5px] font-extrabold uppercase text-inksoft">
                      Nombre y apellidos
                    </th>
                    {fechas.map((f) => {
                      const fc = fechaCorta(f);
                      const esHoy = f === hoyISO();
                      return (
                        <th key={f}
                          className={`min-w-[46px] border-b border-r border-line px-1 py-1.5 text-center ${
                            esHoy ? "bg-primary/10" : ""
                          }`}>
                          <span className={`block text-[13px] font-extrabold leading-none ${
                            esHoy ? "text-primary" : "text-ink"
                          }`}>
                            {fc.dia}
                          </span>
                          <span className="block text-[9.5px] font-bold uppercase text-inksoft">
                            {fc.mes}
                          </span>
                        </th>
                      );
                    })}
                    <th className="min-w-[52px] border-b border-line px-2 py-2.5 text-[10.5px] font-extrabold uppercase text-inksoft">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((e, i) => {
                    const pct = pctDe(e.id);
                    return (
                      <tr key={e.id} className={i % 2 === 1 ? "bg-paper/50" : "bg-white"}>
                        <td className="sticky left-0 z-10 border-b border-r border-line bg-inherit px-2 py-2 text-center text-[11px] font-extrabold text-inksoft"
                          style={{ backgroundColor: i % 2 === 1 ? "#F9FAFE" : "#FFFFFF" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="sticky left-9 z-10 whitespace-nowrap border-b border-r-2 border-line px-3 py-2 font-bold"
                          style={{ backgroundColor: i % 2 === 1 ? "#F9FAFE" : "#FFFFFF" }}>
                          {e.nombre} {e.apellido}
                        </td>
                        {fechas.map((f) => {
                          const est = estadoDe(e.id, f);
                          return (
                            <td key={f} className="border-b border-r border-line px-1 py-2 text-center">
                              {est === "presente" ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-okbg text-[13px] font-extrabold text-okdeep">
                                  ✓
                                </span>
                              ) : est === "ausente" ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-badbg text-[13px] font-extrabold text-bad">
                                  ✗
                                </span>
                              ) : (
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-line" />
                              )}
                            </td>
                          );
                        })}
                        <td className="border-b border-line px-2 py-2 text-center">
                          <span className={`text-[12px] font-extrabold ${
                            pct === null ? "text-inksoft"
                            : pct >= 85 ? "text-okdeep"
                            : pct >= 60 ? "text-amber"
                            : "text-bad"
                          }`}>
                            {pct === null ? "—" : `${pct}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Leyenda */}
          <div className="flex items-center gap-4 border-t border-line bg-paper/60 px-5 py-3 text-[11px] font-bold text-inksoft">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-okbg text-[11px] font-extrabold text-okdeep">✓</span>
              Presente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-badbg text-[11px] font-extrabold text-bad">✗</span>
              Ausente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-line" />
              Sin registro
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
