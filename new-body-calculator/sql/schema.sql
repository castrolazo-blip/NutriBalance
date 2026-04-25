-- ============================================================
-- NEW BODY CALCULATOR - ESQUEMA DE BASE DE DATOS SUPABASE
-- Versión: 1.0
-- Fecha: 2026-04-21
-- ============================================================
-- Instrucciones:
-- 1. Entra a tu proyecto Supabase > SQL Editor
-- 2. Copia y pega este archivo completo
-- 3. Ejecuta todo de una sola vez
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PERFILES DE USUARIO (vinculados a auth.users de Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PERFILES NUTRICIONALES (datos físicos del usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS perfiles_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F')),
    fecha_nacimiento DATE NOT NULL,
    talla_cm NUMERIC(5,1) NOT NULL,
    peso_actual_kg NUMERIC(5,2) NOT NULL,
    peso_meta_kg NUMERIC(5,2),
    nivel_actividad TEXT NOT NULL CHECK (nivel_actividad IN ('sedentario','ligero','moderado','activo','muy_activo')),
    meta TEXT NOT NULL CHECK (meta IN ('deficit','mantenimiento','superavit')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_nutri_usuario ON perfiles_nutricionales(usuario_id);

-- ============================================================
-- 3. CONFIGURACIONES DE PREFERENCIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS configuraciones_preferencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    num_comidas INTEGER DEFAULT 4 CHECK (num_comidas BETWEEN 3 AND 5),
    incluye_desayuno BOOLEAN DEFAULT TRUE,
    hace_ayuno BOOLEAN DEFAULT FALSE,
    estilo TEXT DEFAULT 'tradicional' CHECK (estilo IN ('tradicional','economico','mixto')),
    proteina_g_kg NUMERIC(3,2) DEFAULT 2.2,
    grasa_g_kg NUMERIC(3,2) DEFAULT 0.9,
    porcentaje_deficit NUMERIC(4,2) DEFAULT 10.0,
    alimentos_excluidos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_usuario ON configuraciones_preferencias(usuario_id);

-- ============================================================
-- 4. CATÁLOGO DE ALIMENTOS (matriz base)
-- ============================================================
CREATE TABLE IF NOT EXISTS alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('proteinas','carbohidratos','grasas','vegetales','combinados','bebidas','frutas')),
    subcategoria TEXT,
    porcion_base_g NUMERIC(6,2) NOT NULL DEFAULT 100,
    porcion_descripcion TEXT,
    kcal NUMERIC(6,2) NOT NULL,
    proteina_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    grasa_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    carbo_g NUMERIC(6,2) NOT NULL DEFAULT 0,
    fibra_g NUMERIC(6,2) DEFAULT 0,
    unidad_hogar TEXT,
    pais_referencia TEXT DEFAULT 'El Salvador',
    etiquetas TEXT[],
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alimentos_categoria ON alimentos(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_activo ON alimentos(activo);

-- ============================================================
-- 5. EQUIVALENCIAS DE ALIMENTOS (para sustituciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS equivalencias_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alimento_origen_id UUID NOT NULL REFERENCES alimentos(id) ON DELETE CASCADE,
    alimento_destino_id UUID NOT NULL REFERENCES alimentos(id) ON DELETE CASCADE,
    factor NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alimento_origen_id, alimento_destino_id)
);

-- ============================================================
-- 6. PLANTILLAS DE MENÚ
-- ============================================================
CREATE TABLE IF NOT EXISTS plantillas_menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    kcal_min INTEGER NOT NULL,
    kcal_max INTEGER NOT NULL,
    num_comidas INTEGER NOT NULL,
    perfil_recomendado TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. ITEMS DE PLANTILLAS (distribución por comida)
-- ============================================================
CREATE TABLE IF NOT EXISTS items_plantilla_menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plantilla_id UUID NOT NULL REFERENCES plantillas_menu(id) ON DELETE CASCADE,
    tiempo_comida TEXT NOT NULL CHECK (tiempo_comida IN ('desayuno','media_manana','almuerzo','media_tarde','cena','colacion')),
    orden INTEGER NOT NULL,
    porcentaje_kcal NUMERIC(4,2) NOT NULL,
    categorias_sugeridas TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_plantilla ON items_plantilla_menu(plantilla_id);

-- ============================================================
-- 8. PLANES GENERADOS (historial de cálculos)
-- ============================================================
CREATE TABLE IF NOT EXISTS planes_generados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    tmb NUMERIC(7,2) NOT NULL,
    tdee NUMERIC(7,2) NOT NULL,
    kcal_objetivo NUMERIC(7,2) NOT NULL,
    proteina_g NUMERIC(6,2) NOT NULL,
    grasa_g NUMERIC(6,2) NOT NULL,
    carbo_g NUMERIC(6,2) NOT NULL,
    plantilla_id UUID REFERENCES plantillas_menu(id),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planes_usuario ON planes_generados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_planes_fecha ON planes_generados(fecha DESC);

-- ============================================================
-- 9. DETALLE DE PLANES (alimentos específicos del menú)
-- ============================================================
CREATE TABLE IF NOT EXISTS planes_generados_detalle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES planes_generados(id) ON DELETE CASCADE,
    tiempo_comida TEXT NOT NULL,
    alimento_id UUID NOT NULL REFERENCES alimentos(id),
    porcion_g NUMERIC(6,2) NOT NULL,
    kcal_calculadas NUMERIC(6,2),
    proteina_calculada NUMERIC(6,2),
    grasa_calculada NUMERIC(6,2),
    carbo_calculado NUMERIC(6,2),
    orden INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planes_detalle_plan ON planes_generados_detalle(plan_id);

-- ============================================================
-- 10. HISTORIAL DE PESO
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_peso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    peso_kg NUMERIC(5,2) NOT NULL,
    nota TEXT,
    adherencia_porcentaje NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_peso_usuario ON historial_peso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_peso_fecha ON historial_peso(fecha DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Seguridad por usuario
-- ============================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_nutricionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equivalencias_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_plantilla_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_generados ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_generados_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_peso ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios ven y editan solo sus propios datos
CREATE POLICY "usuarios_propio_perfil" ON perfiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "usuarios_propio_nutri" ON perfiles_nutricionales FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuarios_propia_config" ON configuraciones_preferencias FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuarios_propios_planes" ON planes_generados FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuarios_propio_historial" ON historial_peso FOR ALL USING (auth.uid() = usuario_id);

-- Detalle de planes: acceso a través del plan padre
CREATE POLICY "usuarios_propios_detalles" ON planes_generados_detalle FOR ALL USING (
    EXISTS (SELECT 1 FROM planes_generados WHERE planes_generados.id = planes_generados_detalle.plan_id AND planes_generados.usuario_id = auth.uid())
);

-- Catálogos: lectura pública, escritura solo admin
CREATE POLICY "alimentos_lectura" ON alimentos FOR SELECT USING (true);
CREATE POLICY "alimentos_admin_write" ON alimentos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "alimentos_admin_update" ON alimentos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "alimentos_admin_delete" ON alimentos FOR DELETE USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
);

CREATE POLICY "equiv_lectura" ON equivalencias_alimentos FOR SELECT USING (true);
CREATE POLICY "plantillas_lectura" ON plantillas_menu FOR SELECT USING (true);
CREATE POLICY "items_plantilla_lectura" ON items_plantilla_menu FOR SELECT USING (true);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre, telefono)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        NEW.raw_user_meta_data->>'telefono'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DATOS SEMILLA: Plantillas de menú base
-- ============================================================
INSERT INTO plantillas_menu (codigo, nombre, kcal_min, kcal_max, num_comidas, perfil_recomendado, descripcion) VALUES
('DL-1500', 'Déficit Ligero 1500', 1450, 1550, 4, 'Déficit bajo apetito controlado', 'Alta densidad proteica'),
('DL-1800', 'Déficit Moderado 1800', 1750, 1850, 4, 'Déficit moderado', 'Opción más usada para pérdida de peso'),
('EQ-2000', 'Equilibrado 2000', 1950, 2050, 4, 'Mantenimiento', 'Distribución equilibrada'),
('GM-2300', 'Ganancia Ligera 2300', 2250, 2350, 5, 'Ganancia ligera', 'Mayor carga de carbohidratos'),
('GM-2600', 'Ganancia Moderada 2600', 2550, 2650, 5, 'Ganancia moderada', 'Requiere mejor adherencia')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================
