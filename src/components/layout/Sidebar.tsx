import { NavLink, Link, useLocation } from "react-router-dom";
import { documents } from "../../constants";
import { CalendarDays, ClipboardList, Home, FileEdit } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const mainNavItems = [
    { key: "inicio", label: "Inicio / Plantillas", href: "/", icon: Home },
    { key: "agenda", label: "Agenda y Programación", href: "/agenda", icon: CalendarDays },
    { key: "historial", label: "Historial de Emisiones", href: "/historial", icon: ClipboardList },
  ];

  return (
    <aside className="w-full border-r bg-navy p-4 text-white lg:min-h-[calc(100vh-70px)] lg:w-72 shrink-0">
      <div className="mb-6 rounded-md border border-white/10 bg-white/10 p-4">
        <p className="text-xs font-bold uppercase text-white/60">Panel documental</p>
        <p className="mt-1 text-lg font-extrabold">DEPDICC Iquitos</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-white/50">Navegación</p>
          <nav className="grid gap-1.5">
            {mainNavItems.map(({ key, label, href, icon: Icon }) => (
              <NavLink
                key={key}
                to={href}
                end={href === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    isActive ? "bg-white text-police shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">Edición de Documentos</p>
            <FileEdit className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="px-3 pb-2 text-[11px] text-white/60">
            Selecciona una plantilla para registrar o editar en línea:
          </p>
          <nav className="grid gap-1.5">
            {documents.map(({ key, label, icon: Icon }) => {
              const isActive =
                location.pathname === "/" &&
                new URLSearchParams(location.search).get("doc") === key;
              return (
                <Link
                  key={key}
                  to={`/?doc=${key}`}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-action text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}

