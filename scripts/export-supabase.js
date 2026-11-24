#!/usr/bin/env node
/**
 * Exportar todos los registros de la tabla `diligencias` de Supabase a un archivo JSON.
 * Uso: node scripts/export-supabase.js [output-file]
 * Requiere variables de entorno:
 *   SUPABASE_URL        - URL del proyecto Supabase
 *   SUPABASE_SERVICE_KEY - Clave de servicio (sb_secret_...) o anon key (sb_publishable_...)
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const OUTPUT_FILE = process.argv[2] || path.join(__dirname, "..", "supabase_export.json");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY/SUPABASE_ANON_KEY");
  process.exit(1);
}

async function main() {
  const url = `${SUPABASE_URL}/rest/v1/diligencias?select=*`;
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("ERROR al consultar Supabase:", resp.status, text);
    process.exit(1);
  }

  const data = await resp.json();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Exportados ${data.length} registros a: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});