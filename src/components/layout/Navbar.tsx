import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <nav className="flex h-[70px] items-center justify-between px-4 md:px-6 lg:px-20">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-police text-white">
            <Shield className="h-7 w-7" />
          </div>
          <div className="hidden h-10 w-px bg-slate-300 sm:block" />
          <div>
            <p className="truncate text-sm font-extrabold text-police sm:text-base">
              Citaciones y Notificaciones
            </p>
            <p className="text-xs font-medium text-slate-500">DEPDICC - Iquitos</p>
          </div>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-police" : "hover:text-police")}>Inicio</NavLink>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? "text-police" : "hover:text-police")}>Historial</NavLink>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? "text-police" : "hover:text-police")}>Agenda</NavLink>
        </div>
        <div className="flex items-center gap-2">
          <button className="lg:hidden" onClick={() => setOpen(v => !v)} aria-label="Abrir menú">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t bg-white px-4 py-3 lg:hidden">
          {[["Inicio", "/"], ["Historial", "/historial"], ["Agenda", "/agenda"]].map(([label, href]) => (
            <Link key={href} to={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
