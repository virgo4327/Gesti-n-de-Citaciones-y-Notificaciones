import { ChevronDown, FilePlus2, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { documents } from "../../constants";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden h-9 items-center justify-between bg-navy px-6 text-xs text-white md:flex lg:px-20">
        <span className="font-semibold">PNP Perú</span>
      </div>
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
          <div className="group relative py-6">
            <button className="flex items-center gap-1 hover:text-police">
              Documentos <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-16 w-64 rounded-md border bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
              {documents.map(({ label, href }) => (
                <Link key={href} to={href} className="block rounded px-3 py-2 hover:bg-slate-100">{label}</Link>
              ))}
            </div>
          </div>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? "text-police" : "hover:text-police")}>Historial</NavLink>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden lg:inline-flex">
            <a href="/#crear"><FilePlus2 className="h-4 w-4" />Nuevo documento</a>
          </Button>
          <button className="lg:hidden" onClick={() => setOpen(v => !v)} aria-label="Abrir menú">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t bg-white px-4 py-3 lg:hidden">
          {[["Inicio", "/"], ...documents.map(d => [d.label, d.href] as const), ["Historial", "/historial"]].map(([label, href]) => (
            <Link key={href} to={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
