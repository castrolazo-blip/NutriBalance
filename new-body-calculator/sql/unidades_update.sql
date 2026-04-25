-- ============================================================
-- NEW BODY CALCULATOR - ACTUALIZACIÓN: Sistema de unidades
-- ============================================================
-- Agrega soporte para 3 sistemas de unidades:
-- - salvadoreno (lb + cm) [por defecto]
-- - imperial (lb + ft/in)
-- - metrico (kg + cm)
-- ============================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New query
-- 2. Copia este archivo completo
-- 3. Ejecuta (Run)
-- ============================================================

-- Agregar columna de preferencia de unidad al perfil nutricional
ALTER TABLE perfiles_nutricionales
ADD COLUMN IF NOT EXISTS sistema_unidades TEXT DEFAULT 'salvadoreno'
CHECK (sistema_unidades IN ('salvadoreno', 'imperial', 'metrico'));

-- Los perfiles antiguos quedan automáticamente con 'salvadoreno' por defecto

-- Verificación
SELECT id, sexo, talla_cm, peso_actual_kg, sistema_unidades
FROM perfiles_nutricionales;
