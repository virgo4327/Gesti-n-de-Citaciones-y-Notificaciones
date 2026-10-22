import { Menu, Shield, X, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDocumentStore } from "../../store/documentStore";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cloudConfigured, isSyncing, fetchFromCloud } = useDocumentStore();

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
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-police font-bold" : "hover:text-police")}>Inicio</NavLink>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? "text-police font-bold" : "hover:text-police")}>Historial</NavLink>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? "text-police font-bold" : "hover:text-police")}>Agenda</NavLink>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicador de estado de base de datos */}
          {cloudConfigured ? (
            <button
              onClick={() => fetchFromCloud()}
              title="Base de datos Supabase sincronizada. Clic para refrescar."
              className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Cloud className={`h-3.5 w-3.5 text-emerald-600 ${isSyncing ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isSyncing ? "Sincronizando…" : "Nube Conectada"}</span>
              {isSyncing && <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" />}
            </button>
          ) : (
            <div
              title="Operando en almacenamiento local (IndexedDB). Ingrese la URL de Supabase para activar la nube."
              className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200"
            >
              <CloudOff className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Modo Local</span>
            </div>
          )}

          <button className="lg:hidden p-1 text-slate-700" onClick={() => setOpen(v => !v)} aria-label="Abrir menú">
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
