import { FilePlus2, History, ShieldCheck, FileText, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

const TEMPLATE_FILES: Record<string, string> = {
  a2: "https://docs.google.com/document/d/18ujh0XUk67mOSGsRgjMh1cCv7d_-Dt9MajdH4pz5H6c/edit?usp=sharing",
  a3: "https://docs.google.com/document/d/1OZyPGdB5Y_RTw7HzLTlADf3d0cqNF4iOyhW1lvKvbU0/edit?usp=sharing",
  a4: "https://docs.google.com/document/d/1f-14cUs9rdJkP1gEyQcDvhNm3Bzj0-2xwSrY3IZlHa8/edit?usp=sharing",
  a5: "https://docs.google.com/document/d/1OVz0yXmbRGb3CIz069BTmJ5SJ8ti430mg7-76DnNxRs/edit?usp=sharing",
};

const DOCUMENT_CARDS = [
  {
    label: "A2 - Citación Flagrancia",
    description: "Citación a víctima, testigo, perito, depositario u otro en caso de flagrancia.",
    color: "blue",
    file: TEMPLATE_FILES.a2,
  },
  {
    label: "A3 - Citación Carpeta Fiscal",
    description: "Citación a víctima, testigo, perito, depositario u otro por Carpeta Fiscal.",
    color: "emerald",
    file: TEMPLATE_FILES.a3,
  },
  {
    label: "A4 - Notif. Flagrante Delito",
    description: "Notificación policial a denunciado por flagrante delito.",
    color: "amber",
    file: TEMPLATE_FILES.a4,
  },
  {
    label: "A5 - Notif. Carpeta Fiscal",
    description: "Notificación policial a denunciado con disposición fiscal a folios.",
    color: "rose",
    file: TEMPLATE_FILES.a5,
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-600",
  rose: "bg-rose-600",
};

export default function OperationalDashboard() {
  const stats = [
    { label: "Sistema", value: "Operativo" },
  ];

  const abrirPlantilla = (file: string) => {
    window.open(file, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="bg-slate-100 px-4 py-5 md:px-8 lg:px-10">
      <section className="mx-auto max-w-6xl space-y-4">
        <motion.div
          className="rounded-lg border bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-action">DEPDICC – Iquitos</p>
              <h1 className="mt-1 text-2xl font-black text-police md:text-3xl">Gestión de Citaciones y Notificaciones</h1>
              <p className="mt-1 text-sm text-slate-600">Seleccione una plantilla para descargar el documento Word, editarlo y guardarlo en su equipo.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/historial">
                <Button variant="secondary" className="border border-slate-200">
                  <History className="h-4 w-4" /> Historial
                </Button>
              </Link>
              <Link to="/agenda">
                <Button variant="secondary" className="border border-slate-200">
                  <CalendarDays className="h-4 w-4" /> Agenda
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                <p className="mt-0.5 text-xl font-black text-slate-950">{s.value}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-police" />
            </div>
          ))}
        </div>

        <section className="scroll-mt-28 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-police">Plantillas oficiales</h2>
          <p className="mt-1 text-sm text-slate-600">Al hacer clic se descarga el documento Word para editar y guardar desde su equipo.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {DOCUMENT_CARDS.map((doc) => (
              <button
                key={doc.label}
                onClick={() => abrirPlantilla(doc.file)}
                className="group rounded-lg border border-slate-200 p-5 text-left transition hover:border-police hover:shadow-md"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md text-white ${COLOR_MAP[doc.color]}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-900">{doc.label}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-600">{doc.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-action group-hover:gap-2 transition-all">
                  Descargar plantilla <FilePlus2 className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
