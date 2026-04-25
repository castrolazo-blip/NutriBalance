-- ============================================================
-- NEW BODY CALCULATOR - ALIMENTOS PRECARGADOS
-- ~80 alimentos típicos salvadoreños / latinoamericanos
-- Valores por 100g salvo indicación contraria
-- Fuentes: USDA FoodData Central + INCAP
-- ============================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New query
-- 2. Copia este archivo completo
-- 3. Ejecuta (Run)
-- ============================================================

-- Si quieres limpiar los alimentos antes (opcional, descomenta):
-- DELETE FROM alimentos;

INSERT INTO alimentos (codigo, nombre, categoria, subcategoria, porcion_base_g, porcion_descripcion, kcal, proteina_g, grasa_g, carbo_g, fibra_g, unidad_hogar, etiquetas, activo) VALUES

-- ============================================================
-- PROTEÍNAS ANIMALES (15)
-- ============================================================
('A-0001', 'Pechuga de pollo (sin piel)', 'proteinas', 'aves', 100, '100g cocida', 165, 31.0, 3.6, 0, 0, '1 pechuga mediana (~120g)', ARRAY['economico','alta_proteina','deficit'], true),
('A-0002', 'Muslo de pollo (sin piel)', 'proteinas', 'aves', 100, '100g cocido', 179, 24.8, 8.0, 0, 0, '1 muslo (~100g)', ARRAY['economico','tradicional'], true),
('A-0003', 'Huevo entero', 'proteinas', 'huevos', 50, '1 unidad grande (50g)', 72, 6.3, 5.0, 0.4, 0, '1 huevo grande', ARRAY['economico','tradicional','saciante'], true),
('A-0004', 'Clara de huevo', 'proteinas', 'huevos', 33, '1 clara (33g)', 17, 3.6, 0.1, 0.2, 0, '1 clara grande', ARRAY['economico','alta_proteina','deficit'], true),
('A-0005', 'Carne de res magra (posta)', 'proteinas', 'res', 100, '100g cocida', 217, 26.1, 11.8, 0, 0, '1 filete mediano', ARRAY['tradicional','alta_proteina'], true),
('A-0006', 'Carne molida de res (95% magra)', 'proteinas', 'res', 100, '100g cocida', 171, 26.0, 6.6, 0, 0, '1 porción', ARRAY['tradicional','economico'], true),
('A-0007', 'Chuleta de cerdo (magra)', 'proteinas', 'cerdo', 100, '100g cocida', 199, 26.0, 10.0, 0, 0, '1 chuleta mediana', ARRAY['tradicional'], true),
('A-0008', 'Atún en agua (enlatado)', 'proteinas', 'pescado', 100, '100g escurrido', 116, 25.5, 0.8, 0, 0, '1 lata (~140g)', ARRAY['economico','alta_proteina','deficit','facil'], true),
('A-0009', 'Atún en aceite (enlatado)', 'proteinas', 'pescado', 100, '100g escurrido', 198, 29.1, 8.2, 0, 0, '1 lata (~140g)', ARRAY['economico','alta_proteina'], true),
('A-0010', 'Tilapia (filete)', 'proteinas', 'pescado', 100, '100g cocida', 128, 26.2, 2.7, 0, 0, '1 filete mediano', ARRAY['deficit','alta_proteina'], true),
('A-0011', 'Camarones cocidos', 'proteinas', 'mariscos', 100, '100g', 99, 24.0, 0.3, 0.2, 0, '8-10 camarones', ARRAY['alta_proteina','deficit'], true),
('A-0012', 'Queso fresco salvadoreño', 'proteinas', 'lacteos', 100, '100g', 264, 18.0, 20.0, 3.0, 0, '1 rebanada (~30g)', ARRAY['tradicional','economico'], true),
('A-0013', 'Queso mozzarella', 'proteinas', 'lacteos', 100, '100g', 280, 22.0, 17.1, 3.1, 0, '1 rebanada (~30g)', ARRAY['tradicional'], true),
('A-0014', 'Yogur griego natural', 'proteinas', 'lacteos', 100, '100g', 59, 10.0, 0.4, 3.6, 0, '1 vasito (~170g)', ARRAY['saciante','alta_proteina','deficit'], true),
('A-0015', 'Requesón (cottage cheese)', 'proteinas', 'lacteos', 100, '100g', 98, 11.1, 4.3, 3.4, 0, '1/2 taza', ARRAY['alta_proteina','deficit'], true),

