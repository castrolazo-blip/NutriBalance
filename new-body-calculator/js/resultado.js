/* ============================================================
   MÓDULO M5: PANTALLA DE RESULTADO / CALCULADORA
   Tarjetas visuales de TMB, TDEE, calorías objetivo y macros
   + Accordion inline de alimentos por categoría de macro
   ============================================================ */

window.resultado = {

    ultimoCalculo: null,
    perfilActual: null,
    configActual: null,
    alimentosCacheados: null,           // cache para no re-consultar
    accordionAbierto: null,             // 'proteinas' | 'grasas' | 'carbohidratos' | null

    async cargar() {
        const usuarioId = window.app.usuario.id;

        this.perfilActual = await window.dbHelpers.obtenerPerfilNutricional(usuarioId);
        this.configActual = await window.dbHelpers.obtenerConfigPreferencias(usuarioId);

        if (!this.perfilActual) {
            this.renderSinPerfil();
            return;
        }

        this.ultimoCalculo = window.calculo.calcularCompleto(this.perfilActual, this.configActual);
        this.accordionAbierto = null;
        this.render();
        this.configurarEventos();
    },

    renderSinPerfil() {
        document.getElementById('page-calculadora').innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Calculadora</h1>
                <p class="page-subtitle">Cálculo de TMB, TDEE y macronutrientes</p>
            </div>
            <div class="card text-center" style="padding: 40px 20px;">
                <div class="empty-state-icon">📋</div>
                <h3 style="margin-bottom: 8px;">Necesitas completar tu perfil</h3>
                <p style="color: var(--color-texto-secundario); margin-bottom: 20px;">
                    Ingresa tus datos físicos para que podamos calcular tus calorías y macros.
                </p>
                <button class="btn btn-primary" onclick="window.app.navegar('perfil')">
                    Ir a Mi Perfil →
                </button>
            </div>
        `;
    },

    render() {
        const r = this.ultimoCalculo;
        const p = this.perfilActual;

        const metaTexto = {
            'deficit': '📉 Déficit (perder peso)',
            'mantenimiento': '⚖️ Mantenimiento',
            'superavit': '📈 Superávit (ganar peso)'
        }[p.meta] || p.meta;

        const actividadTexto = {
            'sedentario': 'Sedentario',
            'ligero': 'Ligero',
            'moderado': 'Moderado',
            'activo': 'Activo',
            'muy_activo': 'Muy activo'
        }[p.nivel_actividad] || p.nivel_actividad;

        const advertenciaHtml = r.advertencia
            ? `<div class="alert alert-warning">⚠️ ${r.advertencia}</div>`
            : '';

        document.getElementById('page-calculadora').innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Tu Resultado</h1>
                <p class="page-subtitle">Meta: ${metaTexto} · Actividad: ${actividadTexto} · Edad: ${r.edad} años</p>
            </div>

            ${advertenciaHtml}

            <!-- TARJETAS PRINCIPALES -->
            <div class="grid mb-3">
                <div class="stat-card">
                    <div class="stat-label">TMB (Metabolismo basal)</div>
                    <div class="stat-value">${window.ui.formatearNumero(r.tmb)}</div>
                    <div class="stat-unit">kcal/día en reposo</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">TDEE (Gasto total)</div>
                    <div class="stat-value">${window.ui.formatearNumero(r.tdee)}</div>
                    <div class="stat-unit">kcal/día con actividad</div>
                </div>

                <div class="stat-card highlight">
                    <div class="stat-label">CALORÍAS OBJETIVO</div>
                    <div class="stat-value">${window.ui.formatearNumero(r.kcal_objetivo)}</div>
                    <div class="stat-unit">kcal/día para tu meta</div>
                </div>
            </div>

            <!-- MACROS -->
            <div class="card">
                <h3 class="card-title">🥗 Distribución de Macronutrientes</h3>

                <!-- Barra visual de distribución -->
                <div style="display:flex; height:32px; border-radius:8px; overflow:hidden; margin-bottom:20px; background:var(--color-superficie-hover);">
                    <div style="width:${r.porc_proteina}%; background:#ef4444; display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:600;">
                        ${r.porc_proteina > 10 ? r.porc_proteina + '%' : ''}
                    </div>
                    <div style="width:${r.porc_grasa}%; background:#f59e0b; display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:600;">
                        ${r.porc_grasa > 10 ? r.porc_grasa + '%' : ''}
                    </div>
                    <div style="width:${r.porc_carbos}%; background:#10b981; display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:600;">
                        ${r.porc_carbos > 10 ? r.porc_carbos + '%' : ''}
                    </div>
                </div>

                <div class="grid" id="macro-cards-grid">

                    <!-- PROTEÍNA -->
                    <div class="macro-accordion-wrap">
                        <div class="stat-card macro-card-clickable" style="border-left: 4px solid #ef4444; cursor:pointer;"
                             data-macro="proteinas" id="macro-card-proteinas">
                            <div class="stat-label">🥩 Proteína</div>
                            <div class="stat-value">${r.proteina_g}<span style="font-size:1rem; color:var(--color-texto-secundario);"> g</span></div>
                            <div class="stat-unit">${r.kcal_proteina} kcal · ${r.porc_proteina}%</div>
                            <div class="macro-hint">Ver alimentos <span class="macro-arrow" id="arrow-proteinas">▼</span></div>
                        </div>
                        <div class="macro-accordion" id="accordion-proteinas"></div>
                    </div>

                    <!-- GRASA -->
                    <div class="macro-accordion-wrap">
                        <div class="stat-card macro-card-clickable" style="border-left: 4px solid #f59e0b; cursor:pointer;"
                             data-macro="grasas" id="macro-card-grasas">
                            <div class="stat-label">🥑 Grasa</div>
                            <div class="stat-value">${r.grasa_g}<span style="font-size:1rem; color:var(--color-texto-secundario);"> g</span></div>
                            <div class="stat-unit">${r.kcal_grasa} kcal · ${r.porc_grasa}%</div>
                            <div class="macro-hint">Ver alimentos <span class="macro-arrow" id="arrow-grasas">▼</span></div>
                        </div>
                        <div class="macro-accordion" id="accordion-grasas"></div>
                    </div>

                    <!-- CARBOHIDRATOS -->
                    <div class="macro-accordion-wrap">
                        <div class="stat-card macro-card-clickable" style="border-left: 4px solid #10b981; cursor:pointer;"
                             data-macro="carbohidratos" id="macro-card-carbohidratos">
                            <div class="stat-label">🍞 Carbohidratos</div>
                            <div class="stat-value">${r.carbo_g}<span style="font-size:1rem; color:var(--color-texto-secundario);"> g</span></div>
                            <div class="stat-unit">${r.kcal_carbos} kcal · ${r.porc_carbos}%</div>
                            <div class="macro-hint">Ver alimentos <span class="macro-arrow" id="arrow-carbohidratos">▼</span></div>
                        </div>
                        <div class="macro-accordion" id="accordion-carbohidratos"></div>
                    </div>

                </div>
            </div>

            <!-- DETALLES DEL CÁLCULO -->
            <div class="card">
                <h3 class="card-title">📊 Detalle del cálculo</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:0.9rem;">
                    <div><strong>Sexo:</strong> ${p.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                    <div><strong>Edad:</strong> ${r.edad} años</div>
                    <div><strong>Talla:</strong> ${window.unidades.formatearTalla(p.talla_cm, p.sistema_unidades || 'salvadoreno')}</div>
                    <div><strong>Peso actual:</strong> ${window.unidades.formatearPeso(p.peso_actual_kg, p.sistema_unidades || 'salvadoreno')}</div>
                    <div><strong>Peso meta:</strong> ${p.peso_meta_kg ? window.unidades.formatearPeso(p.peso_meta_kg, p.sistema_unidades || 'salvadoreno') : 'No definido'}</div>
                    <div><strong>Fórmula:</strong> Mifflin-St Jeor</div>
                </div>
            </div>

            <!-- ACCIONES -->
            <div class="flex gap-2 mt-3" style="flex-wrap:wrap;">
                <button class="btn btn-primary" id="btn-guardar-calculo">
                    💾 Guardar este cálculo
                </button>
                <button class="btn btn-outline" onclick="window.app.navegar('perfil')">
                    ✏️ Editar perfil
                </button>
                <button class="btn btn-secondary" onclick="window.app.navegar('dieta')">
                    🍽️ Ver dieta sugerida →
                </button>
            </div>

            <!-- AVISO LEGAL -->
            <div class="alert alert-info mt-3">
                <strong>ℹ️ Aviso:</strong> Esta calculadora es una guía orientativa basada en fórmulas estándar.
                No reemplaza la consulta con un profesional de la salud o nutrición.
            </div>

            <style>
                .macro-accordion-wrap {
                    display: flex;
                    flex-direction: column;
                }
                .macro-card-clickable {
                    transition: box-shadow 0.2s, transform 0.15s;
                    user-select: none;
                }
                .macro-card-clickable:hover {
                    box-shadow: var(--sombra-md);
                    transform: translateY(-1px);
                }
                .macro-card-clickable.abierta {
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                }
                .macro-hint {
                    margin-top: 8px;
                    font-size: 0.75rem;
                    color: var(--color-texto-claro);
                    font-weight: 500;
                }
                .macro-arrow {
                    display: inline-block;
                    transition: transform 0.25s;
                    font-size: 0.7rem;
                }
                .macro-arrow.rotada {
                    transform: rotate(180deg);
                }
                .macro-accordion {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.35s ease;
                    border: 1px solid var(--color-borde);
                    border-top: none;
                    border-radius: 0 0 var(--radio-md) var(--radio-md);
                    background: var(--color-superficie);
                }
                .macro-accordion.abierto {
                    max-height: 600px;
                    overflow-y: auto;
                }
                .acord-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--color-borde);
                    font-size: 0.85rem;
                    gap: 8px;
                }
                .acord-item:last-child {
                    border-bottom: none;
                }
                .acord-nombre {
                    font-weight: 600;
                    color: var(--color-texto-principal);
                    flex: 1;
                }
                .acord-porcion {
                    font-size: 0.75rem;
                    color: var(--color-texto-secundario);
                }
                .acord-macros {
                    display: flex;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .acord-badge {
                    padding: 2px 7px;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .acord-loading {
                    padding: 16px;
                    text-align: center;
                    color: var(--color-texto-secundario);
                    font-size: 0.85rem;
                }
                .acord-header {
                    padding: 8px 14px;
                    font-size: 0.75rem;
                    color: var(--color-texto-secundario);
                    background: var(--color-superficie-hover);
                    border-bottom: 1px solid var(--color-borde);
                    display: flex;
                    justify-content: space-between;
                }
            </style>
        `;
    },

    configurarEventos() {
        document.getElementById('btn-guardar-calculo')?.addEventListener('click', () => this.guardarCalculo());

        // Acordeones de macros
        ['proteinas', 'grasas', 'carbohidratos'].forEach(macro => {
            document.getElementById(`macro-card-${macro}`)?.addEventListener('click', () => {
                this.toggleAccordion(macro);
            });
        });
    },

    async toggleAccordion(macro) {
        const acordeon   = document.getElementById(`accordion-${macro}`);
        const arrow      = document.getElementById(`arrow-${macro}`);
        const card       = document.getElementById(`macro-card-${macro}`);
        const estaAbierto = acordeon.classList.contains('abierto');

        // Cerrar todos primero
        ['proteinas', 'grasas', 'carbohidratos'].forEach(m => {
            document.getElementById(`accordion-${m}`)?.classList.remove('abierto');
            document.getElementById(`arrow-${m}`)?.classList.remove('rotada');
            document.getElementById(`macro-card-${m}`)?.classList.remove('abierta');
        });

        // Si estaba cerrado, abrirlo
        if (!estaAbierto) {
            acordeon.classList.add('abierto');
            arrow.classList.add('rotada');
            card.classList.add('abierta');

            // Cargar contenido si está vacío
            if (!acordeon.innerHTML.trim()) {
                acordeon.innerHTML = `<div class="acord-loading">⏳ Cargando alimentos...</div>`;
                await this.cargarAlimentosEnAccordion(macro, acordeon);
            }
        }
    },

    async cargarAlimentosEnAccordion(macro, contenedor) {
        // Mapeo de macro → categoría de la BD
        const categoriaMap = {
            'proteinas':     'proteinas',
            'grasas':        'grasas',
            'carbohidratos': 'carbohidratos'
        };

        const colores = {
            'proteinas':     { bg: '#fee2e2', text: '#991b1b', macro: 'prot' },
            'grasas':        { bg: '#fef3c7', text: '#92400e', macro: 'grasa' },
            'carbohidratos': { bg: '#d1fae5', text: '#065f46', macro: 'carb' }
        };

        try {
            // Usar caché si ya se cargaron
            if (!this.alimentosCacheados) {
                this.alimentosCacheados = await window.dbHelpers.listarAlimentos();
            }

            const categoria = categoriaMap[macro];
            const lista = this.alimentosCacheados.filter(a => a.categoria === categoria);
            const col   = colores[macro];

            if (lista.length === 0) {
                contenedor.innerHTML = `<div class="acord-loading">No hay alimentos en esta categoría.</div>`;
                return;
            }

            const nombresMacro = {
                'proteinas':     'Proteínas',
                'grasas':        'Grasas',
                'carbohidratos': 'Carbohidratos'
            };

            const items = lista.map(a => {
                const porcion = a.porcion_descripcion || `${a.porcion_base_g}g`;
                return `
                    <div class="acord-item">
                        <div>
                            <div class="acord-nombre">${a.nombre}</div>
                            <div class="acord-porcion">${porcion}</div>
                        </div>
                        <div class="acord-macros">
                            <span class="acord-badge" style="background:#fef3c7; color:#92400e;">${a.kcal} kcal</span>
                            <span class="acord-badge" style="background:${col.bg}; color:${col.text};">
                                ${col.macro === 'prot' ? a.proteina_g + 'g P' : col.macro === 'grasa' ? a.grasa_g + 'g G' : a.carbo_g + 'g C'}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            contenedor.innerHTML = `
                <div class="acord-header">
                    <span>${nombresMacro[macro]} · ${lista.length} alimentos</span>
                    <span style="font-size:0.7rem; color:var(--color-primario); cursor:pointer;"
                          onclick="window.app.navegar('alimentos')">
                        Ver catálogo completo →
                    </span>
                </div>
                ${items}
            `;

        } catch (err) {
            console.error('Error cargando alimentos accordion:', err);
            contenedor.innerHTML = `<div class="acord-loading">⚠️ Error al cargar alimentos.</div>`;
        }
    },

    async guardarCalculo() {
        if (!this.ultimoCalculo) return;

        const btn = document.getElementById('btn-guardar-calculo');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const plan = await window.calculo.guardarPlan(window.app.usuario.id, this.ultimoCalculo);

        if (plan) {
            window.ui.mostrarAlerta('✅ Cálculo guardado en tu historial', 'success');
            btn.textContent = '✅ Guardado';
        } else {
            window.ui.mostrarAlerta('Error al guardar el cálculo', 'danger');
            btn.disabled = false;
            btn.textContent = '💾 Guardar este cálculo';
        }
    }
};

document.addEventListener('cargar:calculadora', () => window.resultado.cargar());
