/* ============================================================
   PANEL ADMIN: GESTIÓN DE ALIMENTOS
   Agregar, editar, activar/desactivar alimentos (solo admin)
   ============================================================ */

window.adminAlimentos = {

    listaCompleta: [],
    listaFiltrada: [],
    alimentoEditando: null,
    busqueda: '',
    filtroCategoria: 'todas',

    CATEGORIAS: ['proteinas', 'carbohidratos', 'grasas', 'vegetales', 'frutas', 'combinados', 'bebidas'],

    async cargar() {
        this.renderShell();
        await this.cargarAlimentos();
    },

    renderShell() {
        document.getElementById('page-admin-alimentos').innerHTML = `
            <div class="page-header">
                <div class="flex-between" style="flex-wrap:wrap; gap:12px;">
                    <div>
                        <h1 class="page-title">Gestionar Alimentos</h1>
                        <p class="page-subtitle">Panel de administración</p>
                    </div>
                    <button class="btn btn-primary" id="btn-nuevo-alimento">
                        ➕ Nuevo alimento
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" id="admin-busqueda" class="form-input"
                               placeholder="🔍 Buscar por nombre o código...">
                    </div>
                    <div class="form-group">
                        <select id="admin-filtro-categoria" class="form-select">
                            <option value="todas">Todas las categorías</option>
                            <option value="proteinas">Proteínas</option>
                            <option value="carbohidratos">Carbohidratos</option>
                            <option value="grasas">Grasas</option>
                            <option value="vegetales">Vegetales</option>
                            <option value="frutas">Frutas</option>
                            <option value="combinados">Combinados</option>
                            <option value="bebidas">Bebidas</option>
                        </select>
                    </div>
                </div>
                <div style="font-size:0.85rem; color:var(--color-texto-secundario);" id="admin-resumen"></div>
            </div>

            <div id="admin-lista-alimentos">
                <div class="loading"><div class="spinner"></div></div>
            </div>

            <!-- Modal de edición -->
            <div id="admin-modal" class="hidden" style="
                position:fixed; inset:0; background:rgba(0,0,0,0.5);
                z-index:1000; display:flex; align-items:center;
                justify-content:center; padding:20px; overflow-y:auto;
            ">
                <div style="
                    background:white; border-radius:var(--radio-lg);
                    padding:24px; max-width:700px; width:100%;
                    max-height:90vh; overflow-y:auto; box-shadow:var(--sombra-xl);
                ">
                    <div class="flex-between mb-2">
                        <h2 id="modal-titulo" style="font-size:1.3rem; font-weight:700;">Nuevo alimento</h2>
                        <button onclick="window.adminAlimentos.cerrarModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                    </div>
                    <div id="modal-body"></div>
                </div>
            </div>

            <style>
                .admin-tabla {
                    width:100%; border-collapse:collapse; font-size:0.9rem;
                }
                .admin-tabla th {
                    text-align:left; padding:10px; background:var(--color-superficie-hover);
                    font-size:0.8rem; text-transform:uppercase;
                    color:var(--color-texto-secundario); font-weight:600;
                }
                .admin-tabla td {
                    padding:10px; border-bottom:1px solid var(--color-borde);
                }
                .admin-tabla tr:hover { background:var(--color-superficie-hover); }
                .admin-acciones { display:flex; gap:6px; }
                .admin-btn-icono {
                    background:none; border:1px solid var(--color-borde);
                    padding:4px 8px; border-radius:var(--radio-sm);
                    cursor:pointer; font-size:0.85rem;
                }
                .admin-btn-icono:hover { background:var(--color-superficie-hover); }
                @media (max-width: 768px) {
                    .admin-tabla th.desktop-only,
                    .admin-tabla td.desktop-only { display:none; }
                }
            </style>
        `;

        // Eventos
        document.getElementById('btn-nuevo-alimento').addEventListener('click', () => this.abrirModal(null));
        document.getElementById('admin-busqueda').addEventListener('input', (e) => {
            this.busqueda = e.target.value.toLowerCase();
            this.filtrarYRenderizar();
        });
        document.getElementById('admin-filtro-categoria').addEventListener('change', (e) => {
            this.filtroCategoria = e.target.value;
            this.filtrarYRenderizar();
        });
    },

    async cargarAlimentos() {
        const { data, error } = await window.db
            .from('alimentos')
            .select('*')
            .order('categoria')
            .order('nombre');

        if (error) {
            window.ui.mostrarAlerta('Error cargando alimentos', 'danger');
            return;
        }

        this.listaCompleta = data || [];
        this.filtrarYRenderizar();
    },

    filtrarYRenderizar() {
        let lista = [...this.listaCompleta];

        if (this.filtroCategoria !== 'todas') {
            lista = lista.filter(a => a.categoria === this.filtroCategoria);
        }

        if (this.busqueda) {
            lista = lista.filter(a =>
                a.nombre.toLowerCase().includes(this.busqueda) ||
                (a.codigo && a.codigo.toLowerCase().includes(this.busqueda))
            );
        }

        this.listaFiltrada = lista;
        this.renderLista();
    },

    renderLista() {
        const cont = document.getElementById('admin-lista-alimentos');
        const resumen = document.getElementById('admin-resumen');

        resumen.textContent = `${this.listaFiltrada.length} de ${this.listaCompleta.length} alimentos`;

        if (this.listaFiltrada.length === 0) {
            cont.innerHTML = '<div class="empty-state"><p>No hay alimentos que coincidan.</p></div>';
            return;
        }

        const filas = this.listaFiltrada.map(a => `
            <tr>
                <td><strong>${a.codigo}</strong></td>
                <td>
                    ${a.nombre}
                    <div style="font-size:0.75rem; color:var(--color-texto-claro);">${a.porcion_descripcion || a.porcion_base_g + 'g'}</div>
                </td>
                <td><span class="badge badge-secondary">${a.categoria}</span></td>
                <td class="desktop-only">${a.kcal}</td>
                <td class="desktop-only">${a.proteina_g}g</td>
                <td class="desktop-only">${a.grasa_g}g</td>
                <td class="desktop-only">${a.carbo_g}g</td>
                <td>
                    ${a.activo
                        ? '<span class="badge badge-success">Activo</span>'
                        : '<span class="badge" style="background:#e5e7eb; color:#6b7280;">Inactivo</span>'}
                </td>
                <td>
                    <div class="admin-acciones">
                        <button class="admin-btn-icono" onclick="window.adminAlimentos.abrirModal('${a.id}')" title="Editar">✏️</button>
                        <button class="admin-btn-icono" onclick="window.adminAlimentos.toggleActivo('${a.id}', ${!a.activo})" title="${a.activo ? 'Desactivar' : 'Activar'}">
                            ${a.activo ? '🚫' : '✅'}
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        cont.innerHTML = `
            <div class="card" style="padding:0; overflow-x:auto;">
                <table class="admin-tabla">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th class="desktop-only">Kcal</th>
                            <th class="desktop-only">Prot</th>
                            <th class="desktop-only">Grasa</th>
                            <th class="desktop-only">Carb</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>
        `;
    },

    abrirModal(alimentoId) {
        const alimento = alimentoId
            ? this.listaCompleta.find(a => a.id === alimentoId)
            : null;

        this.alimentoEditando = alimento;

        document.getElementById('modal-titulo').textContent = alimento ? 'Editar alimento' : 'Nuevo alimento';

        const a = alimento || {};

        document.getElementById('modal-body').innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Código *</label>
                    <input type="text" id="mod-codigo" class="form-input" value="${a.codigo || this.generarCodigo()}" ${alimento ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label class="form-label">Categoría *</label>
                    <select id="mod-categoria" class="form-select">
                        ${this.CATEGORIAS.map(c => `<option value="${c}" ${a.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" id="mod-nombre" class="form-input" value="${a.nombre || ''}" placeholder="Ej: Pechuga de pollo">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Subcategoría</label>
                    <input type="text" id="mod-subcategoria" class="form-input" value="${a.subcategoria || ''}" placeholder="Ej: aves, legumbres">
                </div>
                <div class="form-group">
                    <label class="form-label">Porción base (g) *</label>
                    <input type="number" id="mod-porcion" class="form-input" step="0.1" value="${a.porcion_base_g || 100}">
                </div>
                <div class="form-group">
                    <label class="form-label">Descripción de porción</label>
                    <input type="text" id="mod-porcion-desc" class="form-input" value="${a.porcion_descripcion || ''}" placeholder="Ej: 100g cocido">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Kcal *</label>
                    <input type="number" id="mod-kcal" class="form-input" step="0.1" value="${a.kcal || 0}">
                </div>
                <div class="form-group">
                    <label class="form-label">Proteína (g) *</label>
                    <input type="number" id="mod-proteina" class="form-input" step="0.1" value="${a.proteina_g || 0}">
                </div>
                <div class="form-group">
                    <label class="form-label">Grasa (g) *</label>
                    <input type="number" id="mod-grasa" class="form-input" step="0.1" value="${a.grasa_g || 0}">
                </div>
                <div class="form-group">
                    <label class="form-label">Carbos (g) *</label>
                    <input type="number" id="mod-carbo" class="form-input" step="0.1" value="${a.carbo_g || 0}">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Fibra (g)</label>
                    <input type="number" id="mod-fibra" class="form-input" step="0.1" value="${a.fibra_g || 0}">
                </div>
                <div class="form-group">
                    <label class="form-label">Unidad hogar</label>
                    <input type="text" id="mod-unidad" class="form-input" value="${a.unidad_hogar || ''}" placeholder="Ej: 1 taza, 2 cdas">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Etiquetas (separadas por coma)</label>
                <input type="text" id="mod-etiquetas" class="form-input"
                       value="${(a.etiquetas || []).join(', ')}"
                       placeholder="Ej: economico, tradicional, alta_proteina">
            </div>

            <div class="form-group">
                <label class="form-label">
                    <input type="checkbox" id="mod-activo" ${a.activo !== false ? 'checked' : ''}>
                    Alimento activo
                </label>
            </div>

            <div class="flex gap-2 mt-3" style="flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.adminAlimentos.guardar()">
                    💾 ${alimento ? 'Guardar cambios' : 'Crear alimento'}
                </button>
                ${alimento ? `
                    <button class="btn btn-danger" onclick="window.adminAlimentos.eliminar('${alimento.id}')">
                        🗑️ Eliminar
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="window.adminAlimentos.cerrarModal()">
                    Cancelar
                </button>
            </div>
        `;

        document.getElementById('admin-modal').classList.remove('hidden');
    },

    cerrarModal() {
        document.getElementById('admin-modal').classList.add('hidden');
        this.alimentoEditando = null;
    },

    generarCodigo() {
        // Genera próximo código A-XXXX
        let max = 0;
        this.listaCompleta.forEach(a => {
            const m = a.codigo?.match(/A-(\d+)/);
            if (m) max = Math.max(max, parseInt(m[1]));
        });
        return 'A-' + String(max + 1).padStart(4, '0');
    },

    async guardar() {
        const datos = {
            codigo: document.getElementById('mod-codigo').value.trim(),
            nombre: document.getElementById('mod-nombre').value.trim(),
            categoria: document.getElementById('mod-categoria').value,
            subcategoria: document.getElementById('mod-subcategoria').value.trim() || null,
            porcion_base_g: parseFloat(document.getElementById('mod-porcion').value),
            porcion_descripcion: document.getElementById('mod-porcion-desc').value.trim() || null,
            kcal: parseFloat(document.getElementById('mod-kcal').value),
            proteina_g: parseFloat(document.getElementById('mod-proteina').value),
            grasa_g: parseFloat(document.getElementById('mod-grasa').value),
            carbo_g: parseFloat(document.getElementById('mod-carbo').value),
            fibra_g: parseFloat(document.getElementById('mod-fibra').value) || 0,
            unidad_hogar: document.getElementById('mod-unidad').value.trim() || null,
            etiquetas: document.getElementById('mod-etiquetas').value
                .split(',').map(s => s.trim()).filter(Boolean),
            activo: document.getElementById('mod-activo').checked
        };

        if (!datos.nombre || !datos.codigo) {
            window.ui.mostrarAlerta('Completa código y nombre', 'warning');
            return;
        }

        try {
            let res;
            if (this.alimentoEditando) {
                res = await window.db.from('alimentos')
                    .update(datos)
                    .eq('id', this.alimentoEditando.id);
            } else {
                res = await window.db.from('alimentos').insert(datos);
            }

            if (res.error) throw res.error;

            window.ui.mostrarAlerta('✅ Alimento guardado', 'success');
            this.cerrarModal();
            await this.cargarAlimentos();

        } catch (err) {
            console.error(err);
            window.ui.mostrarAlerta('Error: ' + err.message, 'danger');
        }
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este alimento? Esta acción no se puede deshacer.')) return;

        const { error } = await window.db.from('alimentos').delete().eq('id', id);
        if (error) {
            window.ui.mostrarAlerta('Error eliminando: ' + error.message, 'danger');
            return;
        }

        window.ui.mostrarAlerta('🗑️ Alimento eliminado', 'success');
        this.cerrarModal();
        await this.cargarAlimentos();
    },

    async toggleActivo(id, nuevoEstado) {
        const { error } = await window.db.from('alimentos')
            .update({ activo: nuevoEstado })
            .eq('id', id);

        if (error) {
            window.ui.mostrarAlerta('Error: ' + error.message, 'danger');
            return;
        }

        window.ui.mostrarAlerta(nuevoEstado ? '✅ Activado' : '🚫 Desactivado', 'success');
        await this.cargarAlimentos();
    }
};

document.addEventListener('cargar:admin-alimentos', () => window.adminAlimentos.cargar());
