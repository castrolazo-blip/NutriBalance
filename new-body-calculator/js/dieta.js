/* ============================================================
   MÓDULO M7: MOTOR DE DIETA INTELIGENTE
   NutriBalance · by Ronald Castro
   v3 — Integración M8 (recetas) + Motor de ajuste automático
   ============================================================ */

window.dieta = {

  perfilActual:  null,
  configActual:  null,
  calculoActual: null,
  alimentos:     [],
  menuGenerado:  null,
  preferencias:  null,
  vistaActiva:   'diario',

  // ─── REGLAS POR TIEMPO DE COMIDA ─────────────────────────
  MENU_RULES: {
    desayuno: {
      proteinas:     ['A-0003','A-0004','A-0014','A-0015','A-0085'],
      carbohidratos: ['A-0023','A-0024','A-0025','A-0026','A-0034'],
      grasas:        ['A-0036','A-0039','A-0040'],
      combinados:    ['A-0076','A-0075']
    },
    almuerzo: {
      proteinas:     ['A-0001','A-0002','A-0005','A-0006','A-0007','A-0008','A-0010','A-0011','A-0016','A-0017'],
      carbohidratos: ['A-0021','A-0022','A-0023','A-0027','A-0028','A-0030','A-0031','A-0035'],
      combinados:    ['A-0068','A-0069','A-0070','A-0071','A-0074','A-0077']
    },
    cena: {
      proteinas:     ['A-0001','A-0003','A-0004','A-0005','A-0008','A-0010','A-0012','A-0014','A-0016','A-0017'],
      carbohidratos: ['A-0021','A-0023','A-0028','A-0029','A-0025'],
      combinados:    ['A-0068','A-0074']
    }
  },

  // ─── DISTRIBUCIÓN CALÓRICA ───────────────────────────────
  DISTRIBUCION: {
    3: { desayuno:0.30, almuerzo:0.40, cena:0.30 },
    4: { desayuno:0.25, almuerzo:0.35, cena:0.25, snack1:0.15 },
    5: { desayuno:0.25, almuerzo:0.30, cena:0.25, snack1:0.10, snack2:0.10 }
  },
  DIST_PROT: {
    3: { desayuno:0.28, almuerzo:0.42, cena:0.30 },
    4: { desayuno:0.25, almuerzo:0.35, cena:0.28, snack1:0.12 },
    5: { desayuno:0.25, almuerzo:0.32, cena:0.26, snack1:0.09, snack2:0.08 }
  },

  PREF_DEFAULT: {
    num_comidas:       4,
    ayuno:             false,
    comida_llevar:     false,
    tiene_microondas:  true,
    snacks_portables:  true,
    nivel_practicidad: 2,
    modo:              'salvadoreno',
    restricciones:     []
  },

  // ─── LÍMITES DE PORCIÓN ──────────────────────────────────
  LIMITES_PORCION: {
    'A-0003':200,'A-0004':165,'A-0023':120,'A-0024':150,
    'A-0025':84, 'A-0026':80, 'A-0034':80, 'A-0036':200,
    'A-0037':42, 'A-0038':42, 'A-0039':42, 'A-0040':64,
    'A-0041':56, 'A-0042':56, 'A-0044':30, 'A-0085':60
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
        <p class="page-subtitle">Plan alimentario basado en tus macros</p>
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
      ${this.renderToggleVista()}
      <div id="dieta-menu-container">
        <div class="loading"><div class="spinner"></div></div>
      </div>
      ${this.renderEstilos()}`;
    this.configurarEventos();
    this.generarYRenderMenu();
  },

  renderToggleVista() {
    return `
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <button class="btn-vista ${this.vistaActiva==='diario'?'activa':''}" data-vista="diario">📅 Menú del día</button>
      <button class="btn-vista ${this.vistaActiva==='semanal'?'activa':''}" data-vista="semanal">🗓️ Menú semanal</button>
    </div>`;
  },

  renderPanelPreferencias() {
    const p = this.preferencias;
    const modoLabels = { salvadoreno:'🇸🇻 Salvadoreño', fitness:'💪 Fitness', economico:'💰 Económico', mixto:'🔀 Mixto' };
    const niveles    = ['Estructurado','Práctico','Muy práctico'];
    return `
    <div class="card mb-3">
      <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;" id="toggle-prefs">
        <span style="font-weight:600;">⚙️ Configurar mi menú</span>
        <span id="arrow-prefs" style="font-size:0.75rem;transition:transform 0.25s;">▼</span>
      </div>
      <div id="prefs-body" style="display:none;margin-top:14px;">
        <div class="prefs-grid">
          <div class="pref-item">
            <label class="pref-label">🍴 Comidas al día</label>
            <div class="btn-group-pref">
              ${[3,4,5].map(n=>`<button class="btn-pref ${p.num_comidas===n?'activo':''}" data-pref="num_comidas" data-val="${n}">${n} comidas</button>`).join('')}
            </div>
          </div>
          <div class="pref-item">
            <label class="pref-label">🎯 Nivel de practicidad</label>
            <div class="btn-group-pref">
              ${niveles.map((lbl,i)=>`<button class="btn-pref ${p.nivel_practicidad===(i+1)?'activo':''}" data-pref="nivel_practicidad" data-val="${i+1}">${lbl}</button>`).join('')}
            </div>
          </div>
          <div class="pref-item">
            <label class="pref-label">🌟 Estilo de menú</label>
            <div class="btn-group-pref">
              ${Object.entries(modoLabels).map(([k,v])=>`<button class="btn-pref ${p.modo===k?'activo':''}" data-pref="modo" data-val="${k}">${v}</button>`).join('')}
            </div>
          </div>
          <div class="pref-item">
            <label class="pref-label">🔧 Opciones</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              ${this.chk('ayuno','⏱️ Ayuno intermitente',p.ayuno)}
              ${this.chk('comida_llevar','🎒 Comida para llevar',p.comida_llevar)}
              ${this.chk('tiene_microondas','🔥 Tengo microondas',p.tiene_microondas)}
              ${this.chk('snacks_portables','🍌 Snacks portables',p.snacks_portables)}
            </div>
          </div>
          <div class="pref-item">
            <label class="pref-label">🚫 Restricciones</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              ${this.chkR('sin_lacteos','🥛 Sin lácteos',p.restricciones)}
              ${this.chkR('sin_gluten','🌾 Sin gluten',p.restricciones)}
              ${this.chkR('sin_cerdo','🐷 Sin cerdo',p.restricciones)}
              ${this.chkR('vegetariano','🥦 Vegetariano',p.restricciones)}
            </div>
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
    return `<label class="check-pref"><input type="checkbox" data-restr="${key}" ${lista.includes(key)?'checked':''}><span>${label}</span></label>`;
  },

  // ─────────────────────────────────────────────────────────
  configurarEventos() {
    document.getElementById('toggle-prefs')?.addEventListener('click', () => {
      const body  = document.getElementById('prefs-body');
      const arrow = document.getElementById('arrow-prefs');
      const open  = body.style.display !== 'none';
      body.style.display    = open ? 'none'  : 'block';
      arrow.style.transform = open ? ''      : 'rotate(180deg)';
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
        if (chk.checked) { if (!this.preferencias.restricciones.includes(key)) this.preferencias.restricciones.push(key); }
        else              { this.preferencias.restricciones = this.preferencias.restricciones.filter(r=>r!==key); }
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

  // ─────────────────────────────────────────────────────────
  // ALGORITMO PRINCIPAL
  // ─────────────────────────────────────────────────────────
  generarYRenderMenu() {
    const cont = document.getElementById('dieta-menu-container');
    cont.innerHTML = `<div class="loading"><div class="spinner"></div><p style="margin-top:8px;font-size:0.9rem;color:var(--color-texto-secundario);">Generando tu menú...</p></div>`;
    setTimeout(() => {
      try {
        this.menuGenerado = this.generarMenu();
        this.renderMenuEnContenedor();
      } catch(e) {
        console.error(e);
        cont.innerHTML = `<div class="alert alert-warning">⚠️ Error al generar el menú. Revisa tu perfil.</div>`;
      }
    }, 150);
  },

  generarMenu() {
    const r = this.calculoActual;
    const p = this.preferencias;
    const objetivo   = { kcal: r.kcal_objetivo, prot: r.proteina_g, grasa: r.grasa_g, carb: r.carbo_g };
    const estructura = this.definirEstructura(p);
    const macros     = this.distribuirMacros(objetivo, estructura, p);
    const diaBase    = this.generarDia(estructura, macros, p, 0);
    const semana     = Array.from({ length: 7 }, (_, i) => this.generarDia(estructura, macros, p, i * 7));
    return { diaBase, semana, objetivo, estructura, macros, _ajustes: [] };
  },

  definirEstructura(p) {
    const t = [];
    if (!p.ayuno) t.push('desayuno');
    t.push('almuerzo');
    if (p.num_comidas >= 4) t.push('snack1');
    if (p.num_comidas >= 5) t.push('snack2');
    t.push('cena');
    return t;
  },

  distribuirMacros(objetivo, estructura, p) {
    const n     = p.num_comidas;
    const dKcal = this.DISTRIBUCION[n] || this.DISTRIBUCION[4];
    const dProt = this.DIST_PROT[n]    || this.DIST_PROT[4];
    const res   = {};
    estructura.forEach(t => {
      const pk = dKcal[t] || 0.10;
      const pp = dProt[t] || 0.10;
      res[t] = {
        kcal:  Math.round(objetivo.kcal  * pk),
        prot:  Math.round(objetivo.prot  * pp),
        grasa: Math.round(objetivo.grasa * pk),
        carb:  Math.round(objetivo.carb  * pk),
        pct:   Math.round(pk * 100)
      };
    });
    return res;
  },

  // Escalar ítems de una comida para acercarse al kcal objetivo
  escalarComida(items, kcalObjetivo) {
    if (!items || items.length === 0) return items;
    const kcalActual = items.reduce((s, item) => {
      const g = item._gramos ?? (item.porcion_base_g || 100);
      const base = item.porcion_base_g || 100;
      return s + (item.kcal || 0) * (g / base);
    }, 0);
    if (kcalActual <= 0) return items;
    const factor = kcalObjetivo / kcalActual;
    // Solo escalar si estamos por debajo del 85% del objetivo
    if (factor <= 1.15) return items;
    // Escalar cada ítem proporcionalmente con límites por alimento
    const MAXIMOS = {
      'A-0003': 150, 'A-0004': 165, 'A-0001': 200, 'A-0002': 200,
      'A-0005': 200, 'A-0006': 150, 'A-0008': 170, 'A-0010': 200,
      'A-0021': 300, 'A-0023': 120, 'A-0024': 150, 'A-0026': 160,
      'A-0028': 300, 'A-0036': 200, 'A-0039': 64,  'A-0040': 42,
    };
    return items.map(item => {
      if (item._porcion?.includes('al gusto')) return item;
      const base    = item.porcion_base_g || 100;
      const gActual = item._gramos ?? base;
      const maxG    = MAXIMOS[item.codigo] || (base * 4);
      const gNuevo  = Math.min(Math.round(gActual * factor), maxG);
      const f2      = gNuevo / base;
      let _porcion  = `${gNuevo}g`;
      if (item.unidad_hogar && base > 0) {
        const uR = Math.round((gNuevo / base) * 2) / 2;
        if (uR >= 0.5 && uR <= 10) {
          const uhLimpia = item.unidad_hogar.replace(/^[\d.]+\s*/, '').trim();
          _porcion = `${gNuevo}g (≈ ${uR} ${uhLimpia})`;
        }
      }
      return { ...item, _gramos: gNuevo, _porcion };
    });
  },

  generarDia(estructura, macros, p, seed) {
    return estructura.map(tiempo => {
      const meta    = macros[tiempo];
      const esSnack = tiempo.startsWith('snack');
      let items     = esSnack
        ? this.armarSnack(meta, p, seed)
        : this.armarComidaPrincipal(tiempo, meta, p, seed);
      // Escalar ítems para acercarse al kcal objetivo de la comida
      if (!esSnack && meta?.kcal > 0) {
        items = this.escalarComida(items, meta.kcal);
      }
      return {
        tiempo,
        label: this.labelTiempo(tiempo),
        meta,
        items,
        valido: esSnack || items.some(i => i._cat === 'proteinas' || i._cat === 'combinados')
      };
    });
  },

  // ─────────────────────────────────────────────────────────
  // COMIDA PRINCIPAL
  // ─────────────────────────────────────────────────────────
  armarComidaPrincipal(tiempo, meta, p, seed) {
    const reglas   = this.MENU_RULES[tiempo];
    if (!reglas) return [];
    const items    = [];
    const esDeficit = this.perfilActual?.meta === 'deficit';
    const modoFit   = p.modo === 'fitness';

    const candidatos = (codigos) => {
      let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean);
      lista = this.aplicarRestricciones(lista, p);
      if (p.nivel_practicidad >= 3) {
        const basicos = lista.filter(a => a.etiquetas?.includes('basico'));
        if (basicos.length > 0) lista = basicos;
      }
      return lista;
    };

    if (tiempo === 'desayuno') {
      let cProt = [...reglas.proteinas];
      if (p.modo === 'salvadoreno' || p.modo === 'economico') {
        cProt = ['A-0003','A-0004', ...cProt.filter(c => !['A-0003','A-0004'].includes(c))];
      } else if (modoFit) {
        cProt = ['A-0014','A-0085','A-0004', ...cProt.filter(c => !['A-0014','A-0085','A-0004'].includes(c))];
      }
      const prots  = candidatos(cProt);
      const carbos = candidatos(reglas.carbohidratos);
      const grasas = candidatos(reglas.grasas);
      const prot   = this.elegir(prots,  seed);
      const carb   = this.elegir(carbos, seed + 1);
      const grasa  = this.elegir(grasas, seed + 2);
      if (prot)  { const pc=this.calcPorcionCompleta(prot,  meta.prot,        'prot');  items.push({...prot,  ...pc, _cat:'proteinas'    }); }
      if (carb)  { const pc=this.calcPorcionCompleta(carb,  meta.carb * 0.7,  'carb');  items.push({...carb,  ...pc, _cat:'carbohidratos'}); }
      if (grasa) { const pc=this.calcPorcionCompleta(grasa, meta.grasa * 0.4, 'grasa'); items.push({...grasa, ...pc, _cat:'grasas'       }); }
    }

    else if (tiempo === 'almuerzo') {
      if (p.comida_llevar && p.nivel_practicidad >= 2) {
        const comb  = candidatos(['A-0074','A-0068','A-0069','A-0070','A-0071','A-0077','A-0008']);
        const plato = this.elegir(comb, seed);
        if (plato) { items.push({...plato, _porcion:this.porcion(plato, meta.kcal, 'kcal'), _cat:'combinados'}); return items; }
      }
      let cProt = [...reglas.proteinas];
      let cCarb = [...reglas.carbohidratos];
      if (p.modo === 'salvadoreno' || p.modo === 'economico') {
        cProt = ['A-0001','A-0002','A-0005','A-0006', ...cProt];
        cCarb = ['A-0021','A-0023', ...cCarb];
      } else if (modoFit) {
        cProt = ['A-0001','A-0010','A-0008', ...cProt];
        cCarb = ['A-0022','A-0035','A-0021', ...cCarb];
      }
      const prots = candidatos([...new Set(cProt)]);
      const carbos = candidatos([...new Set(cCarb)]);
      const vegs   = this.aplicarRestricciones(this.alimentos.filter(a => a.categoria === 'vegetales'), p);
      const prot   = this.elegir(prots,  seed);
      const carb   = this.elegir(carbos, seed + 1);
      const veg    = this.elegir(vegs,   seed + 3);
      if (prot) { const pc=this.calcPorcionCompleta(prot,  meta.prot,       'prot');  items.push({...prot,  ...pc, _cat:'proteinas'    }); }
      if (carb) { const pc=this.calcPorcionCompleta(carb,  meta.carb * 0.6, 'carb');  items.push({...carb,  ...pc, _cat:'carbohidratos'}); }
      if (veg)  items.push({...veg, _porcion:'1 porción al gusto', _cat:'vegetales'});
      if ((p.modo === 'salvadoreno' || p.modo === 'economico') && prot && !['A-0016','A-0017'].includes(prot.codigo)) {
        const frijol = this.alimentos.find(a => a.codigo === 'A-0016');
        if (frijol) items.push({...frijol, _porcion:'2-3 cucharadas', _cat:'proteinas'});
      }
    }

    else if (tiempo === 'cena') {
      let cProt = [...reglas.proteinas];
      if (modoFit || esDeficit) {
        cProt = ['A-0001','A-0010','A-0004','A-0008','A-0014', ...cProt];
      } else if (p.modo === 'salvadoreno') {
        cProt = ['A-0003','A-0016','A-0017','A-0001', ...cProt];
      }
      const prots = candidatos([...new Set(cProt)]);
      const vegs  = this.aplicarRestricciones(this.alimentos.filter(a => a.categoria === 'vegetales'), p);
      const prot  = this.elegir(prots, seed);
      const veg   = this.elegir(vegs,  seed + 3);
      if (prot) { const pc=this.calcPorcionCompleta(prot, meta.prot, 'prot'); items.push({...prot, ...pc, _cat:'proteinas'}); }
      if (veg)  items.push({...veg, _porcion:'1 porción al gusto', _cat:'vegetales'});
      if (!esDeficit) {
        const carbos = candidatos(reglas.carbohidratos);
        const carb   = this.elegir(carbos, seed + 1);
        if (carb) { const pc=this.calcPorcionCompleta(carb, meta.carb * 0.4, 'carb'); items.push({...carb, ...pc, _cat:'carbohidratos'}); }
      } else if (p.modo === 'salvadoreno') {
        const tortilla = this.alimentos.find(a => a.codigo === 'A-0023');
        if (tortilla) items.push({...tortilla, _porcion:'1 tortilla', _cat:'carbohidratos'});
      }
    }

    return items;
  },

  armarSnack(meta, p, seed) {
    const items = [];
    const portables = this.aplicarRestricciones(
      this.alimentos.filter(a => a.etiquetas?.includes('portable')), p
    );
    const frutas = portables.filter(a => a.categoria === 'frutas');
    const prots  = portables.filter(a => a.categoria === 'proteinas');
    const otros  = portables.filter(a => a.categoria === 'grasas');
    if (p.nivel_practicidad <= 2) {
      const fruta = this.elegir(frutas, seed + 10);
      const prot  = this.elegir(prots,  seed + 11);
      if (fruta) items.push({...fruta, _porcion: fruta.unidad_hogar || '1 unidad',   _cat:'frutas'   });
      if (prot)  items.push({...prot,  _porcion: prot.unidad_hogar  || '1 porción',  _cat:'proteinas'});
    } else {
      const fruta = this.elegir(frutas, seed + 10);
      const nuez  = this.elegir(otros,  seed + 12);
      if (fruta) items.push({...fruta, _porcion: fruta.unidad_hogar || '1 unidad',        _cat:'frutas'});
      if (nuez)  items.push({...nuez,  _porcion: nuez.unidad_hogar  || '1 puñado pequeño', _cat:'grasas'});
    }
    if (items.length === 0) {
      const fb = this.elegir(this.alimentos.filter(a => a.categoria === 'frutas'), seed + 13);
      if (fb) items.push({...fb, _porcion: fb.unidad_hogar || '1 porción', _cat:'frutas'});
    }
    return items;
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
    return lista[Math.abs(seed) % lista.length];
  },

  // ─────────────────────────────────────────────────────────
  // MOTOR DE AJUSTE AUTOMÁTICO
  // Analiza el menú contra el objetivo y ajusta porciones
  // ─────────────────────────────────────────────────────────
  ajustarMenuContraObjetivo(dia) {
    const obj = this.menuGenerado?.objetivo;
    if (!obj) return { dia, ajustes: 0 };

    const totales = dia.reduce((acc, comida) => {
      const t = this.calcularTotalesComida(comida);
      return { kcal: acc.kcal+t.kcal, prot: acc.prot+t.prot, grasa: acc.grasa+t.grasa, carb: acc.carb+t.carb };
    }, { kcal:0, prot:0, grasa:0, carb:0 });

    let ajustes = 0;

    // Calorías excedidas → reducir grasas densas
    if (totales.kcal > obj.kcal * 1.05) {
      dia = this._reducirGrasa(dia);
      ajustes++;
    }
    // Proteína baja → aumentar fuente proteica
    if (totales.prot < obj.prot * 0.90) {
      dia = this._aumentarProteina(dia);
      ajustes++;
    }
    // Carbos excedidos → reducir
    if (totales.carb > obj.carb * 1.10) {
      dia = this._reducirCarbos(dia);
      ajustes++;
    }

    return { dia, ajustes };
  },

  _reducirGrasa(dia) {
    const codigos = ['A-0036','A-0037','A-0038','A-0039','A-0040','A-0041','A-0042'];
    return dia.map(comida => ({
      ...comida,
      items: comida.items.map(item => {
        if (!codigos.includes(item.codigo)) return item;
        const base   = item.porcion_base_g || 100;
        const gAct   = item._gramos ?? base;
        const gNuevo = Math.max(Math.round(gAct * 0.7), 10);
        const factor = gNuevo / base;
        return { ...item, _gramos: gNuevo, _porcion: `${gNuevo}g`,
          kcal: Math.round((item.kcal||0)*factor), proteina_g: Math.round((item.proteina_g||0)*factor),
          grasa_g: Math.round((item.grasa_g||0)*factor), carbo_g: Math.round((item.carbo_g||0)*factor), _ajustado: true };
      })
    }));
  },

  _aumentarProteina(dia) {
    const codigos = ['A-0001','A-0004','A-0008','A-0010','A-0014'];
    return dia.map(comida => {
      if (comida.tiempo.startsWith('snack')) return comida;
      return {
        ...comida,
        items: comida.items.map(item => {
          if (!codigos.includes(item.codigo)) return item;
          const base   = item.porcion_base_g || 100;
          const gAct   = item._gramos ?? base;
          const maxG   = this.LIMITES_PORCION[item.codigo] || 400;
          const gNuevo = Math.min(Math.round(gAct * 1.2), maxG);
          const factor = gNuevo / base;
          return { ...item, _gramos: gNuevo, _porcion: `${gNuevo}g`,
            kcal: Math.round((item.kcal||0)*factor), proteina_g: Math.round((item.proteina_g||0)*factor),
            grasa_g: Math.round((item.grasa_g||0)*factor), carbo_g: Math.round((item.carbo_g||0)*factor), _ajustado: true };
        })
      };
    });
  },

  _reducirCarbos(dia) {
    const codigos = ['A-0021','A-0022','A-0027','A-0031','A-0024'];
    return dia.map(comida => ({
      ...comida,
      items: comida.items.map(item => {
        if (!codigos.includes(item.codigo)) return item;
        const base   = item.porcion_base_g || 100;
        const gAct   = item._gramos ?? base;
        const gNuevo = Math.max(Math.round(gAct * 0.75), 30);
        const factor = gNuevo / base;
        return { ...item, _gramos: gNuevo, _porcion: `${gNuevo}g`,
          kcal: Math.round((item.kcal||0)*factor), proteina_g: Math.round((item.proteina_g||0)*factor),
          grasa_g: Math.round((item.grasa_g||0)*factor), carbo_g: Math.round((item.carbo_g||0)*factor), _ajustado: true };
      })
    }));
  },

  calcPorcionCompleta(alimento, macroObj, tipo) {
    const base      = alimento.porcion_base_g || 100;
    const macroBase = tipo === 'prot'  ? (alimento.proteina_g||0) :
                      tipo === 'carb'  ? (alimento.carbo_g   ||0) :
                      tipo === 'grasa' ? (alimento.grasa_g   ||0) : 0;

    // Límites máximos realistas por alimento (en gramos)
    const MAXIMOS = {
      'A-0003': 150,  // Huevo entero: máx 3 huevos
      'A-0004': 165,  // Clara de huevo: máx 5 claras
      'A-0001': 200,  // Pechuga de pollo: máx 2 pechugas
      'A-0002': 200,  // Muslo de pollo: máx 2
      'A-0005': 200,  // Carne de res: máx 2 porciones
      'A-0006': 150,  // Carne molida: máx 1.5 porciones
      'A-0008': 170,  // Atún: máx 2 latas
      'A-0010': 200,  // Tilapia: máx 2 filetes
      'A-0014': 200,  // Proteína en polvo: máx 2 scoops
      'A-0021': 300,  // Arroz: máx 3 porciones
      'A-0023': 120,  // Tortilla de maíz: máx 4 tortillas
      'A-0024': 150,  // Pan: máx 3 porciones
      'A-0026': 160,  // Avena: máx 2 porciones
      'A-0028': 300,  // Papa: máx 3 porciones
      'A-0036': 200,  // Aguacate: máx 2 porciones
      'A-0039': 64,   // Crema de maní: máx 2 cucharadas
      'A-0040': 42,   // Aceite de oliva: máx 1 cucharada
    };
    const maxG = MAXIMOS[alimento.codigo] || (base * 3);

    let gramos = base;
    if (macroBase > 0 && macroObj > 0) {
      const gramosNecesarios = Math.round((macroObj / macroBase) * base);
      gramos = Math.min(gramosNecesarios, maxG);
      gramos = Math.max(gramos, base); // mínimo 1 porción
    }
    let _porcion = `${gramos}g`;
    if (alimento.unidad_hogar && alimento.porcion_base_g > 0) {
      const uR = Math.round((gramos / alimento.porcion_base_g) * 2) / 2;
      if (uR >= 0.5 && uR <= 10) {
        const uhLimpia = alimento.unidad_hogar.replace(/^[\d.]+\s*/, '').trim();
        _porcion = `${gramos}g (≈ ${uR} ${uhLimpia})`;
      }
    }
    return { _gramos: gramos, _porcion };
  },

  porcion(alimento, macroObj, tipo) {
    return this.calcPorcionCompleta(alimento, macroObj, tipo)._porcion;
  },

  labelTiempo(t) {
    return { desayuno:'🌅 Desayuno', almuerzo:'🍽️ Almuerzo', cena:'🌙 Cena',
             snack1:'🍎 Snack mañana', snack2:'🌿 Snack tarde' }[t] || t;
  },

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  renderMenuEnContenedor() {
    const cont = document.getElementById('dieta-menu-container');
    if (!this.menuGenerado) return;
    const { diaBase, semana, objetivo } = this.menuGenerado;

    // Sin ajuste automático — usar porciones base directamente
    const diaAjustado = JSON.parse(JSON.stringify(diaBase));
    const ajustes = 0;
    this.menuGenerado._ajustes = 0;

    cont.innerHTML = this.vistaActiva === 'diario'
      ? this.renderDiario(diaAjustado, objetivo, ajustes) + this.renderBotones()
      : this.renderSemanal(semana, objetivo) + this.renderBotones();

    document.getElementById('btn-regenerar')?.addEventListener('click', () => this.generarYRenderMenu());
  },

  renderDiario(dia, objetivo, numAjustes) {
    const totKcal  = dia.reduce((s,c) => s + this.calcularTotalesComida(c).kcal,  0);
    const totProt  = dia.reduce((s,c) => s + this.calcularTotalesComida(c).prot,  0);
    const totGrasa = dia.reduce((s,c) => s + this.calcularTotalesComida(c).grasa, 0);
    const totCarb  = dia.reduce((s,c) => s + this.calcularTotalesComida(c).carb,  0);

    const badgeAjuste = numAjustes > 0 ? `
      <div class="badge-ajuste">
        🤖 Menú ajustado automáticamente · ${numAjustes} corrección${numAjustes > 1 ? 'es' : ''}
      </div>` : '';

    return `
    <div class="card mb-3" style="background:var(--color-superficie-hover);" id="resumen-dia">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;">📊 Resumen del día</div>
          <div style="font-size:0.8rem;color:var(--color-texto-secundario);" id="resumen-kcal">
            ${dia.length} comidas · ~${window.ui.formatearNumero(totKcal)} kcal
          </div>
        </div>
        <div style="display:flex;gap:10px;font-size:0.82rem;font-weight:600;">
          <span style="color:#ef4444;" id="resumen-prot">P: ${totProt}g</span>
          <span style="color:#f59e0b;" id="resumen-grasa">G: ${totGrasa}g</span>
          <span style="color:#10b981;" id="resumen-carb">C: ${totCarb}g</span>
        </div>
      </div>
      ${badgeAjuste}
      ${this.renderBarraProgreso(totKcal, objetivo.kcal)}
    </div>
    ${dia.map(c => this.renderComida(c, 0)).join('')}`;
  },

  renderBarraProgreso(actual, objetivo) {
    const pct   = Math.min(Math.round((actual / objetivo) * 100), 110);
    const color = pct > 105 ? '#ef4444' : pct >= 90 ? '#10b981' : '#f59e0b';
    return `
    <div style="margin-top:10px;">
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--color-texto-secundario);margin-bottom:4px;">
        <span>Progreso calórico</span>
        <span>${pct}% del objetivo</span>
      </div>
      <div style="height:6px;background:var(--color-borde);border-radius:999px;overflow:hidden;">
        <div style="height:100%;width:${Math.min(pct,100)}%;background:${color};border-radius:999px;transition:width 0.5s ease;"></div>
      </div>
    </div>`;
  },

  renderSemanal(semana, objetivo) {
    const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    return `
    <div class="alert alert-info mb-3" style="font-size:0.85rem;">
      📋 Toca cada día para ver el detalle. Los alimentos varían para mayor adherencia.
    </div>
    ${semana.map((dia, i) => `
      <div class="card mb-2">
        <div style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
             onclick="const d=this.nextElementSibling;d.style.display=d.style.display==='block'?'none':'block'">
          <span style="font-weight:600;">📅 ${dias[i]}</span>
          <span style="font-size:0.78rem;color:var(--color-texto-secundario);">
            ${dia.length} comidas · ${window.ui.formatearNumero(dia.reduce((s,c)=>s+(c.meta?.kcal||0),0))} kcal
          </span>
        </div>
        <div style="display:none;margin-top:12px;">
          ${dia.map(c => this.renderComida(c, i + 1)).join('')}
        </div>
      </div>
    `).join('')}`;
  },

  renderComida(comida, diaIdx = 0) {
    const alertProt = !comida.valido
      ? `<div style="font-size:0.75rem;color:#ef4444;margin-top:2px;">⚠️ Sin proteína principal</div>` : '';
    const tot = this.calcularTotalesComida(comida);
    const itemsHtml = comida.items.length > 0
      ? comida.items.map((item, i) => this.renderItem(item, diaIdx, comida.tiempo, i)).join('')
      : `<div style="font-size:0.85rem;color:var(--color-texto-secundario);padding:8px 0;">Sin alimentos disponibles. Revisa restricciones.</div>`;

    return `
    <div class="card mb-2" style="padding:14px;" id="comida-card-${diaIdx}-${comida.tiempo}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <div>
          <span style="font-weight:700;font-size:1rem;">${comida.label}</span>
          ${alertProt}
        </div>
        <div style="display:flex;gap:8px;font-size:0.78rem;font-weight:600;flex-wrap:wrap;" id="meta-${diaIdx}-${comida.tiempo}">
          <span id="meta-kcal-${diaIdx}-${comida.tiempo}">${tot.kcal} kcal</span>
          <span style="color:#ef4444;" id="meta-prot-${diaIdx}-${comida.tiempo}">${tot.prot}g P</span>
          <span style="color:#f59e0b;" id="meta-grasa-${diaIdx}-${comida.tiempo}">${tot.grasa}g G</span>
          <span style="color:#10b981;" id="meta-carb-${diaIdx}-${comida.tiempo}">${tot.carb}g C</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;" id="items-${diaIdx}-${comida.tiempo}">
        ${itemsHtml}
      </div>
      <div style="margin-top:10px;">
        <button class="btn-agregar-item" onclick="window.dieta.toggleAgregar('${diaIdx}-${comida.tiempo}')">
          ＋ Agregar alimento
        </button>
        <div id="panel-agregar-${diaIdx}-${comida.tiempo}" style="display:none;margin-top:8px;">
          <input type="text" class="form-input" placeholder="🔍 Buscar alimento..."
                 oninput="window.dieta.filtrarAgregar(this.value,'${diaIdx}-${comida.tiempo}')"
                 id="search-agregar-${diaIdx}-${comida.tiempo}"
                 style="margin-bottom:6px;font-size:0.85rem;">
          <div id="lista-agregar-${diaIdx}-${comida.tiempo}"
               style="max-height:220px;overflow-y:auto;border:1px solid var(--color-borde);border-radius:8px;background:var(--color-superficie);"></div>
        </div>
      </div>
    </div>`;
  },

  renderItem(item, diaIdx, tiempo, itemIdx) {
    const estilos = {
      proteinas:     { bg:'#fee2e2', border:'#991b1b', emoji:'🥩' },
      carbohidratos: { bg:'#d1fae5', border:'#065f46', emoji:'🍞' },
      grasas:        { bg:'#fef9c3', border:'#92400e', emoji:'🥑' },
      frutas:        { bg:'#ede9fe', border:'#5b21b6', emoji:'🍎' },
      vegetales:     { bg:'#dcfce7', border:'#166534', emoji:'🥬' },
      combinados:    { bg:'#e0f2fe', border:'#0c4a6e', emoji:'🫓' },
      bebidas:       { bg:'#f0fdf4', border:'#14532d', emoji:'🥤' }
    };
    const e   = estilos[item._cat] || { bg:'#f1f5f9', border:'#475569', emoji:'🍽️' };
    const uid = `${diaIdx}-${tiempo}-${itemIdx}`;

    // Badge ajuste automático
    const badgeAjuste = item._ajustado
      ? `<span style="font-size:0.65rem;background:#eff6ff;color:#3b82f6;padding:1px 5px;border-radius:4px;font-weight:600;margin-left:4px;">⚡ ajustado</span>`
      : '';

    // Botón eliminar (solo ítems manuales)
    const btnEliminar = item._manual
      ? `<button onclick="event.stopPropagation();window.dieta.eliminarItem('${diaIdx}','${tiempo}',${itemIdx})"
                 style="background:none;border:none;cursor:pointer;font-size:0.85rem;color:#ef4444;padding:2px 4px;" title="Eliminar">✕</button>`
      : '';

    // ── BOTÓN DE RECETA ────────────────────────────────────
    // Aparece solo si el alimento tiene código real y porción concreta
    const tieneReceta = item.codigo && !item._porcion?.includes('al gusto');
    const nombreSeguro = (item.nombre || '').replace(/'/g, "\\'");
    const btnReceta = tieneReceta ? `
      <button
        onclick="event.stopPropagation();window.recetas?.mostrarPanelRecetas('${item.codigo}','${nombreSeguro}','${uid}')"
        style="background:none;border:1px solid #10b981;border-radius:5px;cursor:pointer;
               font-size:0.72rem;color:#10b981;padding:2px 7px;font-weight:600;
               font-family:inherit;line-height:1.4;white-space:nowrap;"
        title="Ver cómo prepararlo">
        👨‍🍳 Receta
      </button>` : '';

    return `
    <div class="item-swap-wrap" id="wrap-${uid}">
      <div style="padding:8px 12px;border-radius:8px;border-left:3px solid ${e.border};
                  background:${e.bg}40;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
                  cursor:pointer;"
           onclick="window.dieta.toggleSwap('${uid}','${item._cat}','${tiempo}',${diaIdx},${itemIdx})">
        <span style="font-size:1.1rem;">${e.emoji}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.9rem;color:var(--color-texto-principal);display:flex;align-items:center;flex-wrap:wrap;gap:2px;">
            ${item.nombre}${badgeAjuste}
          </div>
          <div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-top:1px;">${item._porcion}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          ${btnReceta}
          <div style="font-size:0.78rem;color:${e.border};font-weight:600;">${item.kcal} kcal</div>
          <span style="font-size:0.75rem;color:var(--color-texto-claro);">🔄</span>
          ${btnEliminar}
        </div>
      </div>
      <div id="swap-${uid}" style="display:none;"></div>
    </div>`;
  },

  // ── PANEL DE SUSTITUCIONES ─────────────────────────────────
  toggleSwap(uid, cat, tiempo, diaIdx, itemIdx) {
    const panel = document.getElementById(`swap-${uid}`);
    if (!panel) return;
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
    document.querySelectorAll('[id^="swap-"]').forEach(p => { if (p.id !== `swap-${uid}`) p.style.display = 'none'; });

    const dia    = diaIdx === 0 ? this.menuGenerado.diaBase : this.menuGenerado.semana[diaIdx - 1];
    const comida = dia?.find(c => c.tiempo === tiempo);
    const actual = comida?.items[itemIdx];
    const alts   = this.obtenerAlternativas(cat, tiempo, actual?.codigo);

    if (alts.length === 0) {
      panel.innerHTML = `<div style="padding:10px 12px;font-size:0.82rem;color:var(--color-texto-secundario);">No hay más opciones para esta categoría.</div>`;
    } else {
      const colores = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534', combinados:'#0c4a6e' };
      const color   = colores[cat] || '#475569';
      panel.innerHTML = `
        <div style="background:var(--color-superficie);border:1px solid var(--color-borde);border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
          <div style="padding:7px 12px;background:var(--color-superficie-hover);font-size:0.74rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;letter-spacing:.04em;">
            🔄 Cambiar por…
          </div>
          ${alts.map(alt => `
          <div onclick="window.dieta.aplicarSwap('${uid}','${alt.codigo}','${cat}','${tiempo}',${diaIdx},${itemIdx})"
               style="padding:9px 12px;border-bottom:1px solid var(--color-borde);display:flex;align-items:center;
                      justify-content:space-between;gap:8px;cursor:pointer;">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.88rem;color:var(--color-texto-principal);">${alt.nombre}</div>
              <div style="font-size:0.75rem;color:var(--color-texto-secundario);">${alt.unidad_hogar || alt.porcion_base_g+'g'}</div>
            </div>
            <div style="font-size:0.78rem;color:${color};font-weight:600;white-space:nowrap;">${alt.kcal} kcal</div>
          </div>`).join('')}
        </div>`;
    }
    panel.style.display = 'block';
  },

  obtenerAlternativas(cat, tiempo, codigoActual) {
    const reglas = this.MENU_RULES[tiempo];
    let codigos  = [];
    if (tiempo?.startsWith('snack')) {
      codigos = this.alimentos.filter(a => a.categoria === cat && a.etiquetas?.includes('portable')).map(a => a.codigo);
    } else if (reglas) {
      const listaCat = reglas[cat] || [];
      codigos = listaCat.length > 0 ? listaCat : this.alimentos.filter(a => a.categoria === cat).map(a => a.codigo);
    } else {
      codigos = this.alimentos.filter(a => a.categoria === cat).map(a => a.codigo);
    }
    let lista = codigos.map(c => this.alimentos.find(a => a.codigo === c)).filter(Boolean).filter(a => a.codigo !== codigoActual);
    lista = this.aplicarRestricciones(lista, this.preferencias);
    return lista.slice(0, 6);
  },

  aplicarSwap(uid, codigoNuevo, cat, tiempo, diaIdx, itemIdx) {
    const nuevo = this.alimentos.find(a => a.codigo === codigoNuevo);
    if (!nuevo) return;
    const dia    = diaIdx === 0 ? this.menuGenerado.diaBase : this.menuGenerado.semana[diaIdx - 1];
    const comida = dia?.find(c => c.tiempo === tiempo);
    if (!comida) return;
    const itemAnterior = comida.items[itemIdx];
    const tipoMacro    = cat === 'proteinas' ? 'prot' : cat === 'carbohidratos' ? 'carb' : cat === 'grasas' ? 'grasa' : null;
    const macroObj     = tipoMacro ? (itemAnterior?._macroObj || comida.meta[tipoMacro === 'prot' ? 'prot' : tipoMacro === 'carb' ? 'carb' : 'grasa']) : null;
    const porcion      = tipoMacro && macroObj ? this.porcion(nuevo, macroObj, tipoMacro) : (nuevo.unidad_hogar || `${nuevo.porcion_base_g}g`);
    comida.items[itemIdx] = { ...nuevo, _porcion: porcion, _cat: cat, _macroObj: macroObj };

    const contItems = document.getElementById(`items-${diaIdx}-${tiempo}`);
    if (contItems) contItems.innerHTML = comida.items.map((item, i) => this.renderItem(item, diaIdx, tiempo, i)).join('');
    this.actualizarTotales(diaIdx, tiempo, comida);
  },

  calcularTotalesComida(comida) {
    let kcal = 0, prot = 0, grasa = 0, carb = 0;
    comida.items.forEach(item => {
      // Datos en BD son por porcion_base_g — factor solo si _gramos fue ajustado
      const g      = item._gramos ?? (item.porcion_base_g || 100);
      const base   = item.porcion_base_g || 100;
      const factor = base > 0 ? (g / base) : 1;
      kcal  += (item.kcal       ||0) * factor;
      prot  += (item.proteina_g ||0) * factor;
      grasa += (item.grasa_g    ||0) * factor;
      carb  += (item.carbo_g    ||0) * factor;
    });
    return { kcal: Math.round(kcal), prot: Math.round(prot), grasa: Math.round(grasa), carb: Math.round(carb) };
  },

  _gramosDeItem(item) {
    const m = (item._porcion || '').match(/^(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : (item.porcion_base_g || 100);
  },

  // ── AGREGAR ALIMENTO ─────────────────────────────────────
  toggleAgregar(key) {
    const panel = document.getElementById(`panel-agregar-${key}`);
    if (!panel) return;
    const abierto = panel.style.display === 'block';
    document.querySelectorAll('[id^="panel-agregar-"]').forEach(p => p.style.display = 'none');
    if (!abierto) {
      panel.style.display = 'block';
      const input = document.getElementById(`search-agregar-${key}`);
      if (input) { input.value = ''; input.focus(); }
      this.filtrarAgregar('', key);
    }
  },

  filtrarAgregar(termino, key) {
    const lista = document.getElementById(`lista-agregar-${key}`);
    if (!lista) return;
    const t = termino.toLowerCase().trim();
    let candidatos = this.aplicarRestricciones([...this.alimentos], this.preferencias);
    if (t) candidatos = candidatos.filter(a => a.nombre.toLowerCase().includes(t));
    candidatos = candidatos.slice(0, 30);

    if (candidatos.length === 0) {
      lista.innerHTML = `<div style="padding:12px;text-align:center;">
        <div style="font-size:0.82rem;color:var(--color-texto-secundario);margin-bottom:8px;">Sin resultados para "<strong>${t}</strong>"</div>
        <button class="btn btn-outline" style="font-size:0.82rem;padding:6px 14px;"
                onclick="window.dieta.abrirFormNuevoAlimento('${t}')">
          ➕ Agregar al catálogo
        </button>
      </div>`;
      return;
    }
    const colores = { proteinas:'#991b1b', carbohidratos:'#065f46', grasas:'#92400e', frutas:'#5b21b6', vegetales:'#166534', combinados:'#0c4a6e', bebidas:'#14532d' };
    lista.innerHTML = candidatos.map(a => `
      <div onclick="window.dieta.mostrarCantidad('${key}','${a.codigo}')"
           style="padding:9px 12px;border-bottom:1px solid var(--color-borde);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.88rem;color:var(--color-texto-principal);">${a.nombre}</div>
          <div style="font-size:0.74rem;color:var(--color-texto-secundario);">${a.porcion_descripcion || a.porcion_base_g+'g'} · ${a.proteina_g}g P · ${a.grasa_g}g G · ${a.carbo_g}g C</div>
        </div>
        <span style="font-size:0.78rem;color:${colores[a.categoria]||'#475569'};font-weight:600;white-space:nowrap;">${a.kcal} kcal</span>
      </div>`).join('');
  },

  mostrarCantidad(key, codigo) {
    const a    = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const lista = document.getElementById(`lista-agregar-${key}`);
    if (!lista) return;
    lista.innerHTML = `
    <div style="padding:12px;">
      <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px;">${a.nombre}</div>
      <div style="font-size:0.78rem;color:var(--color-texto-secundario);margin-bottom:10px;">
        ${a.kcal} kcal / ${a.porcion_base_g}g · ${a.proteina_g}g P · ${a.grasa_g}g G · ${a.carbo_g}g C
      </div>
      <label style="font-size:0.78rem;font-weight:600;color:var(--color-texto-secundario);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:4px;">
        Cantidad (gramos)
      </label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="number" id="cantidad-agregar-${key}" value="${a.porcion_base_g||100}" min="10" max="1000" step="10"
               class="form-input" style="width:100px;font-size:0.9rem;text-align:center;">
        <button class="btn btn-primary" style="padding:7px 16px;font-size:0.85rem;"
                onclick="window.dieta.confirmarAgregar('${key}','${codigo}')">✓ Agregar</button>
        <button class="btn btn-outline" style="padding:7px 12px;font-size:0.85rem;"
                onclick="window.dieta.filtrarAgregar('','${key}')">← Volver</button>
      </div>
    </div>`;
  },

  confirmarAgregar(key, codigo) {
    const a = this.alimentos.find(x => x.codigo === codigo);
    if (!a) return;
    const gramos  = parseFloat(document.getElementById(`cantidad-agregar-${key}`)?.value) || a.porcion_base_g;
    const factor  = gramos / (a.porcion_base_g || 100);
    const sepIdx  = key.indexOf('-');
    const diaIdx  = parseInt(key.substring(0, sepIdx));
    const tiempo  = key.substring(sepIdx + 1);
    const dia     = diaIdx === 0 ? this.menuGenerado.diaBase : this.menuGenerado.semana[diaIdx - 1];
    const comida  = dia?.find(c => c.tiempo === tiempo);
    if (!comida) return;

    let porcion = `${gramos}g`;
    if (a.unidad_hogar && a.porcion_base_g) {
      const uR = Math.round((gramos / a.porcion_base_g) * 2) / 2;
      if (uR >= 0.5 && uR <= 10) porcion = `${uR} ${a.unidad_hogar}`;
    }

    comida.items.push({
      ...a,
      kcal: Math.round(a.kcal*factor), proteina_g: Math.round(a.proteina_g*factor),
      grasa_g: Math.round(a.grasa_g*factor), carbo_g: Math.round(a.carbo_g*factor),
      _porcion: porcion, _cat: a.categoria, _manual: true, _gramos: gramos
    });

    const contItems = document.getElementById(`items-${key}`);
    if (contItems) contItems.innerHTML = comida.items.map((item, i) => this.renderItem(item, diaIdx, tiempo, i)).join('');
    this.actualizarTotales(diaIdx, tiempo, comida);
    const panel = document.getElementById(`panel-agregar-${key}`);
    if (panel) panel.style.display = 'none';
  },

  eliminarItem(diaIdx, tiempo, itemIdx) {
    diaIdx  = parseInt(diaIdx);
    itemIdx = parseInt(itemIdx);
    const dia    = diaIdx === 0 ? this.menuGenerado.diaBase : this.menuGenerado.semana[diaIdx - 1];
    const comida = dia?.find(c => c.tiempo === tiempo);
    if (!comida) return;
    comida.items.splice(itemIdx, 1);
    const contItems = document.getElementById(`items-${diaIdx}-${tiempo}`);
    if (contItems) contItems.innerHTML = comida.items.map((item, i) => this.renderItem(item, diaIdx, tiempo, i)).join('');
    this.actualizarTotales(diaIdx, tiempo, comida);
  },

  actualizarTotales(diaIdx, tiempo, comida) {
    const tot = this.calcularTotalesComida(comida);
    const s = (id) => document.getElementById(id);
    if (s(`meta-kcal-${diaIdx}-${tiempo}`))  s(`meta-kcal-${diaIdx}-${tiempo}`).textContent  = `${tot.kcal} kcal`;
    if (s(`meta-prot-${diaIdx}-${tiempo}`))  s(`meta-prot-${diaIdx}-${tiempo}`).textContent  = `${tot.prot}g P`;
    if (s(`meta-grasa-${diaIdx}-${tiempo}`)) s(`meta-grasa-${diaIdx}-${tiempo}`).textContent = `${tot.grasa}g G`;
    if (s(`meta-carb-${diaIdx}-${tiempo}`))  s(`meta-carb-${diaIdx}-${tiempo}`).textContent  = `${tot.carb}g C`;

    if (diaIdx === 0) {
      const totDia = this.menuGenerado.diaBase.reduce((acc, c) => {
        const t = this.calcularTotalesComida(c);
        return { kcal:acc.kcal+t.kcal, prot:acc.prot+t.prot, grasa:acc.grasa+t.grasa, carb:acc.carb+t.carb };
      }, { kcal:0, prot:0, grasa:0, carb:0 });
      if (s('resumen-kcal'))  s('resumen-kcal').textContent  = `${this.menuGenerado.diaBase.length} comidas · ~${window.ui.formatearNumero(totDia.kcal)} kcal`;
      if (s('resumen-prot'))  s('resumen-prot').textContent  = `P: ${totDia.prot}g`;
      if (s('resumen-grasa')) s('resumen-grasa').textContent = `G: ${totDia.grasa}g`;
      if (s('resumen-carb'))  s('resumen-carb').textContent  = `C: ${totDia.carb}g`;
    }
  },

  // ── FORM NUEVO ALIMENTO ──────────────────────────────────
  abrirFormNuevoAlimento(nombreInicial = '') {
    document.querySelectorAll('[id^="panel-agregar-"]').forEach(p => p.style.display = 'none');
    document.getElementById('modal-nuevo-alimento')?.remove();
    const cats = { proteinas:'🥩 Proteínas', carbohidratos:'🍞 Carbohidratos', grasas:'🥑 Grasas', vegetales:'🥬 Vegetales', frutas:'🍎 Frutas', combinados:'🫓 Combinados', bebidas:'🥤 Bebidas' };
    document.body.insertAdjacentHTML('beforeend', `
    <div id="modal-nuevo-alimento" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;">
      <div style="background:white;border-radius:16px;padding:20px;width:100%;max-width:480px;margin:auto;margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-weight:700;font-size:1.1rem;margin:0;">➕ Nuevo alimento</h3>
          <button onclick="document.getElementById('modal-nuevo-alimento').remove()"
                  style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#6b7280;">✕</button>
        </div>
        <div style="font-size:0.8rem;color:#065f46;background:#d1fae5;border-radius:8px;padding:8px 12px;margin-bottom:14px;">
          📋 Ingresa los valores <strong>por 100g</strong> del alimento.
        </div>
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input type="text" id="na-nombre" class="form-input" value="${nombreInicial.replace(/'/g,"\\'")}">
        </div>
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select id="na-categoria" class="form-input">
            ${Object.entries(cats).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="form-group"><label class="form-label">Calorías *</label><input type="number" id="na-kcal" class="form-input" placeholder="165" min="0"></div>
          <div class="form-group"><label class="form-label">Proteína g *</label><input type="number" id="na-prot" class="form-input" placeholder="31" min="0" step="0.1"></div>
          <div class="form-group"><label class="form-label">Grasa g *</label><input type="number" id="na-grasa" class="form-input" placeholder="3.6" min="0" step="0.1"></div>
          <div class="form-group"><label class="form-label">Carbos g *</label><input type="number" id="na-carb" class="form-input" placeholder="0" min="0" step="0.1"></div>
          <div class="form-group"><label class="form-label">Porción base (g)</label><input type="number" id="na-porcion" class="form-input" value="100" min="1"></div>
          <div class="form-group"><label class="form-label">Unidad hogar</label><input type="text" id="na-unidad" class="form-input" placeholder="1 filete"></div>
        </div>
        <div id="na-error" style="display:none;background:#fee2e2;color:#991b1b;border-radius:8px;padding:8px 12px;font-size:0.82rem;margin-bottom:10px;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" onclick="window.dieta.guardarNuevoAlimento()">
          💾 Guardar en catálogo
        </button>
      </div>
    </div>`);
  },

  async guardarNuevoAlimento() {
    const g      = id => document.getElementById(id)?.value.trim();
    const nombre = g('na-nombre');
    const kcal   = parseFloat(g('na-kcal'));
    const errEl  = document.getElementById('na-error');
    if (!nombre)              { errEl.textContent='El nombre es obligatorio.'; errEl.style.display='block'; return; }
    if (isNaN(kcal)||kcal<0) { errEl.textContent='Ingresa las calorías.';    errEl.style.display='block'; return; }
    errEl.style.display = 'none';
    const btn = document.querySelector('#modal-nuevo-alimento .btn-primary');
    btn.disabled = true; btn.textContent = 'Guardando...';
    try {
      const { data, error } = await window.db.from('alimentos').insert({
        codigo: `U-${Date.now().toString().slice(-6)}`,
        nombre,
        categoria:         g('na-categoria'),
        porcion_base_g:    parseFloat(g('na-porcion')) || 100,
        kcal,
        proteina_g:        parseFloat(g('na-prot'))  || 0,
        grasa_g:           parseFloat(g('na-grasa')) || 0,
        carbo_g:           parseFloat(g('na-carb'))  || 0,
        unidad_hogar:      g('na-unidad') || null,
        activo:            true
      }).select().single();
      if (error) throw error;
      this.alimentos.push(data);
      window.ui.mostrarAlerta('✅ Alimento guardado en el catálogo', 'success');
      document.getElementById('modal-nuevo-alimento').remove();
    } catch (err) {
      errEl.textContent = 'Error: ' + err.message;
      errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = '💾 Guardar en catálogo';
    }
  },

  renderBotones() {
    return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn btn-outline" id="btn-regenerar">🔄 Regenerar menú</button>
      <button class="btn btn-secondary" onclick="window.app.navegar('alimentos')">📋 Ver alimentos</button>
      <button class="btn btn-outline" onclick="window.recetas?.mostrarSazon()"
              style="border-color:#10b981;color:#10b981;">🧂 Guía de sazón</button>
    </div>
    <div class="alert alert-info mt-3" style="font-size:0.82rem;">
      <strong>ℹ️</strong> Toca <strong>👨‍🍳 Receta</strong> en cualquier alimento para ver cómo prepararlo.
      Este menú es orientativo y no reemplaza asesoría nutricional profesional.
    </div>`;
  },

  renderEstilos() {
    return `<style id="estilos-dieta">
      .btn-vista{padding:8px 18px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.85rem;font-weight:500;cursor:pointer;transition:var(--transicion);font-family:inherit;}
      .btn-vista.activa{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .prefs-grid{display:flex;flex-direction:column;gap:16px;}
      .pref-label{font-size:0.78rem;font-weight:700;color:var(--color-texto-secundario);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:6px;}
      .btn-group-pref{display:flex;flex-wrap:wrap;gap:6px;}
      .btn-pref{padding:5px 12px;border-radius:999px;border:1.5px solid var(--color-borde);background:var(--color-superficie);color:var(--color-texto-secundario);font-size:0.8rem;font-weight:500;cursor:pointer;transition:var(--transicion);font-family:inherit;}
      .btn-pref.activo{background:var(--color-primario);color:white;border-color:var(--color-primario);}
      .check-pref{display:flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;padding:5px 10px;border-radius:8px;border:1.5px solid var(--color-borde);background:var(--color-superficie);transition:var(--transicion);user-select:none;}
      .check-pref input{accent-color:var(--color-primario);}
      .item-swap-wrap{border-radius:8px;overflow:hidden;}
      .btn-agregar-item{display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:999px;border:1.5px dashed var(--color-primario);background:transparent;color:var(--color-primario);font-size:0.82rem;font-weight:600;cursor:pointer;transition:var(--transicion);font-family:inherit;}
      .btn-agregar-item:hover{background:#ecfdf5;}
      .badge-ajuste{margin-top:8px;font-size:0.75rem;color:#3b82f6;background:#eff6ff;border-radius:6px;padding:4px 9px;display:inline-block;font-weight:600;}
    </style>`;
  }
};

document.addEventListener('cargar:dieta', () => window.dieta.cargar());
