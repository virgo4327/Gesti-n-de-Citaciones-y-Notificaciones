import type { HistoryItem, DocumentType } from "../types";

const fechaRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function esFechaValida(fecha?: string): boolean {
  if (!fecha) return false;
  const f = fecha.trim();
  return fechaRegex.test(f) || /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(f);
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

  const [hh, min] = h.split(":").map(Number);

  // Formato DD/MM/YYYY
  const ddMMyyyy = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
  const matchDDMM = ddMMyyyy.exec(f);
  if (matchDDMM) {
    const dd = Number(matchDDMM[1]);
    const mm = Number(matchDDMM[2]);
    const aaaa = Number(matchDDMM[3]);
    return new Date(aaaa, mm - 1, dd, hh, min).getTime();
  }

  // Formato YYYY-MM-DD
  const isoMatch = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(f);
  if (isoMatch) {
    const aaaa = Number(isoMatch[1]);
    const mm = Number(isoMatch[2]);
    const dd = Number(isoMatch[3]);
    return new Date(aaaa, mm - 1, dd, hh, min).getTime();
  }

  return 0;
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

export function extraerFechaHora(item: HistoryItem): { fecha: string; hora: string; delito: string; nombre: string; cf: string } {
  const p = item.payload as any;
  const type = item.type;

  let fecha = "";
  let hora = "";
  let delito = "";
  let nombre = item.nombre || p.nombre || "";
  let cf = p.cf || "";

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

  return { fecha, hora, delito, nombre, cf };
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

export function verificarConflictoFechaHora(
  fechaInput: string,
  horaInput: string,
  history: HistoryItem[],
  excludeId?: string
): { existe: boolean; mensaje?: string; conflicto?: HistoryItem } {
  if (!fechaInput?.trim() || !horaInput?.trim()) return { existe: false };

  const fechaNorm = normalizarFecha(fechaInput.trim());
  const horaNorm = horaInput.trim();
  const tsNuevo = fechaATimestamp(fechaNorm, horaNorm);

  for (const item of history) {
    if (excludeId && item.id === excludeId) continue;

    const { fecha: itemFecha, hora: itemHora } = extraerFechaHora(item);
    if (!itemFecha || !itemHora) continue;

    const itemFechaNorm = normalizarFecha(itemFecha);
    const itemHoraTrim = itemHora.trim();
    const tsItem = fechaATimestamp(itemFechaNorm, itemHoraTrim);

    const coincideTs = tsNuevo > 0 && tsItem > 0 && tsNuevo === tsItem;
    const coincideTexto = fechaNorm === itemFechaNorm && horaNorm === itemHoraTrim;

    if (coincideTs || coincideTexto) {
      return {
        existe: true,
        conflicto: item,
        mensaje: `Ya existe una diligencia programada para el día ${fechaNorm} a las ${horaNorm} (Doc. N° ${item.numero || "S/N"} - ${item.nombre || "Sin nombre"}). No se permite registrar dos diligencias en la misma fecha y hora.`,
      };
    }
  }

  return { existe: false };
}

export type AgendaItem = {
  id: string;
  type: DocumentType;
  numero: string;
  nombre: string;
  fecha: string;
  hora: string;
  delito: string;
  cf: string;
  timestamp: number;
  esPasada: boolean;
  esCitado?: boolean;
};

export function construirAgenda(history: HistoryItem[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  const now = Date.now();

  for (const item of history) {
    const { fecha, hora, delito, nombre, cf } = extraerFechaHora(item);

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
        cf,
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
    const fechaNorm = normalizarFecha(item.fecha);
    const existente = mapa.get(fechaNorm) ?? [];
    existente.push({ ...item, fecha: fechaNorm });
    mapa.set(fechaNorm, existente);
  }
  for (const [, grupo] of mapa) {
    grupo.sort((a, b) => {
      const horaA = (a.hora || "").trim().padStart(5, "0");
      const horaB = (b.hora || "").trim().padStart(5, "0");
      if (horaA !== horaB) return horaA.localeCompare(horaB);
      const numA = parseInt((a.numero || "0").replace(/[^\d]/g, ""), 10) || 0;
      const numB = parseInt((b.numero || "0").replace(/[^\d]/g, ""), 10) || 0;
      return numA - numB;
    });
  }
  return mapa;
}

export function formatearFechaDisplay(fecha: string): string {
  if (!fecha) return "";
  const f = fecha.trim();
  const isoMatch = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(f);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  }
  if (fechaRegex.test(f)) {
    const [dd, mm, aaaa] = f.split("/").map(Number);
    const date = new Date(aaaa, mm - 1, dd);
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  }
  return f;
}

export { documentCategory } from "../types";
