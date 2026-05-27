import { useMemo, useState } from "react";
import { CalendarDays, Trash2, CalendarRange, AlertTriangle, Clock, ChevronDown, ChevronUp, ClipboardX } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { Button } from "../components/ui/button";
import { useDocumentStore } from "../store/documentStore";
import { documentLabels } from "../types";
import { construirAgenda, agruparPorFecha, formatearFechaDisplay } from "../lib/schedule";

const TYPE_COLORS: Record<string, string> = {
  investigado: "bg-blue-100 text-blue-700",
  testigo: "bg-emerald-100 text-emerald-700",
  notificacion: "bg-amber-100 text-amber-700",
};

export default function AgendaPage() {
  const { history, deleteHistory } = useDocumentStore();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [fechaAbierta, setFechaAbierta] = useState<string | null>(null);
  const [confirmarLimpieza, setConfirmarLimpieza] = useState(false);

  const agenda = useMemo(() => construirAgenda(history), [history]);

  const filtrada = useMemo(() => {
    if (filtroTipo === "todos") return agenda;
    return agenda.filter((i) => i.type === filtroTipo);
  }, [agenda, filtroTipo]);

  const agrupada = useMemo(() => agruparPorFecha(filtrada), [filtrada]);

  const fechas = useMemo(() => {
    const keys = Array.from(agrupada.keys());
    keys.sort((a, b) => {
      const itemA = agrupada.get(a)?.[0];
      const itemB = agrupada.get(b)?.[0];
      if (!itemA || !itemB) return 0;
      if (itemA.timestamp === 0 && itemB.timestamp === 0) return a.localeCompare(b);
      if (itemA.timestamp === 0) return 1;
      if (itemB.timestamp === 0) return -1;
      return itemA.timestamp - itemB.timestamp;
    });
    return keys;
  }, [agrupada]);

  const stats = useMemo(() => {
    const total = agenda.length;
    const conFechaValida = agenda.filter((i) => i.timestamp > 0).length;
    const sinFecha = total - conFechaValida;
    return { total, conFechaValida, sinFecha };
  }, [agenda]);

  const toggleFecha = (fecha: string) => {
    setFechaAbierta((prev) => (prev === fecha ? null : fecha));
  };

  const handleClearAllHistory = () => {
    for (const item of history) {
      deleteHistory(item.id);
    }
    setConfirmarLimpieza(false);
  };

  return (
    <>
      <Navbar />
      <main className="lg:flex">
        <Sidebar />
        <section className="min-h-[calc(100vh-70px)] flex-1 bg-paper p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-police">Agenda de citas</h1>
              <p className="mt-1 text-slate-600">Control y visualización de todas las citaciones programadas.</p>
            </div>
            <div className="flex gap-2">
              {confirmarLimpieza ? (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <span className="text-sm text-red-700">¿Eliminar todo el historial?</span>
                  <Button variant="danger" className="h-8 px-3 text-xs" onClick={handleClearAllHistory}>
                    Confirmar
                  </Button>
                  <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => setConfirmarLimpieza(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmarLimpieza(true)} disabled={history.length === 0}>
                  <ClipboardX className="h-4 w-4" /> Limpiar historial
                </Button>
              )}
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total citas</p>
                <p className="mt-0.5 text-xl font-black text-slate-950">{stats.total}</p>
              </div>
              <CalendarDays className="h-5 w-5 text-police" />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Con fecha válida</p>
                <p className="mt-0.5 text-xl font-black text-emerald-600">{stats.conFechaValida}</p>
              </div>
              <CalendarRange className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sin fecha válida</p>
                <p className="mt-0.5 text-xl font-black text-amber-600">{stats.sinFecha}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <div className="mb-4">
            <select
              className="field w-auto"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="investigado">Citación Investigado</option>
              <option value="testigo">Citación Testigo</option>
              <option value="notificacion">Notificación</option>
            </select>
          </div>

          {fechas.length === 0 ? (
            <div className="rounded-lg border bg-white p-10 text-center shadow-sm">
              <CalendarDays className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-lg font-bold text-slate-500">No hay citas programadas</p>
              <p className="mt-1 text-sm text-slate-400">Los documentos generados aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fechas.map((fecha) => {
                const items = agrupada.get(fecha) ?? [];
                const abierta = fechaAbierta === fecha;
                const fechaDisplay = formatearFechaDisplay(fecha);
                const esFechaValida = items.some((i) => i.timestamp > 0);

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
                          <p className="font-black text-police">
                            {esFechaValida ? fechaDisplay : fecha}
                          </p>
                          <p className="text-xs text-slate-500">
                            {items.length} cita{items.length !== 1 ? "s" : ""} programada{items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {abierta ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </button>

                    {abierta && (
                      <div className="border-t">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                            <tr>
                              <th className="px-4 py-2">Hora</th>
                              <th className="px-4 py-2">Tipo</th>
                              <th className="px-4 py-2">N°</th>
                              <th className="px-4 py-2">Nombre</th>
                              <th className="px-4 py-2">Delito</th>
                              <th className="px-4 py-2">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={`${item.id}-${idx}`} className="border-t">
                                <td className="px-4 py-2">
                                  {item.timestamp > 0 ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                                      <Clock className="h-3.5 w-3.5" /> {item.hora}
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 text-xs">Sin hora válida</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${TYPE_COLORS[item.type] ?? "bg-slate-100 text-slate-600"}`}>
                                    {item.esCitado ? "Citado" : documentLabels[item.type]}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-bold">{item.numero}</td>
                                <td className="px-4 py-2">{item.nombre}</td>
                                <td className="px-4 py-2 text-slate-500 text-xs">{item.delito}</td>
                                <td className="px-4 py-2">
                                  <Button
                                    type="button"
                                    variant="danger"
                                    className="h-8 w-8 px-0"
                                    onClick={() => deleteHistory(item.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
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
        </section>
      </main>
    </>
  );
}
