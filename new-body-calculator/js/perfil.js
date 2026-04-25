/* ============================================================
   MÓDULO M3: PERFIL / ONBOARDING (con sistema de unidades)
   ============================================================ */

window.perfil = {

    perfilNutricional: null,
    configuracion: null,
    sistemaActual: 'salvadoreno',

    async cargar() {
        const usuarioId = window.app.usuario.id;
        this.perfilNutricional = await window.dbHelpers.obtenerPerfilNutricional(usuarioId);
        this.configuracion = await window.dbHelpers.obtenerConfigPreferencias(usuarioId);
        this.sistemaActual = this.perfilNutricional?.sistema_unidades || 'salvadoreno';
        this.render();
        this.configurarEventos();
    },

    render() {
        const p = this.perfilNutricional || {};
        const c = this.configuracion || {};
        const sistema = this.sistemaActual;

        const pesoDisplay = p.peso_actual_kg ? window.unidades.kgADisplay(p.peso_actual_kg, sistema) : '';
        const pesoMetaDisplay = p.peso_meta_kg ? window.unidades.kgADisplay(p.peso_meta_kg, sistema) : '';
        const tallaInfo = p.talla_cm ? window.unidades.cmADisplay(p.talla_cm, sistema) : null;

        const selectoresSistema = Object.entries(window.unidades.SISTEMAS).map(([codigo, s]) => `
            <label class="selector-sistema ${sistema === codigo ? 'activo' : ''}" data-sistema="${codigo}">
                <input type="radio" name="sistema-unidades" value="${codigo}" ${sistema === codigo ? 'checked' : ''} style="display:none;">
                <div style="font-size:1.5rem;">${s.bandera}</div>
                <div style="font-weight:600; font-size:0.9rem;">${s.nombre}</div>
                <div style="font-size:0.75rem; color:var(--color-texto-secundario);">${s.descripcion}</div>
            </label>
        `).join('');

        const inputTalla = sistema === 'imperial'
            ? `
                <div class="form-group">
                    <label class="form-label">Talla *</label>
                    <div style="display:flex; gap:8px;">
                        <div style="flex:1;">
                            <input type="number" id="perfil-talla-pies" class="form-input"
                                   placeholder="5" min="3" max="8"
                                   value="${tallaInfo?.pies || ''}">
                            <span class="form-hint">pies</span>
                        </div>
                        <div style="flex:1;">
                            <input type="number" id="perfil-talla-pulgadas" class="form-input"
                                   placeholder="7" min="0" max="11"
                                   value="${tallaInfo?.pulgadas || ''}">
                            <span class="form-hint">pulgadas</span>
                        </div>
                    </div>
                </div>
            `
            : `
                <div class="form-group">
                    <label class="form-label">Talla (cm) *</label>
                    <input type="number" id="perfil-talla" class="form-input"
                           placeholder="170" min="100" max="250" step="0.5"
                           value="${tallaInfo?.cm || ''}">
                </div>
            `;

        const unidadPeso = window.unidades.etiquetaPeso(sistema);

        const html = `
            <div class="card">
                <h3 class="card-title">📏 Sistema de Unidades</h3>
                <p class="form-hint mb-2">Elige cómo quieres ingresar tus medidas. Puedes cambiarlo en cualquier momento.</p>
                <div class="selector-sistema-grid">${selectoresSistema}</div>
            </div>

            <div class="card">
                <h3 class="card-title">📋 Datos Físicos</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Sexo *</label>
                        <select id="perfil-sexo" class="form-select">
                            <option value="">Selecciona...</option>
                            <option value="M" ${p.sexo === 'M' ? 'selected' : ''}>Masculino</option>
                            <option value="F" ${p.sexo === 'F' ? 'selected' : ''}>Femenino</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de nacimiento *</label>
                        <input type="date" id="perfil-fecha-nacimiento" class="form-input"
                               value="${p.fecha_nacimiento || ''}" max="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>

                <div class="form-row">
                    ${inputTalla}
                    <div class="form-group">
                        <label class="form-label">Peso actual (${unidadPeso}) *</label>
                        <input type="number" id="perfil-peso" class="form-input"
                               placeholder="${sistema === 'metrico' ? '70' : '155'}"
                               min="30" max="660" step="0.1" value="${pesoDisplay}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Peso meta (${unidadPeso})</label>
                        <input type="number" id="perfil-peso-meta" class="form-input"
                               placeholder="Opcional" min="30" max="660" step="0.1" value="${pesoMetaDisplay}">
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">🎯 Meta y Actividad</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tu meta *</label>
                        <select id="perfil-meta" class="form-select">
                            <option value="">Selecciona...</option>
                            <option value="deficit" ${p.meta === 'deficit' ? 'selected' : ''}>📉 Perder peso (déficit)</option>
                            <option value="mantenimiento" ${p.meta === 'mantenimiento' ? 'selected' : ''}>⚖️ Mantener peso</option>
                            <option value="superavit" ${p.meta === 'superavit' ? 'selected' : ''}>📈 Ganar peso/masa (superávit)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nivel de actividad *</label>
                        <select id="perfil-actividad" class="form-select">
                            <option value="">Selecciona...</option>
                            <option value="sedentario" ${p.nivel_actividad === 'sedentario' ? 'selected' : ''}>Sedentario</option>
                            <option value="ligero" ${p.nivel_actividad === 'ligero' ? 'selected' : ''}>Ligero (1-3 días/sem)</option>
                            <option value="moderado" ${p.nivel_actividad === 'moderado' ? 'selected' : ''}>Moderado (3-5 días/sem)</option>
                            <option value="activo" ${p.nivel_actividad === 'activo' ? 'selected' : ''}>Activo (6-7 días/sem)</option>
                            <option value="muy_activo" ${p.nivel_actividad === 'muy_activo' ? 'selected' : ''}>Muy activo</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">🍽️ Preferencias Alimentarias</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Número de comidas al día</label>
                        <select id="perfil-comidas" class="form-select">
                            <option value="3" ${c.num_comidas === 3 ? 'selected' : ''}>3 comidas</option>
                            <option value="4" ${(c.num_comidas === 4 || !c.num_comidas) ? 'selected' : ''}>4 comidas</option>
                            <option value="5" ${c.num_comidas === 5 ? 'selected' : ''}>5 comidas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estilo</label>
                        <select id="perfil-estilo" class="form-select">
                            <option value="tradicional" ${(c.estilo === 'tradicional' || !c.estilo) ? 'selected' : ''}>Tradicional</option>
                            <option value="economico" ${c.estilo === 'economico' ? 'selected' : ''}>Económico</option>
                            <option value="mixto" ${c.estilo === 'mixto' ? 'selected' : ''}>Mixto</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="perfil-ayuno" ${c.hace_ayuno ? 'checked' : ''}>
                            Hago ayuno intermitente
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="perfil-desayuno" ${(c.incluye_desayuno !== false) ? 'checked' : ''}>
                            Incluir desayuno
                        </label>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">⚙️ Configuración Avanzada (opcional)</h3>
                <p class="form-hint mb-2">Valores por defecto recomendados. Solo ajusta si sabes lo que haces.</p>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Proteína (g/kg)</label>
                        <input type="number" id="perfil-proteina" class="form-input"
                               step="0.1" min="1.0" max="3.5"
                               value="${c.proteina_g_kg || window.APP_CONFIG.DEFAULTS.proteina_g_kg}">
                        <span class="form-hint">Recomendado: 2.0 - 2.6</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grasa (g/kg)</label>
                        <input type="number" id="perfil-grasa" class="form-input"
                               step="0.1" min="0.5" max="1.5"
                               value="${c.grasa_g_kg || window.APP_CONFIG.DEFAULTS.grasa_g_kg}">
                        <span class="form-hint">Recomendado: 0.7 - 1.0</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">% Déficit/Superávit</label>
                        <input type="number" id="perfil-porcentaje" class="form-input"
                               step="1" min="5" max="25"
                               value="${c.porcentaje_deficit || window.APP_CONFIG.DEFAULTS.porcentaje_deficit}">
                        <span class="form-hint">Recomendado: 10%</span>
                    </div>
                </div>
            </div>

            <div class="flex gap-2 mt-3" style="flex-wrap:wrap;">
                <button class="btn btn-primary" id="btn-guardar-perfil">💾 Guardar perfil</button>
                <button class="btn btn-outline" id="btn-guardar-calcular">🧮 Guardar y calcular</button>
            </div>

            <style>
                .selector-sistema-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 12px;
                }
                .selector-sistema {
                    display: block;
                    padding: 16px 12px;
                    border: 2px solid var(--color-borde);
                    border-radius: var(--radio-md);
                    cursor: pointer;
                    text-align: center;
                    transition: var(--transicion);
                    background: var(--color-superficie);
                }
                .selector-sistema:hover {
                    background: var(--color-superficie-hover);
                    border-color: var(--color-primario);
                }
                .selector-sistema.activo {
                    border-color: var(--color-primario);
                    background: var(--color-primario-claro);
                }
            </style>
        `;

        document.getElementById('page-perfil').innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Mi Perfil</h1>
                <p class="page-subtitle">Ingresa tus datos físicos y preferencias</p>
            </div>
            ${html}
        `;
    },

    configurarEventos() {
        document.querySelectorAll('.selector-sistema').forEach(label => {
            label.addEventListener('click', () => {
                const nuevoSistema = label.dataset.sistema;
                if (nuevoSistema === this.sistemaActual) return;
                this.capturarValoresActuales();
                this.sistemaActual = nuevoSistema;
                this.render();
                this.configurarEventos();
            });
        });

        document.getElementById('btn-guardar-perfil')?.addEventListener('click', () => this.guardar(false));
        document.getElementById('btn-guardar-calcular')?.addEventListener('click', () => this.guardar(true));
    },

    capturarValoresActuales() {
        if (!this.perfilNutricional) this.perfilNutricional = {};

        const pesoEl = document.getElementById('perfil-peso');
        if (pesoEl?.value) {
            this.perfilNutricional.peso_actual_kg = window.unidades.displayAKg(parseFloat(pesoEl.value), this.sistemaActual);
        }

        const pesoMetaEl = document.getElementById('perfil-peso-meta');
        if (pesoMetaEl?.value) {
            this.perfilNutricional.peso_meta_kg = window.unidades.displayAKg(parseFloat(pesoMetaEl.value), this.sistemaActual);
        }

        if (this.sistemaActual === 'imperial') {
            const pies = document.getElementById('perfil-talla-pies')?.value;
            const pulgadas = document.getElementById('perfil-talla-pulgadas')?.value;
            if (pies || pulgadas) {
                this.perfilNutricional.talla_cm = window.unidades.displayACm(pies || 0, pulgadas || 0, this.sistemaActual);
            }
        } else {
            const tallaEl = document.getElementById('perfil-talla');
            if (tallaEl?.value) this.perfilNutricional.talla_cm = parseFloat(tallaEl.value);
        }

        ['sexo', 'fecha-nacimiento', 'meta', 'actividad'].forEach(campo => {
            const el = document.getElementById(`perfil-${campo}`);
            if (el?.value) {
                const key = campo === 'fecha-nacimiento' ? 'fecha_nacimiento' :
                           campo === 'actividad' ? 'nivel_actividad' : campo;
                this.perfilNutricional[key] = el.value;
            }
        });
    },

    obtenerDatosFormulario() {
        const sistema = this.sistemaActual;
        const pesoDisplay = parseFloat(document.getElementById('perfil-peso').value);
        const pesoMetaDisplay = parseFloat(document.getElementById('perfil-peso-meta').value);

        const pesoKg = window.unidades.displayAKg(pesoDisplay, sistema);
        const pesoMetaKg = pesoMetaDisplay ? window.unidades.displayAKg(pesoMetaDisplay, sistema) : null;

        let tallaCm;
        if (sistema === 'imperial') {
            const pies = parseFloat(document.getElementById('perfil-talla-pies').value) || 0;
            const pulgadas = parseFloat(document.getElementById('perfil-talla-pulgadas').value) || 0;
            tallaCm = window.unidades.displayACm(pies, pulgadas, sistema);
        } else {
            tallaCm = parseFloat(document.getElementById('perfil-talla').value);
        }

        return {
            perfil: {
                sexo: document.getElementById('perfil-sexo').value,
                fecha_nacimiento: document.getElementById('perfil-fecha-nacimiento').value,
                talla_cm: tallaCm,
                peso_actual_kg: pesoKg,
                peso_meta_kg: pesoMetaKg,
                meta: document.getElementById('perfil-meta').value,
                nivel_actividad: document.getElementById('perfil-actividad').value,
                sistema_unidades: sistema
            },
            config: {
                num_comidas: parseInt(document.getElementById('perfil-comidas').value),
                estilo: document.getElementById('perfil-estilo').value,
                hace_ayuno: document.getElementById('perfil-ayuno').checked,
                incluye_desayuno: document.getElementById('perfil-desayuno').checked,
                proteina_g_kg: parseFloat(document.getElementById('perfil-proteina').value),
                grasa_g_kg: parseFloat(document.getElementById('perfil-grasa').value),
                porcentaje_deficit: parseFloat(document.getElementById('perfil-porcentaje').value)
            }
        };
    },

    validar(datos) {
        const p = datos.perfil;
        if (!p.sexo) return 'Selecciona tu sexo';
        if (!p.fecha_nacimiento) return 'Ingresa tu fecha de nacimiento';
        if (!p.talla_cm || p.talla_cm < 100 || p.talla_cm > 250) return 'Talla inválida';
        if (!p.peso_actual_kg || p.peso_actual_kg < 30 || p.peso_actual_kg > 300) return 'Peso inválido';
        if (!p.meta) return 'Selecciona tu meta';
        if (!p.nivel_actividad) return 'Selecciona tu nivel de actividad';
        const edad = window.calculo.calcularEdad(p.fecha_nacimiento);
        if (edad < 15 || edad > 100) return 'Edad fuera de rango (15-100 años)';
        return null;
    },

    async guardar(calcular = false) {
        const datos = this.obtenerDatosFormulario();
        const error = this.validar(datos);
        if (error) {
            window.ui.mostrarAlerta(error, 'warning');
            return;
        }

        const usuarioId = window.app.usuario.id;
        const btn = calcular ? document.getElementById('btn-guardar-calcular') : document.getElementById('btn-guardar-perfil');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            await window.db.from('perfiles_nutricionales').update({ activo: false }).eq('usuario_id', usuarioId);

            const { data: perfilData, error: errPerfil } = await window.db
                .from('perfiles_nutricionales')
                .insert({ usuario_id: usuarioId, ...datos.perfil, activo: true })
                .select().single();

            if (errPerfil) throw errPerfil;

            if (this.configuracion) {
                await window.db.from('configuraciones_preferencias').update(datos.config).eq('id', this.configuracion.id);
            } else {
                await window.db.from('configuraciones_preferencias').insert({ usuario_id: usuarioId, ...datos.config });
            }

            this.perfilNutricional = perfilData;
            window.ui.mostrarAlerta('✅ Perfil guardado', 'success');

            if (calcular) {
                setTimeout(() => window.app.navegar('calculadora'), 500);
            } else {
                btn.disabled = false;
                btn.textContent = '💾 Guardar perfil';
            }
        } catch (err) {
            console.error(err);
            window.ui.mostrarAlerta('Error al guardar: ' + err.message, 'danger');
            btn.disabled = false;
            btn.textContent = calcular ? '🧮 Guardar y calcular' : '💾 Guardar perfil';
        }
    }
};

document.addEventListener('cargar:perfil', () => window.perfil.cargar());
