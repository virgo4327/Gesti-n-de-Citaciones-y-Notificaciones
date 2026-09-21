import type { HistoryItem, DocumentType } from "../types";

const fechaRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function esFechaValida(fecha?: string): boolean {
  if (!fecha) return false;
  return fechaRegex.test(fecha.trim());
}

export function esHoraValida(hora?: string): boolean {
  if (!hora) return false;
  return horaRegex.test(hora.trim());
}

export function fechaATimestamp(fecha?: string, hora?: string): number {
  if (!fecha || !hora) return 0;
  const f = fecha.trim();
  const h = hora.trim();
  if (!esFechaValida(f) || !esHoraValida(h)) return 0;
  const [dd, mm, aaaa] = f.split("/").map(Number);
  const [hh, min] = h.split(":").map(Number);
  return new Date(aaaa, mm - 1, dd, hh, min).getTime();
}

/**
 * Normaliza una fecha al formato DD/MM/YYYY.
 * Acepta tanto DD/MM/YYYY como YYYY-MM-DD (formato nativo de <input type="date">).
 */
export function normalizarFecha(fecha?: string): string {
  if (!fecha) return "";
  const f = fecha.trim();
  if (fechaRegex.test(f)) return f;
  // Convertir YYYY-MM-DD a DD/MM/YYYY
  const isoRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const match = isoRegex.exec(f);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return f;
}


/**
 * Determina si una cita ya venció en relación con la fecha y hora actual de la computadora.
 */
export function esCitaPasada(fecha: string, hora: string): boolean {
  const ts = fechaATimestamp(fecha, hora);
  if (ts === 0) return false;
  return ts < Date.now();
}

export type Conflicto = {
  tipo: "exacto" | "cercano";
  registro: HistoryItem;
  minutosDiferencia?: number;
};

export function extraerFechaHora(item: HistoryItem): { fecha: string; hora: string; delito: string; nombre: string } {
  const p = item.payload as any;
  const type = item.type;

  let fecha = "";
  let hora = "";
  let delito = "";
  let nombre = item.nombre || p.nombre || "";

  if (type === "a2" || type === "a3") {
    fecha = normalizarFecha(p.fechaDiligencia || "");
    hora = p.horaDiligencia || "";
    delito = p.modalidadDelito || "";
  } else if (type === "a4" || type === "a5") {
    fecha = normalizarFecha(p.fechaDiligencia || "");
    hora = p.horaDiligencia || "";
    delito = p.delito || "";
  } else if (type === "investigado" || type === "testigo") {
    fecha = normalizarFecha(p.fechaDiligencia || "");
    hora = p.hora || "";
    delito = p.delito || "";
  } else if (type === "notificacion") {
    if (p.citados && p.citados.length > 0) {
      fecha = normalizarFecha(p.citados[0].fecha || "");
      hora = p.citados[0].hora || "";
    }
    delito = p.delito || "";
  }

  return { fecha, hora, delito, nombre };
}

export function detectarConflictos(
  _nombre: string,
  fechaDiligencia: string,
  hora: string,
  history: HistoryItem[],
  registroExcluirId?: string
): Conflicto[] {
  const tsNuevo = fechaATimestamp(fechaDiligencia, hora);
  if (tsNuevo === 0) return [];

  const conflictos: Conflicto[] = [];

  for (const item of history) {
    if (registroExcluirId && item.id === registroExcluirId) continue;

    const { fecha, hora: horaExistente } = extraerFechaHora(item);
    if (!fecha || !horaExistente) continue;

    const tsExistente = fechaATimestamp(fecha, horaExistente);
    if (tsExistente === 0) continue;

    if (tsNuevo === tsExistente) {
      conflictos.push({ tipo: "exacto", registro: item });
    } else {
      const diffMin = Math.abs(tsNuevo - tsExistente) / 60000;
      if (diffMin <= 60) {
        conflictos.push({
          tipo: "cercano",
          registro: item,
          minutosDiferencia: Math.round(diffMin),
        });
      }
    }
  }

  return conflictos;
}

export type AgendaItem = {
  id: string;
  type: DocumentType;
  numero: string;
  nombre: string;
  fecha: string;
  hora: string;
  delito: string;
  timestamp: number;
  esPasada: boolean;
  esCitado?: boolean;
};

export function construirAgenda(history: HistoryItem[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  const now = Date.now();

  for (const item of history) {
    const { fecha, hora, delito, nombre } = extraerFechaHora(item);

    if (fecha && hora) {
      const ts = fechaATimestamp(fecha, hora);
      items.push({
        id: item.id,
        type: item.type,
        numero: item.numero,
        nombre: nombre || item.nombre,
        fecha,
        hora,
        delito,
        timestamp: ts,
        esPasada: ts > 0 ? ts < now : false,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.timestamp === 0 && b.timestamp === 0) return 0;
    if (a.timestamp === 0) return 1;
    if (b.timestamp === 0) return -1;
    return a.timestamp - b.timestamp;
  });
}

export function agruparPorFecha(items: AgendaItem[]): Map<string, AgendaItem[]> {
  const mapa = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const existente = mapa.get(item.fecha) ?? [];
    existente.push(item);
    mapa.set(item.fecha, existente);
  }
  for (const [, grupo] of mapa) {
    grupo.sort((a, b) => {
      if (a.timestamp === 0 && b.timestamp === 0) return 0;
      if (a.timestamp === 0) return 1;
      if (b.timestamp === 0) return -1;
      return a.timestamp - b.timestamp;
    });
  }
  return mapa;
}

export function formatearFechaDisplay(fecha: string): string {
  if (!esFechaValida(fecha)) return fecha;
  const [dd, mm, aaaa] = fecha.split("/").map(Number);
  const date = new Date(aaaa, mm - 1, dd);
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}
