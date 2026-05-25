export function sanitizeForPdf(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-.]/g, "_").replace(/_{2,}/g, "_");
}
