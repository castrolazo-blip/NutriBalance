/* ============================================================
   MÓDULO: DASHBOARD DE INICIO
   Muestra resumen del estado del usuario
   ============================================================ */

window.inicio = {

    async cargar() {
        const usuarioId = window.app.usuario.id;

        const [perfilNutri, planesRecientes, historialPeso] = await Promise.all([
            window.dbHelpers.obtenerPerfilNutricional(usuarioId),
            window.dbHelpers.obtenerPlanesRecientes(usuarioId, 1),
            window.dbHelpers.obtenerHistorialPeso(usuarioId, 1)
        ]);

        const nombre = (await window.dbHelpers.obtenerPerfilActual())?.nombre || 'Usuario';

        // Tarjeta 1: Último cálculo
        let htmlCalculo;
        if (planesRecientes.length > 0) {
            const p = planesRecientes[0];
            htmlCalculo = `
                <div style="font-size:2rem; font-weight:800; color:var(--color-primario); line-height:1;">
                    ${window.ui.formatearNumero(p.kcal_objetivo)}
                    <span style="font-size:0.9rem; color:var(--color-texto-secundario); font-weight:500;">kcal/día</span>
                </div>
                <div style="font-size:0.85rem; color:var(--color-texto-secundario); margin-top:4px;">
                    P: ${p.proteina_g}g · G: ${p.grasa_g}g · C: ${p.carbo_g}g
                </div>
                <div style="font-size:0.8rem; color:var(--color-texto-claro); margin-top:6px;">
                    ${window.ui.formatearFecha(p.fecha)}
                </div>
                <button class="btn btn-outline mt-2" onclick="window.app.navegar('calculadora')">Ver detalle</button>
            `;
        } else if (perfilNutri) {
            htmlCalculo = `
                <p style="color:var(--color-texto-secundario); font-size:0.9rem;">Tu perfil está listo. Calcula tus calorías ahora.</p>
                <button class="btn btn-primary mt-2" onclick="window.app.navegar('calculadora')">Calcular ahora</button>
            `;
        } else {
            htmlCalculo = `
                <p style="color:var(--color-texto-secundario); font-size:0.9rem;">Aún no has realizado ningún cálculo.</p>
                <button class="btn btn-primary mt-2" onclick="window.app.navegar('perfil')">Empezar</button>
            `;
        }
        document.getElementById('inicio-ultimo-calculo').innerHTML = htmlCalculo;

        // Tarjeta 2: Peso actual
        let htmlPeso;
        const pesoMostrarKg = historialPeso[0]?.peso_kg || perfilNutri?.peso_actual_kg;
        const sistema = perfilNutri?.sistema_unidades || 'salvadoreno';
        const unidadPeso = window.unidades.etiquetaPeso(sistema);

        if (pesoMostrarKg) {
            const pesoDisplay = window.unidades.kgADisplay(pesoMostrarKg, sistema);
            const fechaPeso = historialPeso[0]?.fecha || perfilNutri?.created_at;
            const pesoMetaDisplay = perfilNutri?.peso_meta_kg
                ? window.unidades.kgADisplay(perfilNutri.peso_meta_kg, sistema) : null;
            const diffDisplay = pesoMetaDisplay ? (pesoMetaDisplay - pesoDisplay).toFixed(1) : null;

            htmlPeso = `
                <div style="font-size:2rem; font-weight:800; color:var(--color-texto-principal); line-height:1;">
                    ${pesoDisplay}
                    <span style="font-size:0.9rem; color:var(--color-texto-secundario); font-weight:500;">${unidadPeso}</span>
                </div>
                ${pesoMetaDisplay ? `
                    <div style="font-size:0.85rem; color:var(--color-texto-secundario); margin-top:4px;">
                        Meta: ${pesoMetaDisplay} ${unidadPeso} (${Math.abs(diffDisplay)} ${unidadPeso} ${diffDisplay > 0 ? 'por ganar' : 'por perder'})
                    </div>
                ` : ''}
                <div style="font-size:0.8rem; color:var(--color-texto-claro); margin-top:6px;">
                    ${window.ui.formatearFecha(fechaPeso)}
                </div>
                <button class="btn btn-outline mt-2" onclick="window.app.navegar('progreso')">Ver progreso</button>
            `;
        } else {
            htmlPeso = `
                <p style="color:var(--color-texto-secundario); font-size:0.9rem;">Registra tu peso para ver tu progreso.</p>
                <button class="btn btn-outline mt-2" onclick="window.app.navegar('perfil')">Ingresar peso</button>
            `;
        }
        document.getElementById('inicio-peso-actual').innerHTML = htmlPeso;

        // Tarjeta 3: Dieta
        document.getElementById('inicio-dieta').innerHTML = `
            <p style="color:var(--color-texto-secundario); font-size:0.9rem;">
                Genera tu plan alimentario automático basado en tus macros y preferencias.
            </p>
            <button class="btn btn-outline mt-2" onclick="window.app.navegar('dieta')">
                🍽️ Generar dieta
            </button>
        `;

        // Mostrar/ocultar alerta de "primera vez"
        const alertaPrimera = document.querySelector('#page-inicio .alert-info');
        if (alertaPrimera && perfilNutri) {
            alertaPrimera.style.display = 'none';
        }

        // Actualizar título de bienvenida
        const titulo = document.querySelector('#page-inicio .page-title');
        if (titulo && nombre) {
            titulo.textContent = `Hola, ${nombre.split(' ')[0]} 👋`;
        }
    }
};

document.addEventListener('cargar:inicio', () => window.inicio.cargar());
