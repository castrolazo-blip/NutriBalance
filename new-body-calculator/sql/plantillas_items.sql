-- ============================================================
-- NEW BODY CALCULATOR - ITEMS DE PLANTILLAS DE MENÚ
-- Distribución de kcal y categorías por tiempo de comida
-- ============================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New query
-- 2. Copia este archivo completo
-- 3. Ejecuta (Run)
-- ============================================================

-- Limpiar items previos (por si se ejecuta de nuevo)
DELETE FROM items_plantilla_menu;

-- ============================================================
-- DL-1500: Déficit Ligero (4 comidas)
-- Distribución: Desayuno 25% | Almuerzo 35% | Media tarde 15% | Cena 25%
-- ============================================================
INSERT INTO items_plantilla_menu (plantilla_id, tiempo_comida, orden, porcentaje_kcal, categorias_sugeridas)
SELECT id, 'desayuno', 1, 25.0, ARRAY['proteinas','carbohidratos','frutas'] FROM plantillas_menu WHERE codigo='DL-1500'
UNION ALL
SELECT id, 'almuerzo', 2, 35.0, ARRAY['proteinas','carbohidratos','vegetales','grasas'] FROM plantillas_menu WHERE codigo='DL-1500'
UNION ALL
SELECT id, 'media_tarde', 3, 15.0, ARRAY['proteinas','frutas'] FROM plantillas_menu WHERE codigo='DL-1500'
UNION ALL
SELECT id, 'cena', 4, 25.0, ARRAY['proteinas','vegetales','grasas'] FROM plantillas_menu WHERE codigo='DL-1500';

-- ============================================================
-- DL-1800: Déficit Moderado (4 comidas)
-- Distribución: Desayuno 25% | Almuerzo 35% | Media tarde 15% | Cena 25%
-- ============================================================
INSERT INTO items_plantilla_menu (plantilla_id, tiempo_comida, orden, porcentaje_kcal, categorias_sugeridas)
SELECT id, 'desayuno', 1, 25.0, ARRAY['proteinas','carbohidratos','frutas'] FROM plantillas_menu WHERE codigo='DL-1800'
UNION ALL
SELECT id, 'almuerzo', 2, 35.0, ARRAY['proteinas','carbohidratos','vegetales','grasas'] FROM plantillas_menu WHERE codigo='DL-1800'
UNION ALL
SELECT id, 'media_tarde', 3, 15.0, ARRAY['proteinas','frutas'] FROM plantillas_menu WHERE codigo='DL-1800'
UNION ALL
SELECT id, 'cena', 4, 25.0, ARRAY['proteinas','vegetales','carbohidratos'] FROM plantillas_menu WHERE codigo='DL-1800';

-- ============================================================
-- EQ-2000: Equilibrado / Mantenimiento (4 comidas)
-- ============================================================
INSERT INTO items_plantilla_menu (plantilla_id, tiempo_comida, orden, porcentaje_kcal, categorias_sugeridas)
SELECT id, 'desayuno', 1, 25.0, ARRAY['proteinas','carbohidratos','frutas','grasas'] FROM plantillas_menu WHERE codigo='EQ-2000'
UNION ALL
SELECT id, 'almuerzo', 2, 35.0, ARRAY['proteinas','carbohidratos','vegetales','grasas'] FROM plantillas_menu WHERE codigo='EQ-2000'
UNION ALL
SELECT id, 'media_tarde', 3, 15.0, ARRAY['proteinas','carbohidratos','frutas'] FROM plantillas_menu WHERE codigo='EQ-2000'
UNION ALL
SELECT id, 'cena', 4, 25.0, ARRAY['proteinas','carbohidratos','vegetales'] FROM plantillas_menu WHERE codigo='EQ-2000';

-- ============================================================
-- GM-2300: Ganancia Ligera (5 comidas)
-- Distribución: Desayuno 22% | M mañana 13% | Almuerzo 30% | M tarde 15% | Cena 20%
-- ============================================================
INSERT INTO items_plantilla_menu (plantilla_id, tiempo_comida, orden, porcentaje_kcal, categorias_sugeridas)
SELECT id, 'desayuno', 1, 22.0, ARRAY['proteinas','carbohidratos','frutas','grasas'] FROM plantillas_menu WHERE codigo='GM-2300'
UNION ALL
SELECT id, 'media_manana', 2, 13.0, ARRAY['proteinas','carbohidratos','frutas'] FROM plantillas_menu WHERE codigo='GM-2300'
UNION ALL
SELECT id, 'almuerzo', 3, 30.0, ARRAY['proteinas','carbohidratos','vegetales','grasas'] FROM plantillas_menu WHERE codigo='GM-2300'
UNION ALL
SELECT id, 'media_tarde', 4, 15.0, ARRAY['proteinas','carbohidratos'] FROM plantillas_menu WHERE codigo='GM-2300'
UNION ALL
SELECT id, 'cena', 5, 20.0, ARRAY['proteinas','carbohidratos','vegetales'] FROM plantillas_menu WHERE codigo='GM-2300';

-- ============================================================
-- GM-2600: Ganancia Moderada (5 comidas)
-- ============================================================
INSERT INTO items_plantilla_menu (plantilla_id, tiempo_comida, orden, porcentaje_kcal, categorias_sugeridas)
SELECT id, 'desayuno', 1, 22.0, ARRAY['proteinas','carbohidratos','frutas','grasas'] FROM plantillas_menu WHERE codigo='GM-2600'
UNION ALL
SELECT id, 'media_manana', 2, 13.0, ARRAY['proteinas','carbohidratos','frutas'] FROM plantillas_menu WHERE codigo='GM-2600'
UNION ALL
SELECT id, 'almuerzo', 3, 30.0, ARRAY['proteinas','carbohidratos','vegetales','grasas'] FROM plantillas_menu WHERE codigo='GM-2600'
UNION ALL
SELECT id, 'media_tarde', 4, 15.0, ARRAY['proteinas','carbohidratos','grasas'] FROM plantillas_menu WHERE codigo='GM-2600'
UNION ALL
SELECT id, 'cena', 5, 20.0, ARRAY['proteinas','carbohidratos','vegetales'] FROM plantillas_menu WHERE codigo='GM-2600';

-- ============================================================
-- Verificación
-- ============================================================
SELECT
    p.codigo,
    p.nombre,
    COUNT(i.id) as num_comidas,
    ROUND(SUM(i.porcentaje_kcal)::numeric, 1) as total_porcentaje
FROM plantillas_menu p
LEFT JOIN items_plantilla_menu i ON i.plantilla_id = p.id
GROUP BY p.codigo, p.nombre
ORDER BY p.codigo;