-- ============================================================
-- PROTEÍNAS VEGETALES / LEGUMBRES (5)
-- ============================================================
('A-0016', 'Frijoles rojos (cocidos)', 'proteinas', 'legumbres', 100, '100g cocidos', 127, 8.7, 0.5, 22.8, 7.4, '1/2 taza', ARRAY['economico','tradicional','fibra'], true),
('A-0017', 'Frijoles negros (cocidos)', 'proteinas', 'legumbres', 100, '100g cocidos', 132, 8.9, 0.5, 23.7, 8.7, '1/2 taza', ARRAY['economico','tradicional','fibra'], true),
('A-0018', 'Lentejas (cocidas)', 'proteinas', 'legumbres', 100, '100g cocidas', 116, 9.0, 0.4, 20.1, 7.9, '1/2 taza', ARRAY['economico','fibra'], true),
('A-0019', 'Garbanzos (cocidos)', 'proteinas', 'legumbres', 100, '100g cocidos', 164, 8.9, 2.6, 27.4, 7.6, '1/2 taza', ARRAY['fibra','saciante'], true),
('A-0020', 'Tofu firme', 'proteinas', 'vegetal', 100, '100g', 144, 17.3, 8.7, 2.8, 2.3, '1 porción', ARRAY['vegetariano'], true),

-- ============================================================
-- CARBOHIDRATOS (15)
-- ============================================================
('A-0021', 'Arroz blanco cocido', 'carbohidratos', 'cereales', 100, '100g cocido', 130, 2.7, 0.3, 28.2, 0.4, '1/2 taza', ARRAY['economico','tradicional'], true),
('A-0022', 'Arroz integral cocido', 'carbohidratos', 'cereales', 100, '100g cocido', 112, 2.6, 0.9, 23.5, 1.8, '1/2 taza', ARRAY['fibra'], true),
('A-0023', 'Tortilla de maíz', 'carbohidratos', 'cereales', 30, '1 tortilla (~30g)', 65, 1.7, 0.7, 13.6, 1.5, '1 tortilla mediana', ARRAY['economico','tradicional'], true),
('A-0024', 'Pan francés (bolillo)', 'carbohidratos', 'panes', 50, '1/2 pan (~50g)', 137, 4.5, 1.2, 26.0, 1.0, '1/2 pan francés', ARRAY['tradicional'], true),
('A-0025', 'Pan integral (rebanada)', 'carbohidratos', 'panes', 28, '1 rebanada', 69, 3.6, 0.9, 11.6, 1.9, '1 rebanada', ARRAY['fibra'], true),
('A-0026', 'Avena en hojuelas', 'carbohidratos', 'cereales', 40, '1/2 taza cruda', 150, 5.0, 3.0, 27.0, 4.0, '1/2 taza', ARRAY['fibra','saciante','economico'], true),
('A-0027', 'Pasta (espagueti cocido)', 'carbohidratos', 'cereales', 100, '100g cocida', 131, 5.0, 1.1, 25.0, 1.8, '1 taza', ARRAY['tradicional'], true),
('A-0028', 'Papa cocida (sin piel)', 'carbohidratos', 'tuberculos', 100, '100g cocida', 87, 1.9, 0.1, 20.1, 1.8, '1 papa mediana', ARRAY['economico','tradicional','saciante'], true),
('A-0029', 'Camote (batata) cocido', 'carbohidratos', 'tuberculos', 100, '100g', 90, 2.0, 0.1, 20.7, 3.3, '1 camote mediano', ARRAY['tradicional','fibra'], true),
('A-0030', 'Yuca cocida', 'carbohidratos', 'tuberculos', 100, '100g', 160, 1.4, 0.3, 38.1, 1.8, '1 porción', ARRAY['tradicional'], true),
('A-0031', 'Plátano maduro cocido', 'carbohidratos', 'tuberculos', 100, '100g', 122, 1.3, 0.4, 31.9, 2.3, '1/2 plátano', ARRAY['tradicional'], true),
('A-0032', 'Plátano verde (frito/asado)', 'carbohidratos', 'tuberculos', 100, '100g', 122, 1.3, 0.4, 31.9, 2.3, '1/2 plátano', ARRAY['tradicional'], true),
('A-0033', 'Galletas saladas (soda)', 'carbohidratos', 'snacks', 30, '~10 galletas', 130, 3.0, 4.0, 22.0, 1.0, '10 galletas', ARRAY['facil'], true),
('A-0034', 'Cereal en hojuelas (sin azúcar)', 'carbohidratos', 'cereales', 40, '1 taza', 150, 3.0, 1.0, 32.0, 3.0, '1 taza', ARRAY['facil'], true),
('A-0035', 'Quinoa cocida', 'carbohidratos', 'cereales', 100, '100g cocida', 120, 4.4, 1.9, 21.3, 2.8, '1/2 taza', ARRAY['alta_proteina','fibra'], true),

