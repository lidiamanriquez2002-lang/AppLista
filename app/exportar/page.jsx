"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase, hoyISO } from "../../lib/supabase";
import SelectorCurso from "../../components/SelectorCurso";
import PageHeader from "../../components/PageHeader";

export default function Exportar() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(hoyISO());
  const [generando, setGenerando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    supabase.from("cursos").select("*").order("nombre")
      .then(({ data }) => setCursos(data || []));
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 1);
    setDesde(inicio.toLocaleDateString("en-CA"));
  }, []);

  async function generarExcel() {
    if (!cursoId) return;
    setGenerando(true);
    setExito(false);

    const curso = cursos.find((c) => c.id === cursoId);
    const { data: ests } = await supabase.from("estudiantes").select("*")
      .eq("curso_id", cursoId).order("apellido").order("nombre");
    const { data: profData } = await supabase.from("profesor").select("*").limit(1);
    const prof = profData?.[0] || null;

    const ids = (ests || []).map((e) => e.id);
    let registros = [];
    if (ids.length > 0) {
      let q = supabase.from("asistencia")
        .select("estudiante_id, fecha, estado").in("estudiante_id", ids).order("fecha");
      if (desde) q = q.gte("fecha", desde);
      if (hasta) q = q.lte("fecha", hasta);
      const { data } = await q;
      registros = data || [];
    }

    const fechas = [...new Set(registros.map((r) => r.fecha))].sort();

    const filas = (ests || []).map((e, i) => {
      const fila = { "N°": i + 1, Apellido: e.apellido, Nombre: e.nombre };
      let presentes = 0, ausentes = 0;
      fechas.forEach((f) => {
        const r = registros.find((x) => x.estudiante_id === e.id && x.fecha === f);
        if (!r) fila[f] = "";
        else if (r.estado === "presente") { fila[f] = "P"; presentes++; }
        else { fila[f] = "A"; ausentes++; }
      });
      const total = presentes + ausentes;
      fila["Presentes"] = presentes;
      fila["Ausentes"] = ausentes;
      fila["% Asistencia"] = total ? Math.round((presentes / total) * 100) + "%" : "";
      return fila;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filas);
    ws["!cols"] = [
      { wch: 4 }, { wch: 16 }, { wch: 16 },
      ...fechas.map(() => ({ wch: 11 })),
      { wch: 10 }, { wch: 9 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");

    const wsLista = XLSX.utils.json_to_sheet(
      (ests || []).map((e, i) => ({ "N°": i + 1, Apellido: e.apellido, Nombre: e.nombre }))
    );
    wsLista["!cols"] = [{ wch: 4 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsLista, "Estudiantes");

    // Hoja 3: datos del profesor (si están completados en el Panel)
    if (prof && (prof.nombre || "").trim() !== "") {
      const wsProf = XLSX.utils.aoa_to_sheet([
        ["Datos del profesor", ""],
        ["Nombre", prof.nombre || ""],
        ["Asignatura", prof.asignatura || ""],
        ["Establecimiento", prof.establecimiento || ""],
        ["Correo", prof.correo || ""],
        ["Teléfono", prof.telefono || ""],
        ["", ""],
        ["Curso exportado", curso?.nombre || ""],
        ["Rango", `${desde || "inicio"} a ${hasta || "hoy"}`],
        ["Fecha de exportación", hoyISO()]
      ]);
      wsProf["!cols"] = [{ wch: 22 }, { wch: 34 }];
      XLSX.utils.book_append_sheet(wb, wsProf, "Profesor");
    }

    XLSX.writeFile(
      wb,
      `Asistencia_${(curso?.nombre || "curso").replace(/\s+/g, "_")}_${hoyISO()}.xlsx`
    );
    setGenerando(false);
    setExito(true);
    setTimeout(() => setExito(false), 4000);
  }

  const inputCls =
    "w-full rounded-xl2 border border-line bg-white px-4 py-3 text-[15px] font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

  return (
    <div>
      <PageHeader
        emoji="📥"
        kicker="Reportes"
        title="Exportar a Excel"
        subtitle="Nómina + asistencia por fecha, totales y %"
      />

      <div className="space-y-5 rounded-xl3 border border-line bg-white p-5 shadow-soft">
        <SelectorCurso cursos={cursos} value={cursoId} onChange={setCursoId} />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
              Desde
            </span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
              Hasta
            </span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
          </label>
        </div>

        <button
          onClick={generarExcel}
          disabled={generando || !cursoId}
          className="grad-ok w-full rounded-xl2 py-4 text-lg font-extrabold text-white shadow-ok transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          {generando ? "Generando…" : "⬇ Descargar Excel"}
        </button>

        {!cursoId && (
          <p className="text-center text-xs font-semibold text-inksoft">
            Selecciona un curso para habilitar la descarga
          </p>
        )}
        {exito && (
          <p className="fade-in rounded-xl2 bg-okbg p-3 text-center text-sm font-extrabold text-okdeep">
            ✓ Archivo descargado
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
          <p className="text-lg" aria-hidden>🗓️</p>
          <p className="mt-1 text-sm font-extrabold">Hoja Asistencia</p>
          <p className="mt-0.5 text-xs font-medium text-inksoft">
            Una columna por fecha (P/A), totales y % por estudiante.
          </p>
        </div>
        <div className="rounded-xl2 border border-line bg-white p-4 shadow-soft">
          <p className="text-lg" aria-hidden>🧑‍🎓</p>
          <p className="mt-1 text-sm font-extrabold">Hoja Estudiantes</p>
          <p className="mt-0.5 text-xs font-medium text-inksoft">
            La nómina completa del curso, numerada y ordenada.
          </p>
        </div>
      </div>
    </div>
  );
}
