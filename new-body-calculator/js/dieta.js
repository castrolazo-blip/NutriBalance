/* ============================================================
   MÓDULO M7: MOTOR DE DIETA INTELIGENTE v4
   NutriBalance · by Ronald Castro
   ============================================================
   DATOS EN SUPABASE: kcal/proteina_g/grasa_g/carbo_g son
   valores POR porcion_base_g (no por 100g).
   Ejemplo: Huevo entero → 72 kcal / 50g (1 huevo)
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

  // ─── Porciones máximas por alimento (en unidades) ────────
  MAX_PORCIONES: {
    'A-0003': 3,   // Huevo entero: máx 3 huevos
    'A-0004': 5,   // Clara de huevo: máx 5 claras
    'A-0001': 2,   // Pechuga de pollo: máx 2
    'A-0002': 2,   // Muslo de pollo: máx 2
    'A-0005': 2,   // Carne de res: máx 2
    'A-0006': 2,   // Carne molida: máx 2
    'A-0008': 2,   // Atún: máx 2 latas
    'A-0010': 2,   // Tilapia: máx 2 filetes
    'A-0014': 2,   // Proteína en polvo: máx 2 scoops
    'A-0021': 3,   // Arroz: máx 3 porciones
    'A-0022': 3,   // Arroz integral: máx 3
    'A-0023': 4,   // Tortilla de maíz: máx 4
    'A-0024': 3,   // Pan francés: máx 3
    'A-0026': 2,   // Avena: máx 2 porciones
    'A-0028': 3,   // Papa: máx 3
    'A-0029': 3,   // Camote: máx 3
    'A-0016': 3,   // Frijoles: máx 3
    'A-0036': 2,   // Aguacate: máx 2 porciones
    'A-0039': 2,   // Crema de maní: máx 2 cucharadas
    'A-0040': 1,   // Aceite de oliva: máx 1 cucharada
  },

  // ─── Alimentos por tiempo de comida ──────────────────────
  ALIMENTOS_POR_TIEMPO: {
    desayuno: {
      proteinas:     ['A-0003','A-0004','A-0014','A-0015','A-0085','A-0086','A-0012'],
      carbohidratos: ['A-0023','A-0024','A-0025','A-0026','A-0034'],
      grasas:        ['A-0036','A-0039','A-0040'],
      vegetales:     [],
      frutas:        ['A-0043','A-0044','A-0045','A-0046','A-0047'],
      combinados:    ['A-0090','A-0091','A-0092','A-0093','A-0094'],
    },
    almuerzo: {
      proteinas:     ['A-0001','A-0002','A-0005','A-0006','A-0007','A-0008','A-0010','A-0011','A-0016','A-0017'],
      carbohidratos: ['A-0021','A-0022','A-0023','A-0027','A-0028','A-0030','A-0031','A-0035'],
      grasas:        ['A-0036','A-0039'],
      vegetales:     'todas',
      frutas:        [],
    },
    cena: {
      proteinas:     ['A-0001','A-0003','A-0004','A-0005','A-0008','A-0010','A-0012','A-0014','A-0016','A-0017'],
      carbohidratos: ['A-0021','A-0023','A-0028','A-0029','A-0025'],
      grasas:        ['A-0036'],
      vegetales:     'todas',
      frutas:        [],
    },
    snack1: {
      proteinas:     ['A-0003','A-0004','A-0014','A-0085'],
      carbohidratos: ['A-0025','A-0026','A-0034'],
      grasas:        ['A-0039','A-0040'],
      vegetales:     [],
      frutas:        'todas',
    },
    snack2: {
      proteinas:     ['A-0003','A-0004','A-0014','A-0085'],
      carbohidratos: ['A-0025','A-0026','A-0034'],
      grasas:        ['A-0039','A-0040'],
      vegetales:     [],
      frutas:        'todas',
    },
  },

  // ─── Distribución calórica por número de comidas ─────────
  DISTRIBUCION: {
    3: { desayuno:0.30, almuerzo:0.40, cena:0.30 },
    4: { desayuno:0.25, almuerzo:0.35, cena:0.25, snack1:0.15 },
    5: { desayuno:0.22, almuerzo:0.30, cena:0.22, snack1:0.13, snack2:0.13 },
  },

  PREF_DEFAULT: {
    num_comidas:      4,
    ayuno:            false,
    modo:             'salvadoreno',
    restricciones:    [],
  },

  // ─────────────────────────────────────────────────────────
  async cargar() {
    const uid = window.app.usuario.id;
    this.perfilActual = await window.dbHelpers.obtenerPerfilNutricional(uid);
    this.configActual = await window.dbHelpers.obtenerConfigPreferencias(uid);
    if (!this.perfilActual) { this.renderSinPerfil(); return; }
    this.calculoActual = window.calculo.calcularCompleto(this.perfilActual, this.configActual);
    this.alimentos     = await window.dbHelpers.listarAlimentos();
    this.preferencias  = await this.cargarPreferencias(uid);
    this.renderPantalla();
  },

  async cargarPreferencias(uid) {
    try {
      const { data } = await window.db
        .from('configuraciones_preferencias')
        .select('preferencias_dieta')
        .eq('usuario_id', uid)
        .single();
      return { ...this.PREF_DEFAULT, ...(data?.preferencias_dieta || {}) };
    } catch { return { ...this.PREF_DEFAULT }; }
  },

  async guardarPreferencias() {
    try {
      const uid = window.app.usuario.id;
      await window.db.from('configuraciones_preferencias').upsert(
        { usuario_id: uid, preferencias_dieta: this.preferencias },
        { onConflict: 'usuario_id' }
      );
    } catch (e) { console.warn('No se pudo guardar preferencias:', e); }
  },

  // ─────────────────────────────────────────────────────────
  renderSinPerfil() {
    document.getElementById('page-dieta').innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Mi Dieta Sugerida</h1>
      </div>
      <div class="card text-center" style="padding:40px 20px;">
        <div style="font-size:3rem;margin-bottom:12px;">📋</div>
        <h3 style="margin-bottom:8px;">Completa tu perfil primero</h3>
        <p style="color:var(--color-texto-secundario);margin-bottom:20px;">
          Necesitamos tus datos físicos y metas para generar tu dieta.
        </p>
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
      ${this.renderPanelPreferencias()}
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <button class="btn-vista ${this.vistaActiva==='diario'?'activa':''}" data-vista="diario">📅 Menú del día</button>
        <button class="btn-vista ${this.vistaActiva==='semanal'?'activa':''}" data-vista="semanal">🗓️ Menú semanal</button>
      </div>
      <div id="dieta-menu-container">
        <div class="loading"><div class="spinner"></div></div>
      </div>
      ${this.renderEstilos()}`;
    this.configurarEventos();
    this.generarYRenderMenu();
  },

  renderPanelPreferencias() {
    const p = this.preferencias;
    const modos = { salvadoreno:'🇸🇻 Salvadoreño', fitness:'💪 Fitness', economico:'💰 Económico' };
    return `
    <div class="card mb-3">
      <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;" id="toggle-prefs">
        <span style="font-weight:600;">⚙️ Configurar mi menú</span>
        <span id="arrow-prefs" style="transition:transform 0.25s;">▼</span>
      </div>
      <div id="prefs-body" style="display:none;margin-top:14px;">
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="pref-label">🍴 Comidas al día</label>
            <div class="btn-group-pref">
              ${[3,4,5].map(n=>`<button class="btn-pref ${p.num_comidas===n?'activo':''}" data-pref="num_comidas" data-val="${n}">${n} comidas</button>`).join('')}
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
              ${this.chkR('sin_lacteos','🥛 Sin lácteos',p.restricciones)}
              ${this.chkR('sin_gluten','🌾 Sin gluten',p.restricciones)}
              ${this.chkR('sin_cerdo','🐷 Sin cerdo',p.restricciones)}
              ${this.chkR('vegetariano','🥦 Vegetariano',p.restricciones)}
            </div>
          </div>
          <div>
            ${this.chk('ayuno','⏱️ Ayuno intermitente (sin desayuno)',p.ayuno)}
          </div>
        </div>
        <button class="btn btn-primary mt-3" id="btn-aplicar-prefs" style="width:100%;">✅ Aplicar y generar menú</button>
      </div>
    </div>`;
  },

  chk(key, label, val) {
    return `<label class="check-pref"><input type="checkbox" data-check="${key}" ${val?'checked':''}><span>${label}</span></label>`;
  },
  chkR(key, label, lista) {
    return `<label class="check-pref"><input type="checkbox" data-restr="${key}" ${(lista||[]).includes(key)?'checked':''}><span>${label}</span></label>`;
  },

  configurarEventos() {
    document.getElementById('toggle-prefs')?.addEventListener('click', () => {
      const body = document.getElementById('prefs-body');
      const arrow = document.getElementById('arrow-prefs');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      arrow.style.transform = open ? '' : 'rotate(180deg)';
    });
    document.querySelectorAll('[data-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.pref;
        const val = isNaN(btn.dataset.val) ? btn.dataset.val : Number(btn.dataset.val);
        this.preferencias[key] = val;
        document.querySelectorAll(`[data-pref="${key}"]`).forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
      });
    });
    document.querySelectorAll('[data-check]').forEach(chk => {
      chk.addEventListener('change', () => { this.preferencias[chk.dataset.check] = chk.checked; });
    });
    document.querySelectorAll('[data-restr]').forEach(chk => {
      chk.addEventListener('change', () => {
        const key = chk.dataset.restr;
        if (!this.preferencias.restricciones) this.preferencias.restricciones = [];
        if (chk.checked) { if (!this.preferencias.restricciones.includes(key)) this.preferencias.restricciones.push(key); }
        else { this.preferencias.restricciones = this.preferencias.restricciones.filter(r=>r!==key); }
      });
    });
    document.getElementById('btn-aplicar-prefs')?.addEventListener('click', async () => {
      await this.guardarPreferencias();
      document.getElementById('prefs-body').style.display = 'none';
      document.getElementById('arrow-prefs').style.transform = '';
      this.generarYRenderMenu();
    });
    document.querySelectorAll('[data-vista]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.vistaActiva = btn.dataset.vista;
        document.querySelectorAll('[data-vista]').forEach(b => b.classList.remove('activa'));
        btn.classList.add('activa');
        this.renderMenuEnContenedor();
      });
    });
  },

  // ═════════════════════════════════════════════════════════
  // GENERACIÓN DEL MENÚ
  // ═════════════════════════════════════════════════════════

  generarYRenderMenu() {
    const cont = document.getElementById('dieta-menu-container');
    cont.innerHTML = `<div class="loading"><div class="spinner"></div><p style="margin-top:8px;font-size:0.9rem;color:var(--color-texto-secundario);">Generando tu menú...</p></div>`;
    setTimeout(() => {
      try {
        this.menuGenerado = this.generarMenu();
        this.renderMenuEnContenedor();
      } catch(e) {
        console.error(e);
        cont.innerHTML = `<div class="alert alert-warning">⚠️ Error al generar el menú: ${e.message}</div>`;
      }
    }, 150);
  },

  generarMenu() {
    const r = this.calculoActual;
    const p = this.preferencias;
    const objetivo = { kcal: r.kcal_objetivo, prot: r.proteina_g, grasa: r.grasa_g, carb: r.carbo_g };

    // Definir estructura de comidas
    const estructura = [];
    if (!p.ayuno) estructura.push('desayuno');
    estructura.push('almuerzo');
    if (p.num_comidas >= 4) estructura.push('snack1');
    if (p.num_comidas >= 5) estructura.push('snack2');
    estructura.push('cena');

    // Distribución calórica
    const dist = this.DISTRIBUCION[p.num_comidas] || this.DISTRIBUCION[4];

    // Generar día base y semana
    const diaBase = this.generarDia(estructura, dist, objetivo, p, 0);
    const semana  = Array.from({ length: 7 }, (_, i) => this.generarDia(estructura, dist, objetivo, p, i * 13));

    return { diaBase, semana, objetivo, estructura, dist };
  },

  generarDia(estructura, dist, objetivo, p, seed) {
    return estructura.map(tiempo => {
      const pctKcal  = dist[tiempo] || 0.20;
      const kcalMeta = Math.round(objetivo.kcal * pctKcal);
      const items    = tiempo.startsWith('snack')
        ? this.armarSnack(tiempo, kcalMeta, p, seed)
        : this.armarComida(tiempo, kcalMeta, objetivo, p, seed);

      return {
        tiempo,
        label:    this.labelTiempo(tiempo),
        kcalMeta,
        items,
      };
    });
  },

  // ─── Armar comida principal ───────────────────────────────
  armarComida(tiempo, kcalMeta, objetivo, p, seed) {
    const reglas = this.ALIMENTOS_POR_TIEMPO[tiempo];
    if (!reglas) return [];

    const items = [];

    // Desayuno: a veces usar combinado (pupusa, pancakes, dobladita)
    if (tiempo === 'desayuno' && reglas.combinados && seed % 3 === 0) {
      const listaComb = this.candidatos(reglas.combinados, p);
      const comb = this.elegir(listaComb, seed + 5);
      if (comb) {
        const porcs = this.calcularPorciones(comb, kcalMeta * 0.70, 'kcal');
        items.push(this.crearItem(comb, porcs, 'combinados'));
        return this.escalarItems(items, kcalMeta);
      }
    }

    // 1. Elegir proteína principal
    const listaProt = this.candidatos(reglas.proteinas, p);
    const prot = this.elegir(listaProt, seed);
    if (prot) {
      const porcs = this.calcularPorciones(prot, kcalMeta * 0.40, 'kcal');
      items.push(this.crearItem(prot, porcs, 'proteinas'));
    }

    // 2. Elegir carbohidrato
    const listaCarb = this.candidatos(reglas.carbohidratos, p);
    const carb = this.elegir(listaCarb, seed + 1);
    if (carb) {
      const porcs = this.calcularPorciones(carb, kcalMeta * 0.40, 'kcal');
      items.push(this.crearItem(carb, porcs, 'carbohidratos'));
    }

    // 3. Agregar vegetal (almuerzo y cena)
    if (reglas.vegetales === 'todas') {
      const vegs = this.alimentos.filter(a => a.categoria === 'vegetales');
      const veg  = this.elegir(vegs, seed + 2);
      if (veg) items.push(this.crearItem(veg, 1, 'vegetales', true));
    }

    // 4. Frijoles en almuerzo (modo salvadoreño)
    if (tiempo === 'almuerzo' && (p.modo === 'salvadoreno' || p.modo === 'economico')) {
      const frijol = this.alimentos.find(a => a.codigo === 'A-0016');
      if (frijol && !items.find(i => i.codigo === 'A-0016')) {
        items.push(this.crearItem(frijol, 1, 'proteinas'));
      }
    }

    // 5. Grasa en desayuno
    if (tiempo === 'desayuno' && reglas.grasas.length > 0) {
      const listaGrasa = this.candidatos(reglas.grasas, p);
      const grasa = this.elegir(listaGrasa, seed + 3);
      if (grasa) {
        const porcs = this.calcularPorciones(grasa, kcalMeta * 0.20, 'kcal');
        items.push(this.crearItem(grasa, porcs, 'grasas'));
      }
    }

    // 6. Escalar todo para acercarse al kcalMeta
    return this.escalarItems(items, kcalMeta);
  },

  // ─── Armar snack ─────────────────────────────────────────
  armarSnack(tiempo, kcalMeta, p, seed) {
    const reglas  = this.ALIMENTOS_POR_TIEMPO[tiempo];
    const items   = [];

    // Fruta
    const frutas = this.alimentos.filter(a => a.categoria === 'frutas');
    const fruta  = this.elegir(frutas, seed + 10);
    if (fruta) items.push(this.crearItem(fruta, 1, 'frutas'));

    // Proteína portable (modo fitness)
    if (p.modo === 'fitness') {
      const listaProt = this.candidatos(reglas.proteinas || [], p);
      const prot = this.elegir(listaProt, seed + 11);
      if (prot) items.push(this.crearItem(prot, 1, 'proteinas'));
    }

    return items;
  },

  // ─── Calcular porciones para un alimento ─────────────────
  // objetivo: cuántas kcal debe aportar este alimento
  calcularPorciones(alimento, kcalObjetivo, tipo) {
    const kcalPorPorcion = alimento.kcal || 0;
    if (kcalPorPorcion <= 0) return 1;
    const maxPorciones = this.MAX_PORCIONES[alimento.codigo] || 3;
    const porcsNecesarias = kcalObjetivo / kcalPorPorcion;
    return Math.max(1, Math.min(Math.round(porcsNecesarias * 2) / 2, maxPorciones));
  },

  // ─── Crear ítem con porciones calculadas ─────────────────
  crearItem(alimento, porciones, categoria, alGusto = false) {
    const base    = alimento.porcion_base_g || 100;
    const gramos  = alGusto ? base : Math.round(porciones * base);
    const factor  = gramos / base;
    const maxPorc = this.MAX_PORCIONES[alimento.codigo] || 3;

    let _porcion = alGusto ? '1 porción al gusto' : `${gramos}g`;
    if (!alGusto && alimento.unidad_hogar && base > 0) {
      const uR = Math.round((gramos / base) * 2) / 2;
      if (uR >= 0.5 && uR <= 10) {
        const uhLimpia = alimento.unidad_hogar.replace(/^[\d.]+\s*/, '').trim();
        _porcion = `${gramos}g (≈ ${uR} ${uhLimpia})`;
      }
    }

    return {
      ...alimento,
      _cat:      categoria,
      _gramos:   gramos,
      _porcion,
      _porciones: alGusto ? 1 : porciones,
      _maxPorciones: maxPorc,
      _alGusto:  alGusto,
      // Macros ajustados a la porción actual
      _kcal:     Math.round((alimento.kcal       || 0) * factor),
      _prot:     Math.round((alimento.proteina_g || 0) * factor * 10) / 10,
      _grasa:    Math.round((alimento.grasa_g    || 0) * factor * 10) / 10,
      _carb:     Math.round((alimento.carbo_g    || 0) * factor * 10) / 10,
    };
  },

  // ─── Escalar ítems respetando distribución de macros ──────
  escalarItems(items, kcalMeta) {
    if (!items || items.length === 0) return items;
    let kcalActual = items.reduce((s, i) => s + (i._kcal || 0), 0);
    if (kcalActual <= 0) return items;

    // Paso 1: Reducir carbohidratos si se exceden (prioridad alta)
    const carbActual = items.reduce((s, i) => s + (i._carb || 0), 0);
    const carbMeta   = kcalMeta * 0.32 / 4; // 32% kcal en carb → gramos
    if (carbActual > carbMeta * 1.15) {
      const factorReducir = carbMeta / carbActual;
      items = items.map(item => {
        if (item._alGusto || item._cat !== 'carbohidratos') return item;
        const porcsNuevas = Math.max(0.5, item._porciones * factorReducir);
        return this.crearItem(item, porcsNuevas, item._cat, false);
      });
    }

    // Paso 2: Escalar proteínas si están bajas
    const protActual = items.reduce((s, i) => s + (i._prot || 0), 0);
    const protMeta   = kcalMeta * 0.35 / 4; // 35% kcal en prot → gramos
    if (protActual < protMeta * 0.85) {
      const factorProt = protMeta / protActual;
      items = items.map(item => {
        if (item._alGusto || item._cat !== 'proteinas') return item;
        const maxPorc     = item._maxPorciones || 3;
        const porcsNuevas = Math.max(1, Math.min(item._porciones * factorProt, maxPorc));
        return this.crearItem(item, porcsNuevas, item._cat, false);
      });
    }

    // Paso 3: Si aún faltan kcal, escalar todo proporcionalmente
    kcalActual = items.reduce((s, i) => s + (i._kcal || 0), 0);
    const ratio = kcalMeta / kcalActual;
    if (ratio > 1.05) {
      items = items.map(item => {
        if (item._alGusto) return item;
        const maxPorc     = item._maxPorciones || 3;
        const porcsNuevas = Math.max(1, Math.min(item._porciones * ratio, maxPorc));
        return this.crearItem(item, porcsNuevas, item._cat, false);
      });
    }

    // Paso 4: Si aún falta más del 8%, agregar proteína primero, luego grasa
    kcalActual = items.reduce((s, i) => s + (i._kcal || 0), 0);
    const faltante = kcalMeta - kcalActual;
    if (faltante > kcalMeta * 0.08) {
      const codigosEnUso = items.map(i => i.codigo);
      // Priorizar proteína
      const extras = this.alimentos.filter(a =>
        a.categoria === 'proteinas' &&
        !codigosEnUso.includes(a.codigo) &&
        a.kcal > 0
      );
      if (extras.length > 0) {
        const mejor = extras.reduce((prev, curr) =>
          Math.abs(curr.kcal - faltante) < Math.abs(prev.kcal - faltante) ? curr : prev
        );
        const porcsExtra = Math.max(1, Math.min(Math.round(faltante / mejor.kcal), this.MAX_PORCIONES[mejor.codigo] || 3));
        items.push(this.crearItem(mejor, porcsExtra, 'proteinas', false));
      }
    }

    return items;
  },

  // ─── Helpers ─────────────────────────────────────────────
  candidatos(codigos, p) {
    if (!codigos || codigos.length === 0) return [];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
    return this.aplicarRestricciones(lista, p);
  },

  aplicarRestricciones(lista, p) {
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
    return {
      desayuno:'🌅 Desayuno', almuerzo:'🍽️ Almuerzo',
      cena:'🌙 Cena', snack1:'🍎 Snack mañana', snack2:'🌿 Snack tarde'
    }[t] || t;
  },

  // ─── Totales de una comida ────────────────────────────────
  totalesComida(comida) {
    return comida.items.reduce((acc, item) => ({
      kcal:  acc.kcal  + (item._kcal  || 0),
      prot:  acc.prot  + (item._prot  || 0),
      grasa: acc.grasa + (item._grasa || 0),
      carb:  acc.carb  + (item._carb  || 0),
    }), { kcal:0, prot:0, grasa:0, carb:0 });
  },

  totalesDia(dia) {
    return dia.reduce((acc, comida) => {
      const t = this.totalesComida(comida);
      return { kcal: acc.kcal+t.kcal, prot: acc.prot+t.prot, grasa: acc.grasa+t.grasa, carb: acc.carb+t.carb };
    }, { kcal:0, prot:0, grasa:0, carb:0 });
  },

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════

  renderMenuEnContenedor() {
    const cont = document.getElementById('dieta-menu-container');
    if (!this.menuGenerado) return;
    const { diaBase, semana, objetivo } = this.menuGenerado;

    cont.innerHTML = this.vistaActiva === 'diario'
      ? this.renderDiario(diaBase, objetivo) + this.renderBotones()
      : this.renderSemanal(semana, objetivo) + this.renderBotones();

    document.getElementById('btn-regenerar')?.addEventListener('click', () => this.generarYRenderMenu());
  },

  renderDiario(dia, objetivo) {
    const tot = this.totalesDia(dia);
    const pct = Math.min(Math.round((tot.kcal / objetivo.kcal) * 100), 110);
    const colorBarra = pct > 105 ? '#ef4444' : pct >= 85 ? '#10b981' : '#f59e0b';
    const statusBarra = pct > 105 ? '⚠️ Superaste el objetivo' : pct >= 85 ? '✅ En objetivo' : '⚠️ Por debajo del objetivo';

    return `
    <div class="card mb-3" id="resumen-dia" style="background:var(--color-superficie-hover);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;">📊 Resumen del día</div>
          <div style="font-size:0.8rem;color:var(--color-texto-secundario);" id="resumen-subtitulo">
            ${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal
          </div>
        </div>
        <div style="display:flex;gap:10px;font-size:0.82rem;font-weight:600;">
          <span style="color:#ef4444;" id="r-prot">P: ${Math.round(tot.prot)}g</span>
          <span style="color:#f59e0b;" id="r-grasa">G: ${Math.round(tot.grasa)}g</span>
          <span style="color:#10b981;" id="r-carb">C: ${Math.round(tot.carb)}g</span>
        </div>
      </div>
      <div style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--color-texto-secundario);margin-bottom:4px;">
          <span id="r-status">${statusBarra}</span>
          <span id="r-pct">${pct}% del objetivo (${window.ui.formatearNumero(objetivo.kcal)} kcal)</span>
        </div>
        <div style="height:8px;background:var(--color-borde);border-radius:999px;overflow:hidden;">
          <div id="r-barra" style="height:100%;width:${Math.min(pct,100)}%;background:${colorBarra};border-radius:999px;transition:width 0.5s ease;"></div>
        </div>
      </div>
    </div>
    <div id="warning-dia"></div>
    ${dia.map(c => this.renderComida(c, 0)).join('')}`;
  },

  renderSemanal(semana, objetivo) {
    const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    return `
    <div class="alert alert-info mb-3" style="font-size:0.85rem;">
      📋 Toca cada día para ver el detalle.
    </div>
    ${semana.map((dia, i) => {
      const tot = this.totalesDia(dia);
      return `
      <div class="card mb-2">
        <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
             onclick="const d=this.nextElementSibling;d.style.display=d.style.display==='block'?'none':'block'">
          <span style="font-weight:600;">📅 ${dias[i]}</span>
          <span style="font-size:0.78rem;color:var(--color-texto-secundario);">
            ~${window.ui.formatearNumero(tot.kcal)} kcal
          </span>
        </div>
        <div style="display:none;margin-top:12px;">
          ${dia.map(c => this.renderComida(c, i + 1)).join('')}
        </div>
      </div>`;
    }).join('')}`;
  },

  renderComida(comida, diaIdx) {
    const tot     = this.totalesComida(comida);
    const pct     = comida.kcalMeta > 0 ? Math.round((tot.kcal / comida.kcalMeta) * 100) : 0;
    const overLimit = pct > 110;
    const key     = `${diaIdx}-${comida.tiempo}`;

    return `
    <div class="card mb-2" style="padding:14px;" id="comida-card-${key}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <span style="font-weight:700;font-size:1rem;">${comida.label}</span>
        <div style="display:flex;gap:8px;font-size:0.78rem;font-weight:600;flex-wrap:wrap;" id="totales-${key}">
          <span id="tc-kcal-${key}" style="${overLimit?'color:#ef4444':''}">${tot.kcal} kcal${overLimit?' ⚠️':''}</span>
          <span style="color:#ef4444;" id="tc-prot-${key}">${Math.round(tot.prot)}g P</span>
          <span style="color:#f59e0b;" id="tc-grasa-${key}">${Math.round(tot.grasa)}g G</span>
          <span style="color:#10b981;" id="tc-carb-${key}">${Math.round(tot.carb)}g C</span>
        </div>
      </div>
      ${overLimit ? `<div class="warning-comida">⚠️ Esta comida supera su límite calórico (${comida.kcalMeta} kcal asignadas)</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:6px;" id="items-${key}">
        ${comida.items.map((item, i) => this.renderItem(item, key, i, comida.tiempo)).join('')}
      </div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-agregar-item" onclick="window.dieta.abrirAgregar('${key}','${comida.tiempo}',${diaIdx})">
          ＋ Agregar alimento
        </button>
      </div>
      <div id="panel-agregar-${key}" style="display:none;margin-top:8px;"></div>
    </div>`;
  },

  renderItem(item, key, itemIdx, tiempo) {
    const estilos = {
      proteinas:     { bg:'#fee2e2', border:'#991b1b', emoji:'🥩' },
      carbohidratos: { bg:'#d1fae5', border:'#065f46', emoji:'🍞' },
      grasas:        { bg:'#fef9c3', border:'#92400e', emoji:'🥑' },
      frutas:        { bg:'#ede9fe', border:'#5b21b6', emoji:'🍎' },
      vegetales:     { bg:'#dcfce7', border:'#166534', emoji:'🥬' },
      combinados:    { bg:'#e0f2fe', border:'#0c4a6e', emoji:'🫓' },
    };
    const e   = estilos[item._cat] || { bg:'#f1f5f9', border:'#475569', emoji:'🍽️' };
    const uid = `${key}-${itemIdx}`;

    const nombreSeguro = (item.nombre || '').replace(/'/g, "\\'");
    const tieneReceta  = item.codigo && !item._alGusto;
    const btnReceta    = tieneReceta ? `
      <button onclick="event.stopPropagation();window.recetas?.mostrarPanelRecetas('${item.codigo}','${nombreSeguro}','${uid}')"
        style="background:none;border:1px solid #10b981;border-radius:5px;cursor:pointer;
               font-size:0.72rem;color:#10b981;padding:2px 7px;font-weight:600;
               font-family:inherit;white-space:nowrap;">👨‍🍳 Receta</button>` : '';

    const btnEliminar = item._manual ? `
      <button onclick="event.stopPropagation();window.dieta.eliminarItem('${key}',${itemIdx},${tiempo.startsWith('snack')?1:0})"
        style="background:none;border:none;cursor:pointer;font-size:0.85rem;color:#ef4444;padding:2px 4px;">✕</button>` : '';

    // Botones +/- solo si no es "al gusto"
    const btnPlusMinus = !item._alGusto ? `
      <div style="display:flex;align-items:center;gap:4px;" onclick="event.stopPropagation()">
        <button class="btn-porcion" onclick="window.dieta.ajustarPorcion('${key}',${itemIdx},-1)" title="Reducir porción">−</button>
        <span style="font-size:0.75rem;min-width:20px;text-align:center;font-weight:600;" id="porcs-${uid}">${item._porciones}</span>
        <button class="btn-porcion" onclick="window.dieta.ajustarPorcion('${key}',${itemIdx},+1)" title="Aumentar porción">＋</button>
      </div>` : '';

    return `
    <div class="item-wrap" id="item-${uid}">
      <div style="padding:8px 12px;border-radius:8px;border-left:3px solid ${e.border};
                  background:${e.bg}40;display:flex;align-items:center;gap:8px;flex-wrap:wrap;"
           id="item-row-${uid}">
        <span style="font-size:1.1rem;">${e.emoji}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.88rem;color:var(--color-texto-principal);">${item.nombre}</div>
          <div style="font-size:0.76rem;color:var(--color-texto-secundario);" id="porcion-txt-${uid}">${item._porcion}</div>
        </div>
        <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;flex-wrap:wrap;">
          ${btnPlusMinus}
          ${btnReceta}
          <div style="font-size:0.78rem;color:${e.border};font-weight:600;white-space:nowrap;" id="kcal-txt-${uid}">${item._kcal} kcal</div>
          <button onclick="event.stopPropagation();window.dieta.abrirSustituir('${key}',${itemIdx},'${item._cat}','${tiempo}')"
            style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:var(--color-texto-claro);padding:2px;"
            title="Sustituir">🔄</button>
          ${btnEliminar}
        </div>
      </div>
      <div id="sustituir-${uid}" style="display:none;"></div>
      <div id="receta-panel-${uid}"></div>
    </div>`;
  },

  // ═════════════════════════════════════════════════════════
  // AJUSTAR PORCIONES (+/-)
  // ═════════════════════════════════════════════════════════
  ajustarPorcion(key, itemIdx, delta) {
    const { diaIdx, tiempo, comida } = this.obtenerComida(key);
    if (!comida) return;
    const item = comida.items[itemIdx];
    if (!item || item._alGusto) return;

    const maxPorc  = item._maxPorciones || 3;
    const nuevaPorc = Math.max(0.5, Math.min((item._porciones || 1) + delta * 0.5, maxPorc));

    // Actualizar el ítem
    const actualizado = this.crearItem(item, nuevaPorc, item._cat, false);
    comida.items[itemIdx] = actualizado;

    // Re-render del ítem
    const uid = `${key}-${itemIdx}`;
    const porcionEl = document.getElementById(`porcion-txt-${uid}`);
    const kcalEl    = document.getElementById(`kcal-txt-${uid}`);
    const porcsEl   = document.getElementById(`porcs-${uid}`);
    if (porcionEl) porcionEl.textContent = actualizado._porcion;
    if (kcalEl)    kcalEl.textContent    = `${actualizado._kcal} kcal`;
    if (porcsEl)   porcsEl.textContent   = actualizado._porciones;

    this.actualizarTotalesUI(key, comida, diaIdx);
  },

  // ═════════════════════════════════════════════════════════
  // SUSTITUIR ALIMENTO
  // ═════════════════════════════════════════════════════════
  abrirSustituir(key, itemIdx, cat, tiempo) {
    // Cerrar paneles previos
    document.querySelectorAll('[id^="sustituir-"]').forEach(p => p.style.display = 'none');

    const uid    = `${key}-${itemIdx}`;
    const panel  = document.getElementById(`sustituir-${uid}`);
    if (!panel) return;

    // Obtener alimentos del mismo tiempo y categoría
    const reglaTiempo = this.ALIMENTOS_POR_TIEMPO[tiempo];
    let codigos = [];
    if (reglaTiempo && reglaTiempo[cat]) {
      codigos = reglaTiempo[cat] === 'todas'
        ? this.alimentos.filter(a => a.categoria === cat).map(a => a.codigo)
        : reglaTiempo[cat];
    }

    const { comida } = this.obtenerComida(key);
    const actual = comida?.items[itemIdx];
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c))
      .filter(Boolean)
      .filter(a => a.codigo !== actual?.codigo);
    lista = this.aplicarRestricciones(lista, this.preferencias);

    if (lista.length === 0) {
      panel.innerHTML = `<div style="padding:8px 12px;font-size:0.82rem;color:var(--color-texto-secundario);background:var(--color-superficie);border:1px solid var(--color-borde);border-top:none;border-radius:0 0 8px 8px;">No hay alternativas disponibles para este tiempo.</div>`;
    } else {
      const colores = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534' };
      const color   = colores[cat] || '#475569';
      panel.innerHTML = `
        <div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
          <div style="padding:6px 12px;background:var(--color-superficie-hover);font-size:0.73rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;">
            🔄 Sustituir por (mismo tiempo de comida)
          </div>
          ${lista.slice(0,6).map(alt => `
          <div onclick="window.dieta.aplicarSustitucion('${key}',${itemIdx},'${alt.codigo}','${cat}')"
               style="padding:9px 12px;border-bottom:1px solid var(--color-borde);display:flex;
                      justify-content:space-between;align-items:center;gap:8px;cursor:pointer;">
            <div>
              <div style="font-weight:600;font-size:0.87rem;">${alt.nombre}</div>
              <div style="font-size:0.73rem;color:var(--color-texto-secundario);">${alt.unidad_hogar || alt.porcion_base_g+'g'}</div>
            </div>
            <span style="font-size:0.78rem;color:${color};font-weight:600;">${alt.kcal} kcal</span>
          </div>`).join('')}
        </div>`;
    }
    panel.style.display = 'block';
  },

  aplicarSustitucion(key, itemIdx, codigoNuevo, cat) {
    const { comida } = this.obtenerComida(key);
    if (!comida) return;
    const nuevo = this.alimentos.find(a => a.codigo === codigoNuevo);
    if (!nuevo) return;

    const itemAnterior = comida.items[itemIdx];
    const porciones    = itemAnterior._porciones || 1;
    comida.items[itemIdx] = this.crearItem(nuevo, porciones, cat, false);

    // Re-render items de la comida
    this.rerenderItems(key, comida);
    this.actualizarTotalesUI(key, comida, this.obtenerComida(key).diaIdx);

    // Cerrar panel
    const uid = `${key}-${itemIdx}`;
    const panel = document.getElementById(`sustituir-${uid}`);
    if (panel) panel.style.display = 'none';
  },

  // ═════════════════════════════════════════════════════════
  // AGREGAR ALIMENTO
  // ═════════════════════════════════════════════════════════
  abrirAgregar(key, tiempo, diaIdx) {
    // Cerrar otros paneles
    document.querySelectorAll('[id^="panel-agregar-"]').forEach(p => {
      if (p.id !== `panel-agregar-${key}`) p.style.display = 'none';
    });
    const panel = document.getElementById(`panel-agregar-${key}`);
    if (!panel) return;
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }

    panel.style.display = 'block';
    panel.innerHTML = `
      <div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-radius:8px;overflow:hidden;">
        <div style="padding:8px 12px;background:var(--color-superficie-hover);font-size:0.73rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;">
          ＋ Agregar alimento (opciones de ${this.labelTiempo(tiempo)})
        </div>
        <div style="padding:8px 12px;">
          <input type="text" class="form-input" placeholder="🔍 Buscar..."
                 style="margin-bottom:6px;font-size:0.85rem;"
                 oninput="window.dieta.filtrarAgregar(this.value,'${key}','${tiempo}')">
        </div>
        <div id="lista-agregar-${key}" style="max-height:220px;overflow-y:auto;"></div>
      </div>`;

    this.filtrarAgregar('', key, tiempo);
  },

  filtrarAgregar(termino, key, tiempo) {
    const lista = document.getElementById(`lista-agregar-${key}`);
    if (!lista) return;

    // Solo alimentos permitidos para ese tiempo
    const reglaTiempo = this.ALIMENTOS_POR_TIEMPO[tiempo] || {};
    let permitidos = [];
    Object.entries(reglaTiempo).forEach(([cat, codigos]) => {
      if (codigos === 'todas') {
        this.alimentos.filter(a => a.categoria === cat).forEach(a => {
          if (!permitidos.find(p => p.codigo === a.codigo)) permitidos.push({ ...a, _cat: cat });
        });
      } else if (Array.isArray(codigos)) {
        codigos.forEach(c => {
          const a = this.alimentos.find(x => x.codigo === c);
          if (a && !permitidos.find(p => p.codigo === a.codigo)) permitidos.push({ ...a, _cat: cat });
        });
      }
    });

    permitidos = this.aplicarRestricciones(permitidos, this.preferencias);
    if (termino) permitidos = permitidos.filter(a => a.nombre.toLowerCase().includes(termino.toLowerCase()));

    if (permitidos.length === 0) {
      lista.innerHTML = `<div style="padding:12px;font-size:0.82rem;color:var(--color-texto-secundario);text-align:center;">Sin resultados para "${termino}"</div>`;
      return;
    }

    const colores = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534' };
    lista.innerHTML = permitidos.slice(0,20).map(a => `
      <div onclick="window.dieta.seleccionarAgregar('${key}','${a.codigo}','${a._cat}','${tiempo}')"
           style="padding:9px 12px;border-bottom:1px solid var(--color-borde);display:flex;
                  justify-content:space-between;align-items:center;gap:8px;cursor:pointer;">
        <div>
          <div style="font-weight:600;font-size:0.87rem;">${a.nombre}</div>
          <div style="font-size:0.73rem;color:var(--color-texto-secundario);">${a.unidad_hogar || a.porcion_base_g+'g'} · ${a.proteina_g}g P · ${a.grasa_g}g G · ${a.carbo_g}g C</div>
        </div>
        <span style="font-size:0.78rem;color:${colores[a._cat]||'#475569'};font-weight:600;">${a.kcal} kcal</span>
      </div>`).join('');
  },

  seleccionarAgregar(key, codigo, cat, tiempo) {
    const lista = document.getElementById(`lista-agregar-${key}`);
    if (!lista) return;
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;

    lista.innerHTML = `
      <div style="padding:12px;">
        <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px;">${a.nombre}</div>
        <div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-bottom:10px;">
          ${a.kcal} kcal / porción · ${a.proteina_g}g P · ${a.grasa_g}g G · ${a.carbo_g}g C
        </div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px;">Porciones</label>
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="number" id="cant-agregar-${key}" value="1" min="0.5" max="${this.MAX_PORCIONES[codigo]||3}" step="0.5"
                 class="form-input" style="width:80px;text-align:center;">
          <span style="font-size:0.8rem;color:var(--color-texto-secundario);">× ${a.kcal} kcal</span>
          <button class="btn btn-primary" style="padding:6px 14px;font-size:0.85rem;"
                  onclick="window.dieta.confirmarAgregar('${key}','${codigo}','${cat}')">✓ Agregar</button>
          <button class="btn btn-outline" style="padding:6px 10px;font-size:0.85rem;"
                  onclick="window.dieta.filtrarAgregar('','${key}','${tiempo}')">← Volver</button>
        </div>
      </div>`;
  },

  confirmarAgregar(key, codigo, cat) {
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const input    = document.getElementById(`cant-agregar-${key}`);
    const porciones = parseFloat(input?.value) || 1;
    const { diaIdx, comida } = this.obtenerComida(key);
    if (!comida) return;

    const nuevo = this.crearItem(a, porciones, cat, false);
    nuevo._manual = true;
    comida.items.push(nuevo);

    this.rerenderItems(key, comida);
    this.actualizarTotalesUI(key, comida, diaIdx);

    const panel = document.getElementById(`panel-agregar-${key}`);
    if (panel) panel.style.display = 'none';
  },

  // ─── Eliminar ítem ────────────────────────────────────────
  eliminarItem(key, itemIdx) {
    const { diaIdx, comida } = this.obtenerComida(key);
    if (!comida) return;
    comida.items.splice(itemIdx, 1);
    this.rerenderItems(key, comida);
    this.actualizarTotalesUI(key, comida, diaIdx);
  },

  // ─── Helpers de render ───────────────────────────────────
  rerenderItems(key, comida) {
    const cont = document.getElementById(`items-${key}`);
    if (cont) {
      const tiempo = comida.tiempo;
      cont.innerHTML = comida.items.map((item, i) => this.renderItem(item, key, i, tiempo)).join('');
    }
  },

  actualizarTotalesUI(key, comida, diaIdx) {
    const tot = this.totalesComida(comida);
    const pct = comida.kcalMeta > 0 ? Math.round((tot.kcal / comida.kcalMeta) * 100) : 0;
    const overLimit = pct > 110;

    // Actualizar totales de la comida
    const el = (id) => document.getElementById(id);
    if (el(`tc-kcal-${key}`)) {
      el(`tc-kcal-${key}`).textContent = `${tot.kcal} kcal${overLimit?' ⚠️':''}`;
      el(`tc-kcal-${key}`).style.color = overLimit ? '#ef4444' : '';
    }
    if (el(`tc-prot-${key}`))  el(`tc-prot-${key}`).textContent  = `${Math.round(tot.prot)}g P`;
    if (el(`tc-grasa-${key}`)) el(`tc-grasa-${key}`).textContent = `${Math.round(tot.grasa)}g G`;
    if (el(`tc-carb-${key}`))  el(`tc-carb-${key}`).textContent  = `${Math.round(tot.carb)}g C`;

    // Warning de la comida
    const warnEl = document.querySelector(`#comida-card-${key} .warning-comida`);
    if (overLimit && !warnEl) {
      const card = document.getElementById(`comida-card-${key}`);
      const totDiv = document.getElementById(`totales-${key}`);
      if (totDiv) totDiv.insertAdjacentHTML('afterend', `<div class="warning-comida">⚠️ Esta comida supera su límite calórico (${comida.kcalMeta} kcal asignadas)</div>`);
    } else if (!overLimit && warnEl) {
      warnEl.remove();
    }

    // Actualizar resumen del día (solo vista diaria)
    if (diaIdx === 0) this.actualizarResumenDia();
  },

  actualizarResumenDia() {
    const dia = this.menuGenerado?.diaBase;
    if (!dia) return;
    const objetivo = this.menuGenerado.objetivo;
    const tot = this.totalesDia(dia);
    const pct = Math.min(Math.round((tot.kcal / objetivo.kcal) * 100), 110);
    const colorBarra = pct > 105 ? '#ef4444' : pct >= 85 ? '#10b981' : '#f59e0b';
    const statusBarra = pct > 105 ? '⚠️ Superaste el objetivo calórico' : pct >= 85 ? '✅ En objetivo' : '⚠️ Por debajo del objetivo';

    const el = (id) => document.getElementById(id);
    if (el('resumen-subtitulo')) el('resumen-subtitulo').textContent = `${dia.length} comidas · ~${window.ui.formatearNumero(tot.kcal)} kcal`;
    if (el('r-prot'))   el('r-prot').textContent   = `P: ${Math.round(tot.prot)}g`;
    if (el('r-grasa'))  el('r-grasa').textContent  = `G: ${Math.round(tot.grasa)}g`;
    if (el('r-carb'))   el('r-carb').textContent   = `C: ${Math.round(tot.carb)}g`;
    if (el('r-status')) el('r-status').textContent = statusBarra;
    if (el('r-pct'))    el('r-pct').textContent    = `${pct}% del objetivo (${window.ui.formatearNumero(objetivo.kcal)} kcal)`;
    if (el('r-barra'))  { el('r-barra').style.width = `${Math.min(pct,100)}%`; el('r-barra').style.background = colorBarra; }

    // Warning general del día
    const warnDia = document.getElementById('warning-dia');
    if (warnDia) {
      if (pct > 105) {
        warnDia.innerHTML = `<div class="alert-warning-dia">🔴 Superaste el objetivo diario: ${window.ui.formatearNumero(tot.kcal)} kcal vs ${window.ui.formatearNumero(objetivo.kcal)} kcal meta</div>`;
      } else if (pct < 70) {
        warnDia.innerHTML = `<div class="alert-warning-dia" style="background:#fef9c3;border-color:#f59e0b;color:#92400e;">🟡 El menú está muy por debajo del objetivo. Agrega alimentos o aumenta porciones.</div>`;
      } else {
        warnDia.innerHTML = '';
      }
    }
  },

  // ─── Obtener comida del menú generado ────────────────────
  obtenerComida(key) {
    const partes  = key.split('-');
    const diaIdx  = parseInt(partes[0]);
    const tiempo  = partes.slice(1).join('-');
    const dia     = diaIdx === 0 ? this.menuGenerado?.diaBase : this.menuGenerado?.semana?.[diaIdx - 1];
    const comida  = dia?.find(c => c.tiempo === tiempo);
    return { diaIdx, tiempo, comida };
  },

  // ─── Botones inferiores ───────────────────────────────────
  renderBotones() {
    return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn btn-outline" id="btn-regenerar">🔄 Regenerar menú</button>
      <button class="btn btn-secondary" onclick="window.app.navegar('alimentos')">📋 Ver alimentos</button>
      <button class="btn btn-outline" onclick="window.recetas?.mostrarSazon()"
              style="border-color:#10b981;color:#10b981;">🧂 Guía de sazón</button>
    </div>
    <div class="alert alert-info mt-3" style="font-size:0.82rem;">
      <strong>ℹ️</strong> Toca 👨‍🍳 para ver recetas. Usa +/− para ajustar porciones. Toca 🔄 para sustituir un alimento.
    </div>`;
  },

  // ─── Estilos ──────────────────────────────────────────────
  renderEstilos() {
    return `<style id="estilos-dieta">
      .btn-vista{padding:8px 18px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.85rem;font-weight:500;cursor:pointer;transition:var(--transicion);font-family:inherit;}
      .btn-vista.activa{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .pref-label{font-size:0.78rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:6px;}
      .btn-group-pref{display:flex;flex-wrap:wrap;gap:6px;}
      .btn-pref{padding:5px 12px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.8rem;font-weight:500;cursor:pointer;font-family:inherit;}
      .btn-pref.activo{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .check-pref{display:flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;padding:5px 10px;border-radius:8px;border:1.5px solid var(--color-borde);background:var(--color-superficie);user-select:none;}
      .check-pref input{accent-color:var(--color-primario);}
      .item-wrap{border-radius:8px;overflow:hidden;margin-bottom:2px;}
      .btn-agregar-item{display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:999px;border:1.5px dashed var(--color-primario);background:transparent;color:var(--color-primario);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;}
      .btn-porcion{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-principal);font-size:0.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;line-height:1;}
      .btn-porcion:hover{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .warning-comida{background:#fee2e2;color:#991b1b;border-radius:6px;padding:6px 10px;font-size:0.78rem;font-weight:600;margin-top:6px;}
      .alert-warning-dia{background:#fee2e2;border:1.5px solid #ef4444;border-radius:10px;padding:10px 14px;font-size:0.82rem;color:#991b1b;font-weight:600;margin-bottom:12px;}
    </style>`;
  }
};

document.addEventListener('cargar:dieta', () => window.dieta.cargar());
