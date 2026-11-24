# Script de Exportación de Supabase

Exporta todos los registros de la tabla `diligencias` a un archivo JSON.

## Uso

```bash
# Opcionalmente especifica el archivo de salida
node scripts/export-supabase.js [output-file]
```

Por defecto, guarda en `supabase_export.json` en la raíz del proyecto.

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase (ej. `https://tu-proyecto.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Clave de servicio (`sb_secret_...`) **recomendada** |
| `SUPABASE_ANON_KEY` | Clave pública (`sb_publishable_...`) como alternativa |

## Ejemplo

```bash
export SUPABASE_URL="https://hkipgvrdqhhlnopulqci.supabase.co"
export SUPABASE_SERVICE_KEY="sb_secret_..."
node scripts/export-supabase.js
```

## Notas

- El script usa la API REST de Supabase (`/rest/v1/diligencias`).
- La clave de servicio (`sb_secret_`) tiene más permisos y es la recomendada.
- El archivo de salida es un JSON plano con todos los campos de la tabla.