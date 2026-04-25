/* ============================================================
   MÓDULO M6: CATÁLOGO PÚBLICO DE ALIMENTOS
   Búsqueda, filtros por categoría y visualización
   ============================================================ */

window.alimentos = {

    listaCompleta: [],
    listaFiltrada: [],
    categoriaActiva: 'todas',
    terminoBusqueda: '',

    CATEGORIAS: [
        { codigo: 'todas', nombre: '🍽️ Todos', icono: '🍽️' },
        { codigo: 'proteinas', nombre: '🥩 Proteínas', icono: '🥩' },
        { codigo: 'carbohidratos', nombre: '🍞 Carbohidratos', icono: '🍞' },
        { codigo: 'grasas', nombre: '🥑 Grasas', icono: '🥑' },
        { codigo: 'vegetales', nombre: '🥬 Vegetales', icono: '🥬' },
        { codigo: 'frutas', nombre: '🍎 Frutas', icono: '🍎' },
        { codigo: 'combinados', nombre: '🫓 Combinados', icono: '🫓' },
        { codigo: 'bebidas', nombre: '🥤 Bebidas', icono: '🥤' }
    ],

    async cargar() {
        this.renderShell();
        await this.cargarAlimentos();
    },

    renderShell() {
        const filtrosHtml = this.CATEGORIAS.map(cat => `
            <button class="btn-categoria ${cat.codigo === this.categoriaActiva ? 'activa' : ''}"
                    data-categoria="${cat.codigo}">
                ${cat.nombre}
            </button>
        `).join('');

        document.getElementById('page-alimentos').innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Catálogo de Alimentos</h1>
                <p class="page-subtitle">Consulta la información nutricional de cada alimento</p>
            </div>

            <div class="card">
                <div class="form-group mb-2">
                    <input type="text" id="alimentos-busqueda" class="form-input"
                           placeholder="🔍 Buscar alimento (ej: pollo, arroz, pupusa...)">
                </div>

                <div class="filtros-categorias" id="filtros-categorias">
                    ${filtrosHtml}
                </div>

                <div style="margin-top:12px; font-size:0.85rem; color:var(--color-texto-secundario);" id="alimentos-resumen">
                    Cargando...
                </div>
            </div>

            <div id="alimentos-lista">
                <div class="loading"><div class="spinner"></div></div>
            </div>

            <style>
                .filtros-categorias {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .btn-categoria {
                    padding: 6px 14px;
                    border-radius: 999px;
                    border: 1.5px solid var(--color-borde);
                    background: var(--color-superficie);
                    color: var(--color-texto-secundario);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transicion);
                    font-family: inherit;
                    white-space: nowrap;
                }
                .btn-categoria:hover {
                    background: var(--color-superficie-hover);
                }
                .btn-categoria.activa {
                    background: var(--color-primario);
                    color: white;
                    border-color: var(--color-primario);
                }
                .alimento-card {
                    background: var(--color-superficie);
                    border-radius: var(--radio-md);
                    padding: 14px;
                    border: 1px solid var(--color-borde);
                    transition: var(--transicion);
                }
                .alimento-card:hover {
                    box-shadow: var(--sombra-md);
                    transform: translateY(-1px);
                }
                .alimento-nombre {
                    font-weight: 600;
                    font-size: 1rem;
                    color: var(--color-texto-principal);
                    margin-bottom: 4px;
                }
                .alimento-porcion {
                    font-size: 0.8rem;
                    color: var(--color-texto-secundario);
                    margin-bottom: 10px;
                }
                .alimento-nutrientes {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                    font-size: 0.8rem;
                }
                .alimento-nutriente {
                    text-align: center;
                    padding: 4px;
                    background: var(--color-superficie-hover);
                    border-radius: 6px;
                }
                .alimento-nutriente-valor {
                    font-weight: 700;
                    color: var(--color-texto-principal);
                    display: block;
                }
                .alimento-nutriente-label {
                    color: var(--color-texto-claro);
                    font-size: 0.7rem;
                    text-transform: uppercase;
                }
                .alimento-etiquetas {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }
            </style>
        `;

        // Eventos
        document.getElementById('alimentos-busqueda').addEventListener('input', (e) => {
            this.terminoBusqueda = e.target.value.toLowerCase();
            this.filtrarYRenderizar();
        });

        document.querySelectorAll('.btn-categoria').forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoriaActiva = btn.dataset.categoria;
                document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('activa'));
                btn.classList.add('activa');
                this.filtrarYRenderizar();
            });
        });
    },

    async cargarAlimentos() {
        this.listaCompleta = await window.dbHelpers.listarAlimentos();
        this.filtrarYRenderizar();
    },

    filtrarYRenderizar() {
        let lista = [...this.listaCompleta];

        // Filtro por categoría
        if (this.categoriaActiva !== 'todas') {
            lista = lista.filter(a => a.categoria === this.categoriaActiva);
        }

        // Filtro por búsqueda
        if (this.terminoBusqueda) {
            lista = lista.filter(a =>
                a.nombre.toLowerCase().includes(this.terminoBusqueda) ||
                (a.subcategoria && a.subcategoria.toLowerCase().includes(this.terminoBusqueda))
            );
        }

        this.listaFiltrada = lista;
        this.render();
    },

    render() {
        const cont = document.getElementById('alimentos-lista');
        const resumen = document.getElementById('alimentos-resumen');

        resumen.textContent = `Mostrando ${this.listaFiltrada.length} de ${this.listaCompleta.length} alimentos`;

        if (this.listaFiltrada.length === 0) {
            cont.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No se encontraron alimentos con ese criterio.</p>
                </div>
            `;
            return;
        }

        const html = this.listaFiltrada.map(a => {
            const etiquetasHtml = (a.etiquetas || []).slice(0, 3).map(e =>
                `<span class="badge badge-secondary" style="font-size:0.7rem;">${e.replace(/_/g, ' ')}</span>`
            ).join('');

            return `
                <div class="alimento-card">
                    <div class="alimento-nombre">${a.nombre}</div>
                    <div class="alimento-porcion">${a.porcion_descripcion || `${a.porcion_base_g}g`}${a.unidad_hogar ? ` · ${a.unidad_hogar}` : ''}</div>
                    <div class="alimento-nutrientes">
                        <div class="alimento-nutriente" style="background:#fef3c7;">
                            <span class="alimento-nutriente-valor">${a.kcal}</span>
                            <span class="alimento-nutriente-label">kcal</span>
                        </div>
                        <div class="alimento-nutriente" style="background:#fee2e2;">
                            <span class="alimento-nutriente-valor">${a.proteina_g}g</span>
                            <span class="alimento-nutriente-label">Prot</span>
                        </div>
                        <div class="alimento-nutriente" style="background:#fef3c7;">
                            <span class="alimento-nutriente-valor">${a.grasa_g}g</span>
                            <span class="alimento-nutriente-label">Grasa</span>
                        </div>
                        <div class="alimento-nutriente" style="background:#d1fae5;">
                            <span class="alimento-nutriente-valor">${a.carbo_g}g</span>
                            <span class="alimento-nutriente-label">Carb</span>
                        </div>
                    </div>
                    ${etiquetasHtml ? `<div class="alimento-etiquetas">${etiquetasHtml}</div>` : ''}
                </div>
            `;
        }).join('');

        cont.innerHTML = `<div class="grid">${html}</div>`;
    }
};

document.addEventListener('cargar:alimentos', () => window.alimentos.cargar());
