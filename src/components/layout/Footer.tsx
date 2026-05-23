import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { documents } from "../../constants";

export default function Footer() {
  return (
    <footer className="bg-navy px-4 py-10 text-white md:px-10 lg:px-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <h2 className="text-base font-extrabold">DEPDICC – Iquitos</h2>
          </div>
          <p className="text-sm leading-5 text-white/60">
            Sistema de gestión de citaciones y notificaciones.<br />
            Policía Nacional del Perú.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/70">Documentos</h3>
          {documents.map(({ label, href }) => (
            <Link key={href} to={href} className="mb-1.5 block text-sm text-white/60 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/70">Sistema</h3>
          <Link to="/historial" className="mb-1.5 block text-sm text-white/60 hover:text-white">Historial</Link>
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-white/50">
        © 2026 DEPDICC – Iquitos | PNP · Todos los derechos reservados
      </div>
    </footer>
  );
}
