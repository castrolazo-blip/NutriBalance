/* ============================================================
   APP PRINCIPAL - ROUTER Y NAVEGACIÓN
   ============================================================ */

window.app = {
    paginaActual: 'inicio',
    usuario: null,

    async init() {
        // Verificar sesión
        const user = await window.dbHelpers.obtenerUsuarioActual();

        if (!user) {
            this.mostrarAuth();
            return;
        }

        this.usuario = user;
        await this.mostrarApp();
    },

    mostrarAuth() {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
        if (window.auth) window.auth.init();
    },

    async mostrarApp() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');

        // Cargar perfil
        const perfil = await window.dbHelpers.obtenerPerfilActual();
        if (perfil) {
            document.getElementById('user-name').textContent = perfil.nombre;

            // Mostrar menú admin si el usuario es admin
            if (perfil.rol === 'admin') {
                document.getElementById('nav-admin').style.display = 'block';
            }
        }

        // Mostrar inicio por defecto (o perfil si es primera vez)
        const perfilNutri = await window.dbHelpers.obtenerPerfilNutricional(this.usuario.id);
        if (!perfilNutri) {
            this.navegar('perfil');
            window.ui.mostrarAlerta('Completa tu perfil para comenzar', 'info');
        } else {
            this.navegar('inicio');
        }

        this.configurarEventos();
    },

    navegar(pagina) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Mostrar la página solicitada
        const pageEl = document.getElementById(`page-${pagina}`);
        if (pageEl) pageEl.classList.add('active');

        // Actualizar nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navEl = document.querySelector(`.nav-item[data-page="${pagina}"]`);
        if (navEl) navEl.classList.add('active');

        this.paginaActual = pagina;

        // Cerrar sidebar en mobile
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');

        // Disparar evento de carga de cada módulo
        const eventoCarga = `cargar:${pagina}`;
        document.dispatchEvent(new CustomEvent(eventoCarga));
    },

    configurarEventos() {
        // Click en items del menú
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const pagina = item.dataset.page;
                if (pagina) this.navegar(pagina);
            });
        });

        // Toggle sidebar en mobile
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('overlay').classList.toggle('active');
        });

        document.getElementById('overlay')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
        });

        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', async () => {
            await window.db.auth.signOut();
            window.location.reload();
        });
    }
};

// Iniciar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