-- ============================================================
-- GRASAS SALUDABLES (10)
-- ============================================================
('A-0036', 'Aguacate', 'grasas', 'frutas_grasas', 100, '100g (~1/2 aguacate)', 160, 2.0, 14.7, 8.5, 6.7, '1/2 aguacate', ARRAY['tradicional','saciante'], true),
('A-0037', 'Aceite de oliva', 'grasas', 'aceites', 14, '1 cda (~14g)', 119, 0, 13.5, 0, 0, '1 cucharada', ARRAY['saludable'], true),
('A-0038', 'Aceite vegetal (maíz/soya)', 'grasas', 'aceites', 14, '1 cda (~14g)', 120, 0, 14.0, 0, 0, '1 cucharada', ARRAY['economico'], true),
('A-0039', 'Mantequilla', 'grasas', 'grasas_animales', 14, '1 cda (~14g)', 102, 0.1, 11.5, 0, 0, '1 cucharada', ARRAY['tradicional'], true),
('A-0040', 'Crema de maní (natural)', 'grasas', 'frutos_secos', 32, '2 cdas (~32g)', 188, 8.0, 16.0, 7.0, 2.0, '2 cucharadas', ARRAY['saciante','economico'], true),
('A-0041', 'Almendras', 'grasas', 'frutos_secos', 28, '23 almendras (~28g)', 164, 6.0, 14.2, 6.1, 3.5, '1 puñado (~23 unidades)', ARRAY['saciante'], true),
('A-0042', 'Maní (cacahuate)', 'grasas', 'frutos_secos', 28, '1 puñado (~28g)', 161, 7.3, 14.0, 4.6, 2.4, '1 puñado', ARRAY['economico','saciante'], true),
('A-0043', 'Nueces', 'grasas', 'frutos_secos', 28, '~14 mitades', 185, 4.3, 18.5, 3.9, 1.9, '1 puñado pequeño', ARRAY['omega3'], true),
('A-0044', 'Semillas de chía', 'grasas', 'semillas', 15, '1 cda (~15g)', 73, 2.5, 4.6, 6.3, 5.1, '1 cucharada', ARRAY['fibra','omega3'], true),
('A-0045', 'Semillas de marañón (cashew)', 'grasas', 'frutos_secos', 28, '~18 unidades', 157, 5.2, 12.4, 8.6, 0.9, '1 puñado pequeño', ARRAY['saciante'], true),

