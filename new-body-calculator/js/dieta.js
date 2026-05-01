/* ============================================================
   MÓDULO M7: MOTOR DE DIETA v6 — PLATO-FIRST INTELIGENTE
   NutriBalance · by Ronald Castro
   ============================================================
   REGLA FUNDAMENTAL:
   Los datos en Supabase (kcal, proteina_g, grasa_g, carbo_g)
   son valores POR porcion_base_g.
   Ejemplo: Huevo → 72 kcal / 50g (1 huevo)
   
   ALGORITMO v6:
   1. Seleccionar un PLATO BASE real (coherente culinariamente)
   2. Ajustar porciones para cumplir macros
   3. Proteína MANDA — se cubre primero
   4. Nunca romper la lógica del plato en ajustes
   
   REGLA: Primero el plato, luego los macros. Nunca al revés.
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

  // ─── Porciones máximas por alimento (en unidades de porcion_base_g) ──
  MAX_PORCIONES: {
    'A-0003': 3,   // Huevo: máx 3
    'A-0004': 5,   // Clara: máx 5
    'A-0001': 2,   // Pechuga: máx 2
    'A-0002': 2,   // Muslo: máx 2
    'A-0005': 2,   // Res: máx 2
    'A-0006': 2,   // Molida: máx 2
    'A-0007': 2,   // Cerdo: máx 2
    'A-0008': 2,   // Atún agua: máx 2
    'A-0009': 2,   // Atún aceite: máx 2
    'A-0010': 2,   // Tilapia: máx 2
    'A-0011': 2,   // Camarones: máx 2
    'A-0012': 1.5, // Queso fresco: máx 150g
    'A-0013': 1,   // Mozzarella: máx 100g
    'A-0014': 3,   // Yogur griego: máx 300g
    'A-0015': 2,   // Requesón: máx 200g
    'A-0016': 2,   // Frijoles rojos: máx 200g
    'A-0017': 2,   // Frijoles negros: máx 200g
    'A-0021': 2,   // Arroz: máx 200g
    'A-0023': 4,   // Tortilla: máx 4
    'A-0024': 3,   // Pan: máx 3
    'A-0026': 2,   // Avena: máx 2
    'A-0028': 2,   // Papa: máx 200g
    'A-0029': 2,   // Camote: máx 200g
    'A-0036': 1.5, // Aguacate: máx 150g
    'A-0037': 1,   // Aceite oliva: máx 1 cda
    'A-0039': 1,   // Mantequilla: máx 1
    'A-0040': 2,   // Crema maní: máx 2 cdas
    'A-0041': 2,   // Almendras: máx 56g
    'A-0042': 2,   // Maní: máx 56g
    'A-0043': 2,   // Nueces: máx 56g
    'A-0085': 4,   // Jamón pavo: máx 4 rebanadas
    'A-0086': 2,   // Salchicha pavo: máx 2
    'A-0090': 3,   // Pupusa: máx 3
    'A-0091': 2,   // Pancakes: máx 2
    'A-0092': 2,   // Dobladita: máx 2
    'A-0093': 2,   // Tostadas francesas: máx 2
    'A-0094': 2,   // Wrap huevo: máx 2
  },

  // ─── PLATOS BASE — comidas reales y coherentes ─────────────
  // Cada plato define componentes con rol, min y max por alimento.
  // El motor elige un plato y ajusta porciones dentro de esos rangos.
  PLATOS_BASE: {
    desayuno: [
      { id:'D01', nombre:'Huevos con tortilla y aguacate', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0023', rol:'carbohidrato', min:1, max:3 },
          { codigo:'A-0036', rol:'grasa', min:0.5, max:1.5 },
        ]},
      { id:'D02', nombre:'Huevos con pan y queso', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0024', rol:'carbohidrato', min:1, max:2 },
          { codigo:'A-0012', rol:'proteina2', min:0.5, max:1.5 },
        ]},
      { id:'D03', nombre:'Yogurt con fruta y avena', nivel:'ligero',
        modos:['fitness','salvadoreno'],
        componentes:[
          { codigo:'A-0014', rol:'proteina', min:1, max:2 },
          { codigo:'A-0026', rol:'carbohidrato', min:0.5, max:1.5 },
          { rol:'fruta', min:1, max:1 },
        ]},
      { id:'D04', nombre:'Claras con tortilla y frijoles', nivel:'ligero',
        modos:['fitness','economico'],
        componentes:[
          { codigo:'A-0004', rol:'proteina', min:2, max:5 },
          { codigo:'A-0023', rol:'carbohidrato', min:1, max:3 },
          { codigo:'A-0016', rol:'proteina2', min:0.5, max:1 },
        ]},
      { id:'D05', nombre:'Pan con huevo y jamón pavo', nivel:'normal',
        modos:['salvadoreno','fitness'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0024', rol:'carbohidrato', min:1, max:2 },
          { codigo:'A-0085', rol:'proteina2', min:1, max:3 },
        ]},
      { id:'D06', nombre:'Avena con crema de maní y fruta', nivel:'normal',
        modos:['fitness'],
        componentes:[
          { codigo:'A-0014', rol:'proteina', min:1, max:2 },
          { codigo:'A-0026', rol:'carbohidrato', min:0.5, max:1.5 },
          { codigo:'A-0040', rol:'grasa', min:0.5, max:1.5 },
          { rol:'fruta', min:1, max:1 },
        ]},
      { id:'D07', nombre:'Pupusa con frijoles', nivel:'pesado',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0090', rol:'carbohidrato', min:1, max:3 },
          { codigo:'A-0016', rol:'proteina', min:0.5, max:1 },
        ]},
      { id:'D08', nombre:'Huevos con frijoles y tortilla', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0023', rol:'carbohidrato', min:1, max:3 },
          { codigo:'A-0016', rol:'proteina2', min:0.5, max:1 },
        ]},
    ],
    almuerzo: [
      { id:'A01', nombre:'Pollo con arroz y ensalada', nivel:'normal',
        modos:['salvadoreno','fitness','economico'],
        componentes:[
          { codigo:'A-0001', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A02', nombre:'Carne con papa y vegetales', nivel:'normal',
        modos:['salvadoreno'],
        componentes:[
          { codigo:'A-0005', rol:'proteina', min:1, max:2 },
          { codigo:'A-0028', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A03', nombre:'Pescado con arroz y ensalada', nivel:'ligero',
        modos:['fitness','salvadoreno'],
        componentes:[
          { codigo:'A-0010', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A04', nombre:'Pollo con tortilla y aguacate', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0001', rol:'proteina', min:1, max:2 },
          { codigo:'A-0023', rol:'carbohidrato', min:1, max:3 },
          { codigo:'A-0036', rol:'grasa', min:0.5, max:1.5 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A05', nombre:'Carne molida con arroz y frijoles', nivel:'pesado',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0006', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:1.5 },
          { codigo:'A-0016', rol:'proteina2', min:0.5, max:1 },
        ]},
      { id:'A06', nombre:'Muslo de pollo con camote y vegetales', nivel:'normal',
        modos:['fitness','salvadoreno'],
        componentes:[
          { codigo:'A-0002', rol:'proteina', min:1, max:2 },
          { codigo:'A-0029', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A07', nombre:'Atún con arroz y ensalada', nivel:'ligero',
        modos:['economico','fitness'],
        componentes:[
          { codigo:'A-0008', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A08', nombre:'Cerdo con arroz y frijoles', nivel:'pesado',
        modos:['salvadoreno'],
        componentes:[
          { codigo:'A-0007', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:1.5 },
          { codigo:'A-0017', rol:'proteina2', min:0.5, max:1 },
        ]},
      { id:'A09', nombre:'Camarones con arroz y vegetales', nivel:'ligero',
        modos:['fitness'],
        componentes:[
          { codigo:'A-0011', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'A10', nombre:'Pechuga con quinoa y vegetales', nivel:'ligero',
        modos:['fitness'],
        componentes:[
          { codigo:'A-0001', rol:'proteina', min:1, max:2 },
          { codigo:'A-0022', rol:'carbohidrato', min:0.5, max:1.5 },
          { rol:'vegetal', min:1, max:1 },
        ]},
    ],
    cena: [
      { id:'C01', nombre:'Pollo con vegetales', nivel:'ligero',
        modos:['fitness','salvadoreno'],
        componentes:[
          { codigo:'A-0001', rol:'proteina', min:1, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'C02', nombre:'Huevos con aguacate y ensalada', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0036', rol:'grasa', min:0.5, max:1.5 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'C03', nombre:'Atún con ensalada', nivel:'ligero',
        modos:['fitness','economico'],
        componentes:[
          { codigo:'A-0008', rol:'proteina', min:1, max:2 },
          { codigo:'A-0037', rol:'grasa', min:0.5, max:1 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'C04', nombre:'Carne con vegetales', nivel:'normal',
        modos:['salvadoreno','fitness'],
        componentes:[
          { codigo:'A-0005', rol:'proteina', min:1, max:2 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'C05', nombre:'Pescado con camote y vegetales', nivel:'ligero',
        modos:['fitness'],
        componentes:[
          { codigo:'A-0010', rol:'proteina', min:1, max:2 },
          { codigo:'A-0029', rol:'carbohidrato', min:0.5, max:1.5 },
          { rol:'vegetal', min:1, max:1 },
        ]},
      { id:'C06', nombre:'Huevos con tortilla y frijoles', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0003', rol:'proteina', min:1, max:3 },
          { codigo:'A-0023', rol:'carbohidrato', min:1, max:2 },
          { codigo:'A-0016', rol:'proteina2', min:0.5, max:1 },
        ]},
      { id:'C07', nombre:'Pollo con arroz', nivel:'normal',
        modos:['salvadoreno','economico'],
        componentes:[
          { codigo:'A-0001', rol:'proteina', min:1, max:2 },
          { codigo:'A-0021', rol:'carbohidrato', min:0.5, max:1.5 },
        ]},
      { id:'C08', nombre:'Camarones con vegetales', nivel:'ligero',
        modos:['fitness'],
        componentes:[
          { codigo:'A-0011', rol:'proteina', min:1, max:2 },
          { codigo:'A-0037', rol:'grasa', min:0.5, max:1 },
          { rol:'vegetal', min:1, max:1 },
        ]},
    ],
  },

  // ─── Incompatibilidades culinarias ──────────────────────────
  INCOMPATIBLE: {
    'pescado':  ['lacteo'],
    'mariscos': ['lacteo'],
    'res':      ['lacteo'],
    'cerdo':    ['lacteo'],
  },

  // ─── Alimentos con porción entera (no fraccionar) ──────────
  PORCION_ENTERA: {
    'A-0003': true,  // huevo
    'A-0023': true,  // tortilla
    'A-0024': true,  // pan
    'A-0090': true,  // pupusa
    'A-0091': true,  // pancake
    'A-0085': true,  // jamón pavo (rebanada)
    'A-0086': true,  // salchicha pavo
    'A-0092': true,  // dobladita
    'A-0093': true,  // tostada francesa
    'A-0094': true,  // wrap huevo
  },

  // ─── Límite absoluto de seguridad ──────────────────────────
  MAX_ABSOLUTO: {
    'A-0003': 8,
    'A-0023': 8,
    'A-0024': 6,
    'A-0090': 6,
    'A-0036': 3,
    'A-0037': 3,
  },

  // ─── Pool para snacks ──────────────────────────────────────
  SNACK_POOL: {
    proteina_base: ['A-0085','A-0003'],
    proteina_perecedera: ['A-0014','A-0015','A-0012','A-0085','A-0003','A-0004'],
    carbo_base: ['A-0026','A-0034'],
    grasa_base: ['A-0041','A-0042','A-0043','A-0040'],
    frutas: 'todas',
  },

  // ─── Distribución de macros por comida (% del total diario) ──
  DIST: {
    3: { desayuno:0.30, almuerzo:0.40, cena:0.30 },
    4: { desayuno:0.20, almuerzo:0.35, snack1:0.10, cena:0.35 },
    5: { desayuno:0.20, almuerzo:0.30, snack1:0.10, snack2:0.10, cena:0.30 },
  },

  // Distribución cuando ayuno=true (sin desayuno, redistribuido)
  DIST_AYUNO: {
    3: { almuerzo:0.45, snack1:0.15, cena:0.40 },
    4: { almuerzo:0.40, snack1:0.15, snack2:0.10, cena:0.35 },
    5: { almuerzo:0.35, snack1:0.15, snack2:0.10, cena:0.40 },
  },

PREF_DEFAULT: {
  num_comidas: 4,
  ayuno: false,
  modo: 'salvadoreno',
  restricciones: [],
  snack_perecedero: false
},
  // ─── Tolerancias (documento técnico §6.1) ─────────────────
  TOL: { prot: 5, grasa: 5, carb: 10 },

  // ═══════════════════════════════════════════════════════════
  // CARGA E INICIALIZACIÓN
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
  // ALGORITMO MACRO-FIRST (§5 del documento)
  // ═══════════════════════════════════════════════════════════

  generarMenu() {
    const r = this.calculoActual;
    const p = this.preferencias;
    const macrosDia = {
      kcal: r.kcal_objetivo,
      prot: r.proteina_g,
      grasa: r.grasa_g,
      carb: r.carbo_g,
    };

    // Estructura de comidas
    const estructura = [];
    if (!p.ayuno) estructura.push('desayuno');
    estructura.push('almuerzo');
    if (p.num_comidas >= 4) estructura.push('snack1');
    if (p.num_comidas >= 5) estructura.push('snack2');
    estructura.push('cena');

    const dist = p.ayuno
      ? (this.DIST_AYUNO[p.num_comidas] || this.DIST_AYUNO[3])
      : (this.DIST[p.num_comidas] || this.DIST[4]);

    const diaBase = this.generarDia(estructura, dist, macrosDia, p, 0);
    const semana  = Array.from({ length: 7 }, (_, i) =>
      this.generarDia(estructura, dist, macrosDia, p, (i + 1) * 13)
    );

    return { diaBase, semana, macrosDia, estructura, dist };
  },

  generarDia(estructura, dist, macrosDia, p, seed) {
 const usadosDia = new Set();
const tiposProteinaUsados = new Set();

  return estructura.map(tiempo => {
    const pct = dist[tiempo] || 0.20;

    const meta = {
      prot:  Math.round(macrosDia.prot  * pct),
      grasa: Math.round(macrosDia.grasa * pct),
      carb:  Math.round(macrosDia.carb  * pct),
      kcal:  Math.round(macrosDia.kcal  * pct),
    };

    const resultado = tiempo.startsWith('snack')
      ? this.armarSnack(tiempo, meta, p, seed)
      : this.armarComida(tiempo, meta, p, seed, usadosDia, tiposProteinaUsados);

    // Si armarComida devolvió un array con metadata de plato, extraerla
    let items, platoId, platoNombre, platoNivel;
    if (resultado._platoId) {
      platoId = resultado._platoId;
      platoNombre = resultado._platoNombre;
      platoNivel = resultado._platoNivel;
      items = [...resultado]; // copiar items del array
    } else {
      items = resultado;
    }

    return { tiempo, label: this.labelTiempo(tiempo), meta, items, platoId, platoNombre, platoNivel };
  });
},

  // ─── ARMAR COMIDA DESDE PLATO BASE ──────────────────────
  armarComida(tiempo, meta, p, seed, usadosDia = new Set(), tiposProteinaUsados = new Set()) {
    const platosDisponibles = this.PLATOS_BASE[tiempo];
    if (!platosDisponibles) return [];

    // Filtrar platos por modo y restricciones
    let platos = platosDisponibles.filter(pl => {
      if (!pl.modos.includes(p.modo)) return false;
      // Verificar que todos los alimentos con código pasen restricciones
      const codigos = pl.componentes.filter(c => c.codigo).map(c => c.codigo);
      const alimentos = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
      return this.filtrar(alimentos, p).length === alimentos.length;
    });

    // Priorizar platos cuya proteína no se haya usado hoy
    platos.sort((a, b) => {
      const protA = a.componentes.find(c => c.rol === 'proteina');
      const protB = b.componentes.find(c => c.rol === 'proteina');
      const tipoA = protA?.codigo ? this.tipoProteinaCodigo(protA.codigo) : null;
      const tipoB = protB?.codigo ? this.tipoProteinaCodigo(protB.codigo) : null;
      const usadoA = tiposProteinaUsados.has(tipoA) ? 1 : 0;
      const usadoB = tiposProteinaUsados.has(tipoB) ? 1 : 0;
      return usadoA - usadoB;
    });

    // Fallback: si no hay platos del modo, usar todos los que pasen restricciones
    if (platos.length === 0) {
      platos = platosDisponibles.filter(pl => {
        const codigos = pl.componentes.filter(c => c.codigo).map(c => c.codigo);
        const alimentos = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
        return this.filtrar(alimentos, p).length === alimentos.length;
      });
    }

    if (platos.length === 0) return [];

    const plato = this.elegir(platos, seed);
    const items = [];
    let cubierto = { prot: 0, grasa: 0, carb: 0 };

    // ── Construir el plato componente por componente ──────────
    for (const comp of plato.componentes) {
      // Vegetal libre
      if (comp.rol === 'vegetal') {
        const vegs = this.alimentos.filter(a => a.categoria === 'vegetales');
        const veg = this.elegir(vegs, seed + 4);
        if (veg) items.push(this.crearItem(veg, 1, 'vegetales', true));
        continue;
      }

      // Fruta
      if (comp.rol === 'fruta') {
        const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
        const fruta = this.elegir(frutas, seed + 6);
        if (fruta) {
          const item = this.crearItem(fruta, 1, 'frutas');
          items.push(item);
          cubierto = this.sumarMacros(cubierto, item);
        }
        continue;
      }

      // Alimento con código
      const alim = this.alimentos.find(a => a.codigo === comp.codigo);
      if (!alim) continue;

      let cat = 'proteinas';
      if (comp.rol === 'carbohidrato') cat = 'carbohidratos';
      else if (comp.rol === 'grasa') cat = 'grasas';

      // Calcular porciones según el rol
      let porcsNecesarias = 1;
      if (comp.rol === 'proteina') {
        const tieneP2 = plato.componentes.some(c => c.rol === 'proteina2');
        porcsNecesarias = (meta.prot * (tieneP2 ? 0.65 : 0.80)) / (alim.proteina_g || 1);
      } else if (comp.rol === 'proteina2') {
        const protFaltante = meta.prot - cubierto.prot;
        porcsNecesarias = protFaltante > this.TOL.prot ? protFaltante / (alim.proteina_g || 1) : comp.min;
      } else if (comp.rol === 'grasa') {
        const grasaFaltante = meta.grasa - cubierto.grasa;
        porcsNecesarias = grasaFaltante > this.TOL.grasa ? grasaFaltante / (alim.grasa_g || 1) : comp.min;
      } else if (comp.rol === 'carbohidrato') {
        const carboFaltante = meta.carb - cubierto.carb;
        porcsNecesarias = carboFaltante > this.TOL.carb ? carboFaltante / (alim.carbo_g || 1) : comp.min;
      }

      // Respetar min/max del plato (no solo MAX_PORCIONES global)
      let porcs = this.limitarPorcionesInteligente(alim.codigo, porcsNecesarias);
      porcs = Math.max(comp.min, Math.min(porcs, comp.max));

      const item = this.crearItem(alim, porcs, cat);
      item._platoMin = comp.min;
      item._platoMax = comp.max;
      items.push(item);
      cubierto = this.sumarMacros(cubierto, item);

      if (comp.rol === 'proteina' || comp.rol === 'proteina2') {
        usadosDia.add(alim.codigo);
        tiposProteinaUsados.add(this.tipoProteina(alim));
      }
    }

    // ── Frijoles en almuerzo salvadoreño (si no están en el plato) ─
    if (tiempo === 'almuerzo' && p.modo === 'salvadoreno') {
      const yaHayLegumbre = items.some(i => i.subcategoria === 'legumbres');
      if (!yaHayLegumbre) {
        const frijol = this.alimentos.find(a => a.codigo === 'A-0016');
        if (frijol) {
          const item = this.crearItem(frijol, 0.5, 'proteinas');
          items.push(item);
          usadosDia.add('A-0016');
          cubierto = this.sumarMacros(cubierto, item);
        }
      }
    }

    // ── Rescate de proteína (si quedó bajo 95%) ─────────────
    const totPrevio = this.totalesItems(items);
    if (totPrevio.prot < meta.prot * 0.95) {
      const protFalt = meta.prot - totPrevio.prot;
      let rescatado = false;
      for (const item of items) {
        if (item._cat === 'proteinas' && !item._alGusto) {
          const maxPlato = item._platoMax || item._maxPorciones || this.maxPorc(item.codigo);
          if (item._porciones < maxPlato) {
            const protPorPorc = (item._prot / item._porciones) || 1;
            const porcsExtra = Math.min(protFalt / protPorPorc, maxPlato - item._porciones);
            const nuevaPorcs = this.limitarPorcionesInteligente(item.codigo, item._porciones + porcsExtra);
            if (nuevaPorcs > item._porciones) {
              const idx = items.indexOf(item);
              items[idx] = this.crearItem(item, Math.min(nuevaPorcs, maxPlato), 'proteinas');
              items[idx]._platoMin = item._platoMin;
              items[idx]._platoMax = item._platoMax;
              rescatado = true;
              break;
            }
          }
        }
      }
      if (!rescatado) {
        const clara = this.alimentos.find(a => a.codigo === 'A-0004');
        if (clara && !this.esIncompatibleConPlato(plato, clara)) {
          const porcs = this.limitarPorcionesInteligente(clara.codigo, protFalt / (clara.proteina_g || 1));
          items.push(this.crearItem(clara, porcs, 'proteinas'));
        }
      }
    }

    // ── Ajuste final (respeta rangos del plato) ──────────────
    const resultado = this.ajusteFinal(items, meta);

    // Guardar identidad del plato en cada comida
    resultado._platoId = plato.id;
    resultado._platoNombre = plato.nombre;
    resultado._platoNivel = plato.nivel;

    return resultado;
  },

  // ─── ARMAR SNACK ──────────────────────────────────────────
 armarSnack(tiempo, meta, p, seed) {
  const pool = this.SNACK_POOL;
  if (!pool) return [];

  const items = [];
  let cubierto = { prot: 0, grasa: 0, carb: 0 };

  let listaProt = [];

  if (p.snack_perecedero && pool.proteina_perecedera?.length > 0) {
    listaProt = this.buscar(pool.proteina_perecedera, p);
  } else {
    listaProt = this.buscar(pool.proteina_base, p);
  }

  if (meta.prot > 10 && listaProt.length > 0) {
    const prot = this.elegir(listaProt, seed + 10);

    if (prot) {
      const porcs = this.limitarPorcionesInteligente(prot.codigo, meta.prot / (prot.proteina_g || 1));
      const item = this.crearItem(prot, porcs, 'proteinas');
      items.push(item);
      cubierto = this.sumarMacros(cubierto, item);
    }
  }

  if (pool.frutas === 'todas') {
    const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
    const fruta = this.elegir(frutas, seed + 11);

    if (fruta) {
      const item = this.crearItem(fruta, 1, 'frutas');
      items.push(item);
      cubierto = this.sumarMacros(cubierto, item);
    }
  }

  const grasaFalt = meta.grasa - cubierto.grasa;

  if (grasaFalt > 3 && pool.grasa_base?.length > 0) {
    const listaG = this.buscar(pool.grasa_base, p);
    const g = this.elegir(listaG, seed + 12);

    if (g) {
      const porcs = this.limitarPorcionesInteligente(g.codigo, grasaFalt / (g.grasa_g || 1));
      items.push(this.crearItem(g, porcs, 'grasas'));
    }
  }

  return items;
},

  // ─── AJUSTE FINAL (§7) ────────────────────────────────────
// ─── AJUSTE FINAL INTELIGENTE ─────────────────────────────
// Objetivo: dejar kcal, proteína, grasa y carbos entre 95% y 102%
ajusteFinal(items, meta) {
  let salida = [...items];

  const maxIteraciones = 30;

  for (let i = 0; i < maxIteraciones; i++) {
    const tot = this.totalesItems(salida);
    const kcalCalc = Math.round((tot.prot * 4) + (tot.carb * 4) + (tot.grasa * 9));

    const enRango =
      this.enRango(kcalCalc, meta.kcal) &&
      this.enRango(tot.prot, meta.prot) &&
      this.enRango(tot.grasa, meta.grasa) &&
      this.enRango(tot.carb, meta.carb);

    if (enRango) return salida;

    // 1. Primero bajar excesos
    if (tot.grasa > meta.grasa * 1.02) {
      if (this.ajustarCategoria(salida, 'grasas', 'grasa', 'bajar')) continue;
    }

    if (tot.carb > meta.carb * 1.02) {
      if (this.ajustarCategoria(salida, 'carbohidratos', 'carb', 'bajar')) continue;
    }

// ⚠️ PROTEÍNA NO SE TOCA EN AJUSTE FINAL
    if (tot.grasa < meta.grasa * 0.95) {
      if (this.ajustarCategoria(salida, 'grasas', 'grasa', 'subir')) continue;
    }

    if (tot.carb < meta.carb * 0.95) {
      if (this.ajustarCategoria(salida, 'carbohidratos', 'carb', 'subir')) continue;
    }

    // 3. Si kcal sigue alta, bajar carbos o grasas
    if (kcalCalc > meta.kcal * 1.02) {
      if (this.ajustarCategoria(salida, 'carbohidratos', 'carb', 'bajar')) continue;
      if (this.ajustarCategoria(salida, 'grasas', 'grasa', 'bajar')) continue;
    }

    // 4. Si kcal sigue baja, subir carbos
    if (kcalCalc < meta.kcal * 0.95) {
      if (this.ajustarCategoria(salida, 'carbohidratos', 'carb', 'subir')) continue;
      if (this.ajustarCategoria(salida, 'grasas', 'grasa', 'subir')) continue;
    }

    break;
  }

  return salida;
},
   enRango(actual, objetivo) {
  if (!objetivo || objetivo <= 0) return true;
  return actual >= objetivo * 0.95 && actual <= objetivo * 1.02;
},

ajustarCategoria(items, categoria, macro, accion) {
  const candidatos = items
    .map((item, idx) => ({ item, idx }))
    .filter(x => x.item._cat === categoria && !x.item._alGusto);

  if (candidatos.length === 0) return false;

  const campo = macro === 'prot' ? '_prot' : macro === 'grasa' ? '_grasa' : '_carb';

  candidatos.sort((a, b) => (b.item[campo] || 0) - (a.item[campo] || 0));

  for (const c of candidatos) {
    const item = c.item;
    const actual = item._porciones || 1;
    const maxPlato = item._platoMax || item._maxPorciones || this.maxPorc(item.codigo);
    const minPlato = item._platoMin || 0.5;
    const esEntero = this.PORCION_ENTERA[item.codigo];
    const paso = esEntero ? 1 : 0.5;

    let nueva = actual;

    if (accion === 'subir') {
      nueva = Math.min(actual + paso, maxPlato);
    }

    if (accion === 'bajar') {
      nueva = Math.max(actual - paso, minPlato);
    }

    if (nueva !== actual) {
      const nuevoItem = this.crearItem(item, nueva, item._cat);
      nuevoItem._platoMin = item._platoMin;
      nuevoItem._platoMax = item._platoMax;
      items[c.idx] = nuevoItem;
      return true;
    }
  }

  return false;
},

  // ═══════════════════════════════════════════════════════════
  // HELPERS DE CÁLCULO
  // ═══════════════════════════════════════════════════════════

crearItem(alimento, porciones, cat, alGusto = false) {
  const base   = alimento.porcion_base_g || 100;
  const porcs  = alGusto ? 1 : Math.round(porciones * 2) / 2;
  const gramos = alGusto ? base : Math.round(porcs * base);
  const factor = gramos / base;
  const maxP   = this.maxPorc(alimento.codigo);

  let _porcion = alGusto ? '1 porción al gusto' : `${gramos}g`;

  if (!alGusto && alimento.unidad_hogar && base > 0) {
    const uR = Math.round((gramos / base) * 2) / 2;
    if (uR >= 0.5 && uR <= 10) {
      const uh = alimento.unidad_hogar.replace(/^[\d.]+\s*/, '').trim();
      _porcion = `${gramos}g (≈ ${uR} ${uh})`;
    }
  }

  const prot  = (alimento.proteina_g || 0) * factor;
  const grasa = (alimento.grasa_g    || 0) * factor;
  const carb  = (alimento.carbo_g    || 0) * factor;
  // FUENTE ÚNICA de kcal: siempre por fórmula, nunca usar alimento.kcal
  const kcal  = Math.round((prot * 4) + (carb * 4) + (grasa * 9));

  return {
    ...alimento,
    _cat: cat,
    _gramos: gramos,
    _porcion,
    _porciones: porcs,
    _maxPorciones: maxP,
    _alGusto: alGusto,

    _prot: prot,
    _grasa: grasa,
    _carb: carb,
    _kcal: kcal
  };
},
  sumarMacros(acumulado, item) {
    return {
      prot:  acumulado.prot  + (item._prot  || 0),
      grasa: acumulado.grasa + (item._grasa || 0),
      carb:  acumulado.carb  + (item._carb  || 0),
    };
  },

  // No permitir 2 alimentos de la misma subcategoría en una comida
  // Familias de alimentos — evita combinar alimentos de la misma familia
  FAMILIAS: {
    'cereales': 'almidones',    // arroz, avena, pasta, tortilla, quinoa
    'panes': 'almidones',       // pan francés, pan integral
    'tuberculos': 'almidones',  // papa, camote, yuca, plátano
    'legumbres': 'legumbres',   // frijoles, lentejas, garbanzos, ejote
  },

  familiaDeAlimento(alimento) {
    const sub = alimento.subcategoria;
    if (!sub) return null;
    return this.FAMILIAS[sub] || sub;
  },

  familiasEnUso(items) {
    const familias = [];
    items.forEach(i => {
      const fam = this.familiaDeAlimento(i);
      if (fam && !familias.includes(fam)) familias.push(fam);
      // También registrar subcategoría exacta para evitar duplicados exactos
      if (i.subcategoria && !familias.includes(i.subcategoria)) familias.push(i.subcategoria);
    });
    return familias;
  },

  filtrarPorSubcategoria(lista, items) {
    const usadas = this.familiasEnUso(items);
    return lista.filter(a => {
      if (!a.subcategoria) return true;
      const familia = this.familiaDeAlimento(a);
      // Bloquear si la familia ya está usada
      if (familia && usadas.includes(familia)) return false;
      // Bloquear si la subcategoría exacta ya está
      if (usadas.includes(a.subcategoria)) return false;
      return true;
    });
  },

  limitarPorciones(codigo, porcsCalculadas) {
    const max = this.maxPorc(codigo);
    return Math.max(0.5, Math.min(Math.round(porcsCalculadas * 2) / 2, max));
  },

  // Versión inteligente: respeta porciones enteras para alimentos que lo requieren
  limitarPorcionesInteligente(codigo, porcsCalculadas) {
    const max = this.maxPorc(codigo);
    const esEntero = this.PORCION_ENTERA[codigo];
    let porcs;
    if (esEntero) {
      porcs = Math.max(1, Math.min(Math.round(porcsCalculadas), max));
    } else {
      porcs = Math.max(0.5, Math.min(Math.round(porcsCalculadas * 2) / 2, max));
    }
    return porcs;
  },

  // Verificar si un alimento es incompatible con el plato seleccionado
  esIncompatibleConPlato(plato, alimento) {
    if (!plato || !alimento) return false;
    const protAlim = this.alimentos.find(a => a.codigo === plato.proteina);
    if (!protAlim) return false;
    const tipoProt = this.tipoProteina(protAlim);
    const tipoNuevo = this.tipoProteina(alimento);
    if (!tipoProt || !tipoNuevo) return false;
    const reglas = this.INCOMPATIBLE[tipoProt];
    if (!reglas) return false;
    return reglas.includes(tipoNuevo);
  },

  // Obtener tipo de proteína desde un código de alimento
  tipoProteinaCodigo(codigo) {
    const alim = this.alimentos.find(a => a.codigo === codigo);
    return alim ? this.tipoProteina(alim) : null;
  },

  maxPorc(codigo) { return this.MAX_PORCIONES[codigo] || 3; },

