/* ============================================================
   MÓDULO M7: MOTOR DE DIETA v6 — MACRO-FIRST DEFINITIVO
   NutriBalance · by Ronald Castro
   ============================================================
   DATOS EN SUPABASE: kcal/proteina_g/grasa_g/carbo_g son
   valores POR porcion_base_g (no por 100g).
   Ej: Huevo entero → 72 kcal / 50g (= 1 huevo)

   REGLAS FUNDAMENTALES:
   1. Proteína MANDA — se cubre primero, nunca se toca en ajuste
   2. Grasa — se cubre segundo
   3. Carbohidratos — variable, se ajustan al final
   4. kcal = proteina*4 + carbo*4 + grasa*9 (nunca de Supabase)
   5. Objetivo: 95-105% en todos los macros
   ============================================================ */

window.dieta = {

  // ─── Estado ──────────────────────────────────────────────
  perfilActual:  null,
  configActual:  null,
  calculoActual: null,
  alimentos:     [],
  menuGenerado:  null,
  preferencias:  null,
  vistaActiva:   'diario',

  // ─── Porciones máximas por alimento (en nº de porciones base) ──
  MAX_PORCIONES: {
    'A-0003': 3,    // Huevo: máx 3
    'A-0004': 5,    // Clara: máx 5
    'A-0001': 2,    // Pechuga: máx 2
    'A-0002': 2,    // Muslo: máx 2
    'A-0005': 2,    // Res: máx 2
    'A-0006': 2,    // Molida: máx 2
    'A-0007': 2,    // Cerdo: máx 2
    'A-0008': 2,    // Atún agua: máx 2
    'A-0009': 2,    // Atún aceite: máx 2
    'A-0010': 2,    // Tilapia: máx 2
    'A-0011': 2,    // Camarones: máx 2
    'A-0012': 1.5,  // Queso fresco: máx 150g
    'A-0013': 1,    // Mozzarella: máx 100g
    'A-0014': 3,    // Yogur griego: máx 300g
    'A-0015': 2,    // Requesón: máx 200g
    'A-0016': 2,    // Frijoles rojos: máx 200g
    'A-0017': 2,    // Frijoles negros: máx 200g
    'A-0019': 2,    // Garbanzos: máx 200g
    'A-0018': 2,    // Lentejas: máx 200g
    'A-0021': 2,    // Arroz: máx 200g
    'A-0022': 2,    // Arroz integral: máx 200g
    'A-0023': 4,    // Tortilla: máx 4
    'A-0024': 3,    // Pan francés: máx 3
    'A-0025': 3,    // Pan integral: máx 3
    'A-0026': 2,    // Avena: máx 2
    'A-0028': 2,    // Papa: máx 200g
    'A-0029': 2,    // Camote: máx 200g
    'A-0036': 1.5,  // Aguacate: máx 150g
    'A-0037': 1,    // Aceite oliva: máx 1 cda
    'A-0039': 1,    // Mantequilla: máx 1
    'A-0040': 2,    // Crema maní: máx 2 cdas
    'A-0041': 2,    // Almendras: máx 56g
    'A-0042': 2,    // Maní: máx 56g
    'A-0043': 2,    // Nueces: máx 56g
    'A-0044': 2,    // Chía: máx 30g
    'A-0045': 2,    // Marañón: máx 56g
    'A-0085': 4,    // Jamón pavo: máx 4 rebanadas
    'A-0086': 2,    // Salchicha pavo: máx 2
    'A-0090': 3,    // Pupusa queso: máx 3
    'A-0091': 2,    // Pancakes: máx 2
    'A-0092': 2,    // Dobladita: máx 2
    'A-0093': 2,    // Tostadas francesas: máx 2
    'A-0094': 2,    // Wrap huevo: máx 2
  },

  // ─── Tipo de proteína — evita combinar del mismo tipo ─────
  // Alimentos que se cuentan en unidades enteras (no fraccionar)
  PORCION_ENTERA: {
    'A-0003': true,  // huevo
    'A-0023': true,  // tortilla
    'A-0024': true,  // pan francés
    'A-0025': true,  // pan integral
    'A-0090': true,  // pupusa
    'A-0091': true,  // pancakes
    'A-0092': true,  // dobladita
    'A-0093': true,  // tostadas francesas
    'A-0094': true,  // wrap huevo
    'A-0085': true,  // jamón pavo (rebanada)
    'A-0086': true,  // salchicha pavo
  },

  // Límite absoluto de seguridad (para +/- manual)
  MAX_ABSOLUTO: {
    'A-0003': 6, 'A-0023': 8, 'A-0024': 6,
    'A-0090': 6, 'A-0036': 3, 'A-0037': 2,
  },

  TIPO_PROTEINA: {
    'A-0001': 'pollo',    'A-0002': 'pollo',
    'A-0003': 'huevo',    'A-0004': 'huevo',
    'A-0005': 'res',      'A-0006': 'res',
    'A-0007': 'cerdo',
    'A-0008': 'pescado',  'A-0009': 'pescado',  'A-0010': 'pescado',
    'A-0011': 'mariscos',
    'A-0012': 'lacteo',   'A-0013': 'lacteo',
    'A-0014': 'lacteo',   'A-0015': 'lacteo',
    'A-0016': 'legumbre', 'A-0017': 'legumbre',
    'A-0018': 'legumbre', 'A-0019': 'legumbre',
    'A-0085': 'embutido', 'A-0086': 'embutido',
    'A-0020': 'vegetal',
  },

  // ─── Compatibilidades — evita combinar proteínas raras ────
  INCOMPATIBLES: [
    ['pescado',  'lacteo'],
    ['pescado',  'embutido'],
    ['mariscos', 'lacteo'],
    ['mariscos', 'embutido'],
    ['huevo',    'embutido'],  // huevo + jamón está bien en desayuno, pero no en almuerzo
  ],

  // ─── Familias para evitar duplicar almidones/legumbres ────
  FAMILIA: {
    'cereales':   'almidones',
    'panes':      'almidones',
    'tuberculos': 'almidones',
    'legumbres':  'legumbres',  // frijoles, lentejas, garbanzos, ejote
  },

  // ─── Pool de alimentos por comida ─────────────────────────
  MENU_POOL: {
    desayuno: {
      proteina_base:      ['A-0003','A-0004','A-0085'],
      proteina_mixta:     ['A-0012','A-0014','A-0015'],
      proteina_perecedera:['A-0014','A-0015','A-0012','A-0085','A-0003','A-0004'],
      carbo_base:         ['A-0023','A-0024','A-0025','A-0026'],
      grasa_base:         ['A-0036','A-0039','A-0041','A-0043'],
      combinados:         ['A-0090','A-0091','A-0092','A-0093','A-0094'],
    },
    almuerzo: {
      proteina_base:      ['A-0001','A-0002','A-0005','A-0006','A-0008','A-0010'],
      proteina_mixta:     ['A-0016','A-0017','A-0019','A-0018'],
      carbo_base:         ['A-0021','A-0022','A-0023','A-0028','A-0029','A-0027'],
      grasa_base:         ['A-0036','A-0041','A-0042','A-0043'],
      vegetales:          'todas',
    },
    cena: {
      proteina_base:      ['A-0001','A-0005','A-0008','A-0010'],
      proteina_mixta:     ['A-0003','A-0004','A-0016','A-0017'],
      carbo_base:         ['A-0021','A-0023','A-0028','A-0029','A-0025'],
      grasa_base:         ['A-0036','A-0041','A-0043','A-0044'],
      vegetales:          'todas',
    },
    snack1: {
      proteina_base:      [],
      proteina_perecedera:['A-0014','A-0015','A-0012','A-0085'],
      carbo_base:         ['A-0026','A-0034'],
      grasa_base:         ['A-0041','A-0042','A-0043','A-0045'],
      frutas:             'todas',
    },
    snack2: {
      proteina_base:      [],
      proteina_perecedera:['A-0014','A-0015','A-0012'],
      carbo_base:         ['A-0026','A-0034'],
      grasa_base:         ['A-0041','A-0043','A-0044','A-0045'],
      frutas:             'todas',
    },
  },

  // ─── Distribución de macros por comida ────────────────────
  DIST: {
    3: { desayuno:0.30, almuerzo:0.40, cena:0.30 },
    4: { desayuno:0.20, snack1:0.10, almuerzo:0.35, cena:0.35 },
    5: { desayuno:0.20, snack1:0.10, almuerzo:0.30, snack2:0.10, cena:0.30 },
  },

  DIST_AYUNO: {
    3: { almuerzo:0.45, snack1:0.15, cena:0.40 },
    4: { almuerzo:0.40, snack1:0.15, snack2:0.10, cena:0.35 },
    5: { almuerzo:0.35, snack1:0.15, snack2:0.10, cena:0.40 },
  },

  // Platos base — comidas reales y coherentes culturalmente
  PLATOS_BASE: {
    desayuno: [
      { id:'D01', nombre:'Huevos con tortilla y aguacate', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:2} ]},
      { id:'D02', nombre:'Huevos con pan y queso fresco', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0024',rol:'carb',min:1,max:3}, {c:'A-0012',rol:'prot2',min:1,max:2} ]},
      { id:'D03', nombre:'Yogurt con avena y fruta', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0014',rol:'prot',min:2,max:4}, {c:'A-0026',rol:'carb',min:1,max:3}, {rol:'fruta',min:1,max:1} ]},
      { id:'D04', nombre:'Claras con tortilla y frijoles', modos:['fitness','economico'],
        comp:[ {c:'A-0004',rol:'prot',min:3,max:6}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0016',rol:'prot2',min:1,max:2} ]},
      { id:'D05', nombre:'Pan con huevo y jamón de pavo', modos:['salvadoreno','fitness'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0024',rol:'carb',min:1,max:3}, {c:'A-0085',rol:'prot2',min:2,max:4} ]},
      { id:'D06', nombre:'Avena con nueces y fruta', modos:['fitness'],
        comp:[ {c:'A-0026',rol:'carb',min:2,max:4}, {c:'A-0043',rol:'grasa',min:1,max:2}, {c:'A-0014',rol:'prot',min:1,max:3}, {rol:'fruta',min:1,max:1} ]},
      { id:'D07', nombre:'Pupusa con frijoles y queso', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0090',rol:'carb',min:2,max:4}, {c:'A-0016',rol:'prot',min:1,max:2}, {c:'A-0012',rol:'prot2',min:0.5,max:1.5} ]},
      { id:'D08', nombre:'Huevos con frijoles y tortilla', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0016',rol:'prot2',min:1,max:2} ]},
      { id:'D09', nombre:'Avena con chía y fruta', modos:['fitness'],
        comp:[ {c:'A-0026',rol:'carb',min:2,max:4}, {c:'A-0044',rol:'grasa',min:1,max:2}, {c:'A-0014',rol:'prot',min:1,max:3}, {rol:'fruta',min:1,max:1} ]},
      { id:'D10', nombre:'Pancakes con fruta', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0091',rol:'carb',min:1,max:2}, {c:'A-0003',rol:'prot',min:2,max:4}, {rol:'fruta',min:1,max:1} ]},
      { id:'D11', nombre:'Wrap de huevo con vegetales', modos:['fitness'],
        comp:[ {c:'A-0094',rol:'carb',min:1,max:2}, {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:1.5} ]},
      { id:'D12', nombre:'Tostadas francesas con fruta', modos:['salvadoreno','fitness'],
        comp:[ {c:'A-0093',rol:'carb',min:1,max:2}, {c:'A-0003',rol:'prot',min:2,max:4}, {rol:'fruta',min:1,max:1} ]},
      { id:'D13', nombre:'Pan integral con aguacate y huevo', modos:['fitness'],
        comp:[ {c:'A-0025',rol:'carb',min:2,max:4}, {c:'A-0003',rol:'prot',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:2} ]},
      { id:'D14', nombre:'Bowl de avena con marañón y fruta', modos:['fitness'],
        comp:[ {c:'A-0026',rol:'carb',min:2,max:4}, {c:'A-0045',rol:'grasa',min:1,max:2}, {c:'A-0014',rol:'prot',min:1,max:3}, {rol:'fruta',min:1,max:1} ]},
      { id:'D15', nombre:'Requesón con pan integral y fruta', modos:['fitness'],
        comp:[ {c:'A-0015',rol:'prot',min:2,max:4}, {c:'A-0025',rol:'carb',min:2,max:4}, {rol:'fruta',min:1,max:1} ]},
    ],
    almuerzo: [
      { id:'A01', nombre:'Pollo con arroz y ensalada', modos:['salvadoreno','fitness','economico'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A02', nombre:'Carne con papa y vegetales', modos:['salvadoreno'],
        comp:[ {c:'A-0005',rol:'prot',min:1,max:3}, {c:'A-0028',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A03', nombre:'Tilapia con arroz integral y ensalada', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0010',rol:'prot',min:1,max:3}, {c:'A-0022',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A04', nombre:'Pollo con tortilla y aguacate', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A05', nombre:'Carne molida con arroz y frijoles', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0006',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0016',rol:'prot2',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A06', nombre:'Muslo de pollo con camote y vegetales', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0002',rol:'prot',min:1,max:3}, {c:'A-0029',rol:'carb',min:1,max:3}, {c:'A-0041',rol:'grasa',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A07', nombre:'Atún con arroz y ensalada', modos:['economico','fitness'],
        comp:[ {c:'A-0008',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A08', nombre:'Cerdo con arroz y frijoles', modos:['salvadoreno'],
        comp:[ {c:'A-0007',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0017',rol:'prot2',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A09', nombre:'Camarones con arroz y vegetales', modos:['fitness'],
        comp:[ {c:'A-0011',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A10', nombre:'Pechuga con quinoa y vegetales', modos:['fitness'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0035',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A11', nombre:'Carne con yuca y ensalada', modos:['salvadoreno'],
        comp:[ {c:'A-0005',rol:'prot',min:1,max:3}, {c:'A-0030',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A12', nombre:'Pollo con plátano maduro y vegetales', modos:['salvadoreno'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0031',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A13', nombre:'Camarones con yuca y ensalada', modos:['salvadoreno'],
        comp:[ {c:'A-0011',rol:'prot',min:1,max:3}, {c:'A-0030',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A14', nombre:'Bowl de quinoa con camarones', modos:['fitness'],
        comp:[ {c:'A-0011',rol:'prot',min:1,max:3}, {c:'A-0035',rol:'carb',min:1,max:3}, {c:'A-0041',rol:'grasa',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A15', nombre:'Pasta con pollo y brócoli', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0027',rol:'carb',min:1,max:3}, {c:'A-0037',rol:'grasa',min:0.5,max:1.5}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A16', nombre:'Tilapia con camote y espinaca', modos:['fitness'],
        comp:[ {c:'A-0010',rol:'prot',min:1,max:3}, {c:'A-0029',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A17', nombre:'Atún con papa y aguacate', modos:['economico','fitness'],
        comp:[ {c:'A-0008',rol:'prot',min:1,max:3}, {c:'A-0028',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A18', nombre:'Carne molida con pasta y vegetales', modos:['salvadoreno','fitness'],
        comp:[ {c:'A-0006',rol:'prot',min:1,max:3}, {c:'A-0027',rol:'carb',min:1,max:3}, {c:'A-0037',rol:'grasa',min:0.5,max:1.5}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A19', nombre:'Pollo con arroz integral y aguacate', modos:['fitness'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0022',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'A20', nombre:'Lentejas con arroz y vegetales', modos:['economico','fitness'],
        comp:[ {c:'A-0018',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
    ],
    cena: [
      { id:'C01', nombre:'Pollo con arroz y aguacate', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C02', nombre:'Huevos con tortilla y aguacate', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:6}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C03', nombre:'Atún con papa y nueces', modos:['fitness','economico'],
        comp:[ {c:'A-0008',rol:'prot',min:1,max:3}, {c:'A-0028',rol:'carb',min:1,max:3}, {c:'A-0043',rol:'grasa',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C04', nombre:'Carne con camote y aguacate', modos:['salvadoreno','fitness'],
        comp:[ {c:'A-0005',rol:'prot',min:1,max:3}, {c:'A-0029',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C05', nombre:'Tilapia con camote y almendras', modos:['fitness'],
        comp:[ {c:'A-0010',rol:'prot',min:1,max:3}, {c:'A-0029',rol:'carb',min:1,max:3}, {c:'A-0041',rol:'grasa',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C06', nombre:'Huevos con tortilla y frijoles', modos:['salvadoreno','economico'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:6}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0016',rol:'prot2',min:1,max:2}, {c:'A-0036',rol:'grasa',min:0.5,max:1.5} ]},
      { id:'C07', nombre:'Pollo con plátano maduro y vegetales', modos:['salvadoreno'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0031',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C08', nombre:'Tilapia con papa y aguacate', modos:['fitness'],
        comp:[ {c:'A-0010',rol:'prot',min:1,max:3}, {c:'A-0028',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C09', nombre:'Carne con yuca y aguacate', modos:['salvadoreno'],
        comp:[ {c:'A-0005',rol:'prot',min:1,max:3}, {c:'A-0030',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C10', nombre:'Bowl de quinoa con pollo y aguacate', modos:['fitness'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0035',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C11', nombre:'Camarones con arroz integral y vegetales', modos:['fitness'],
        comp:[ {c:'A-0011',rol:'prot',min:1,max:3}, {c:'A-0022',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C12', nombre:'Pasta con atún y vegetales', modos:['fitness','economico'],
        comp:[ {c:'A-0008',rol:'prot',min:1,max:3}, {c:'A-0027',rol:'carb',min:1,max:3}, {c:'A-0037',rol:'grasa',min:0.5,max:1.5}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C13', nombre:'Claras con camote y nueces', modos:['fitness'],
        comp:[ {c:'A-0004',rol:'prot',min:3,max:6}, {c:'A-0029',rol:'carb',min:1,max:3}, {c:'A-0043',rol:'grasa',min:1,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C14', nombre:'Pollo con chayote y aguacate', modos:['fitness','salvadoreno'],
        comp:[ {c:'A-0001',rol:'prot',min:1,max:3}, {c:'A-0021',rol:'carb',min:1,max:3}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
      { id:'C15', nombre:'Huevos con chipilín y tortilla', modos:['salvadoreno'],
        comp:[ {c:'A-0003',rol:'prot',min:2,max:6}, {c:'A-0023',rol:'carb',min:2,max:4}, {c:'A-0036',rol:'grasa',min:0.5,max:2}, {rol:'vegetal',min:1,max:1} ]},
    ],
  },
  PREF_DEFAULT: {
    num_comidas:      4,
    ayuno:            false,
    modo:             'salvadoreno',
    restricciones:    [],
    snack_perecedero: false,
  },

  TOL: { prot: 5, grasa: 5, carb: 10 },

  // ═══════════════════════════════════════════════════════════
  // CARGA
  // ═══════════════════════════════════════════════════════════
  async cargar() {
    const uid = window.app.usuario.id;
    this.perfilActual = await window.dbHelpers.obtenerPerfilNutricional(uid);
    this.configActual = await window.dbHelpers.obtenerConfigPreferencias(uid);
    if (!this.perfilActual) { this.renderSinPerfil(); return; }
    this.calculoActual = window.calculo.calcularCompleto(this.perfilActual, this.configActual);
    this.alimentos     = await window.dbHelpers.listarAlimentos();
    this.preferencias  = await this.cargarPrefs(uid);
    this.renderPantalla();
  },

  async cargarPrefs(uid) {
    try {
      const { data } = await window.db
        .from('configuraciones_preferencias')
        .select('preferencias_dieta')
        .eq('usuario_id', uid).single();
      return { ...this.PREF_DEFAULT, ...(data?.preferencias_dieta || {}) };
    } catch { return { ...this.PREF_DEFAULT }; }
  },

  async guardarPrefs() {
    try {
      await window.db.from('configuraciones_preferencias').upsert(
        { usuario_id: window.app.usuario.id, preferencias_dieta: this.preferencias },
        { onConflict: 'usuario_id' }
      );
    } catch (e) { console.warn('Error guardando prefs:', e); }
  },

  // ═══════════════════════════════════════════════════════════
  // ALGORITMO MACRO-FIRST
  // ═══════════════════════════════════════════════════════════
  generarMenu() {
    const r = this.calculoActual;
    const p = this.preferencias;
    const macrosDia = {
      kcal:  r.kcal_objetivo,
      prot:  r.proteina_g,
      grasa: r.grasa_g,
      carb:  r.carbo_g,
    };
    const estructura = this.definirEstructura(p);
    const dist = p.ayuno
      ? (this.DIST_AYUNO[p.num_comidas] || this.DIST_AYUNO[3])
      : (this.DIST[p.num_comidas] || this.DIST[4]);
    const diaBase    = this.generarDia(estructura, dist, macrosDia, p, 0);
    const semana     = Array.from({ length: 7 }, (_, i) =>
      this.generarDia(estructura, dist, macrosDia, p, (i + 1) * 13)
    );
    return { diaBase, semana, macrosDia, estructura, dist };
  },

  definirEstructura(p) {
    const e = [];
    if (!p.ayuno) e.push('desayuno');
    if (p.num_comidas >= 4) e.push('snack1');
    e.push('almuerzo');
    if (p.num_comidas >= 5) e.push('snack2');
    e.push('cena');
    return e;
  },

  generarDia(estructura, dist, macrosDia, p, seed) {
    return estructura.map(tiempo => {
      const pct  = dist[tiempo] || 0.20;
      const meta = {
        prot:  macrosDia.prot  * pct,
        grasa: macrosDia.grasa * pct,
        carb:  macrosDia.carb  * pct,
        kcal:  macrosDia.kcal  * pct,
      };
      const items = tiempo.startsWith('snack')
        ? this.armarSnack(tiempo, meta, p, seed)
        : this.armarComida(tiempo, meta, p, seed);
      return { tiempo, label: this.labelTiempo(tiempo), meta, items };
    });
  },

  // ─── ARMAR COMIDA DESDE PLATO BASE ──────────────────────────
  armarComida(tiempo, meta, p, seed) {
    const platosT = this.PLATOS_BASE[tiempo];
    if (!platosT) return [];

    // Filtrar platos por modo y restricciones
    let platos = platosT.filter(pl => pl.modos.includes(p.modo));
    if (platos.length === 0) platos = [...platosT]; // fallback: todos

    // Filtrar por restricciones — descartar platos con alimentos bloqueados
    platos = platos.filter(pl => {
      const codigos = pl.comp.filter(c => c.c).map(c => c.c);
      const alims   = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
      return this.filtrar(alims, p).length === alims.length;
    });
    if (platos.length === 0) return [];

    const plato = this.elegir(platos, seed);
    const items = [];
    let cubierto = { prot: 0, grasa: 0, carb: 0 };

    // Construir plato componente por componente
    for (const comp of plato.comp) {
      // Vegetal libre
      if (comp.rol === 'vegetal') {
        const vegs = this.alimentos.filter(a => a.categoria === 'vegetales');
        const veg  = this.elegir(vegs, seed + 4);
        if (veg) items.push(this.crearItem(veg, 1, 'vegetales', true));
        continue;
      }
      // Fruta
      if (comp.rol === 'fruta') {
        const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
        const fruta  = this.elegir(frutas, seed + 6);
        if (fruta) {
          const item = this.crearItem(fruta, 1, 'frutas');
          items.push(item);
          cubierto = this.sumar(cubierto, item);
        }
        continue;
      }
      // Alimento con código
      const alim = this.alimentos.find(a => a.codigo === comp.c);
      if (!alim) continue;

      const cat = comp.rol === 'carb' ? 'carbohidratos' : comp.rol === 'grasa' ? 'grasas' : 'proteinas';

      // Calcular porciones directamente desde macros objetivo
      let objetivo = comp.min;
      if (comp.rol === 'prot') {
        const tieneP2 = plato.comp.some(c => c.rol === 'prot2');
        const pctProt = tieneP2 ? 0.65 : 1.0;
        objetivo = (meta.prot * pctProt) / (alim.proteina_g || 1);
      } else if (comp.rol === 'prot2') {
        objetivo = (meta.prot - cubierto.prot) / (alim.proteina_g || 1);
      } else if (comp.rol === 'grasa') {
        objetivo = (meta.grasa - cubierto.grasa) / (alim.grasa_g || 1);
      } else if (comp.rol === 'carb') {
        objetivo = (meta.carb - cubierto.carb) / (alim.carbo_g || 1);
      }

      // Limitar: mínimo del plato, máximo = MAX_PORCIONES global
      const esEntero  = this.PORCION_ENTERA[alim.codigo];
      const maxGlobal = this.maxPorc(alim.codigo);
      let porcs = esEntero
        ? Math.max(comp.min, Math.min(Math.round(objetivo), maxGlobal))
        : Math.max(comp.min, Math.min(Math.round(objetivo * 2) / 2, maxGlobal));

      const item = this.crearItem(alim, porcs, cat);
      item._compMin = comp.min;
      item._compMax = comp.max;
      items.push(item);
      cubierto = this.sumar(cubierto, item);
    }

    // Frijoles en almuerzo salvadoreño si no hay legumbre ya
    if (tiempo === 'almuerzo' && p.modo === 'salvadoreno') {
      const yaHayLegumbre = items.some(i => i.subcategoria === 'legumbres');
      if (!yaHayLegumbre) {
        const frijol = this.alimentos.find(a => a.codigo === 'A-0016');
        if (frijol) {
          const item = this.crearItem(frijol, 0.5, 'proteinas');
          item._compMin = 0.5; item._compMax = 1;
          items.push(item);
          cubierto = this.sumar(cubierto, item);
        }
      }
    }

    // Guardar nombre del plato para mostrar en UI
    items._platoNombre = plato.nombre;

    // Ajuste final iterativo
    return this.ajustarFinalIterativo(items, meta);
  },

  // ─── ARMAR SNACK ──────────────────────────────────────────
  armarSnack(tiempo, meta, p, seed) {
    const pool  = this.MENU_POOL[tiempo];
    if (!pool) return [];
    const items = [];
    let cubierto = { prot: 0, grasa: 0, carb: 0 };

    // 1. Fruta (siempre)
    if (pool.frutas === 'todas') {
      const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
      const fruta  = this.elegir(frutas, seed + 10);
      if (fruta) {
        const item = this.crearItem(fruta, 1, 'frutas');
        items.push(item);
        cubierto = this.sumar(cubierto, item);
      }
    }

    // 2. Carbo (avena o cereal) para cubrir meta de carbos
    const carbFalt = meta.carb - cubierto.carb;
    if (carbFalt > 5 && pool.carbo_base?.length > 0) {
      const listaC = this.buscar(pool.carbo_base, p).filter(a => !items.find(i => i.codigo === a.codigo));
      const c = this.elegir(listaC, seed + 11);
      if (c) {
        const porcs = this.calcPorciones(c, carbFalt, 'carb');
        items.push(this.crearItem(c, porcs, 'carbohidratos'));
        cubierto = this.sumar(cubierto, items[items.length-1]);
      }
    }

    // 3. Fruto seco como GRASA para cubrir meta de grasas
    const grasaFalt = meta.grasa - cubierto.grasa;
    if (grasaFalt > 3 && pool.grasa_base?.length > 0) {
      const listaG = this.buscar(pool.grasa_base, p).filter(a => !items.find(i => i.codigo === a.codigo));
      const g = this.elegir(listaG, seed + 12);
      if (g) {
        const porcs = this.calcPorciones(g, grasaFalt, 'grasa');
        items.push(this.crearItem(g, porcs, 'grasas'));
        cubierto = this.sumar(cubierto, items[items.length-1]);
      }
    }

    // 4. Proteína perecedera (solo si snack_perecedero = true)
    if (p.snack_perecedero && pool.proteina_perecedera?.length > 0) {
      const protFalt = meta.prot - cubierto.prot;
      if (protFalt > 5) {
        const listaP = this.buscar(pool.proteina_perecedera, p).filter(a => !items.find(i => i.codigo === a.codigo));
        const prot = this.elegir(listaP, seed + 13);
        if (prot) {
          const porcs = this.calcPorciones(prot, protFalt, 'prot');
          items.push(this.crearItem(prot, porcs, 'proteinas'));
        }
      }
    }

    return items;
  },

  // ─── AJUSTE FINAL DE CARBOS (§7) ──────────────────────────
  // NUNCA modifica proteína ni grasa
  // ─── AJUSTE FINAL ITERATIVO ──────────────────────────────
  // Itera hasta que todos los macros queden entre 95%-102%
  // NUNCA toca la proteína
  ajustarFinalIterativo(items, meta) {
    const enRango = (actual, obj) => obj > 0 && actual >= obj * 0.95 && actual <= obj * 1.02;
    const paso = (item) => this.PORCION_ENTERA[item.codigo] ? 1 : 0.5;

    const ajustar = (cat, macro, accion) => {
      const cands = items
        .map((it, i) => ({ it, i }))
        .filter(x => x.it._cat === cat && !x.it._alGusto)
        .sort((a, b) => (b.it[macro] || 0) - (a.it[macro] || 0));
      for (const { it, i } of cands) {
        // Usar el máximo global si el compMax es muy restrictivo
        const maxComp = it._compMax || it._maxPorciones || this.maxPorc(it.codigo);
        const maxGlobal = this.maxPorc(it.codigo);
        const maxP = Math.max(maxComp, maxGlobal);
        const minP = it._compMin || 0.5;
        const p    = paso(it);
        const nueva = accion === 'subir'
          ? Math.min(it._porciones + p, maxP)
          : Math.max(it._porciones - p, minP);
        if (nueva !== it._porciones) {
          const nu = this.crearItem(it, nueva, it._cat);
          nu._compMin = it._compMin; nu._compMax = it._compMax;
          items[i] = nu;
          return true;
        }
      }
      return false;
    };

    for (let iter = 0; iter < 40; iter++) {
      const t = this.totalesItems(items);
      const kcal = (t.prot * 4) + (t.carb * 4) + (t.grasa * 9);
      if (enRango(kcal, meta.kcal) && enRango(t.grasa, meta.grasa) && enRango(t.carb, meta.carb)) break;

      // Prioridad 1: bajar excesos
      if (t.carb  > meta.carb  * 1.02 && ajustar('carbohidratos', '_carb', 'bajar'))  continue;
      if (t.grasa > meta.grasa * 1.02 && ajustar('grasas',         '_grasa','bajar'))  continue;
      // Prioridad 2: subir faltantes
      if (t.grasa < meta.grasa * 0.95 && ajustar('grasas',         '_grasa','subir'))  continue;
      if (t.carb  < meta.carb  * 0.95 && ajustar('carbohidratos', '_carb', 'subir'))  continue;
      // Prioridad 3: ajustar kcal totales
      if (kcal > meta.kcal * 1.02    && ajustar('carbohidratos', '_carb', 'bajar'))   continue;
      if (kcal < meta.kcal * 0.95    && ajustar('carbohidratos', '_carb', 'subir'))   continue;
      break;
    }
    return items;
  },

  // ═══════════════════════════════════════════════════════════
  // HELPERS DE CÁLCULO
  // ═══════════════════════════════════════════════════════════

  // Calcular porciones necesarias para cubrir un macro objetivo
  calcPorciones(alimento, objetivo, tipo) {
    const valPorPorc = tipo === 'prot'  ? (alimento.proteina_g || 0) :
                       tipo === 'grasa' ? (alimento.grasa_g    || 0) :
                       tipo === 'carb'  ? (alimento.carbo_g    || 0) : 1;
    if (valPorPorc <= 0) return 1;
    const porcs = objetivo / valPorPorc;
    return this.limitarPorciones(alimento.codigo, porcs);
  },

  limitarPorciones(codigo, porcs) {
    const max = this.maxPorc(codigo);
    const redondeado = Math.round(porcs * 2) / 2; // redondeo a 0.5
    return Math.max(0.5, Math.min(redondeado, max));
  },

  maxPorc(codigo) { return this.MAX_PORCIONES[codigo] || 3; },

  // Crear ítem con macros calculados desde porciones (no de Supabase directamente)
  crearItem(alimento, porciones, cat, alGusto = false) {
    const base   = alimento.porcion_base_g || 100;
    const porcs  = alGusto ? 1 : Math.round(porciones * 2) / 2;
    const gramos = alGusto ? base : Math.round(porcs * base);
    const factor = gramos / base;

    // Macros calculados desde los datos base × factor (no redondeados aún)
    const protR  = (alimento.proteina_g || 0) * factor;
    const grasaR = (alimento.grasa_g    || 0) * factor;
    const carbR  = (alimento.carbo_g    || 0) * factor;
    // kcal calculada desde macros (regla fundamental)
    const kcalR  = (protR * 4) + (carbR * 4) + (grasaR * 9);

    let _porcion = alGusto ? '1 porción al gusto' : `${gramos}g`;
    if (!alGusto && alimento.unidad_hogar && base > 0) {
      const uR = Math.round((gramos / base) * 2) / 2;
      if (uR >= 0.5 && uR <= 10) {
        const uh = alimento.unidad_hogar.replace(/^[\d.]+\s*/, '').trim();
        _porcion = `${gramos}g (≈ ${uR} ${uh})`;
      }
    }

    return {
      ...alimento,
      _cat:          cat,
      _gramos:       gramos,
      _porcion,
      _porciones:    porcs,
      _maxPorciones: this.maxPorc(alimento.codigo),
      _alGusto:      alGusto,
      // Macros redondeados solo para display
      _kcal:  Math.round(kcalR),
      _prot:  Math.round(protR  * 10) / 10,
      _grasa: Math.round(grasaR * 10) / 10,
      _carb:  Math.round(carbR  * 10) / 10,
    };
  },

  sumar(acc, item) {
    return {
      prot:  acc.prot  + (item._prot  || 0),
      grasa: acc.grasa + (item._grasa || 0),
      carb:  acc.carb  + (item._carb  || 0),
    };
  },

  totalesItems(items) {
    const t = items.reduce((a, i) => ({
      prot:  a.prot  + (i._prot  || 0),
      grasa: a.grasa + (i._grasa || 0),
      carb:  a.carb  + (i._carb  || 0),
    }), { prot: 0, grasa: 0, carb: 0 });
    // kcal siempre calculada desde macros
    return { ...t, kcal: Math.round((t.prot * 4) + (t.carb * 4) + (t.grasa * 9)) };
  },

  totalesComida(comida) { return this.totalesItems(comida.items); },

  totalesDia(dia) {
    return dia.reduce((a, c) => {
      const t = this.totalesComida(c);
      return {
        prot:  a.prot  + t.prot,
        grasa: a.grasa + t.grasa,
        carb:  a.carb  + t.carb,
        kcal:  a.kcal  + t.kcal,
      };
    }, { prot: 0, grasa: 0, carb: 0, kcal: 0 });
  },

  // ─── Helpers de selección ─────────────────────────────────
  buscar(codigos, p) {
    if (!codigos || codigos.length === 0) return [];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
    return this.filtrar(lista, p);
  },

  filtrar(lista, p) {
    const r = p.restricciones || [];
    if (r.includes('sin_lacteos')) lista = lista.filter(a => !a.etiquetas?.includes('lacteo'));
    if (r.includes('sin_gluten'))  lista = lista.filter(a => !a.etiquetas?.includes('gluten'));
    if (r.includes('sin_cerdo'))   lista = lista.filter(a => !a.etiquetas?.includes('cerdo'));
    if (r.includes('vegetariano')) lista = lista.filter(a => !a.etiquetas?.includes('carnes'));
    return lista;
  },

  elegir(lista, seed) {
    if (!lista || lista.length === 0) return null;
    return lista[Math.abs(Math.round(seed)) % lista.length];
  },

  sonIncompatibles(tipo1, tipo2) {
    if (!tipo1 || !tipo2) return false;
    return this.INCOMPATIBLES.some(([a, b]) =>
      (a === tipo1 && b === tipo2) || (a === tipo2 && b === tipo1)
    );
  },

  labelTiempo(t) {
    return {
      desayuno: '🌅 Desayuno',
      snack1:   '🍎 Snack mañana',
      almuerzo: '🍽️ Almuerzo',
      snack2:   '🌿 Snack tarde',
      cena:     '🌙 Cena',
    }[t] || t;
  },

  // ═══════════════════════════════════════════════════════════
  // UI — RENDER
  // ═══════════════════════════════════════════════════════════

  renderSinPerfil() {
    document.getElementById('page-dieta').innerHTML = `
      <div class="page-header"><h1 class="page-title">Mi Dieta Sugerida</h1></div>
      <div class="card text-center" style="padding:40px 20px;">
        <div style="font-size:3rem;margin-bottom:12px;">📋</div>
        <h3>Completa tu perfil primero</h3>
        <p style="color:var(--color-texto-secundario);margin:8px 0 20px;">Necesitamos tus datos para generar tu dieta.</p>
        <button class="btn btn-primary" onclick="window.app.navegar('perfil')">Ir a Mi Perfil →</button>
      </div>`;
  },

  renderPantalla() {
    const r = this.calculoActual;
    document.getElementById('page-dieta').innerHTML = `
      <div class="page-header">
        <h1 class="page-title">🍽️ Mi Dieta Sugerida</h1>
        <p class="page-subtitle">${window.ui.formatearNumero(r.kcal_objetivo)} kcal · ${r.proteina_g}g P · ${r.grasa_g}g G · ${r.carbo_g}g C</p>
      </div>
      ${this.renderPrefs()}
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <button class="btn-vista ${this.vistaActiva==='diario'?'activa':''}" data-vista="diario">📅 Menú del día</button>
        <button class="btn-vista ${this.vistaActiva==='semanal'?'activa':''}" data-vista="semanal">🗓️ Menú semanal</button>
      </div>
      <div id="dieta-cont"><div class="loading"><div class="spinner"></div></div></div>
      ${this.estilos()}`;
    this.bindEventos();
    this.generar();
  },

  renderPrefs() {
    const p = this.preferencias;
    const modos = { salvadoreno:'🇸🇻 Salvadoreño', fitness:'💪 Fitness', economico:'💰 Económico' };
    return `
    <div class="card mb-3">
      <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;" id="tog-prefs">
        <span style="font-weight:600;">⚙️ Configurar mi menú</span>
        <span id="arr-prefs" style="transition:transform 0.25s;">▼</span>
      </div>
      <div id="prefs-body" style="display:none;margin-top:14px;">
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div><label class="pref-label">🍴 Comidas al día</label>
            <div class="btn-group-pref">${[3,4,5].map(n=>`<button class="btn-pref ${p.num_comidas===n?'activo':''}" data-pref="num_comidas" data-val="${n}">${n} comidas</button>`).join('')}</div>
          </div>
          <div><label class="pref-label">🌟 Estilo</label>
            <div class="btn-group-pref">${Object.entries(modos).map(([k,v])=>`<button class="btn-pref ${p.modo===k?'activo':''}" data-pref="modo" data-val="${k}">${v}</button>`).join('')}</div>
          </div>
          <div><label class="pref-label">🚫 Restricciones</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${['sin_lacteos:🥛 Sin lácteos','sin_gluten:🌾 Sin gluten','sin_cerdo:🐷 Sin cerdo','vegetariano:🥦 Vegetariano']
                .map(s => { const [k,l]=s.split(':'); return `<label class="check-pref"><input type="checkbox" data-restr="${k}" ${(p.restricciones||[]).includes(k)?'checked':''}><span>${l}</span></label>`; }).join('')}
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <label class="check-pref"><input type="checkbox" data-check="ayuno" ${p.ayuno?'checked':''}><span>⏱️ Ayuno intermitente</span></label>
            <label class="check-pref"><input type="checkbox" data-check="snack_perecedero" ${p.snack_perecedero?'checked':''}><span>🧊 Snacks con refrigeración</span></label>
          </div>
        </div>
        <button class="btn btn-primary mt-3" id="btn-aplicar" style="width:100%;">✅ Aplicar y generar menú</button>
      </div>
    </div>`;
  },

  bindEventos() {
    document.getElementById('tog-prefs')?.addEventListener('click', () => {
      const b = document.getElementById('prefs-body');
      const a = document.getElementById('arr-prefs');
      const o = b.style.display !== 'none';
      b.style.display = o ? 'none' : 'block';
      a.style.transform = o ? '' : 'rotate(180deg)';
    });
    document.querySelectorAll('[data-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.pref;
        this.preferencias[k] = isNaN(btn.dataset.val) ? btn.dataset.val : Number(btn.dataset.val);
        document.querySelectorAll(`[data-pref="${k}"]`).forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
      });
    });
    document.querySelectorAll('[data-check]').forEach(c => {
      c.addEventListener('change', () => { this.preferencias[c.dataset.check] = c.checked; });
    });
    document.querySelectorAll('[data-restr]').forEach(c => {
      c.addEventListener('change', () => {
        if (!this.preferencias.restricciones) this.preferencias.restricciones = [];
        const k = c.dataset.restr;
        if (c.checked) { if (!this.preferencias.restricciones.includes(k)) this.preferencias.restricciones.push(k); }
        else { this.preferencias.restricciones = this.preferencias.restricciones.filter(r => r !== k); }
      });
    });
    document.getElementById('btn-aplicar')?.addEventListener('click', async () => {
      await this.guardarPrefs();
      document.getElementById('prefs-body').style.display = 'none';
      this.generar();
    });
    document.querySelectorAll('[data-vista]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.vistaActiva = btn.dataset.vista;
        document.querySelectorAll('[data-vista]').forEach(b => b.classList.remove('activa'));
        btn.classList.add('activa');
        this.renderMenu();
      });
    });
  },

  generar() {
    const cont = document.getElementById('dieta-cont');
    cont.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    setTimeout(() => {
      try {
        this.menuGenerado = this.generarMenu();
        this.renderMenu();
      } catch(e) {
        console.error(e);
        cont.innerHTML = `<div class="alert alert-warning">⚠️ Error: ${e.message}</div>`;
      }
    }, 120);
  },

  renderMenu() {
    const cont = document.getElementById('dieta-cont');
    if (!this.menuGenerado) return;
    const { diaBase, semana, macrosDia } = this.menuGenerado;
    cont.innerHTML = (this.vistaActiva === 'diario'
      ? this.renderDiario(diaBase, macrosDia)
      : this.renderSemanal(semana, macrosDia)) + this.renderBotones();
    document.getElementById('btn-regen')?.addEventListener('click', () => this.generar());
  },

  // ─── RENDER DIARIO ────────────────────────────────────────
  renderDiario(dia, obj) {
    const tot = this.totalesDia(dia);
    return `
    <div class="card mb-3" style="background:var(--color-superficie-hover);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;">📊 Resumen del día</div>
          <div style="font-size:0.8rem;color:var(--color-texto-secundario);">${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal</div>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:7px;">
        ${this.barraMacro('Calorías', tot.kcal,            obj.kcal,  'kcal')}
        ${this.barraMacro('Proteína', Math.round(tot.prot), obj.prot,  'g'  )}
        ${this.barraMacro('Grasa',    Math.round(tot.grasa),obj.grasa, 'g'  )}
        ${this.barraMacro('Carbos',   Math.round(tot.carb), obj.carb,  'g'  )}
      </div>
    </div>
    ${dia.map(c => this.renderComida(c, 0)).join('')}`;
  },

  barraMacro(label, actual, objetivo, unidad) {
    const pct     = Math.min(Math.round((actual / objetivo) * 100), 120);
    const enRango = pct >= 90 && pct <= 110;
    const color   = enRango ? '#10b981' : pct < 90 ? '#f59e0b' : '#ef4444';
    const icon    = enRango ? '✅' : pct < 90 ? '⚠️' : '🔴';
    return `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:2px;">
        <span style="font-weight:600;">${icon} ${label}</span>
        <span style="color:var(--color-texto-secundario);">${actual}${unidad} / ${objetivo}${unidad} (${pct}%)</span>
      </div>
      <div style="height:6px;background:var(--color-borde);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${Math.min(pct,100)}%;background:${color};border-radius:99px;"></div>
      </div>
    </div>`;
  },

  renderSemanal(semana, obj) {
    const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    return semana.map((dia, i) => {
      const tot = this.totalesDia(dia);
      const pct = Math.round((tot.kcal / obj.kcal) * 100);
      const color = pct >= 90 && pct <= 110 ? '#10b981' : '#f59e0b';
      return `
      <div class="card mb-2">
        <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
             onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
          <span style="font-weight:600;">📅 ${dias[i]}</span>
          <span style="font-size:0.78rem;color:${color};font-weight:600;">~${window.ui.formatearNumero(tot.kcal)} kcal (${pct}%)</span>
        </div>
        <div style="display:none;margin-top:12px;">${dia.map(c => this.renderComida(c, i+1)).join('')}</div>
      </div>`;
    }).join('');
  },

  // ─── RENDER COMIDA ────────────────────────────────────────
  renderComida(comida, diaIdx) {
    const tot = this.totalesComida(comida);
    const key = `${diaIdx}-${comida.tiempo}`;
    const pctP = comida.meta.prot > 0 ? Math.round((tot.prot / comida.meta.prot) * 100) : 0;
    const warn = pctP < 80 ? `<div class="warn-comida">⚠️ Proteína baja (${Math.round(tot.prot)}g / meta ${Math.round(comida.meta.prot)}g)</div>` : '';

    const platoLabel = comida.items._platoNombre
      ? `<div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-top:2px;">🍽️ ${comida.items._platoNombre}</div>`
      : '';

    return `
    <div class="card mb-2" style="padding:14px;" id="cc-${key}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <div><span style="font-weight:700;">${comida.label}</span>${platoLabel}</div>
        <div style="display:flex;gap:6px;font-size:0.76rem;font-weight:600;" id="tc-${key}">
          <span>${tot.kcal} kcal</span>
          <span style="color:#ef4444;">P:${Math.round(tot.prot)}g</span>
          <span style="color:#f59e0b;">G:${Math.round(tot.grasa)}g</span>
          <span style="color:#10b981;">C:${Math.round(tot.carb)}g</span>
        </div>
      </div>
      ${warn}
      <div style="display:flex;flex-direction:column;gap:6px;" id="its-${key}">
        ${comida.items.map((item, i) => this.renderItem(item, key, i, comida.tiempo)).join('')}
      </div>
      <div style="margin-top:10px;">
        <button class="btn-agregar" onclick="window.dieta.abrirAgregar('${key}','${comida.tiempo}',${diaIdx})">＋ Agregar alimento</button>
      </div>
      <div id="pa-${key}" style="display:none;margin-top:8px;"></div>
    </div>`;
  },

  // ─── RENDER ÍTEM ──────────────────────────────────────────
  renderItem(item, key, idx, tiempo) {
    const S = {
      proteinas:     { bg:'#fee2e2', bd:'#991b1b', em:'🥩' },
      carbohidratos: { bg:'#d1fae5', bd:'#065f46', em:'🍞' },
      grasas:        { bg:'#fef9c3', bd:'#92400e', em:'🥑' },
      frutas:        { bg:'#ede9fe', bd:'#5b21b6', em:'🍎' },
      vegetales:     { bg:'#dcfce7', bd:'#166534', em:'🥬' },
      combinados:    { bg:'#e0f2fe', bd:'#0c4a6e', em:'🫓' },
    };
    const s   = S[item._cat] || { bg:'#f1f5f9', bd:'#475569', em:'🍽️' };
    const uid = `${key}-${idx}`;
    const nom = (item.nombre || '').replace(/'/g, "\\'");

    const btnReceta = item.codigo && !item._alGusto ? `
      <button onclick="event.stopPropagation();window.recetas?.mostrarPanelRecetas('${item.codigo}','${nom}','${uid}')"
        style="background:none;border:1px solid #10b981;border-radius:5px;cursor:pointer;font-size:0.7rem;color:#10b981;padding:1px 6px;font-weight:600;font-family:inherit;">👨‍🍳</button>` : '';

    const btnElim = item._manual ? `
      <button onclick="event.stopPropagation();window.dieta.eliminarItem('${key}',${idx})"
        style="background:none;border:none;cursor:pointer;font-size:0.85rem;color:#ef4444;padding:0 2px;">✕</button>` : '';

    const btnPM = !item._alGusto ? `
      <div style="display:flex;align-items:center;gap:3px;" onclick="event.stopPropagation()">
        <button class="btn-pm" onclick="window.dieta.ajustarPorc('${key}',${idx},-1)">−</button>
        <span style="font-size:0.72rem;min-width:18px;text-align:center;font-weight:700;" id="pc-${uid}">${item._porciones}</span>
        <button class="btn-pm" onclick="window.dieta.ajustarPorc('${key}',${idx},+1)">＋</button>
      </div>` : '';

    return `
    <div id="iw-${uid}">
      <div style="padding:7px 11px;border-radius:8px;border-left:3px solid ${s.bd};background:${s.bg}40;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
        <span style="font-size:1rem;">${s.em}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.86rem;">${item.nombre}</div>
          <div style="font-size:0.74rem;color:var(--color-texto-secundario);" id="pt-${uid}">${item._porcion}</div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          ${btnPM}
          ${btnReceta}
          <span style="font-size:0.76rem;color:${s.bd};font-weight:600;" id="kc-${uid}">${item._kcal} kcal</span>
          <button onclick="event.stopPropagation();window.dieta.abrirSust('${key}',${idx},'${item._cat}','${tiempo}')"
            style="background:none;border:none;cursor:pointer;font-size:0.7rem;color:var(--color-texto-claro);">🔄</button>
          ${btnElim}
        </div>
      </div>
      <div id="sp-${uid}" style="display:none;"></div>
    </div>`;
  },

  // ═══════════════════════════════════════════════════════════
  // INTERACCIONES
  // ═══════════════════════════════════════════════════════════

  ajustarPorc(key, idx, delta) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    const item = comida.items[idx];
    if (!item || item._alGusto) return;

    const esEntero   = this.PORCION_ENTERA[item.codigo];
    const paso       = esEntero ? 1 : 0.5;
    const maxRec     = item._maxPorciones || 3;
    const maxAbs     = this.MAX_ABSOLUTO[item.codigo] || maxRec * 2;
    const actual     = item._porciones || 1;
    const nueva      = esEntero
      ? Math.max(1, Math.min(actual + delta * paso, maxAbs))
      : Math.max(0.5, Math.min(actual + delta * paso, maxAbs));

    if (nueva > maxRec && delta > 0) {
      window.ui?.mostrarAlerta(`⚠️ ${item.nombre}: superaste la porción recomendada (${maxRec})`, 'warning', 2500);
    }
    const actualizado = this.crearItem(item, nueva, item._cat);
    actualizado._compMin = item._compMin;
    actualizado._compMax = item._compMax;
    comida.items[idx] = actualizado;
    const uid = `${key}-${idx}`;
    const el  = id => document.getElementById(id);
    if (el(`pt-${uid}`)) el(`pt-${uid}`).textContent = comida.items[idx]._porcion;
    if (el(`kc-${uid}`)) el(`kc-${uid}`).textContent = `${comida.items[idx]._kcal} kcal`;
    if (el(`pc-${uid}`)) el(`pc-${uid}`).textContent = comida.items[idx]._porciones;
    this.actualizarUI(key, comida, diaIdx);
  },

  abrirSust(key, idx, cat, tiempo) {
    document.querySelectorAll('[id^="sp-"]').forEach(p => p.style.display = 'none');
    const uid   = `${key}-${idx}`;
    const panel = document.getElementById(`sp-${uid}`);
    if (!panel) return;

    const pool = this.MENU_POOL[tiempo] || {};
    let codigos = [];
    if (cat === 'proteinas')      codigos = [...(pool.proteina_base||[]), ...(pool.proteina_mixta||[])];
    else if (cat === 'carbohidratos') codigos = pool.carbo_base || [];
    else if (cat === 'grasas')    codigos = pool.grasa_base || [];
    else if (cat === 'frutas')    codigos = this.alimentos.filter(a => a.categoria === 'frutas').map(a => a.codigo);
    else if (cat === 'vegetales') codigos = this.alimentos.filter(a => a.categoria === 'vegetales').map(a => a.codigo);

    const { comida } = this.getComida(key);
    const actual = comida?.items[idx];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c))
      .filter(Boolean).filter(a => a.codigo !== actual?.codigo);
    lista = this.filtrar(lista, this.preferencias);

    const cols = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534' };
    panel.innerHTML = lista.length === 0
      ? `<div style="padding:8px 12px;font-size:0.82rem;color:var(--color-texto-secundario);">Sin alternativas para este tiempo.</div>`
      : `<div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-radius:0 0 8px 8px;overflow:hidden;">
          <div style="padding:5px 12px;background:var(--color-superficie-hover);font-size:0.72rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;">🔄 Opciones del mismo tiempo</div>
          ${lista.slice(0,8).map(a => `
          <div onclick="window.dieta.hacerSust('${key}',${idx},'${a.codigo}','${cat}')"
               style="padding:8px 12px;border-bottom:1px solid var(--color-borde);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;font-size:0.85rem;">${a.nombre}</div>
              <div style="font-size:0.72rem;color:var(--color-texto-secundario);">P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div>
            </div>
            <span style="font-size:0.76rem;color:${cols[cat]||'#475569'};font-weight:600;">${a.kcal} kcal/porc</span>
          </div>`).join('')}
        </div>`;
    panel.style.display = 'block';
  },

  hacerSust(key, idx, codigo, cat) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    const nuevo = this.alimentos.find(a => a.codigo === codigo);
    if (!nuevo) return;
    const porcsAnterior = comida.items[idx]._porciones || 1;
    comida.items[idx] = this.crearItem(nuevo, porcsAnterior, cat);
    this.rerenderItems(key, comida);
    this.actualizarUI(key, comida, diaIdx);
    const sp = document.getElementById(`sp-${key}-${idx}`);
    if (sp) sp.style.display = 'none';
  },

  abrirAgregar(key, tiempo, diaIdx) {
    const panel = document.getElementById(`pa-${key}`);
    if (!panel) return;
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    document.querySelectorAll('[id^="pa-"]').forEach(p => p.style.display = 'none');
    panel.style.display = 'block';
    panel.innerHTML = `
      <div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-radius:8px;overflow:hidden;">
        <div style="padding:6px 12px;background:var(--color-superficie-hover);font-size:0.72rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;">
          ＋ Opciones de ${this.labelTiempo(tiempo)}
        </div>
        <div style="padding:8px 12px;">
          <input type="text" class="form-input" placeholder="🔍 Buscar..." style="font-size:0.85rem;"
            oninput="window.dieta.filtAgregar(this.value,'${key}','${tiempo}')">
        </div>
        <div id="la-${key}" style="max-height:220px;overflow-y:auto;"></div>
      </div>`;
    this.filtAgregar('', key, tiempo);
  },

  filtAgregar(term, key, tiempo) {
    const lista = document.getElementById(`la-${key}`);
    if (!lista) return;
    const pool = this.MENU_POOL[tiempo] || {};
    let permitidos = [];

    const agregarAlimento = (codigo, catDisplay) => {
      const a = this.alimentos.find(x => x.codigo === codigo);
      if (a && !permitidos.find(p => p.codigo === a.codigo)) {
        permitidos.push({ ...a, _cat: catDisplay });
      }
    };

    Object.entries(pool).forEach(([rol, codigos]) => {
      const catDisplay = rol.includes('proteina') ? 'proteinas' :
                         rol === 'carbo_base'    ? 'carbohidratos' :
                         rol === 'grasa_base'    ? 'grasas' :
                         rol === 'frutas'        ? 'frutas' :
                         rol === 'vegetales'     ? 'vegetales' : rol;
      if (codigos === 'todas') {
        this.alimentos.filter(a => a.categoria === catDisplay).forEach(a => {
          if (!permitidos.find(p => p.codigo === a.codigo)) permitidos.push({ ...a, _cat: catDisplay });
        });
      } else if (Array.isArray(codigos)) {
        codigos.forEach(c => agregarAlimento(c, catDisplay));
      }
    });

    permitidos = this.filtrar(permitidos, this.preferencias);
    if (term) permitidos = permitidos.filter(a => a.nombre.toLowerCase().includes(term.toLowerCase()));

    if (permitidos.length === 0) {
      lista.innerHTML = `<div style="padding:12px;font-size:0.82rem;text-align:center;color:var(--color-texto-secundario);">Sin resultados</div>`;
      return;
    }

    const cols = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534' };
    lista.innerHTML = permitidos.slice(0, 20).map(a => `
      <div onclick="window.dieta.selAgregar('${key}','${a.codigo}','${a._cat||a.categoria}')"
           style="padding:8px 12px;border-bottom:1px solid var(--color-borde);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;font-size:0.85rem;">${a.nombre}</div>
          <div style="font-size:0.72rem;color:var(--color-texto-secundario);">P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div>
        </div>
        <span style="font-size:0.76rem;font-weight:600;color:${cols[a._cat]||'#475569'};">${a.kcal} kcal</span>
      </div>`).join('');
  },

  selAgregar(key, codigo, cat) {
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const lista = document.getElementById(`la-${key}`);
    lista.innerHTML = `
      <div style="padding:12px;">
        <div style="font-weight:600;margin-bottom:4px;">${a.nombre}</div>
        <div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-bottom:10px;">${a.kcal} kcal/porc · P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.78rem;font-weight:600;">Porciones:</label>
          <input type="number" id="ca-${key}" value="1" min="0.5" max="${this.maxPorc(codigo)}" step="0.5"
                 class="form-input" style="width:70px;text-align:center;">
          <button class="btn btn-primary" style="padding:5px 12px;font-size:0.84rem;"
                  onclick="window.dieta.confAgregar('${key}','${codigo}','${cat}')">✓</button>
          <button class="btn btn-outline" style="padding:5px 10px;font-size:0.84rem;"
                  onclick="window.dieta.filtAgregar('','${key}','${key.split('-').slice(1).join('-')}')">←</button>
        </div>
      </div>`;
  },

  confAgregar(key, codigo, cat) {
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const porcs = parseFloat(document.getElementById(`ca-${key}`)?.value) || 1;
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    const item = this.crearItem(a, porcs, cat);
    item._manual = true;
    comida.items.push(item);
    this.rerenderItems(key, comida);
    this.actualizarUI(key, comida, diaIdx);
    const pa = document.getElementById(`pa-${key}`);
    if (pa) pa.style.display = 'none';
  },

  eliminarItem(key, idx) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    comida.items.splice(idx, 1);
    this.rerenderItems(key, comida);
    this.actualizarUI(key, comida, diaIdx);
  },

  // ─── Helpers UI ───────────────────────────────────────────
  rerenderItems(key, comida) {
    const cont = document.getElementById(`its-${key}`);
    if (cont) cont.innerHTML = comida.items.map((item, i) => this.renderItem(item, key, i, comida.tiempo)).join('');
  },

  actualizarUI(key, comida, diaIdx) {
    const tot = this.totalesComida(comida);
    const tc  = document.getElementById(`tc-${key}`);
    if (tc) tc.innerHTML = `
      <span>${tot.kcal} kcal</span>
      <span style="color:#ef4444;">P:${Math.round(tot.prot)}g</span>
      <span style="color:#f59e0b;">G:${Math.round(tot.grasa)}g</span>
      <span style="color:#10b981;">C:${Math.round(tot.carb)}g</span>`;
    if (diaIdx === 0) this.renderMenu();
  },

  getComida(key) {
    const p = key.split('-');
    const diaIdx = parseInt(p[0]);
    const tiempo = p.slice(1).join('-');
    const dia    = diaIdx === 0 ? this.menuGenerado?.diaBase : this.menuGenerado?.semana?.[diaIdx - 1];
    return { diaIdx, tiempo, comida: dia?.find(c => c.tiempo === tiempo) };
  },

  renderBotones() {
    return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn btn-outline" id="btn-regen">🔄 Regenerar menú</button>
      <button class="btn btn-secondary" onclick="window.app.navegar('alimentos')">📋 Alimentos</button>
      <button class="btn btn-outline" onclick="window.recetas?.mostrarSazon()" style="border-color:#10b981;color:#10b981;">🧂 Guía de sazón</button>
    </div>
    <div class="alert alert-info mt-3" style="font-size:0.82rem;">
      <strong>ℹ️</strong> Usa +/− para ajustar porciones · 🔄 para sustituir · 👨‍🍳 para ver recetas
    </div>`;
  },

  estilos() {
    return `<style id="css-dieta">
      .btn-vista{padding:8px 18px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.85rem;font-weight:500;cursor:pointer;font-family:inherit;}
      .btn-vista.activa{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .pref-label{font-size:0.78rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:6px;}
      .btn-group-pref{display:flex;flex-wrap:wrap;gap:6px;}
      .btn-pref{padding:5px 12px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.8rem;cursor:pointer;font-family:inherit;}
      .btn-pref.activo{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .check-pref{display:flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;padding:5px 10px;border-radius:8px;border:1.5px solid var(--color-borde);user-select:none;}
      .check-pref input{accent-color:var(--color-primario);}
      .btn-agregar{display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:999px;border:1.5px dashed var(--color-primario);background:transparent;color:var(--color-primario);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;}
      .btn-pm{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--color-borde);background:var(--color-superficie);font-size:0.85rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;}
      .btn-pm:hover{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .warn-comida{background:#fef9c3;color:#92400e;border-radius:6px;padding:5px 10px;font-size:0.76rem;font-weight:600;margin-bottom:8px;}
    </style>`;
  }
};

document.addEventListener('cargar:dieta', () => window.dieta.cargar());
