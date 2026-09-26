import { useMemo, useState } from "react";
import {
  CalendarDays,
  Trash2,
  CalendarRange,
  Clock,
  ChevronDown,
  ChevronUp,
  ClipboardX,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileDown,
  CheckCircle2,
  History,
  Edit3,
  X,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { Button } from "../components/ui/button";
import { useDocumentStore } from "../store/documentStore";
import { documentLabels } from "../types";
import {
  construirAgenda,
  agruparPorFecha,
  formatearFechaDisplay,
  normalizarFecha,
  verificarConflictoFechaHora,
  fechaATimestamp,
  documentCategory,
} from "../lib/schedule";
import { generarWord } from "../lib/docxGenerator";

const PAGE_SIZE = 6;

const TEMPLATE_FILES: Record<string, string> = {
  a2: "https://docs.google.com/document/d/18ujh0XUk67mOSGsRgjMh1cCv7d_-Dt9MajdH4pz5H6c/edit?usp=sharing",
  a3: "https://docs.google.com/document/d/1OZyPGdB5Y_RTw7HzLTlADf3d0cqNF4iOyhW1lvKvbU0/edit?usp=sharing",
  a4: "https://docs.google.com/document/d/1f-14cUs9rdJkP1gEyQcDvhNm3Bzj0-2xwSrY3IZlHa8/edit?usp=sharing",
  a5: "https://docs.google.com/document/d/1OVz0yXmbRGb3CIz069BTmJ5SJ8ti430mg7-76DnNxRs/edit?usp=sharing",
};

const TYPE_COLORS: Record<string, string> = {
  a2: "bg-blue-100 text-blue-700 border border-blue-200",
  a3: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  a4: "bg-amber-100 text-amber-700 border border-amber-200",
  a5: "bg-rose-100 text-rose-700 border border-rose-200",
  investigado: "bg-slate-100 text-slate-700",
  testigo: "bg-slate-100 text-slate-700",
  notificacion: "bg-slate-100 text-slate-700",
};

export default function AgendaPage() {
  const { history, deleteHistory, updateHistory, storageError, clearStorageError } = useDocumentStore();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<"vigentes" | "todas" | "pasadas">("vigentes");
  const [fechaAbierta, setFechaAbierta] = useState<string | null>(null);
  const [confirmarLimpieza, setConfirmarLimpieza] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estado para modal de edición
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ numero: "", nombre: "", fecha: "", hora: "", cf: "" });
  const [editError, setEditError] = useState<string | null>(null);

  // Construir agenda completa
  const agendaCompleta = useMemo(() => construirAgenda(history), [history]);

  // Aplicar filtro de estado (Vigentes vs Todas vs Pasadas)
  const agendaFiltradaPorEstado = useMemo(() => {
    if (filtroEstado === "vigentes") {
      return agendaCompleta.filter((item) => !item.esPasada);
    }
    if (filtroEstado === "pasadas") {
      return agendaCompleta.filter((item) => item.esPasada);
    }
    return agendaCompleta;
  }, [agendaCompleta, filtroEstado]);

  // Aplicar filtro por tipo de documento
  const filtrada = useMemo(() => {
    if (filtroTipo === "todos") return agendaFiltradaPorEstado;
    return agendaFiltradaPorEstado.filter((i) => i.type === filtroTipo);
  }, [agendaFiltradaPorEstado, filtroTipo]);

  const agrupada = useMemo(() => agruparPorFecha(filtrada), [filtrada]);

  // Orden cronológico estricto de las fechas de agenda (de más próxima a futura)
  const fechas = useMemo(() => {
    const keys = Array.from(agrupada.keys());
    keys.sort((a, b) => {
      const tsA = fechaATimestamp(normalizarFecha(a), "00:00");
      const tsB = fechaATimestamp(normalizarFecha(b), "00:00");
      if (tsA === 0 && tsB === 0) return a.localeCompare(b);
      if (tsA === 0) return 1;
      if (tsB === 0) return -1;
      return tsA - tsB;
    });
    return keys;
  }, [agrupada]);

  const handleOpenEdit = (itemId: string) => {
    const item = history.find((h) => h.id === itemId);
    if (!item) return;
    const payload = (item.payload || {}) as any;
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
      cf: payload.cf || "",
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
        cf: editForm.cf.trim(),
      } as any);

    setEditingItem(null);
  };

  const totalPages = Math.max(1, Math.ceil(fechas.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageFechas = fechas.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const stats = useMemo(() => {
    const total = agendaCompleta.length;
    const vigentes = agendaCompleta.filter((i) => !i.esPasada).length;
    const pasadas = agendaCompleta.filter((i) => i.esPasada).length;
    return { total, vigentes, pasadas };
  }, [agendaCompleta]);

  const toggleFecha = (fecha: string) => {
    setFechaAbierta((prev) => (prev === fecha ? null : fecha));
  };

  const handleClearAllHistory = () => {
    for (const item of history) {
      deleteHistory(item.id);
    }
    setConfirmarLimpieza(false);
  };

  const handleDescargarWordItem = async (itemId: string) => {
    const registro = history.find((h) => h.id === itemId);
    if (!registro) return;
    try {
      await generarWord(registro.type, registro.payload);
    } catch (e) {
      alert("Error descargando Word: " + (e as Error).message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="lg:flex">
        <Sidebar />
        <section className="min-h-[calc(100vh-70px)] flex-1 bg-paper p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-police">Agenda y Programación</h1>
              <p className="mt-1 text-slate-600">
                Control de diligencias programadas con filtrado automático en tiempo real.
              </p>
            </div>
            <div className="flex gap-2">
              {confirmarLimpieza ? (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <span className="text-sm text-red-700">¿Eliminar todo el registro?</span>
                  <Button variant="danger" className="h-8 px-3 text-xs" onClick={handleClearAllHistory}>
                    Confirmar
                  </Button>
                  <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => setConfirmarLimpieza(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmarLimpieza(true)} disabled={history.length === 0}>
                  <ClipboardX className="h-4 w-4" /> Limpiar Todo
                </Button>
              )}
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div
              onClick={() => setFiltroEstado("vigentes")}
              className={`cursor-pointer flex items-center justify-between rounded-lg border p-4 shadow-sm transition ${
                filtroEstado === "vigentes" ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Vigentes / Pendientes</p>
                <p className="mt-0.5 text-2xl font-black text-emerald-800">{stats.vigentes}</p>
                <p className="text-[11px] text-slate-500">Por atender (hora no vencida)</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div
              onClick={() => setFiltroEstado("pasadas")}
              className={`cursor-pointer flex items-center justify-between rounded-lg border p-4 shadow-sm transition ${
                filtroEstado === "pasadas" ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500/20" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Concluidas / Pasadas</p>
                <p className="mt-0.5 text-2xl font-black text-amber-800">{stats.pasadas}</p>
                <p className="text-[11px] text-slate-500">Hora programada ya transcurrió</p>
              </div>
              <History className="h-6 w-6 text-amber-600" />
            </div>

            <div
              onClick={() => setFiltroEstado("todas")}
              className={`cursor-pointer flex items-center justify-between rounded-lg border p-4 shadow-sm transition ${
                filtroEstado === "todas" ? "bg-blue-50 border-blue-400 ring-2 ring-blue-500/20" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-police">Total Registradas</p>
                <p className="mt-0.5 text-2xl font-black text-slate-950">{stats.total}</p>
                <p className="text-[11px] text-slate-500">Historial global de citaciones</p>
              </div>
              <CalendarRange className="h-6 w-6 text-police" />
            </div>
          </div>

          {/* Filtros de visualización */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Mostrar:</span>
              <div className="flex rounded-md border bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  onClick={() => setFiltroEstado("vigentes")}
                  className={`rounded px-3 py-1.5 transition ${
                    filtroEstado === "vigentes" ? "bg-white text-police shadow-sm" : "text-slate-600 hover:text-police"
                  }`}
                >
                  🟢 Vigentes ({stats.vigentes})
                </button>
                <button
                  onClick={() => setFiltroEstado("todas")}
                  className={`rounded px-3 py-1.5 transition ${
                    filtroEstado === "todas" ? "bg-white text-police shadow-sm" : "text-slate-600 hover:text-police"
                  }`}
                >
                  📋 Todas ({stats.total})
                </button>
                <button
                  onClick={() => setFiltroEstado("pasadas")}
                  className={`rounded px-3 py-1.5 transition ${
                    filtroEstado === "pasadas" ? "bg-white text-police shadow-sm" : "text-slate-600 hover:text-police"
                  }`}
                >
                  ⏳ Concluidas ({stats.pasadas})
                </button>
              </div>
            </div>

            <select
              className="field w-auto text-xs font-semibold py-1.5"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los documentos</option>
              <option value="a2">A2 - Citación Flagrancia</option>
              <option value="a3">A3 - Citación Carpeta Fiscal</option>
              <option value="a4">A4 - Notif. Flagrante Delito</option>
              <option value="a5">A5 - Notif. Carpeta Fiscal</option>
            </select>
          </div>

          {/* Listado de fechas */}
          {fechas.length === 0 ? (
            <div className="rounded-lg border bg-white p-10 text-center shadow-sm">
              <CalendarDays className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-lg font-bold text-slate-600">
                {filtroEstado === "vigentes"
                  ? "No hay citas pendientes por atender"
                  : "No hay citas en este filtro"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {filtroEstado === "vigentes"
                  ? "Las citas cuya hora ya transcurrió se ocultan automáticamente. Puedes verlas en 'Todas' o 'Concluidas'."
                  : "Los documentos emitidos aparecerán aquí automáticamente."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pageFechas.map((fecha) => {
                const items = agrupada.get(fecha) ?? [];
                const abierta = fechaAbierta === fecha;
                const fechaDisplay = formatearFechaDisplay(fecha);
                const citasVigentesEnFecha = items.filter((i) => !i.esPasada).length;

                return (
                  <div key={fecha} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <button
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
                      onClick={() => toggleFecha(fecha)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-police text-white">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-police text-base">{fechaDisplay}</p>
                          <p className="text-xs text-slate-500">
                            {items.length} diligencia{items.length !== 1 ? "s" : ""} programada{items.length !== 1 ? "s" : ""}{" "}
                            {citasVigentesEnFecha > 0 && (
                              <span className="ml-1 inline-block rounded bg-emerald-100 px-1.5 py-0.2 text-[11px] font-bold text-emerald-800">
                                {citasVigentesEnFecha} pendiente{citasVigentesEnFecha !== 1 ? "s" : ""}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {abierta ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {abierta && (
                      <div className="border-t overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                            <tr>
                              <th className="px-4 py-2.5">Categoría</th>
                              <th className="px-4 py-2.5">Hora</th>
                              <th className="px-4 py-2.5">Estado</th>
                              <th className="px-4 py-2.5">Tipo</th>
                              <th className="px-4 py-2.5">N°</th>
                              <th className="px-4 py-2.5">Nombre / Citado</th>
                              <th className="px-4 py-2.5">C.F.</th>
                              <th className="px-4 py-2.5 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr
                                key={`${item.id}-${idx}`}
                                className={`border-t transition hover:bg-slate-50 ${item.esPasada ? "bg-slate-50/60 opacity-85" : ""}`}
                              >
                                <td className="px-4 py-2.5 font-semibold text-police">{documentCategory[item.type] || "—"}</td>
                                <td className="px-4 py-2.5">
                                  <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                                    <Clock className="h-3.5 w-3.5 text-police" /> {item.hora || "Sin hora"}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  {item.esPasada ? (
                                    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                      Concluida
                                    </span>
                                  ) : (
                                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                      Pendiente
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${TYPE_COLORS[item.type] ?? "bg-slate-100 text-slate-600"}`}>
                                    {documentLabels[item.type] || item.type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-bold text-police">{item.numero}</td>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">{item.nombre}</td>
                                <td className="px-4 py-2.5 text-slate-600 text-xs">{item.cf || "—"}</td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="h-8 px-2 text-xs border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                      title="Editar diligencia"
                                      onClick={() => handleOpenEdit(item.id)}
                                    >
                                      <Edit3 className="h-3.5 w-3.5" /> Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="h-8 px-2 text-xs border border-blue-200 text-blue-700 hover:bg-blue-50"
                                      title="Descargar en Word (.docx)"
                                      onClick={() => handleDescargarWordItem(item.id)}
                                    >
                                      <FileDown className="h-3.5 w-3.5" /> Word
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="danger"
                                      className="h-8 w-8 px-0"
                                      title="Eliminar de la agenda"
                                      onClick={() => deleteHistory(item.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal de edición de diligencia en Agenda */}
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
                      <h3 className="text-lg font-black text-slate-900">Editar diligencia programada</h3>
                      <p className="text-xs font-bold text-police">
                        {(documentLabels as Record<string, string>)[editingItem.type] || String(editingItem.type).toUpperCase()}
                      </p>
                    </div>
                    <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-slate-800">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">
                    Modifica los datos de la diligencia y abre la plantilla en el navegador para editarla.
                  </p>
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
                    <div>
                      <label className="label">C.F.</label>
                      <input
                        className="field"
                        value={editForm.cf}
                        onChange={(e) => setEditForm({ ...editForm, cf: e.target.value })}
                        placeholder="Ej: Carpeta Fiscal N° 123-2025"
                      />
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
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{storageError}</span>
              <Button variant="ghost" className="ml-auto h-8 px-3 text-xs" onClick={clearStorageError}>
                Cerrar
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Página {safePage} de {totalPages} — {fechas.length} fecha{fechas.length !== 1 ? "s" : ""}
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
