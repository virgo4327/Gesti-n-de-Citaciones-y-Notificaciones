export function sanitizeForPdf(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function formatForPdf(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return cleaned;
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  if (parts.length === 2) {
    return parts.map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }
  const firstNames = parts.slice(0, -2).map(p => p[0].toUpperCase() + p.slice(1).toLowerCase());
  const lastNames = parts.slice(-2).map(p => p.toUpperCase());
  return [...firstNames, ...lastNames].join(" ");
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

export function formatearFechaDocumento(fecha: string): string {
  const sanitized = fecha.trim();
  const match = sanitized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return sanitized;
  const [, dia, mes, anio] = match;
  const nombreMes = MONTHS[parseInt(mes, 10) - 1] || mes;
  return `${dia} de ${nombreMes} de ${anio}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-.]/g, "_").replace(/_{2,}/g, "_");
}
