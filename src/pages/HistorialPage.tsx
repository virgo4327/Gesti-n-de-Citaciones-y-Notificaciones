import { Download, Search, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Edit3, X, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactDOM from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { Button } from "../components/ui/button";
import { useDocumentStore } from "../store/documentStore";
import { documentLabels } from "../types";
import { normalizarFecha, verificarConflictoFechaHora } from "../lib/schedule";
import DocumentPreview from "../components/preview/DocumentPreview";

const PAGE_SIZE = 20;

const TEMPLATE_FILES: Record<string, string> = {
  a2: "https://docs.google.com/document/d/18ujh0XUk67mOSGsRgjMh1cCv7d_-Dt9MajdH4pz5H6c/edit?usp=sharing",
  a3: "https://docs.google.com/document/d/1OZyPGdB5Y_RTw7HzLTlADf3d0cqNF4iOyhW1lvKvbU0/edit?usp=sharing",
  a4: "https://docs.google.com/document/d/1f-14cUs9rdJkP1gEyQcDvhNm3Bzj0-2xwSrY3IZlHa8/edit?usp=sharing",
  a5: "https://docs.google.com/document/d/1OVz0yXmbRGb3CIz069BTmJ5SJ8ti430mg7-76DnNxRs/edit?usp=sharing",
};

export default function HistorialPage() {
  const { history, deleteHistory, updateHistory, storageError, clearStorageError } = useDocumentStore();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<"cronologico-desc" | "cronologico-asc" | "numero">("cronologico-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Estado para modal de edición
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ numero: "", nombre: "", fecha: "", hora: "" });
  const [editError, setEditError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return history
      .filter((item) => {
        const matchesQuery = `${item.numero} ${item.nombre}`.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "todos" || item.type === typeFilter;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        const numA = parseInt((a.numero || "0").replace(/[^\d]/g, ""), 10);
        const numB = parseInt((b.numero || "0").replace(/[^\d]/g, ""), 10);
        return numA - numB;
      });
  }, [history, query, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDownloadPdfFromHistory = async (item: any) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.height = "1123px";
    container.style.overflow = "visible";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<DocumentPreview type={item.type} data={item.payload} />);

    await new Promise((r) => setTimeout(r, 800));

    const element = container.querySelector(".docx-preview-container") as HTMLElement | null;
    if (!element) {
      alert("No se encontró el documento para generar el PDF.");
      root.unmount();
      document.body.removeChild(container);
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      root.unmount();
      document.body.removeChild(container);

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${item.numero}-${item.type}.pdf`);
    } catch (e) {
      root.unmount();
      document.body.removeChild(container);
      alert("Error generando PDF: " + (e as Error).message);
    }
  };

  const handleOpenEdit = (item: any) => {
    const payload = item.payload || {};
    let fechaVal = payload.fechaDiligencia || payload.fecha || "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaVal)) {
      const [dd, mm, aaaa] = fechaVal.split("/");
      fechaVal = `${aaaa}-${mm}-${dd}`;
    }
    setEditForm({
      numero: item.numero || payload.numero || "",
      nombre: item.nombre || payload.nombre || "",
      fecha: fechaVal,
      hora: payload.horaDiligencia || payload.hora || "",
    });
    setEditError(null);
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setEditError(null);

    if (!editForm.numero.trim() || !editForm.nombre.trim() || !editForm.fecha.trim() || !editForm.hora.trim()) {
      setEditError("Complete número, nombre, fecha y hora de la diligencia.");
      return;
    }

    const conflicto = verificarConflictoFechaHora(editForm.fecha, editForm.hora, history, editingItem.id);
    if (conflicto.existe) {
      setEditError(conflicto.mensaje || "Ya existe una diligencia programada en la misma fecha y hora.");
      return;
    }

    updateHistory(editingItem.id, {
      numero: editForm.numero.trim(),
      nombre: editForm.nombre.trim(),
      fechaDiligencia: normalizarFecha(editForm.fecha),
      horaDiligencia: editForm.hora.trim(),
    });

    setEditingItem(null);
  };

  const obtenerFechaHora = (item: any) => {
    const payload = item.payload || {};
    const fecha = payload.fechaDiligencia || payload.fecha || "";
    const hora = payload.horaDiligencia || payload.hora || "";
    return { fecha, hora };
  };

  return (
    <>
      <Navbar />
      <main className="lg:flex">
        <Sidebar />
        <section className="min-h-[calc(100vh-70px)] flex-1 bg-paper p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-police">Historial de Emisiones</h1>
            <p className="mt-1 text-slate-600">Documentos generados y registrados localmente en tu sistema.</p>
          </div>

          <div className="mb-5 grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px]">
            <label className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                className="field pl-10"
                placeholder="Buscar por número o nombre de citado/denunciado..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="field"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="cronologico-desc">📅 Cronológico (Más recientes)</option>
              <option value="cronologico-asc">📅 Cronológico (Más antiguos)</option>
              <option value="numero">🔢 Por Número (N°)</option>
            </select>
            <select
              className="field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="todos">Todos los documentos</option>
              <option value="a2">A2 - Citación Flagrancia</option>
              <option value="a3">A3 - Citación Carpeta Fiscal</option>
              <option value="a4">A4 - Notif. Flagrante Delito</option>
              <option value="a5">A5 - Notif. Carpeta Fiscal</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-police text-white">
                <tr>
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Nombre / Citado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const { fecha, hora } = obtenerFechaHora(item);
                  return (
                    <tr key={item.id} className="border-t hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-police">{item.numero}</td>
                      <td className="px-4 py-3 font-semibold">{documentLabels[item.type] || item.type.toUpperCase()}</td>
                      <td className="px-4 py-3">{item.nombre}</td>
                      <td className="px-4 py-3">{fecha || "—"}</td>
                      <td className="px-4 py-3">{hora || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-8 px-2 text-xs border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            title="Editar diligencia"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Editar
                          </Button>
                          <Button
                            type="button"
                            className="h-8 px-2 text-xs bg-blue-700 hover:bg-blue-800 text-white"
                            onClick={() => handleDownloadPdfFromHistory(item)}
                          >
                            <Download className="h-3.5 w-3.5" /> PDF
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="h-8 w-8 px-0"
                            onClick={() => deleteHistory(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No hay documentos registrados en el historial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de edición de documento */}
          <AnimatePresence>
            {editingItem && (
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
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Editar diligencia</h3>
                      <p className="text-xs font-bold text-police">{(documentLabels as Record<string, string>)[editingItem.type] || String(editingItem.type).toUpperCase()}</p>
                    </div>
                    <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-slate-800">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">Modifica los datos del registro y abre la plantilla para edición.</p>
                  {editError && (
                    <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}
                  <div className="grid gap-3">
                    <div>
                      <label className="label">Número</label>
                      <input
                        className="field"
                        value={editForm.numero}
                        onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
                        placeholder="Ej: 001"
                      />
                    </div>
                    <div>
                      <label className="label">Nombre / Citado</label>
                      <input
                        className="field"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        placeholder="Ej: JUAN CARLOS PÉREZ"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Fecha</label>
                        <input
                          type="date"
                          className="field"
                          value={editForm.fecha}
                          onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Hora</label>
                        <input
                          type="time"
                          className="field"
                          value={editForm.hora}
                          onChange={(e) => setEditForm({ ...editForm, hora: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    {TEMPLATE_FILES[editingItem.type as string] && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-bold text-police hover:underline"
                        onClick={() => window.open(TEMPLATE_FILES[editingItem.type as string], "_blank", "noopener,noreferrer")}
                      >
                        Abrir plantilla online <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Button variant="secondary" className="border border-slate-200" onClick={() => setEditingItem(null)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEdit}>
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {storageError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{storageError}</span>
              <Button variant="ghost" className="ml-auto h-8 px-3 text-xs" onClick={clearStorageError}>
                Cerrar
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Página {safePage} de {totalPages} — {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-8 px-3"
                  disabled={safePage <= 1}
                  onClick={() => handlePageChange(safePage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="secondary"
                  className="h-8 px-3"
                  disabled={safePage >= totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
