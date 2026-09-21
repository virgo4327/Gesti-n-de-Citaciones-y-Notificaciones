import { FilePlus2, History, ShieldCheck, FileText, CalendarDays, AlertTriangle, X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useDocumentStore } from "../../store/documentStore";
import { normalizarFecha, verificarConflictoFechaHora } from "../../lib/schedule";
import type { DocumentType } from "../../types";

const TEMPLATE_FILES: Record<string, string> = {
  a2: "https://docs.google.com/document/d/18ujh0XUk67mOSGsRgjMh1cCv7d_-Dt9MajdH4pz5H6c/edit?usp=sharing",
  a3: "https://docs.google.com/document/d/1OZyPGdB5Y_RTw7HzLTlADf3d0cqNF4iOyhW1lvKvbU0/edit?usp=sharing",
  a4: "https://docs.google.com/document/d/1f-14cUs9rdJkP1gEyQcDvhNm3Bzj0-2xwSrY3IZlHa8/edit?usp=sharing",
  a5: "https://docs.google.com/document/d/1OVz0yXmbRGb3CIz069BTmJ5SJ8ti430mg7-76DnNxRs/edit?usp=sharing",
};

const DOCUMENT_CARDS = [
  {
    key: "a2" as DocumentType,
    label: "A2 - Citación Flagrancia",
    description: "Citación a víctima, testigo, perito, depositario u otro en caso de flagrancia.",
    color: "blue",
    file: TEMPLATE_FILES.a2,
  },
  {
    key: "a3" as DocumentType,
    label: "A3 - Citación Carpeta Fiscal",
    description: "Citación a víctima, testigo, perito, depositario u otro por Carpeta Fiscal.",
    color: "emerald",
    file: TEMPLATE_FILES.a3,
  },
  {
    key: "a4" as DocumentType,
    label: "A4 - Notif. Flagrante Delito",
    description: "Notificación policial a denunciado por flagrante delito.",
    color: "amber",
    file: TEMPLATE_FILES.a4,
  },
  {
    key: "a5" as DocumentType,
    label: "A5 - Notif. Carpeta Fiscal",
    description: "Notificación policial a denunciado con disposición fiscal a folios.",
    color: "rose",
    file: TEMPLATE_FILES.a5,
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  amber: "bg-amber-600",
  rose: "bg-rose-600",
};

export default function OperationalDashboard() {
  const { history, addHistory, storageError } = useDocumentStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openType, setOpenType] = useState<DocumentType | null>(null);
  const [form, setForm] = useState({ numero: "", nombre: "", fecha: "", hora: "" });
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  // Escuchar parámetros de búsqueda para abrir el formulario desde el panel izquierdo (Sidebar)
  useEffect(() => {
    const doc = searchParams.get("doc");
    if (doc && ["a2", "a3", "a4", "a5"].includes(doc)) {
      setOpenType(doc as DocumentType);
      setError(null);
    }
  }, [searchParams]);

  const stats = [
    { label: "Sistema", value: "Operativo" },
    { label: "Registrados", value: String(history.length) },
  ];

  const handleCloseModal = () => {
    setOpenType(null);
    setError(null);
    if (searchParams.get("doc")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("doc");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleOpenTemplate = async () => {
    if (!openType) return;
    setError(null);

    if (!form.numero.trim() || !form.nombre.trim() || !form.fecha.trim() || !form.hora.trim()) {
      setError("Complete número, nombre, fecha y hora de la diligencia.");
      return;
    }

    // Validación estricta de duplicados por fecha y hora
    const conflicto = verificarConflictoFechaHora(form.fecha, form.hora, history);
    if (conflicto.existe) {
      setError(conflicto.mensaje || "Ya existe una diligencia programada en la misma fecha y hora. No se permiten duplicados.");
      return;
    }

    setOpening(true);
    try {
      addHistory(openType, {
        numero: form.numero.trim(),
        nombre: form.nombre.trim(),
        fechaDiligencia: normalizarFecha(form.fecha),
        horaDiligencia: form.hora.trim(),
      } as any);

      window.open(TEMPLATE_FILES[openType], "_blank", "noopener,noreferrer");

      setForm({ numero: "", nombre: "", fecha: "", hora: "" });
      handleCloseModal();
    } catch (e: any) {
      setError(e?.message || "Error al registrar la diligencia.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <section className="bg-slate-100 px-4 py-5 md:px-8 lg:px-10 min-h-[calc(100vh-70px)]">
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
              <p className="mt-1 text-sm text-slate-600">Seleccione una plantilla para registrar y abrir en el navegador.</p>
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
          <p className="mt-1 text-sm text-slate-600">Al hacer clic se abre el formulario de registro y luego el documento en el navegador.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {DOCUMENT_CARDS.map((doc) => (
              <button
                key={doc.key}
                onClick={() => {
                  setOpenType(doc.key);
                  setError(null);
                }}
                className="group rounded-lg border border-slate-200 p-5 text-left transition hover:border-police hover:shadow-md"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md text-white ${COLOR_MAP[doc.color]}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-900">{doc.label}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-600">{doc.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-action group-hover:gap-2 transition-all">
                  Registrar y abrir <FilePlus2 className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <AnimatePresence>
        {openType && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Registrar diligencia y abrir plantilla</h3>
                <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">Complete los datos para registrar la diligencia y abrir la plantilla.</p>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {storageError && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{storageError}</span>
                </div>
              )}
              <div className="grid gap-3">
                <div>
                  <label className="label">Número</label>
                  <input
                    className="field"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    placeholder="Ej: 001"
                  />
                </div>
                <div>
                  <label className="label">Nombre / Citado</label>
                  <input
                    className="field"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: JUAN CARLOS PÉREZ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Fecha</label>
                    <input
                      type="date"
                      className="field"
                      value={form.fecha}
                      onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Hora</label>
                    <input
                      type="time"
                      className="field"
                      value={form.hora}
                      onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-bold text-police hover:underline"
                  onClick={() => window.open(TEMPLATE_FILES[openType], "_blank", "noopener,noreferrer")}
                >
                  Abrir plantilla directa <ExternalLink className="h-3 w-3" />
                </button>
                <div className="flex gap-2">
                  <Button variant="secondary" className="border border-slate-200" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleOpenTemplate} disabled={opening}>
                    {opening ? "Abriendo..." : "Registrar y abrir"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