-- ============================================================
-- VEGETALES (12)
-- ============================================================
('A-0046', 'Lechuga romana', 'vegetales', 'hojas_verdes', 100, '2 tazas', 17, 1.2, 0.3, 3.3, 2.1, '2 tazas picada', ARRAY['bajo_calorias','deficit','fibra'], true),
('A-0047', 'Tomate', 'vegetales', 'frutos', 100, '1 mediano', 18, 0.9, 0.2, 3.9, 1.2, '1 tomate mediano', ARRAY['tradicional','bajo_calorias'], true),
('A-0048', 'Pepino', 'vegetales', 'frutos', 100, '1/2 pepino', 15, 0.7, 0.1, 3.6, 0.5, '1/2 pepino mediano', ARRAY['bajo_calorias','deficit'], true),
('A-0049', 'Brócoli', 'vegetales', 'crucíferas', 100, '1 taza', 34, 2.8, 0.4, 7.0, 2.6, '1 taza', ARRAY['fibra','bajo_calorias'], true),
('A-0050', 'Coliflor', 'vegetales', 'crucíferas', 100, '1 taza', 25, 1.9, 0.3, 5.0, 2.0, '1 taza', ARRAY['bajo_calorias','deficit'], true),
('A-0051', 'Zanahoria', 'vegetales', 'raices', 100, '1 mediana', 41, 0.9, 0.2, 9.6, 2.8, '1 zanahoria', ARRAY['economico','fibra'], true),
('A-0052', 'Espinaca (cruda)', 'vegetales', 'hojas_verdes', 100, '3 tazas', 23, 2.9, 0.4, 3.6, 2.2, '3 tazas crudas', ARRAY['hierro','bajo_calorias'], true),
('A-0053', 'Chipilín', 'vegetales', 'hojas_verdes', 100, '1 manojo', 40, 4.0, 0.8, 6.0, 3.5, '1 manojo', ARRAY['tradicional','economico'], true),
('A-0054', 'Güisquil (chayote)', 'vegetales', 'frutos', 100, '1 mediano', 19, 0.8, 0.1, 4.5, 1.7, '1 güisquil', ARRAY['tradicional','bajo_calorias'], true),
('A-0055', 'Loroco', 'vegetales', 'flores', 100, '1 taza', 60, 4.0, 1.2, 8.0, 3.0, '1 manojo', ARRAY['tradicional'], true),
('A-0056', 'Ejote (vainita)', 'vegetales', 'legumbres', 100, '1 taza', 31, 1.8, 0.2, 7.0, 2.7, '1 taza', ARRAY['fibra','tradicional'], true),
('A-0057', 'Cebolla', 'vegetales', 'bulbos', 100, '1 mediana', 40, 1.1, 0.1, 9.3, 1.7, '1 cebolla', ARRAY['tradicional','economico'], true),

-- ============================================================
-- FRUTAS (10)
-- ============================================================
('A-0058', 'Banano (guineo)', 'frutas', 'tropicales', 100, '1 mediano', 89, 1.1, 0.3, 22.8, 2.6, '1 banano mediano', ARRAY['economico','tradicional'], true),
('A-0059', 'Manzana (con cáscara)', 'frutas', 'pomáceas', 100, '1 mediana', 52, 0.3, 0.2, 13.8, 2.4, '1 manzana', ARRAY['fibra'], true),
('A-0060', 'Naranja', 'frutas', 'citricos', 100, '1 mediana', 47, 0.9, 0.1, 11.8, 2.4, '1 naranja', ARRAY['tradicional','vitamina_c'], true),
('A-0061', 'Papaya', 'frutas', 'tropicales', 100, '1 taza', 43, 0.5, 0.3, 10.8, 1.7, '1 taza cubos', ARRAY['tradicional','economico','fibra'], true),
('A-0062', 'Sandía', 'frutas', 'tropicales', 100, '1 taza', 30, 0.6, 0.2, 7.6, 0.4, '1 taza cubos', ARRAY['tradicional','bajo_calorias'], true),
('A-0063', 'Mango', 'frutas', 'tropicales', 100, '1 taza', 60, 0.8, 0.4, 15.0, 1.6, '1 taza cubos', ARRAY['tradicional'], true),
('A-0064', 'Piña', 'frutas', 'tropicales', 100, '1 taza', 50, 0.5, 0.1, 13.1, 1.4, '1 taza cubos', ARRAY['tradicional'], true),
('A-0065', 'Fresas', 'frutas', 'berries', 100, '1 taza', 32, 0.7, 0.3, 7.7, 2.0, '1 taza', ARRAY['antioxidantes','bajo_calorias'], true),
('A-0066', 'Uvas', 'frutas', 'berries', 100, '1 taza', 69, 0.7, 0.2, 18.1, 0.9, '1 taza', ARRAY['facil'], true),
('A-0067', 'Maracuyá (granadilla)', 'frutas', 'tropicales', 100, '2 unidades', 97, 2.2, 0.7, 23.4, 10.4, '2 maracuyás', ARRAY['tradicional','fibra'], true),

