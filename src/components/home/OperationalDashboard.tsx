import {
  FilePlus2,
  History,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useDocumentStore } from "../../store/documentStore";
import { documentLabels } from "../../types";
import { moduleData } from "../../constants";

const moduleCards = moduleData.map(({ label, href, icon, color }) => ({
  title: label,
  description: label === "Citación Investigado"
    ? "Citar a imputados en investigaciones por corrupción."
    : label === "Citación Testigo"
    ? "Programar manifestación testimonial con formato oficial."
    : "Registrar diligencias con tabla de citados y horarios.",
  href,
  Icon: icon as React.ComponentType<{ className?: string }>,
  accent: color === "blue" ? "bg-blue-600" : color === "emerald" ? "bg-emerald-600" : "bg-amber-600",
}));

export default function OperationalDashboard() {
  const { history, drafts } = useDocumentStore();
  const stats = [
    { label: "Sistema",   value: "Operativo" },
    { label: "Generados", value: String(history.length) },
    { label: "Borradores",value: String(Object.keys(drafts).length) },
  ];
  const latest = history.slice(0, 3);

  return (
    <main className="bg-slate-100 px-4 py-5 md:px-8 lg:px-10">
      <section className="mx-auto max-w-6xl space-y-4">

        {/* ── Panel de título ── */}
        <motion.div
          className="rounded-lg border bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-action">
                DEPDICC – Iquitos
              </p>
              <h1 className="mt-1 text-2xl font-black text-police md:text-3xl">
                Gestión de Citaciones y Notificaciones
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Emisión rápida de documentos oficiales con historial local.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <a href="#crear">
                  <FilePlus2 className="h-4 w-4" /> Nuevo documento
                </a>
              </Button>
              <Button asChild variant="secondary" className="border border-slate-200">
                <Link to="/historial">
                  <History className="h-4 w-4" /> Historial
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                <p className="mt-0.5 text-xl font-black text-slate-950">{s.value}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-police" />
            </div>
          ))}
        </div>

        {/* ── Crear documento ── */}
        <section id="crear" className="scroll-mt-28 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-police">Crear documento</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moduleCards.map(({ title, description, href, Icon, accent }) => (
              <Link
                key={href}
                to={href}
                className="group rounded-lg border border-slate-200 p-5 transition hover:border-police hover:shadow-md"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md text-white ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-600">{description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-action group-hover:gap-2 transition-all">
                  Abrir <FilePlus2 className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Últimos documentos ── */}
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-police">Últimos documentos</h2>
            <Button asChild variant="ghost" className="h-9">
              <Link to="/historial">Ver historial</Link>
            </Button>
          </div>
          {latest.length === 0 ? (
            <p className="text-sm text-slate-500">Sin documentos generados aún.</p>
          ) : (
            <div className="grid gap-2">
              {latest.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm sm:grid-cols-[80px_1fr_180px] sm:items-center"
                >
                  <span className="font-black text-police">N° {item.numero}</span>
                  <span className="font-semibold text-slate-800">{item.nombre}</span>
                  <span className="text-slate-500">{documentLabels[item.type]}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </section>
    </main>
  );
}
