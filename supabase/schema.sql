-- ==============================================================================
-- Esquema para Gestión de Citaciones y Notificaciones — DEPDICC Iquitos
-- Ejecutar este script en el SQL Editor de tu proyecto en Supabase
-- ==============================================================================

-- 1. Crear tabla central de diligencias y documentos
CREATE TABLE IF NOT EXISTS public.diligencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,                         -- 'a2', 'a3', 'a4', 'a5', 'investigado', 'testigo', 'notificacion'
  numero TEXT NOT NULL,                       -- Número correlativo o código de documento
  nombre TEXT NOT NULL,                       -- Nombre del citado o denunciado
  carpeta_fiscal TEXT DEFAULT '',             -- Número de carpeta fiscal / referencia
  delito TEXT DEFAULT '',                     -- Delito o modalidad investigada
  fecha_diligencia TEXT NOT NULL,             -- Fecha principal de la cita (DD/MM/YYYY)
  hora_diligencia TEXT NOT NULL,              -- Hora principal (HH:mm)
  fecha2 TEXT DEFAULT '',                     -- Segunda citación opcional
  hora2 TEXT DEFAULT '',                      -- Segunda hora opcional
  fecha3 TEXT DEFAULT '',                     -- Tercera citación opcional
  hora3 TEXT DEFAULT '',                      -- Tercera hora opcional
  payload JSONB NOT NULL DEFAULT '{}'::jsonb, -- Datos complementarios y campos específicos del formato
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para optimizar búsquedas por fecha/hora y número
CREATE INDEX IF NOT EXISTS idx_diligencias_fecha_hora 
  ON public.diligencias (fecha_diligencia, hora_diligencia);

CREATE INDEX IF NOT EXISTS idx_diligencias_numero 
  ON public.diligencias (numero);

CREATE INDEX IF NOT EXISTS idx_diligencias_created_at 
  ON public.diligencias (created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.diligencias ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso (Permitir lectura y escritura institucional con publishable key)
DROP POLICY IF EXISTS "Permitir lectura publica institucional" ON public.diligencias;
CREATE POLICY "Permitir lectura publica institucional" 
  ON public.diligencias FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir insercion institucional" ON public.diligencias;
CREATE POLICY "Permitir insercion institucional" 
  ON public.diligencias FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion institucional" ON public.diligencias;
CREATE POLICY "Permitir actualizacion institucional" 
  ON public.diligencias FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion institucional" ON public.diligencias;
CREATE POLICY "Permitir eliminacion institucional" 
  ON public.diligencias FOR DELETE 
  USING (true);

-- 5. Habilitar sincronización en tiempo real (Supabase Realtime)
-- Permite que los cambios se reflejen en todas las computadoras conectadas sin refrescar
ALTER PUBLICATION supabase_realtime ADD TABLE public.diligencias;