-- ============================================================
-- COMBINADOS / PLATILLOS TÍPICOS (10)
-- ============================================================
('A-0068', 'Pupusa de queso', 'combinados', 'tipicos', 80, '1 pupusa mediana', 220, 8.5, 9.0, 27.0, 2.0, '1 pupusa', ARRAY['tradicional'], true),
('A-0069', 'Pupusa de frijol con queso', 'combinados', 'tipicos', 90, '1 pupusa mediana', 240, 9.0, 8.5, 32.0, 4.0, '1 pupusa', ARRAY['tradicional','economico'], true),
('A-0070', 'Pupusa revuelta', 'combinados', 'tipicos', 100, '1 pupusa mediana', 280, 11.0, 12.0, 32.0, 3.0, '1 pupusa', ARRAY['tradicional','completa'], true),
('A-0071', 'Pupusa de loroco con queso', 'combinados', 'tipicos', 85, '1 pupusa mediana', 225, 8.5, 9.2, 28.0, 2.2, '1 pupusa', ARRAY['tradicional'], true),
('A-0072', 'Tamal pisque (con frijol)', 'combinados', 'tipicos', 150, '1 tamal mediano', 280, 6.0, 4.5, 55.0, 4.0, '1 tamal', ARRAY['tradicional'], true),
('A-0073', 'Tamal de elote', 'combinados', 'tipicos', 150, '1 tamal mediano', 310, 5.5, 8.0, 55.0, 2.5, '1 tamal', ARRAY['tradicional'], true),
('A-0074', 'Sándwich de pollo (pan integral)', 'combinados', 'sandwiches', 200, '1 sándwich', 350, 28.0, 10.0, 38.0, 5.0, '1 sándwich', ARRAY['facil','balanceado'], true),
('A-0075', 'Licuado de banano con leche', 'combinados', 'bebidas', 300, '1 vaso grande', 220, 9.0, 5.0, 38.0, 2.5, '1 vaso grande', ARRAY['tradicional','facil'], true),
('A-0076', 'Bowl de avena con frutas', 'combinados', 'desayunos', 350, '1 bowl', 320, 10.0, 7.0, 55.0, 7.0, '1 bowl', ARRAY['fibra','balanceado'], true),
('A-0077', 'Baleada sencilla (tortilla+frijol+queso)', 'combinados', 'tipicos', 120, '1 baleada', 290, 11.0, 9.0, 42.0, 5.0, '1 baleada', ARRAY['tradicional','economico'], true),

-- ============================================================
-- BEBIDAS (8)
-- ============================================================
('A-0078', 'Leche entera', 'bebidas', 'lacteos', 240, '1 vaso (240ml)', 149, 8.0, 8.0, 12.0, 0, '1 vaso', ARRAY['tradicional'], true),
('A-0079', 'Leche descremada (deslactosada)', 'bebidas', 'lacteos', 240, '1 vaso (240ml)', 83, 8.3, 0.2, 12.2, 0, '1 vaso', ARRAY['deficit','bajo_grasa'], true),
('A-0080', 'Café negro (sin azúcar)', 'bebidas', 'infusiones', 240, '1 taza', 2, 0.3, 0, 0, 0, '1 taza', ARRAY['bajo_calorias','tradicional'], true),
('A-0081', 'Agua', 'bebidas', 'agua', 240, '1 vaso', 0, 0, 0, 0, 0, '1 vaso', ARRAY['hidratacion'], true),
('A-0082', 'Horchata salvadoreña', 'bebidas', 'tradicionales', 240, '1 vaso', 150, 2.0, 3.0, 28.0, 1.0, '1 vaso', ARRAY['tradicional'], true),
('A-0083', 'Jugo de naranja natural', 'bebidas', 'jugos', 240, '1 vaso', 112, 1.7, 0.5, 25.8, 0.5, '1 vaso', ARRAY['tradicional'], true),
('A-0084', 'Té verde (sin azúcar)', 'bebidas', 'infusiones', 240, '1 taza', 2, 0, 0, 0, 0, '1 taza', ARRAY['antioxidantes','bajo_calorias'], true),
('A-0085', 'Bebida proteica (whey con agua)', 'bebidas', 'suplementos', 300, '1 batido', 120, 24.0, 1.5, 3.0, 0, '1 scoop + agua', ARRAY['alta_proteina','post_entreno'], true)

ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- FIN - Total: 85 alimentos cargados
-- ============================================================
