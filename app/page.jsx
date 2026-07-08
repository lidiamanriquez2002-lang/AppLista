"use client";

import { useEffect, useState } from "react";
import { supabase, hoyISO } from "../lib/supabase";
import SelectorCurso from "../components/SelectorCurso";
import PageHeader from "../components/PageHeader";

function AnilloProgreso({ pct }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 84 84" className="h-24 w-24">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#E4E6F5" strokeWidth="9" />
      <circle
        cx="42" cy="42" r={r} fill="none"
        stroke="url(#gradOk)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
        transform="rotate(-90 42 42)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <defs>
        <linearGradient id="gradOk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B77F" />
          <stop offset="100%" stopColor="#0EA5C6" />
        </linearGradient>
      </defs>
      <text x="42" y="47" textAnchor="middle" className="fill-ink" fontSize="19" fontWeight="800">
        {pct}%
      </text>
    </svg>
  );
}

export default function PasarLista() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [indice, setIndice] = useState(0);
  const [marcas, setMarcas] = useState({});
  const [saliendo, setSaliendo] = useState(null);
  const [terminado, setTerminado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    supabase.from("cursos").select("*").order("nombre")
      .then(({ data }) => setCursos(data || []));
  }, []);

  useEffect(() => {
    if (!cursoId) { setEstudiantes([]); return; }
    setCargando(true);
    setIndice(0);
    setMarcas({});
    setTerminado(false);
    supabase.from("estudiantes").select("*").eq("curso_id", cursoId)
      .order("apellido").order("nombre")
      .then(({ data }) => { setEstudiantes(data || []); setCargando(false); });
  }, [cursoId]);

  const actual = estudiantes[indice];
  const total = estudiantes.length;
  const presentes = Object.values(marcas).filter((m) => m === "presente").length;
  const ausentes = Object.values(marcas).filter((m) => m === "ausente").length;
  const pctFinal = total ? Math.round((presentes / total) * 100) : 0;

  async function marcar(estado) {
    if (!actual || saliendo || guardando) return;
    setGuardando(true);
    const { error } = await supabase.from("asistencia").upsert(
      { estudiante_id: actual.id, fecha: hoyISO(), estado },
      { onConflict: "estudiante_id,fecha" }
    );
    setGuardando(false);
    if (error) { alert("Error al guardar: " + error.message); return; }

    setMarcas((m) => ({ ...m, [actual.id]: estado }));
    setSaliendo(estado === "presente" ? "ok" : "bad");
    setTimeout(() => {
      setSaliendo(null);
      if (indice + 1 >= total) setTerminado(true);
      else setIndice((i) => i + 1);
    }, 310);
  }

  function deshacer() {
    if (indice === 0 || saliendo) return;
    const anterior = estudiantes[indice - 1];
    setMarcas((m) => { const c = { ...m }; delete c[anterior.id]; return c; });
    setIndice((i) => i - 1);
  }

  return (
    <div>
      <PageHeader
        emoji="✅"
        kicker="Registro diario"
        title="Pasar lista"
        subtitle={new Date().toLocaleDateString("es-CL", {
          weekday: "long", day: "numeric", month: "long"
        })}
      />

      <SelectorCurso cursos={cursos} value={cursoId} onChange={setCursoId} />

      {cargando && (
        <p className="mt-12 text-center text-sm font-semibold text-inksoft">
          Cargando estudiantes…
        </p>
      )}

      {cursoId && !cargando && total === 0 && (
        <div className="mt-8 rounded-xl3 border border-dashed border-line bg-white p-8 text-center">
          <p className="text-3xl" aria-hidden>🧑‍🎓</p>
          <p className="mt-2 font-extrabold">Este curso no tiene estudiantes</p>
          <p className="mt-1 text-sm font-medium text-inksoft">
            Agrégalos en la pestaña <b>Cursos</b>.
          </p>
        </div>
      )}

      {actual && !terminado && (
        <section className="mt-7">
          {/* Progreso */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-extrabold text-inksoft">
                {indice + 1} de {total}
              </span>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-okbg px-2.5 py-1 text-[11px] font-extrabold text-okdeep">
                  ✓ {presentes}
                </span>
                <span className="rounded-full bg-badbg px-2.5 py-1 text-[11px] font-extrabold text-bad">
                  ✗ {ausentes}
                </span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-line">
              <div
                className="grad-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${(indice / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Mazo de tarjetas */}
          <div className="relative">
            <div className="absolute inset-x-6 -bottom-2 h-full rounded-xl3 bg-white/50 border border-line" aria-hidden />
            <div className="absolute inset-x-3 -bottom-1 h-full rounded-xl3 bg-white/80 border border-line" aria-hidden />
            <div
              key={actual.id}
              className={`relative rounded-xl3 bg-card p-8 shadow-card ${
                saliendo === "ok" ? "card-exit-ok"
                : saliendo === "bad" ? "card-exit-bad"
                : "card-enter"
              }`}
            >
              <div className="grad-primary mx-auto flex h-24 w-24 items-center justify-center rounded-full p-1 shadow-primary">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-extrabold grad-text">
                  {(actual.nombre[0] || "") + (actual.apellido[0] || "")}
                </div>
              </div>
              <h2 className="mt-5 text-center text-[26px] font-extrabold leading-snug">
                {actual.nombre}
                <br />
                <span className="text-inksoft">{actual.apellido}</span>
              </h2>
              <p className="mt-2 text-center">
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-inksoft">
                  N.º {indice + 1} de la lista
                </span>
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              onClick={() => marcar("ausente")}
              disabled={guardando || !!saliendo}
              className="rounded-xl2 border-2 border-bad/25 bg-badbg py-5 text-lg font-extrabold text-bad transition-all hover:border-bad/50 active:scale-95 disabled:opacity-50"
            >
              ✗ Ausente
            </button>
            <button
              onClick={() => marcar("presente")}
              disabled={guardando || !!saliendo}
              className="grad-ok rounded-xl2 py-5 text-lg font-extrabold text-white shadow-ok transition-all active:scale-95 disabled:opacity-50"
            >
              ✓ Presente
            </button>
          </div>

          <button
            onClick={deshacer}
            disabled={indice === 0 || !!saliendo}
            className="mx-auto mt-5 block rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-inksoft transition hover:text-ink active:scale-95 disabled:opacity-40"
          >
            ↩ Deshacer último
          </button>
        </section>
      )}

      {/* Modal fin de lista */}
      {terminado && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6 backdrop-blur-sm">
          <div className="modal-pop w-full max-w-sm overflow-hidden rounded-xl3 bg-white shadow-card">
            <div className="grad-primary p-6 text-center text-white">
              <p className="text-4xl" aria-hidden>🎉</p>
              <h2 className="mt-2 text-2xl font-extrabold">¡Lista completa!</h2>
              <p className="text-sm font-medium opacity-90">
                Terminaste de pasar la lista de hoy
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center gap-5">
                <AnilloProgreso pct={pctFinal} />
                <div className="space-y-2">
                  <p className="rounded-xl bg-okbg px-3 py-2 text-sm font-extrabold text-okdeep">
                    ✓ {presentes} presentes
                  </p>
                  <p className="rounded-xl bg-badbg px-3 py-2 text-sm font-extrabold text-bad">
                    ✗ {ausentes} ausentes
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setTerminado(false); setCursoId(""); }}
                className="grad-primary mt-6 w-full rounded-xl2 py-3.5 font-extrabold text-white shadow-primary transition active:scale-95"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
