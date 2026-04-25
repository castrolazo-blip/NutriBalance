/* ============================================================
   MÓDULO M9: PROGRESO (con soporte de unidades)
   ============================================================ */

window.progreso = {

    historial: [],
    perfilActual: null,
    planesRecientes: [],
    sistema: 'salvadoreno',

    async cargar() {
        const usuarioId = window.app.usuario.id;
        this.historial = await window.dbHelpers.obtenerHistorialPeso(usuarioId, 90);
        this.perfilActual = await window.dbHelpers.obtenerPerfilNutricional(usuarioId);
        this.planesRecientes = await window.dbHelpers.obtenerPlanesRecientes(usuarioId, 10);
        this.sistema = this.perfilActual?.sistema_unidades || 'salvadoreno';
        this.render();
    },

    render() {
        const hoy = new Date().toISOString().split('T')[0];
        const pesoActualKg = this.perfilActual?.peso_actual_kg || 0;
        const pesoMetaKg = this.perfilActual?.peso_meta_kg;
        const unidadPeso = window.unidades.etiquetaPeso(this.sistema);

        const pesoActualDisplay = pesoActualKg ? window.unidades.kgADisplay(pesoActualKg, this.sistema) : 0;
        const pesoMetaDisplay = pesoMetaKg ? window.unidades.kgADisplay(pesoMetaKg, this.sistema) : null;

        const diffPeso = pesoMetaKg ? (pesoMetaDisplay - pesoActualDisplay) : null;

        document.getElementById('page-progreso').innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Mi Progreso</h1>
                <p class="page-subtitle">Registra tu peso y observa tu evolución</p>
            </div>

            <div class="grid mb-3">
                <div class="stat-card highlight">
                    <div class="stat-label">Peso actual</div>
                    <div class="stat-value">${pesoActualDisplay}<span class="stat-unit"> ${unidadPeso}</span></div>
                    <div class="stat-unit">${this.perfilActual ? 'de tu perfil' : 'sin registro'}</div>
                </div>
                ${pesoMetaDisplay ? `
                    <div class="stat-card">
                        <div class="stat-label">Peso meta</div>
                        <div class="stat-value">${pesoMetaDisplay}<span class="stat-unit"> ${unidadPeso}</span></div>
                        <div class="stat-unit">${Math.abs(diffPeso).toFixed(1)} ${unidadPeso} ${diffPeso > 0 ? 'por ganar' : 'por perder'}</div>
                    </div>
                ` : ''}
                <div class="stat-card">
                    <div class="stat-label">Registros</div>
                    <div class="stat-value">${this.historial.length}</div>
                    <div class="stat-unit">pesajes guardados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Cálculos</div>
                    <div class="stat-value">${this.planesRecientes.length}</div>
                    <div class="stat-unit">planes generados</div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">⚖️ Registrar pesaje de hoy</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha</label>
                        <input type="date" id="progreso-fecha" class="form-input" value="${hoy}" max="${hoy}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Peso (${unidadPeso}) *</label>
                        <input type="number" id="progreso-peso" class="form-input"
                               step="0.1" min="30" max="660"
                               placeholder="${this.sistema === 'metrico' ? 'Ej: 75.5' : 'Ej: 166'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Adherencia % (opcional)</label>
                        <input type="number" id="progreso-adherencia" class="form-input"
                               step="5" min="0" max="100" placeholder="0-100">
                        <span class="form-hint">¿Qué tan bien seguiste tu plan?</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Nota (opcional)</label>
                    <input type="text" id="progreso-nota" class="form-input"
                           placeholder="Ej: me sentí bien esta semana">
                </div>
                <button class="btn btn-primary" id="btn-registrar-peso">💾 Registrar pesaje</button>
            </div>

            ${this.historial.length > 1 ? `
                <div class="card">
                    <h3 class="card-title">📈 Evolución del peso (${unidadPeso})</h3>
                    <div id="grafico-peso"></div>
                </div>
            ` : ''}

            <div class="card">
                <div class="flex-between mb-2">
                    <h3 class="card-title" style="margin:0;">📋 Historial de pesajes</h3>
                </div>
                <div id="historial-lista"></div>
            </div>

            ${this.planesRecientes.length > 0 ? `
                <div class="card">
                    <h3 class="card-title">🧮 Cálculos recientes</h3>
                    <div id="planes-lista"></div>
                </div>
            ` : ''}
        `;

        this.configurarEventos();
        this.renderHistorial();
        if (this.historial.length > 1) this.renderGrafico();
        if (this.planesRecientes.length > 0) this.renderPlanes();
    },

    configurarEventos() {
        document.getElementById('btn-registrar-peso').addEventListener('click', () => this.registrarPeso());
    },

    async registrarPeso() {
        const fecha = document.getElementById('progreso-fecha').value;
        const pesoDisplay = parseFloat(document.getElementById('progreso-peso').value);
        const adherencia = parseFloat(document.getElementById('progreso-adherencia').value) || null;
        const nota = document.getElementById('progreso-nota').value.trim() || null;

        if (!pesoDisplay) {
            window.ui.mostrarAlerta('Ingresa un peso válido', 'warning');
            return;
        }

        // Convertir a kg para guardar
        const pesoKg = window.unidades.displayAKg(pesoDisplay, this.sistema);

        if (pesoKg < 30 || pesoKg > 300) {
            window.ui.mostrarAlerta('Peso fuera de rango', 'warning');
            return;
        }

        const btn = document.getElementById('btn-registrar-peso');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const { error: errHist } = await window.db.from('historial_peso').insert({
                usuario_id: window.app.usuario.id,
                fecha: fecha,
                peso_kg: pesoKg,
                adherencia_porcentaje: adherencia,
                nota: nota
            });

            if (errHist) throw errHist;

            if (this.perfilActual) {
                await window.db.from('perfiles_nutricionales')
                    .update({ peso_actual_kg: pesoKg })
                    .eq('id', this.perfilActual.id);
            }

            window.ui.mostrarAlerta('✅ Peso registrado', 'success');
            await this.cargar();

        } catch (err) {
            console.error(err);
            window.ui.mostrarAlerta('Error: ' + err.message, 'danger');
            btn.disabled = false;
            btn.textContent = '💾 Registrar pesaje';
        }
    },

    renderHistorial() {
        const cont = document.getElementById('historial-lista');
        if (!cont) return;

        if (this.historial.length === 0) {
            cont.innerHTML = `<div class="empty-state" style="padding:20px;"><p>Aún no has registrado ningún pesaje.</p></div>`;
            return;
        }

        const unidadPeso = window.unidades.etiquetaPeso(this.sistema);

        const filas = this.historial.map((h, idx) => {
            const siguiente = this.historial[idx + 1];
            const pesoDisplay = window.unidades.kgADisplay(h.peso_kg, this.sistema);
            const pesoSiguienteDisplay = siguiente ? window.unidades.kgADisplay(siguiente.peso_kg, this.sistema) : null;
            const diff = pesoSiguienteDisplay !== null ? (pesoDisplay - pesoSiguienteDisplay).toFixed(1) : null;
            const colorDiff = diff > 0 ? '#ef4444' : diff < 0 ? '#10b981' : '#64748b';
            const iconoDiff = diff > 0 ? '↑' : diff < 0 ? '↓' : '=';

            return `
                <div style="display:flex; justify-content:space-between; align-items:center;
                     padding:12px; border-bottom:1px solid var(--color-borde); flex-wrap:wrap; gap:8px;">
                    <div style="flex:1; min-width:150px;">
                        <div style="font-weight:600;">${window.ui.formatearFecha(h.fecha)}</div>
                        ${h.nota ? `<div style="font-size:0.8rem; color:var(--color-texto-secundario); margin-top:2px;">${h.nota}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${h.adherencia_porcentaje ? `<div style="font-size:0.8rem; color:var(--color-texto-secundario);">Adherencia: <strong>${h.adherencia_porcentaje}%</strong></div>` : ''}
                        ${diff !== null ? `<span style="font-size:0.85rem; color:${colorDiff}; font-weight:600;">${iconoDiff} ${Math.abs(diff)} ${unidadPeso}</span>` : ''}
                        <div style="font-size:1.2rem; font-weight:700;">${pesoDisplay} ${unidadPeso}</div>
                        <button onclick="window.progreso.eliminarPesaje('${h.id}')" style="background:none; border:none; cursor:pointer; color:var(--color-peligro); font-size:1rem; padding:4px;" title="Eliminar">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        cont.innerHTML = filas;
    },

    renderGrafico() {
        const cont = document.getElementById('grafico-peso');
        if (!cont) return;

        const datos = [...this.historial].reverse().map(d => ({
            ...d,
            peso_display: window.unidades.kgADisplay(d.peso_kg, this.sistema)
        }));

        const unidadPeso = window.unidades.etiquetaPeso(this.sistema);
        const pesos = datos.map(d => d.peso_display);
        const minPeso = Math.min(...pesos) - 1;
        const maxPeso = Math.max(...pesos) + 1;
        const rango = maxPeso - minPeso || 1;

        const ancho = 600;
        const alto = 200;
        const padding = 30;

        const puntos = datos.map((d, i) => {
            const x = padding + (i / (datos.length - 1 || 1)) * (ancho - padding * 2);
            const y = alto - padding - ((d.peso_display - minPeso) / rango) * (alto - padding * 2);
            return { x, y, peso: d.peso_display, fecha: d.fecha };
        });

        const path = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        let lineaMeta = '';
        if (this.perfilActual?.peso_meta_kg) {
            const metaDisplay = window.unidades.kgADisplay(this.perfilActual.peso_meta_kg, this.sistema);
            if (metaDisplay >= minPeso && metaDisplay <= maxPeso) {
                const yMeta = alto - padding - ((metaDisplay - minPeso) / rango) * (alto - padding * 2);
                lineaMeta = `
                    <line x1="${padding}" y1="${yMeta}" x2="${ancho - padding}" y2="${yMeta}"
                          stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
                    <text x="${ancho - padding}" y="${yMeta - 5}" text-anchor="end"
                          fill="#10b981" font-size="11" font-weight="600">Meta: ${metaDisplay} ${unidadPeso}</text>
                `;
            }
        }

        const circulos = puntos.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#3b82f6" stroke="white" stroke-width="2">
                <title>${p.fecha}: ${p.peso} ${unidadPeso}</title>
            </circle>
        `).join('');

        cont.innerHTML = `
            <div style="overflow-x:auto;">
                <svg viewBox="0 0 ${ancho} ${alto}" style="width:100%; min-width:400px; height:${alto}px;">
                    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${alto - padding}" stroke="#e2e8f0" stroke-width="1"/>
                    <line x1="${padding}" y1="${alto - padding}" x2="${ancho - padding}" y2="${alto - padding}" stroke="#e2e8f0" stroke-width="1"/>
                    <text x="${padding - 5}" y="${padding + 5}" text-anchor="end" fill="#64748b" font-size="10">${maxPeso.toFixed(1)}</text>
                    <text x="${padding - 5}" y="${alto - padding + 3}" text-anchor="end" fill="#64748b" font-size="10">${minPeso.toFixed(1)}</text>
                    ${lineaMeta}
                    <path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
                    ${circulos}
                    <text x="${puntos[0].x}" y="${puntos[0].y - 10}" text-anchor="middle" fill="#3b82f6" font-size="11" font-weight="700">${puntos[0].peso}</text>
                    ${puntos.length > 1 ? `<text x="${puntos[puntos.length-1].x}" y="${puntos[puntos.length-1].y - 10}" text-anchor="middle" fill="#3b82f6" font-size="11" font-weight="700">${puntos[puntos.length-1].peso}</text>` : ''}
                </svg>
            </div>
            <div style="font-size:0.8rem; color:var(--color-texto-secundario); text-align:center; margin-top:8px;">
                ${window.ui.formatearFecha(datos[0].fecha)} → ${window.ui.formatearFecha(datos[datos.length-1].fecha)} · ${datos.length} registros
            </div>
        `;
    },

    renderPlanes() {
        const cont = document.getElementById('planes-lista');
        if (!cont) return;

        const filas = this.planesRecientes.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--color-borde); flex-wrap:wrap; gap:8px;">
                <div>
                    <div style="font-weight:600; font-size:0.9rem;">${window.ui.formatearFecha(p.fecha)}</div>
                    <div style="font-size:0.8rem; color:var(--color-texto-secundario);">TMB: ${p.tmb} · TDEE: ${p.tdee}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--color-primario);">${p.kcal_objetivo} kcal</div>
                    <div style="font-size:0.75rem; color:var(--color-texto-secundario);">P:${p.proteina_g}g · G:${p.grasa_g}g · C:${p.carbo_g}g</div>
                </div>
            </div>
        `).join('');

        cont.innerHTML = filas;
    },

    async eliminarPesaje(id) {
        if (!confirm('¿Eliminar este pesaje?')) return;
        const { error } = await window.db.from('historial_peso').delete().eq('id', id);
        if (error) {
            window.ui.mostrarAlerta('Error: ' + error.message, 'danger');
            return;
        }
        window.ui.mostrarAlerta('🗑️ Pesaje eliminado', 'success');
        await this.cargar();
    }
};

document.addEventListener('cargar:progreso', () => window.progreso.cargar());
