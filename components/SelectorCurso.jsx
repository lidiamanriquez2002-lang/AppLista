"use client";

export default function SelectorCurso({ cursos, value, onChange, label = "Elige un curso" }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-inksoft">
        {label}
      </p>
      {cursos.length === 0 ? (
        <p className="rounded-xl2 border border-dashed border-line bg-white p-4 text-sm font-medium text-inksoft">
          Aún no hay cursos. Créalos en la pestaña <b>Cursos</b>.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cursos.map((c) => {
            const active = value === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onChange(active ? "" : c.id)}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                  active
                    ? "grad-primary text-white shadow-primary"
                    : "border border-line bg-white text-ink hover:border-primary/50"
                }`}
              >
                {c.nombre}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
