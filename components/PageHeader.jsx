export default function PageHeader({ kicker, title, subtitle, emoji }) {
  return (
    <header className="mb-6 flex items-start gap-3.5">
      <div className="grad-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl2 text-2xl shadow-primary">
        <span aria-hidden>{emoji}</span>
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">
          {kicker}
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-[13px] font-medium text-inksoft">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
