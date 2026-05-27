import type { HistoryItem } from "../types";

const fechaRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function esFechaValida(fecha: string): boolean {
  return fechaRegex.test(fecha);
}

export function esHoraValida(hora: string): boolean {
  return horaRegex.test(hora);
}

export function fechaATimestamp(fecha: string, hora: string): number {
  if (!esFechaValida(fecha) || !esHoraValida(hora)) return 0;
  const [dd, mm, aaaa] = fecha.split("/").map(Number);
  const [hh, min] = hora.split(":").map(Number);
  return new Date(aaaa, mm - 1, dd, hh, min).getTime();
}

export type Conflicto = {
  tipo: "exacto" | "cercano";
  registro: HistoryItem;
  minutosDiferencia?: number;
};

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

    if (item.type === "investigado" || item.type === "testigo") {
      const p = item.payload as { nombre: string; fechaDiligencia: string; hora: string };
      if (!p.fechaDiligencia || !p.hora) continue;
      const tsExistente = fechaATimestamp(p.fechaDiligencia, p.hora);
      if (tsExistente === 0) continue;

      if (tsNuevo === tsExistente) {
        conflictos.push({ tipo: "exacto", registro: item });
      } else {
        const diffMin = Math.abs(tsNuevo - tsExistente) / 60000;
        if (diffMin <= 60) {
          conflictos.push({ tipo: "cercano", registro: item, minutosDiferencia: Math.round(diffMin) });
        }
      }
    }

    if (item.type === "notificacion") {
      const p = item.payload as { citados: { nombres: string; fecha: string; hora: string }[] };
      if (!p.citados) continue;
      for (const citado of p.citados) {
        if (!citado.fecha || !citado.hora) continue;
        const tsExistente = fechaATimestamp(citado.fecha, citado.hora);
        if (tsExistente === 0) continue;

        if (tsNuevo === tsExistente) {
          conflictos.push({ tipo: "exacto", registro: item });
          break;
        } else {
          const diffMin = Math.abs(tsNuevo - tsExistente) / 60000;
          if (diffMin <= 60) {
            conflictos.push({ tipo: "cercano", registro: item, minutosDiferencia: Math.round(diffMin) });
            break;
          }
        }
      }
    }
  }

  return conflictos;
}

export type AgendaItem = {
  id: string;
  type: "investigado" | "testigo" | "notificacion";
  numero: string;
  nombre: string;
  fecha: string;
  hora: string;
  delito: string;
  timestamp: number;
  esCitado?: boolean;
};

export function construirAgenda(history: HistoryItem[]): AgendaItem[] {
  const items: AgendaItem[] = [];

  for (const item of history) {
    if (item.type === "investigado" || item.type === "testigo") {
      const p = item.payload as { fechaDiligencia: string; hora: string; delito: string };
      if (p.fechaDiligencia && p.hora) {
        items.push({
          id: item.id,
          type: item.type,
          numero: item.numero,
          nombre: item.nombre,
          fecha: p.fechaDiligencia,
          hora: p.hora,
          delito: p.delito || "",
          timestamp: fechaATimestamp(p.fechaDiligencia, p.hora),
        });
      }
    }

    if (item.type === "notificacion") {
      const p = item.payload as { delito: string; citados: { nombres: string; fecha: string; hora: string }[] };
      if (p.citados) {
        for (const citado of p.citados) {
          if (citado.fecha && citado.hora) {
            items.push({
              id: item.id,
              type: "notificacion",
              numero: item.numero,
              nombre: citado.nombres,
              fecha: citado.fecha,
              hora: citado.hora,
              delito: p.delito || "",
              timestamp: fechaATimestamp(citado.fecha, citado.hora),
              esCitado: true,
            });
          }
        }
      }
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
