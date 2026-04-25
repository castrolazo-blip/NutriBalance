/* ============================================================
   CLIENTE SUPABASE Y HELPERS - NEW BODY CALCULATOR
   ============================================================ */

// Inicializar cliente Supabase
const { createClient } = window.supabase;
const supabaseClient = createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
);

window.db = supabaseClient;

// ============================================================
// HELPERS DE USUARIO / SESIÓN
// ============================================================
window.dbHelpers = {

    async obtenerUsuarioActual() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    async obtenerPerfilActual() {
        const user = await this.obtenerUsuarioActual();
        if (!user) return null;

        const { data, error } = await supabaseClient
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
        return data;
    },

    async obtenerPerfilNutricional(usuarioId) {
        const { data, error } = await supabaseClient
            .from('perfiles_nutricionales')
            .select('*')
            .eq('usuario_id', usuarioId)
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) console.error('Error perfil nutricional:', error);
        return data;
    },

    async obtenerConfigPreferencias(usuarioId) {
        const { data, error } = await supabaseClient
            .from('configuraciones_preferencias')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) console.error('Error config:', error);
        return data;
    },

    // ============================================================
    // ALIMENTOS
    // ============================================================
    async listarAlimentos(filtros = {}) {
        let query = supabaseClient.from('alimentos').select('*').eq('activo', true);

        if (filtros.categoria) query = query.eq('categoria', filtros.categoria);
        if (filtros.busqueda) query = query.ilike('nombre', `%${filtros.busqueda}%`);

        query = query.order('nombre');

        const { data, error } = await query;
        if (error) console.error('Error listando alimentos:', error);
        return data || [];
    },

    // ============================================================
    // HISTORIAL DE PESO
    // ============================================================
    async obtenerHistorialPeso(usuarioId, limite = 30) {
        const { data, error } = await supabaseClient
            .from('historial_peso')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('fecha', { ascending: false })
            .limit(limite);

        if (error) console.error('Error historial:', error);
        return data || [];
    },

    // ============================================================
    // PLANES GENERADOS
    // ============================================================
    async obtenerPlanesRecientes(usuarioId, limite = 10) {
        const { data, error } = await supabaseClient
            .from('planes_generados')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('fecha', { ascending: false })
            .limit(limite);

        if (error) console.error('Error planes:', error);
        return data || [];
    }
};

// ============================================================
// HELPERS DE UI
// ============================================================
window.ui = {

    mostrarAlerta(mensaje, tipo = 'info', duracion = 3500) {
        const existente = document.querySelector('.toast-alert');
        if (existente) existente.remove();

        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} toast-alert`;
        alerta.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            max-width: 360px;
            box-shadow: var(--sombra-lg);
            animation: slideInRight 0.3s ease;
        `;
        alerta.textContent = mensaje;
        document.body.appendChild(alerta);

        setTimeout(() => {
            alerta.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => alerta.remove(), 300);
        }, duracion);
    },

    mostrarLoading(contenedorId) {
        const cont = document.getElementById(contenedorId);
        if (cont) cont.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    },

    formatearNumero(num, decimales = 0) {
        if (num === null || num === undefined) return '-';
        return Number(num).toLocaleString('es-SV', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        });
    },

    formatearFecha(fecha) {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-SV', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};

// Agregar animaciones en CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
