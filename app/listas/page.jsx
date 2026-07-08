"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PageHeader from "../../components/PageHeader";

export default function Listas() {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [nuevoCurso, setNuevoCurso] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [editando, setEditando] = useState(null);
  const [editandoCurso, setEditandoCurso] = useState(null);

  async function cargarCursos() {
    const { data } = await supabase.from("cursos").select("*").order("nombre");
    setCursos(data || []);
  }
  async function cargarEstudiantes(id) {
    if (!id) return setEstudiantes([]);
    const { data } = await supabase.from("estudiantes").select("*")
      .eq("curso_id", id).order("apellido").order("nombre");
    setEstudiantes(data || []);
  }

  useEffect(() => { cargarCursos(); }, []);
  useEffect(() => { cargarEstudiantes(cursoId); }, [cursoId]);

  // ---------- Cursos ----------
  async function crearCurso() {
    const nombre = nuevoCurso.trim();
    if (!nombre) return;
    const { error } = await supabase.from("cursos").insert({ nombre });
    if (error) return alert("Error: " + error.message);
    setNuevoCurso("");
    cargarCursos();
  }
  async function guardarCurso() {
    if (!editandoCurso?.nombre.trim()) return;
    await supabase.from("cursos")
      .update({ nombre: editandoCurso.nombre.trim() }).eq("id", editandoCurso.id);
    setEditandoCurso(null);
    cargarCursos();
  }
  async function eliminarCurso(c) {
    if (!confirm(`¿Eliminar el curso "${c.nombre}"?\nSe borrarán también sus estudiantes y registros.`)) return;
    await supabase.from("cursos").delete().eq("id", c.id);
    if (cursoId === c.id) setCursoId("");
    cargarCursos();
  }

  // ---------- Estudiantes ----------
  async function agregarEstudiante() {
    const nombre = nuevoNombre.trim();
    const apellido = nuevoApellido.trim();
    if (!nombre || !cursoId) return;
    const { error } = await supabase.from("estudiantes")
      .insert({ curso_id: cursoId, nombre, apellido });
    if (error) return alert("Error: " + error.message);
    setNuevoNombre("");
    setNuevoApellido("");
    cargarEstudiantes(cursoId);
  }
  async function guardarEdicion() {
    if (!editando) return;
    await supabase.from("estudiantes").update({
      nombre: editando.nombre.trim(),
      apellido: editando.apellido.trim()
    }).eq("id", editando.id);
    setEditando(null);
    cargarEstudiantes(cursoId);
  }
  async function eliminarEstudiante(e) {
    if (!confirm(`¿Eliminar a ${e.nombre} ${e.apellido} y su historial?`)) return;
    await supabase.from("estudiantes").delete().eq("id", e.id);
    cargarEstudiantes(cursoId);
  }

  const inputCls =
    "w-full rounded-xl2 border border-line bg-white px-4 py-3 text-[15px] font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";
  const miniInput =
    "w-1/2 rounded-xl border border-line px-2.5 py-2 text-sm font-medium outline-none focus:border-primary";

  return (
    <div>
      <PageHeader
        emoji="🗂️"
        kicker="Administración"
        title="Cursos y listas"
        subtitle="Crea cursos y gestiona sus estudiantes"
      />

      {/* Cursos */}
      <section className="rounded-xl3 border border-line bg-white p-5 shadow-soft">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
          Mis cursos
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={nuevoCurso}
            onChange={(e) => setNuevoCurso(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && crearCurso()}
            placeholder="Ej: 3° Medio B"
            className={inputCls}
          />
          <button
            onClick={crearCurso}
            className="grad-primary shrink-0 rounded-xl2 px-5 text-xl font-extrabold text-white shadow-primary transition active:scale-95"
            aria-label="Crear curso"
          >
            +
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {cursos.map((c) => (
            <li
              key={c.id}
              className={`flex items-center justify-between rounded-xl2 border px-3.5 py-3 transition ${
                cursoId === c.id
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-line hover:border-primary/40"
              }`}
            >
              {editandoCurso?.id === c.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editandoCurso.nombre}
                    onChange={(ev) => setEditandoCurso({ ...editandoCurso, nombre: ev.target.value })}
                    onKeyDown={(ev) => ev.key === "Enter" && guardarCurso()}
                    className="flex-1 rounded-xl border border-line px-2.5 py-2 text-sm font-medium outline-none focus:border-primary"
                    autoFocus
                  />
                  <button onClick={guardarCurso}
                    className="rounded-xl bg-ok px-3 py-2 text-sm font-extrabold text-white active:scale-95">
                    ✓
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setCursoId(cursoId === c.id ? "" : c.id)}
                    className="flex-1 text-left font-extrabold">
                    {c.nombre}
                    {cursoId === c.id && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary">
                        seleccionado
                      </span>
                    )}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => setEditandoCurso({ id: c.id, nombre: c.nombre })}
                      className="rounded-xl px-2.5 py-1.5 text-sm font-bold text-inksoft transition hover:bg-paper" title="Renombrar">
                      ✎
                    </button>
                    <button onClick={() => eliminarCurso(c)}
                      className="rounded-xl px-2.5 py-1.5 text-sm font-bold text-bad transition hover:bg-badbg" title="Eliminar">
                      🗑
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {cursos.length === 0 && (
            <li className="rounded-xl2 border border-dashed border-line p-4 text-center text-sm font-medium text-inksoft">
              Aún no hay cursos. Crea el primero arriba ☝️
            </li>
          )}
        </ul>
      </section>

      {/* Estudiantes */}
      {cursoId && (
        <section className="mt-5 rounded-xl3 border border-line bg-white p-5 shadow-soft fade-in">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
            Estudiantes · {estudiantes.length}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre" className={inputCls} />
            <input value={nuevoApellido} onChange={(e) => setNuevoApellido(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarEstudiante()}
              placeholder="Apellido" className={inputCls} />
          </div>
          <button onClick={agregarEstudiante}
            className="mt-2.5 w-full rounded-xl2 bg-ink py-3.5 font-extrabold text-white transition active:scale-95">
            + Agregar estudiante
          </button>

          <ul className="mt-4 space-y-2">
            {estudiantes.map((e, i) => (
              <li key={e.id}
                className="flex items-center justify-between rounded-xl2 border border-line px-3.5 py-2.5 transition hover:border-primary/40">
                {editando?.id === e.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input value={editando.nombre}
                      onChange={(ev) => setEditando({ ...editando, nombre: ev.target.value })}
                      className={miniInput} autoFocus />
                    <input value={editando.apellido}
                      onChange={(ev) => setEditando({ ...editando, apellido: ev.target.value })}
                      onKeyDown={(ev) => ev.key === "Enter" && guardarEdicion()}
                      className={miniInput} />
                    <button onClick={guardarEdicion}
                      className="rounded-xl bg-ok px-3 py-2 text-sm font-extrabold text-white active:scale-95">
                      ✓
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center gap-2.5 font-bold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper text-[11px] font-extrabold text-inksoft">
                        {i + 1}
                      </span>
                      {e.nombre} {e.apellido}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditando({ id: e.id, nombre: e.nombre, apellido: e.apellido })}
                        className="rounded-xl px-2.5 py-1.5 text-sm font-bold text-inksoft transition hover:bg-paper" title="Editar">
                        ✎
                      </button>
                      <button onClick={() => eliminarEstudiante(e)}
                        className="rounded-xl px-2.5 py-1.5 text-sm font-bold text-bad transition hover:bg-badbg" title="Eliminar">
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
            {estudiantes.length === 0 && (
              <li className="rounded-xl2 border border-dashed border-line p-4 text-center text-sm font-medium text-inksoft">
                Este curso todavía no tiene estudiantes.
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