totalesItems(items) {
  return items.reduce((a, i) => ({
    prot: a.prot + (i._prot || 0),
    grasa: a.grasa + (i._grasa || 0),
    carb: a.carb + (i._carb || 0),
    kcal: a.kcal + (i._kcal || 0),
  }), { kcal:0, prot:0, grasa:0, carb:0 });
},

  totalesComida(comida) { return this.totalesItems(comida.items); },

  totalesDia(dia) {
    return dia.reduce((a, c) => {
      const t = this.totalesComida(c);
      return { kcal:a.kcal+t.kcal, prot:a.prot+t.prot, grasa:a.grasa+t.grasa, carb:a.carb+t.carb };
    }, { kcal:0, prot:0, grasa:0, carb:0 });
  },
tipoProteina(alimento) {
  if (!alimento?.nombre) return null;

  const n = alimento.nombre.toLowerCase();

  if (n.includes('pollo') || n.includes('pechuga') || n.includes('muslo')) return 'pollo';
  if (n.includes('res') || n.includes('molida')) return 'res';
  if (n.includes('cerdo')) return 'cerdo';
  if (n.includes('atun') || n.includes('tilapia')) return 'pescado';
  if (n.includes('camaron')) return 'mariscos';
  if (n.includes('huevo') || n.includes('clara')) return 'huevo';
  if (n.includes('jamon') || n.includes('jamón') || n.includes('salchicha')) return 'embutido';
  if (n.includes('queso') || n.includes('requesón') || n.includes('yogur')) return 'lacteo';
  if (n.includes('frijol') || n.includes('lenteja') || n.includes('garbanzo')) return 'legumbre';
  return null;
},

  // Verificar compatibilidad entre proteína base y mixta
  esCompatible(protBase, protMixta) {
    if (!protBase || !protMixta) return true;
    // No combinar dos del mismo tipo
    return this.tipoProteina(protBase) !== this.tipoProteina(protMixta);
  },

  buscar(codigos, p) {
    if (!codigos || codigos.length === 0) return [];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
    return this.filtrar(lista, p);
  },

  // Verificar si un alimento tiene subcategoría ya usada en los items actuales
  subcategoriaUsada(items, alimento) {
    if (!alimento.subcategoria) return false;
    return items.some(i => i.subcategoria === alimento.subcategoria);
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

  labelTiempo(t) {
    return { desayuno:'🌅 Desayuno', snack1:'🍎 Snack mañana',
             almuerzo:'🍽️ Almuerzo', snack2:'🌿 Snack tarde',
             cena:'🌙 Cena' }[t] || t;
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
  const modos = { 
    salvadoreno:'🇸🇻 Salvadoreño', 
    fitness:'💪 Fitness', 
    economico:'💰 Económico' 
  };

  return `
  <div class="card mb-3">
    <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;" id="tog-prefs">
      <span style="font-weight:600;">⚙️ Configurar mi menú</span>
      <span id="arr-prefs">▼</span>
    </div>

    <div id="prefs-body" style="display:none;margin-top:14px;">
      <div style="display:flex;flex-direction:column;gap:14px;">

        <div>
          <label class="pref-label">🍴 Comidas al día</label>
          <div class="btn-group-pref">
            ${[3,4,5].map(n=>`<button class="btn-pref ${p.num_comidas===n?'activo':''}" data-pref="num_comidas" data-val="${n}">${n}</button>`).join('')}
          </div>
        </div>

        <div>
          <label class="pref-label">🌟 Estilo</label>
          <div class="btn-group-pref">
            ${Object.entries(modos).map(([k,v])=>`<button class="btn-pref ${p.modo===k?'activo':''}" data-pref="modo" data-val="${k}">${v}</button>`).join('')}
          </div>
        </div>

        <div>
          <label class="pref-label">🚫 Restricciones</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${['sin_lacteos:🥛 Sin lácteos','sin_gluten:🌾 Sin gluten','sin_cerdo:🐷 Sin cerdo','vegetariano:🥦 Vegetariano']
              .map(s => { 
                const [k,l] = s.split(':'); 
                return `<label class="check-pref"><input type="checkbox" data-restr="${k}" ${(p.restricciones||[]).includes(k)?'checked':''}><span>${l}</span></label>`; 
              }).join('')}
          </div>
        </div>

      <label class="check-pref">
  <input type="checkbox" data-check="snack_perecedero" ${p.snack_perecedero?'checked':''}>
  <span>🧊 Tengo refrigeración (puedo llevar yogurt, queso, etc.)</span>
</label>

            <button class="btn btn-primary mt-3" id="btn-aplicar" style="width:100%;">
          ✅ Aplicar y generar menú
        </button>

      </div>
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
        else { this.preferencias.restricciones = this.preferencias.restricciones.filter(r=>r!==k); }
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
      : this.renderSemanal(semana, macrosDia)) + this.renderBotonesInferiores();
    document.getElementById('btn-regen')?.addEventListener('click', () => this.generar());
  },

  // ─── RENDER DIARIO ────────────────────────────────────────
  renderDiario(dia, obj) {
    const tot = this.totalesDia(dia);

    return `
    <div class="card mb-3" id="resumen-dia" style="background:var(--color-superficie-hover);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div><div style="font-weight:700;">📊 Resumen del día</div>
          <div style="font-size:0.8rem;color:var(--color-texto-secundario);" id="r-sub">${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal</div>
        </div>
      </div>
      <!-- Barras por macro -->
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
        ${this.barraMacro('Calorías', tot.kcal, obj.kcal, 'kcal')}
        ${this.barraMacro('Proteína', Math.round(tot.prot), obj.prot, 'g')}
        ${this.barraMacro('Grasa',    Math.round(tot.grasa), obj.grasa, 'g')}
        ${this.barraMacro('Carbos',   Math.round(tot.carb), obj.carb, 'g')}
      </div>
    </div>
    <div id="warning-dia"></div>
    ${dia.map(c => this.renderComida(c, 0)).join('')}`;
  },

  barraMacro(label, actual, objetivo, unidad) {
    const pct = Math.min(Math.round((actual / objetivo) * 100), 120);
    const enRango = pct >= 95 && pct <= 102;
    const colorFinal = enRango ? '#10b981' : (pct < 95 ? '#f59e0b' : '#ef4444');
    const icon = enRango ? '✅' : (pct < 95 ? '⚠️' : '🔴');
    return `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:2px;">
        <span style="font-weight:600;">${icon} ${label}</span>
        <span style="color:var(--color-texto-secundario);">${actual}${unidad} / ${objetivo}${unidad} (${pct}%)</span>
      </div>
      <div style="height:6px;background:var(--color-borde);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${Math.min(pct,100)}%;background:${colorFinal};border-radius:99px;"></div>
      </div>
    </div>`;
  },

  renderSemanal(semana, obj) {
    const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    return semana.map((dia, i) => {
      const tot = this.totalesDia(dia);
      return `<div class="card mb-2">
        <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
             onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
          <span style="font-weight:600;">📅 ${dias[i]}</span>
          <span style="font-size:0.78rem;color:var(--color-texto-secundario);">~${window.ui.formatearNumero(tot.kcal)} kcal · P:${Math.round(tot.prot)}g</span>
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
    const overProt = pctP < 80;

    const platoLabel = comida.platoNombre
      ? `<div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-top:2px;">🍽️ ${comida.platoNombre}</div>`
      : '';

    return `
    <div class="card mb-2" style="padding:14px;" id="cc-${key}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <div>
          <span style="font-weight:700;">${comida.label}</span>
          ${platoLabel}
        </div>
        <div style="display:flex;gap:6px;font-size:0.76rem;font-weight:600;" id="tc-${key}">
          <span>${tot.kcal} kcal</span>
          <span style="color:#ef4444;">P:${Math.round(tot.prot)}g</span>
          <span style="color:#f59e0b;">G:${Math.round(tot.grasa)}g</span>
          <span style="color:#10b981;">C:${Math.round(tot.carb)}g</span>
        </div>
      </div>
      ${overProt ? `<div class="warn-comida">⚠️ Proteína baja en esta comida (meta: ${comida.meta.prot}g)</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:6px;" id="its-${key}">
        ${comida.items.map((item, i) => this.renderItem(item, key, i, comida.tiempo)).join('')}
      </div>
      <div style="margin-top:10px;">
        <button class="btn-agregar" onclick="window.dieta.abrirAgregar('${key}','${comida.tiempo}',${diaIdx})">＋ Agregar alimento</button>
      </div>
      <div id="pa-${key}" style="display:none;margin-top:8px;"></div>
    </div>`;
  },

  // ─── RENDER ITEM ──────────────────────────────────────────
  renderItem(item, key, idx, tiempo) {
    const S = {
      proteinas:{bg:'#fee2e2',bd:'#991b1b',em:'🥩'}, carbohidratos:{bg:'#d1fae5',bd:'#065f46',em:'🍞'},
      grasas:{bg:'#fef9c3',bd:'#92400e',em:'🥑'}, frutas:{bg:'#ede9fe',bd:'#5b21b6',em:'🍎'},
      vegetales:{bg:'#dcfce7',bd:'#166534',em:'🥬'}, combinados:{bg:'#e0f2fe',bd:'#0c4a6e',em:'🫓'},
    };
    const s   = S[item._cat] || { bg:'#f1f5f9', bd:'#475569', em:'🍽️' };
    const uid = `${key}-${idx}`;
    const nom = (item.nombre||'').replace(/'/g,"\\'");

    const btnReceta = item.codigo && !item._alGusto ? `
      <button onclick="event.stopPropagation();window.recetas?.mostrarPanelRecetas('${item.codigo}','${nom}','${uid}')"
        style="background:none;border:1px solid #10b981;border-radius:5px;cursor:pointer;font-size:0.7rem;color:#10b981;padding:1px 6px;font-weight:600;font-family:inherit;">👨‍🍳</button>` : '';

    const btnElim = item._manual ? `
      <button onclick="event.stopPropagation();window.dieta.eliminarItem('${key}',${idx})"
        style="background:none;border:none;cursor:pointer;font-size:0.85rem;color:#ef4444;">✕</button>` : '';

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
  // INTERACCIONES: +/-, SUSTITUIR, AGREGAR, ELIMINAR
  // ═══════════════════════════════════════════════════════════

  ajustarPorc(key, idx, delta) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    const item = comida.items[idx];
    if (!item || item._alGusto) return;

    const maxRecomendado = item._maxPorciones || 3;
    const maxAbsoluto = this.MAX_ABSOLUTO[item.codigo] || maxRecomendado * 3;
    const esEntero = this.PORCION_ENTERA[item.codigo];
    const paso = esEntero ? 1 : 0.5;

    let nueva = (item._porciones || 1) + delta * paso;
    nueva = esEntero ? Math.max(1, Math.min(nueva, maxAbsoluto)) : Math.max(0.5, Math.min(nueva, maxAbsoluto));

    const actualizado = this.crearItem(item, nueva, item._cat);
    comida.items[idx] = actualizado;

    const uid = `${key}-${idx}`;
    const el = id => document.getElementById(id);
    if (el(`pt-${uid}`)) el(`pt-${uid}`).textContent = actualizado._porcion;
    if (el(`kc-${uid}`)) el(`kc-${uid}`).textContent = `${actualizado._kcal} kcal`;
    if (el(`pc-${uid}`)) el(`pc-${uid}`).textContent = actualizado._porciones;

    // Advertencia si supera recomendado (pero permitir)
    if (nueva > maxRecomendado) {
      window.ui?.mostrarAlerta(`⚠️ ${item.nombre}: superaste la porción recomendada (${maxRecomendado})`, 'warning', 2500);
    }

    this.actualizarUI(key, comida, diaIdx);
  },

  abrirSust(key, idx, cat, tiempo) {
    document.querySelectorAll('[id^="sp-"]').forEach(p => p.style.display = 'none');
    const uid   = `${key}-${idx}`;
    const panel = document.getElementById(`sp-${uid}`);
    if (!panel) return;

    // Buscar alimentos del mismo rol desde todos los platos de ese tiempo
    let codigos = new Set();
    if (cat === 'frutas') {
      this.alimentos.filter(a => a.categoria === 'frutas').forEach(a => codigos.add(a.codigo));
    } else if (cat === 'vegetales') {
      this.alimentos.filter(a => a.categoria === 'vegetales').forEach(a => codigos.add(a.codigo));
    } else {
      const platosT = this.PLATOS_BASE[tiempo] || [];
      platosT.forEach(pl => {
        if (cat === 'proteinas') {
          if (pl.proteina) codigos.add(pl.proteina);
          if (pl.proteina2) codigos.add(pl.proteina2);
        } else if (cat === 'carbohidratos') {
          if (pl.carbo) codigos.add(pl.carbo);
        } else if (cat === 'grasas') {
          if (pl.grasa) codigos.add(pl.grasa);
        }
      });
      // Para snacks
      if (tiempo.startsWith('snack')) {
        const sp = this.SNACK_POOL;
        if (cat === 'proteinas') [...(sp.proteina_base||[]), ...(sp.proteina_perecedera||[])].forEach(c => codigos.add(c));
        if (cat === 'grasas') (sp.grasa_base||[]).forEach(c => codigos.add(c));
      }
    }

    const { comida } = this.getComida(key);
    const actual = comida?.items[idx];
    let lista = [...codigos].map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean).filter(a => a.codigo !== actual?.codigo);
    lista = this.filtrar(lista, this.preferencias);
    const subcatActual = actual?.subcategoria;
    if (subcatActual) {
      lista.sort((a, b) => {
        const aMatch = a.subcategoria === subcatActual ? 0 : 1;
        const bMatch = b.subcategoria === subcatActual ? 0 : 1;
        return aMatch - bMatch;
      });
    }

    const colores = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534' };
    panel.innerHTML = lista.length === 0
      ? `<div style="padding:8px 12px;font-size:0.82rem;color:var(--color-texto-secundario);">Sin alternativas para este tiempo.</div>`
      : `<div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-radius:0 0 8px 8px;overflow:hidden;">
          <div style="padding:5px 12px;background:var(--color-superficie-hover);font-size:0.72rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;">🔄 Opciones de ${this.labelTiempo(tiempo)}</div>
          ${lista.slice(0,12).map(a => `
          <div onclick="window.dieta.hacerSust('${key}',${idx},'${a.codigo}','${cat}')"
               style="padding:8px 12px;border-bottom:1px solid var(--color-borde);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
            <div><div style="font-weight:600;font-size:0.85rem;">${a.nombre}</div>
              <div style="font-size:0.72rem;color:var(--color-texto-secundario);">P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div></div>
            <span style="font-size:0.76rem;color:${colores[cat]||'#475569'};font-weight:600;">${a.kcal} kcal</span>
          </div>`).join('')}
        </div>`;
    panel.style.display = 'block';
  },

  hacerSust(key, idx, codigo, cat) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    const nuevo = this.alimentos.find(a => a.codigo === codigo);
    if (!nuevo) return;

    // Validar incompatibilidad con proteína principal del plato
    if (cat === 'proteinas') {
      const protPrincipal = comida.items.find(i => i._cat === 'proteinas' && i.codigo !== comida.items[idx]?.codigo);
      if (protPrincipal) {
        const tipoPrincipal = this.tipoProteina(protPrincipal);
        const tipoNuevo = this.tipoProteina(nuevo);
        const reglas = this.INCOMPATIBLE[tipoPrincipal] || [];
        if (reglas.includes(tipoNuevo)) {
          window.ui?.mostrarAlerta(`⚠️ ${nuevo.nombre} puede no combinar con ${protPrincipal.nombre}`, 'warning', 3000);
        }
      }
    }

    const porcsAnterior = comida.items[idx]._porciones || 1;
    comida.items[idx] = this.crearItem(nuevo, porcsAnterior, cat);
    this.rerenderItems(key, comida);
    this.actualizarUI(key, comida, diaIdx);
    document.getElementById(`sp-${key}-${idx}`)?.style && (document.getElementById(`sp-${key}-${idx}`).style.display = 'none');
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
        <div style="padding:8px 12px;"><input type="text" class="form-input" placeholder="🔍 Buscar..."
          style="font-size:0.85rem;" oninput="window.dieta.filtAgregar(this.value,'${key}','${tiempo}')"></div>
        <div id="la-${key}" style="max-height:220px;overflow-y:auto;"></div>
      </div>`;
    this.filtAgregar('', key, tiempo);
  },

  filtAgregar(term, key, tiempo) {
    const lista = document.getElementById(`la-${key}`);
    if (!lista) return;

    // Recopilar alimentos permitidos desde PLATOS_BASE o SNACK_POOL
    let permitidos = [];
    const codigosVistos = new Set();

    const agregarAlimento = (codigo, cat) => {
      if (codigosVistos.has(codigo)) return;
      const a = this.alimentos.find(x => x.codigo === codigo);
      if (a) { codigosVistos.add(codigo); permitidos.push({ ...a, _cat: cat }); }
    };

    if (tiempo.startsWith('snack')) {
      const sp = this.SNACK_POOL;
      (sp.proteina_base||[]).forEach(c => agregarAlimento(c, 'proteinas'));
      (sp.proteina_perecedera||[]).forEach(c => agregarAlimento(c, 'proteinas'));
      (sp.grasa_base||[]).forEach(c => agregarAlimento(c, 'grasas'));
      (sp.carbo_base||[]).forEach(c => agregarAlimento(c, 'carbohidratos'));
      this.alimentos.filter(a => a.categoria === 'frutas').forEach(a => agregarAlimento(a.codigo, 'frutas'));
    } else {
      const platosT = this.PLATOS_BASE[tiempo] || [];
      platosT.forEach(pl => {
        if (pl.proteina) agregarAlimento(pl.proteina, 'proteinas');
        if (pl.proteina2) agregarAlimento(pl.proteina2, 'proteinas');
        if (pl.carbo) agregarAlimento(pl.carbo, 'carbohidratos');
        if (pl.grasa) agregarAlimento(pl.grasa, 'grasas');
      });
      this.alimentos.filter(a => a.categoria === 'vegetales').forEach(a => agregarAlimento(a.codigo, 'vegetales'));
      this.alimentos.filter(a => a.categoria === 'frutas').forEach(a => agregarAlimento(a.codigo, 'frutas'));
    }

    permitidos = this.filtrar(permitidos, this.preferencias);
    if (term) permitidos = permitidos.filter(a => a.nombre.toLowerCase().includes(term.toLowerCase()));

    if (permitidos.length === 0) {
      lista.innerHTML = `<div style="padding:12px;font-size:0.82rem;text-align:center;color:var(--color-texto-secundario);">Sin resultados</div>`;
      return;
    }
    lista.innerHTML = permitidos.slice(0,20).map(a => `
      <div onclick="window.dieta.selAgregar('${key}','${a.codigo}','${a._cat||a.categoria}')"
           style="padding:8px 12px;border-bottom:1px solid var(--color-borde);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-weight:600;font-size:0.85rem;">${a.nombre}</div>
          <div style="font-size:0.72rem;color:var(--color-texto-secundario);">P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div></div>
        <span style="font-size:0.76rem;font-weight:600;">${a.kcal} kcal</span>
      </div>`).join('');
  },

  selAgregar(key, codigo, cat) {
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const lista = document.getElementById(`la-${key}`);
    lista.innerHTML = `
      <div style="padding:12px;">
        <div style="font-weight:600;margin-bottom:6px;">${a.nombre}</div>
        <div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-bottom:10px;">${a.kcal} kcal · P:${a.proteina_g}g G:${a.grasa_g}g C:${a.carbo_g}g</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.78rem;font-weight:600;">Porciones:</label>
          <input type="number" id="ca-${key}" value="1" min="0.5" max="${this.MAX_ABSOLUTO[codigo] || this.maxPorc(codigo) * 2}" step="${this.PORCION_ENTERA[codigo] ? 1 : 0.5}"
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
    document.getElementById(`pa-${key}`).style.display = 'none';
  },

  eliminarItem(key, idx) {
    const { diaIdx, comida } = this.getComida(key);
    if (!comida) return;
    comida.items.splice(idx, 1);
    this.rerenderItems(key, comida);
    this.actualizarUI(key, comida, diaIdx);
  },

  // ─── Helpers de UI ────────────────────────────────────────
  rerenderItems(key, comida) {
    const cont = document.getElementById(`its-${key}`);
    if (cont) cont.innerHTML = comida.items.map((item, i) => this.renderItem(item, key, i, comida.tiempo)).join('');
  },

  actualizarUI(key, comida, diaIdx) {
    const tot = this.totalesComida(comida);
    const el = id => document.getElementById(id);
    const tc = el(`tc-${key}`);
    if (tc) tc.innerHTML = `
      <span>${tot.kcal} kcal</span>
      <span style="color:#ef4444;">P:${Math.round(tot.prot)}g</span>
      <span style="color:#f59e0b;">G:${Math.round(tot.grasa)}g</span>
      <span style="color:#10b981;">C:${Math.round(tot.carb)}g</span>`;

    if (diaIdx === 0) this.actualizarResumen();
  },

  actualizarResumen() {
    const dia = this.menuGenerado?.diaBase;
    if (!dia) return;
    const obj = this.menuGenerado.macrosDia;
    const tot = this.totalesDia(dia);
    const el = id => document.getElementById(id);
    if (el('r-sub')) el('r-sub').textContent = `${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal`;
    // Las barras se actualizarían reconstruyendo el resumen completo
    // Por simplicidad re-renderizo todo
    this.renderMenu();
  },

  getComida(key) {
    const p = key.split('-');
    const diaIdx = parseInt(p[0]);
    const tiempo = p.slice(1).join('-');
    const dia = diaIdx === 0 ? this.menuGenerado?.diaBase : this.menuGenerado?.semana?.[diaIdx-1];
    return { diaIdx, tiempo, comida: dia?.find(c => c.tiempo === tiempo) };
  },

  renderBotonesInferiores() {
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

  // ─── ESTILOS ──────────────────────────────────────────────
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
