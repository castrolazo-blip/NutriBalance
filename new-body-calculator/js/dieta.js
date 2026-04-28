/* ============================================================
   MÓDULO M7: MOTOR DE DIETA v5 — MACRO-FIRST INTELIGENTE
   NutriBalance · by Ronald Castro
   ============================================================
   REGLA FUNDAMENTAL:
   Los datos en Supabase (kcal, proteina_g, grasa_g, carbo_g)
   son valores POR porcion_base_g.
   Ejemplo: Huevo → 72 kcal / 50g (1 huevo)
   
   ALGORITMO:
   1. Proteína MANDA — se cubre primero
   2. Grasa se controla — se cubre segundo
   3. Carbohidratos son VARIABLE — se ajustan al final
   4. Nunca modificar proteína en ajustes finales
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

  // ─── Alimentos por tiempo de comida y rol ─────────────────
  MENU_POOL: {
    desayuno: {
      proteina_base: ['A-0003','A-0004','A-0085','A-0086'],
      proteina_mixta:['A-0012','A-0014','A-0015','A-0016'],
      carbo_base:    ['A-0023','A-0024','A-0025','A-0026','A-0034'],
      grasa_base:    ['A-0036','A-0039','A-0040','A-0041'],
      combinados:    ['A-0090','A-0091','A-0092','A-0093','A-0094'],
      frutas:        'todas',
    },
    almuerzo: {
      proteina_base: ['A-0001','A-0002','A-0005','A-0006','A-0007','A-0008','A-0010','A-0011'],
      proteina_mixta:['A-0016','A-0017','A-0019','A-0018'],
      carbo_base:    ['A-0021','A-0022','A-0023','A-0027','A-0028','A-0030','A-0031','A-0035'],
      grasa_base:    ['A-0036','A-0037','A-0040','A-0041','A-0042','A-0043'],
      vegetales:     'todas',
    },
    cena: {
      proteina_base: ['A-0001','A-0005','A-0008','A-0010','A-0011'],
      proteina_mixta:['A-0003','A-0004','A-0016','A-0017','A-0014'],
      carbo_base:    ['A-0021','A-0023','A-0028','A-0029','A-0025'],
      grasa_base:    ['A-0036','A-0040','A-0041','A-0043','A-0044'],
      vegetales:     'todas',
    },
    snack1: {
      proteina_base: ['A-0014','A-0085','A-0004'],
      proteina_mixta:[],
      carbo_base:    ['A-0026','A-0025'],
      grasa_base:    ['A-0040','A-0041','A-0042'],
      frutas:        'todas',
    },
    snack2: {
      proteina_base: ['A-0014','A-0004','A-0085'],
      proteina_mixta:[],
      carbo_base:    ['A-0026','A-0034'],
      grasa_base:    ['A-0041','A-0043','A-0044'],
      frutas:        'todas',
    },
  },

  // ─── Distribución de macros por comida (% del total diario) ──
  DIST: {
    3: { desayuno:0.30, almuerzo:0.40, cena:0.30 },
    4: { desayuno:0.20, almuerzo:0.35, snack1:0.10, cena:0.35 },
    5: { desayuno:0.20, almuerzo:0.30, snack1:0.10, snack2:0.10, cena:0.30 },
  },

  PREF_DEFAULT: {
    num_comidas:   4,
    ayuno:         false,
    modo:          'salvadoreno',
    restricciones: [],
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

    const dist = this.DIST[p.num_comidas] || this.DIST[4];

    const diaBase = this.generarDia(estructura, dist, macrosDia, p, 0);
    const semana  = Array.from({ length: 7 }, (_, i) =>
      this.generarDia(estructura, dist, macrosDia, p, (i + 1) * 13)
    );

    return { diaBase, semana, macrosDia, estructura, dist };
  },

  generarDia(estructura, dist, macrosDia, p, seed) {
    return estructura.map(tiempo => {
      const pct = dist[tiempo] || 0.20;
      // Meta de GRAMOS por macro para esta comida
      const meta = {
        prot:  Math.round(macrosDia.prot  * pct),
        grasa: Math.round(macrosDia.grasa * pct),
        carb:  Math.round(macrosDia.carb  * pct),
        kcal:  Math.round(macrosDia.kcal  * pct),
      };

      const items = tiempo.startsWith('snack')
        ? this.armarSnack(tiempo, meta, p, seed)
        : this.armarComida(tiempo, meta, p, seed);

      return { tiempo, label: this.labelTiempo(tiempo), meta, items };
    });
  },

  // ─── ARMAR COMIDA PRINCIPAL (§5.1 - §5.5) ─────────────────
  armarComida(tiempo, meta, p, seed) {
    const pool  = this.MENU_POOL[tiempo];
    if (!pool) return [];
    const items = [];

    // Acumulador de macros ya cubiertos
    let cubierto = { prot: 0, grasa: 0, carb: 0 };

    // ── PASO 1: Proteína base (§5.1) ─────────────────────────
    const listaProtBase = this.buscar(pool.proteina_base, p);
    const protBase = this.elegir(listaProtBase, seed);
    if (protBase) {
      // Calcular porciones para cubrir la mayor parte de la proteína
      const protPorPorcion = protBase.proteina_g || 1;
      const porcsNecesarias = meta.prot * 0.60 / protPorPorcion; // 60% del objetivo
      const porcs = this.limitarPorciones(protBase.codigo, porcsNecesarias);
      const item  = this.crearItem(protBase, porcs, 'proteinas');
      items.push(item);
      cubierto = this.sumarMacros(cubierto, item);
    }

    // ── PASO 2: Completar proteína con proteína mixta (§5.3) ──
    const protFaltante = meta.prot - cubierto.prot;
    if (protFaltante > this.TOL.prot && pool.proteina_mixta?.length > 0) {
      const listaMixta = this.filtrarPorSubcategoria(
        this.buscar(pool.proteina_mixta, p)
          .filter(a => !items.find(i => i.codigo === a.codigo)),
        items
      );
      const mixta = this.elegir(listaMixta, seed + 7);
      if (mixta) {
        const protPorPorcion = mixta.proteina_g || 1;
        const porcsNecesarias = protFaltante / protPorPorcion;
        const porcs = this.limitarPorciones(mixta.codigo, porcsNecesarias);
        const item  = this.crearItem(mixta, porcs, 'proteinas');
        items.push(item);
        cubierto = this.sumarMacros(cubierto, item);
      }
    }

    // ── PASO 3: Ajuste de grasa (§5.4) ─────────────────────────
    const grasaFaltante = meta.grasa - cubierto.grasa;
    if (grasaFaltante > this.TOL.grasa && pool.grasa_base?.length > 0) {
      const listaGrasa = this.filtrarPorSubcategoria(
        this.buscar(pool.grasa_base, p)
          .filter(a => !items.find(i => i.codigo === a.codigo)),
        items
      );
      const grasa = this.elegir(listaGrasa, seed + 3);
      if (grasa) {
        const grasaPorPorcion = grasa.grasa_g || 1;
        const porcsNecesarias = grasaFaltante / grasaPorPorcion;
        const porcs = this.limitarPorciones(grasa.codigo, porcsNecesarias);
        const item  = this.crearItem(grasa, porcs, 'grasas');
        items.push(item);
        cubierto = this.sumarMacros(cubierto, item);
      }
    }

    // ── PASO 4: Ajuste de carbohidratos (§5.5) ─────────────────
    const carboFaltante = meta.carb - cubierto.carb;
    if (carboFaltante > this.TOL.carb) {
      const listaCarb = this.filtrarPorSubcategoria(
        this.buscar(pool.carbo_base, p)
          .filter(a => !items.find(i => i.codigo === a.codigo)),
        items
      );
      // Elegir hasta 2 fuentes de carbo
      const carb1 = this.elegir(listaCarb, seed + 1);
      if (carb1) {
        const carbPorPorcion = carb1.carbo_g || 1;
        const porcsNecesarias = Math.min(carboFaltante * 0.6, carboFaltante) / carbPorPorcion;
        const porcs = this.limitarPorciones(carb1.codigo, porcsNecesarias);
        const item  = this.crearItem(carb1, porcs, 'carbohidratos');
        items.push(item);
        cubierto = this.sumarMacros(cubierto, item);

        // Segundo carbo si todavía falta
        const carboFaltante2 = meta.carb - cubierto.carb;
        if (carboFaltante2 > this.TOL.carb) {
          const listaCarb2 = this.filtrarPorSubcategoria(listaCarb.filter(a => a.codigo !== carb1.codigo), items);
          const carb2 = this.elegir(listaCarb2, seed + 5);
          if (carb2) {
            const porcs2 = this.limitarPorciones(carb2.codigo, carboFaltante2 / (carb2.carbo_g || 1));
            const item2  = this.crearItem(carb2, porcs2, 'carbohidratos');
            items.push(item2);
            cubierto = this.sumarMacros(cubierto, item2);
          }
        }
      }
    }

    // ── PASO 5: Vegetal (libre, no afecta macros) ──────────────
    if (pool.vegetales === 'todas') {
      const vegs = this.filtrarPorSubcategoria(
        this.alimentos.filter(a => a.categoria === 'vegetales'),
        items
      );
      const veg  = this.elegir(vegs, seed + 4);
      if (veg) items.push(this.crearItem(veg, 1, 'vegetales', true));
    }

    // ── PASO 6: Frijoles en almuerzo salvadoreño ───────────────
    if (tiempo === 'almuerzo' && p.modo === 'salvadoreno') {
      // Solo agregar frijoles si no hay otra legumbre ya en la comida
      const yaHayLegumbre = items.some(i => i.subcategoria === 'legumbres');
      if (!yaHayLegumbre) {
        const frijol = this.alimentos.find(a => a.codigo === 'A-0016');
        if (frijol) {
          items.push(this.crearItem(frijol, 1, 'proteinas'));
        }
      }
    }

    // ── PASO 7: Ajuste final (§7) ──────────────────────────────
    return this.ajusteFinal(items, meta);
  },

  // ─── ARMAR SNACK ──────────────────────────────────────────
  armarSnack(tiempo, meta, p, seed) {
    const pool  = this.MENU_POOL[tiempo];
    if (!pool) return [];
    const items = [];
    let cubierto = { prot: 0, grasa: 0, carb: 0 };

    // Proteína
    const listaProt = this.buscar(pool.proteina_base, p);
    const prot = this.elegir(listaProt, seed + 10);
    if (prot) {
      const porcs = this.limitarPorciones(prot.codigo, meta.prot / (prot.proteina_g || 1));
      const item  = this.crearItem(prot, porcs, 'proteinas');
      items.push(item);
      cubierto = this.sumarMacros(cubierto, item);
    }

    // Fruta
    if (pool.frutas === 'todas') {
      const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
      const fruta  = this.elegir(frutas, seed + 11);
      if (fruta) {
        const item = this.crearItem(fruta, 1, 'frutas');
        items.push(item);
        cubierto = this.sumarMacros(cubierto, item);
      }
    }

    // Grasa si falta
    const grasaFalt = meta.grasa - cubierto.grasa;
    if (grasaFalt > 3 && pool.grasa_base?.length > 0) {
      const listaG = this.buscar(pool.grasa_base, p);
      const g = this.elegir(listaG, seed + 12);
      if (g) {
        const porcs = this.limitarPorciones(g.codigo, grasaFalt / (g.grasa_g || 1));
        items.push(this.crearItem(g, porcs, 'grasas'));
      }
    }

    return items;
  },

  // ─── AJUSTE FINAL (§7) ────────────────────────────────────
  // Nunca modificar proteína. Solo ajustar carbos.
  ajusteFinal(items, meta) {
    const tot = this.totalesItems(items);
    const kcalActual = (tot.prot * 4) + (tot.carb * 4) + (tot.grasa * 9);
    const diff = meta.kcal - kcalActual;

    // Si faltan kcal → agregar carbos
    if (diff > 40) {
      const carbGFaltante = diff / 4; // kcal faltantes en gramos de carbo
      const carbs = items.filter(i => i._cat === 'carbohidratos' && !i._alGusto);
      if (carbs.length > 0) {
        // Distribuir entre carbos existentes
        const porExtraPorItem = carbGFaltante / carbs.length;
        carbs.forEach(carb => {
          const carbPorPorcion = carb.carbo_g || 1;
          const porcsExtra = porExtraPorItem / carbPorPorcion;
          const nuevaPorc = Math.min(carb._porciones + porcsExtra, this.maxPorc(carb.codigo));
          const idx = items.indexOf(carb);
          items[idx] = this.crearItem(carb, nuevaPorc, carb._cat);
        });
      }
    }

    // Si sobran kcal → reducir carbos
    if (diff < -40) {
      const carbGSobrante = Math.abs(diff) / 4;
      const carbs = items.filter(i => i._cat === 'carbohidratos' && !i._alGusto);
      if (carbs.length > 0) {
        const porReducirPorItem = carbGSobrante / carbs.length;
        carbs.forEach(carb => {
          const carbPorPorcion = carb.carbo_g || 1;
          const porcsReducir = porReducirPorItem / carbPorPorcion;
          const nuevaPorc = Math.max(0.5, carb._porciones - porcsReducir);
          const idx = items.indexOf(carb);
          items[idx] = this.crearItem(carb, nuevaPorc, carb._cat);
        });
      }
    }

    return items;
  },

  // ═══════════════════════════════════════════════════════════
  // HELPERS DE CÁLCULO
  // ═══════════════════════════════════════════════════════════

  crearItem(alimento, porciones, cat, alGusto = false) {
    const base   = alimento.porcion_base_g || 100;
    const porcs  = alGusto ? 1 : Math.round(porciones * 2) / 2; // redondeo a 0.5
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

    return {
      ...alimento,
      _cat:      cat,
      _gramos:   gramos,
      _porcion,
      _porciones: porcs,
      _maxPorciones: maxP,
      _alGusto:  alGusto,
      _kcal:     Math.round((alimento.kcal       || 0) * factor),
      _prot:     Math.round((alimento.proteina_g || 0) * factor * 10) / 10,
      _grasa:    Math.round((alimento.grasa_g    || 0) * factor * 10) / 10,
      _carb:     Math.round((alimento.carbo_g    || 0) * factor * 10) / 10,
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
  subcategoriasEnUso(items) {
    return items.map(i => i.subcategoria).filter(Boolean);
  },

  filtrarPorSubcategoria(lista, items) {
    const usadas = this.subcategoriasEnUso(items);
    return lista.filter(a => !a.subcategoria || !usadas.includes(a.subcategoria));
  },

  limitarPorciones(codigo, porcsCalculadas) {
    const max = this.maxPorc(codigo);
    return Math.max(0.5, Math.min(Math.round(porcsCalculadas * 2) / 2, max));
  },

  maxPorc(codigo) { return this.MAX_PORCIONES[codigo] || 3; },

  totalesItems(items) {
    return items.reduce((a, i) => ({
      prot: a.prot + (i._prot || 0), grasa: a.grasa + (i._grasa || 0),
      carb: a.carb + (i._carb || 0), kcal: a.kcal + (i._kcal || 0),
    }), { kcal:0, prot:0, grasa:0, carb:0 });
  },

  totalesComida(comida) { return this.totalesItems(comida.items); },

  totalesDia(dia) {
    return dia.reduce((a, c) => {
      const t = this.totalesComida(c);
      return { kcal:a.kcal+t.kcal, prot:a.prot+t.prot, grasa:a.grasa+t.grasa, carb:a.carb+t.carb };
    }, { kcal:0, prot:0, grasa:0, carb:0 });
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
    return { desayuno:'🌅 Desayuno', almuerzo:'🍽️ Almuerzo', cena:'🌙 Cena',
             snack1:'🍎 Snack mañana', snack2:'🌿 Snack tarde' }[t] || t;
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
        <span style="font-weight:600;">⚙️ Configurar mi menú</span><span id="arr-prefs">▼</span>
      </div>
      <div id="prefs-body" style="display:none;margin-top:14px;">
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div><label class="pref-label">🍴 Comidas al día</label>
            <div class="btn-group-pref">${[3,4,5].map(n=>`<button class="btn-pref ${p.num_comidas===n?'activo':''}" data-pref="num_comidas" data-val="${n}">${n}</button>`).join('')}</div>
          </div>
          <div><label class="pref-label">🌟 Estilo</label>
            <div class="btn-group-pref">${Object.entries(modos).map(([k,v])=>`<button class="btn-pref ${p.modo===k?'activo':''}" data-pref="modo" data-val="${k}">${v}</button>`).join('')}</div>
          </div>
          <div><label class="pref-label">🚫 Restricciones</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${['sin_lacteos:🥛 Sin lácteos','sin_gluten:🌾 Sin gluten','sin_cerdo:🐷 Sin cerdo','vegetariano:🥦 Vegetariano']
                .map(s => { const [k,l] = s.split(':'); return `<label class="check-pref"><input type="checkbox" data-restr="${k}" ${(p.restricciones||[]).includes(k)?'checked':''}><span>${l}</span></label>`; }).join('')}
            </div>
          </div>
          <label class="check-pref"><input type="checkbox" data-check="ayuno" ${p.ayuno?'checked':''}><span>⏱️ Ayuno intermitente</span></label>
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
    const pctK = Math.min(Math.round((tot.kcal / obj.kcal) * 100), 120);
    const pctP = Math.round((tot.prot  / obj.prot)  * 100);
    const pctG = Math.round((tot.grasa / obj.grasa) * 100);
    const pctC = Math.round((tot.carb  / obj.carb)  * 100);
    const colorK = pctK > 105 ? '#ef4444' : pctK >= 85 ? '#10b981' : '#f59e0b';

    return `
    <div class="card mb-3" id="resumen-dia" style="background:var(--color-superficie-hover);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div><div style="font-weight:700;">📊 Resumen del día</div>
          <div style="font-size:0.8rem;color:var(--color-texto-secundario);" id="r-sub">${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal</div>
        </div>
      </div>
      <!-- Barras por macro -->
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
        ${this.barraMacro('Calorías', tot.kcal, obj.kcal, 'kcal', colorK)}
        ${this.barraMacro('Proteína', Math.round(tot.prot), obj.prot, 'g', pctP>=90?'#ef4444':'#f59e0b')}
        ${this.barraMacro('Grasa',    Math.round(tot.grasa), obj.grasa, 'g', pctG>=85?'#f59e0b':'#f59e0b')}
        ${this.barraMacro('Carbos',   Math.round(tot.carb), obj.carb, 'g', pctC<=110?'#10b981':'#ef4444')}
      </div>
    </div>
    <div id="warning-dia"></div>
    ${dia.map(c => this.renderComida(c, 0)).join('')}`;
  },

  barraMacro(label, actual, objetivo, unidad, color) {
    const pct = Math.min(Math.round((actual / objetivo) * 100), 120);
    const enRango = pct >= 85 && pct <= 110;
    const colorFinal = enRango ? '#10b981' : color;
    const icon = enRango ? '✅' : (pct < 85 ? '⚠️' : '🔴');
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

    return `
    <div class="card mb-2" style="padding:14px;" id="cc-${key}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <span style="font-weight:700;">${comida.label}</span>
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

    const maxP = item._maxPorciones || 3;
    const nueva = Math.max(0.5, Math.min((item._porciones||1) + delta * 0.5, maxP));
    const actualizado = this.crearItem(item, nueva, item._cat);
    comida.items[idx] = actualizado;

    const uid = `${key}-${idx}`;
    const el = id => document.getElementById(id);
    if (el(`pt-${uid}`)) el(`pt-${uid}`).textContent = actualizado._porcion;
    if (el(`kc-${uid}`)) el(`kc-${uid}`).textContent = `${actualizado._kcal} kcal`;
    if (el(`pc-${uid}`)) el(`pc-${uid}`).textContent = actualizado._porciones;

    // Warning si supera máximo
    if (nueva >= maxP) {
      window.ui?.mostrarAlerta(`⚠️ ${item.nombre}: máximo ${maxP} porciones`, 'warning', 2000);
    }

    this.actualizarUI(key, comida, diaIdx);
  },

  abrirSust(key, idx, cat, tiempo) {
    document.querySelectorAll('[id^="sp-"]').forEach(p => p.style.display = 'none');
    const uid   = `${key}-${idx}`;
    const panel = document.getElementById(`sp-${uid}`);
    if (!panel) return;

    const pool  = this.MENU_POOL[tiempo];
    if (!pool) return;

    // Buscar alimentos del mismo rol en ese tiempo
    let codigos = [];
    if (cat === 'proteinas')      codigos = [...(pool.proteina_base||[]), ...(pool.proteina_mixta||[])];
    else if (cat === 'carbohidratos') codigos = pool.carbo_base || [];
    else if (cat === 'grasas')    codigos = pool.grasa_base || [];
    else if (cat === 'frutas')    codigos = this.alimentos.filter(a => a.categoria === 'frutas').map(a => a.codigo);
    else if (cat === 'vegetales') codigos = this.alimentos.filter(a => a.categoria === 'vegetales').map(a => a.codigo);

    const { comida } = this.getComida(key);
    const actual = comida?.items[idx];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean).filter(a => a.codigo !== actual?.codigo);
    lista = this.filtrar(lista, this.preferencias);
    // Ordenar: primero misma subcategoría del ítem actual, luego el resto
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
    const pool = this.MENU_POOL[tiempo] || {};
    let permitidos = [];
    Object.entries(pool).forEach(([rol, codigos]) => {
      const cat = rol.startsWith('proteina') ? 'proteinas' : rol === 'carbo_base' ? 'carbohidratos' : rol === 'grasa_base' ? 'grasas' : rol;
      if (codigos === 'todas') {
        this.alimentos.filter(a => a.categoria === cat).forEach(a => {
          if (!permitidos.find(p => p.codigo === a.codigo)) permitidos.push({ ...a, _cat: cat });
        });
      } else if (Array.isArray(codigos)) {
        codigos.forEach(c => {
          const a = this.alimentos.find(x => x.codigo === c);
          if (a && !permitidos.find(p => p.codigo === a.codigo)) permitidos.push({ ...a, _cat: cat === 'proteinas' || cat === 'proteina_base' || cat === 'proteina_mixta' ? 'proteinas' : cat });
        });
      }
    });
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
