"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ name, className }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    "aria-hidden": true
  };
  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="3.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="3.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="3.5" cy="18" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="M8 10l4 4 4-4" />
          <path d="M4 19h16" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" />
        </svg>
      );
    default:
      return null;
  }
}

const items = [
  { href: "/", label: "Lista", icon: "check" },
  { href: "/estadisticas", label: "Stats", icon: "chart" },
  { href: "/listas", label: "Cursos", icon: "list" },
  { href: "/registro", label: "Registro", icon: "grid" },
  { href: "/exportar", label: "Excel", icon: "download" },
  { href: "/profesor", label: "Panel", icon: "user" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 inset-x-3 z-40">
      <div className="mx-auto grid max-w-lg grid-cols-6 rounded-xl3 border border-line bg-white/95 p-1.5 shadow-card backdrop-blur">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-1 rounded-xl2 py-2 text-[9.5px] font-bold transition-all ${
                active
                  ? "grad-primary text-white shadow-primary"
                  : "text-inksoft hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon name={it.icon} className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
