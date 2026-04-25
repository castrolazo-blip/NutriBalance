/* ============================================================
   MÓDULO M2: AUTENTICACIÓN - LOGIN + REGISTRO LIBRE
   NutriBalance · by Ronald Castro
   ============================================================ */

window.auth = {

    vista: 'login', // 'login' | 'registro' | 'recuperar'

    init() {
        this.renderAuth();
        this.verificarInvitacion();
    },

    // ── Render dinámico del área de auth ─────────────────────
    renderAuth() {
        const card = document.querySelector('.auth-card');
        if (!card) return;

        // Logo + nombre (no tocamos, ya está en index.html)
        // Solo inyectamos el bloque de formulario

        const formArea = document.getElementById('form-login');
        if (!formArea) return;

        if (this.vista === 'login') {
            formArea.innerHTML = `
                <!-- Tabs -->
                <div style="display:flex; gap:0; margin-bottom:20px; border-radius:10px; overflow:hidden; border:1.5px solid var(--color-borde);">
                    <button id="tab-login" class="tab-auth activo" onclick="window.auth.cambiarVista('login')">
                        Ingresar
                    </button>
                    <button id="tab-registro" class="tab-auth" onclick="window.auth.cambiarVista('registro')">
                        Crear cuenta
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" id="login-email" class="form-input" placeholder="tu@correo.com" autocomplete="email">
                </div>
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password">
                </div>
                <button class="btn btn-primary btn-block" id="btn-login">Ingresar</button>
                <p style="text-align:center; margin-top:12px; font-size:0.85rem;">
                    <a id="link-recuperar" style="cursor:pointer; color:var(--color-primario);">¿Olvidaste tu contraseña?</a>
                </p>

                <style>
                    .tab-auth { flex:1; padding:9px; background:var(--color-superficie); border:none; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:inherit; color:var(--color-texto-secundario); transition:var(--transicion); }
                    .tab-auth.activo { background:var(--color-primario); color:white; }
                </style>
            `;
            document.getElementById('btn-login')?.addEventListener('click', () => this.login());
            document.getElementById('login-password')?.addEventListener('keypress', e => { if (e.key === 'Enter') this.login(); });
            document.getElementById('link-recuperar')?.addEventListener('click', () => this.cambiarVista('recuperar'));

        } else if (this.vista === 'registro') {
            formArea.innerHTML = `
                <!-- Tabs -->
                <div style="display:flex; gap:0; margin-bottom:20px; border-radius:10px; overflow:hidden; border:1.5px solid var(--color-borde);">
                    <button class="tab-auth" onclick="window.auth.cambiarVista('login')">Ingresar</button>
                    <button class="tab-auth activo" onclick="window.auth.cambiarVista('registro')">Crear cuenta</button>
                </div>

                <div class="form-group">
                    <label class="form-label">Nombre completo</label>
                    <input type="text" id="reg-nombre" class="form-input" placeholder="Tu nombre" autocomplete="name">
                </div>
                <div class="form-group">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" id="reg-email" class="form-input" placeholder="tu@correo.com" autocomplete="email">
                </div>
                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input type="password" id="reg-password" class="form-input" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label class="form-label">Confirmar contraseña</label>
                    <input type="password" id="reg-password2" class="form-input" placeholder="Repite tu contraseña" autocomplete="new-password">
                </div>
                <button class="btn btn-primary btn-block" id="btn-registro">Crear mi cuenta</button>

                <style>
                    .tab-auth { flex:1; padding:9px; background:var(--color-superficie); border:none; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:inherit; color:var(--color-texto-secundario); transition:var(--transicion); }
                    .tab-auth.activo { background:var(--color-primario); color:white; }
                </style>
            `;
            document.getElementById('btn-registro')?.addEventListener('click', () => this.registrar());
            document.getElementById('reg-password2')?.addEventListener('keypress', e => { if (e.key === 'Enter') this.registrar(); });

        } else if (this.vista === 'recuperar') {
            formArea.innerHTML = `
                <div style="text-align:center; margin-bottom:16px;">
                    <div style="font-size:1.5rem;">🔑</div>
                    <div style="font-weight:700; font-size:1rem; margin-top:4px;">Recuperar contraseña</div>
                    <div style="font-size:0.82rem; color:var(--color-texto-secundario); margin-top:4px;">
                        Te enviaremos un correo para restablecer tu contraseña.
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" id="recuperar-email" class="form-input" placeholder="tu@correo.com">
                </div>
                <button class="btn btn-primary btn-block" id="btn-recuperar">Enviar correo</button>
                <p style="text-align:center; margin-top:12px; font-size:0.85rem;">
                    <a style="cursor:pointer; color:var(--color-primario);" onclick="window.auth.cambiarVista('login')">← Volver al login</a>
                </p>
            `;
            document.getElementById('btn-recuperar')?.addEventListener('click', () => this.recuperarPassword());
        }
    },

    cambiarVista(nueva) {
        this.vista = nueva;
        this.renderAuth();
    },

    // ── Registro ──────────────────────────────────────────────
    async registrar() {
        const nombre = document.getElementById('reg-nombre')?.value.trim();
        const email  = document.getElementById('reg-email')?.value.trim();
        const pass1  = document.getElementById('reg-password')?.value;
        const pass2  = document.getElementById('reg-password2')?.value;

        if (!nombre || !email || !pass1 || !pass2) {
            window.ui.mostrarAlerta('Por favor completa todos los campos', 'warning');
            return;
        }
        if (pass1.length < 6) {
            window.ui.mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }
        if (pass1 !== pass2) {
            window.ui.mostrarAlerta('Las contraseñas no coinciden', 'warning');
            return;
        }

        const btn = document.getElementById('btn-registro');
        btn.disabled = true;
        btn.textContent = 'Creando cuenta...';

        try {
            const { data, error } = await window.db.auth.signUp({
                email,
                password: pass1,
                options: { data: { nombre_completo: nombre } }
            });

            if (error) throw error;

            // Si Supabase tiene confirmación de email activa, avisar
            if (data.user && !data.session) {
                window.ui.mostrarAlerta('✅ Cuenta creada. Revisa tu correo para confirmar.', 'success');
                setTimeout(() => this.cambiarVista('login'), 2000);
                return;
            }

            // Si no requiere confirmación, entra directo
            window.ui.mostrarAlerta('✅ Cuenta creada. ¡Bienvenido!', 'success');
            setTimeout(() => window.location.reload(), 800);

        } catch (err) {
            console.error(err);
            const msg = err.message?.includes('already registered')
                ? 'Este correo ya tiene una cuenta. Usa "Ingresar".'
                : 'Error al crear la cuenta: ' + err.message;
            window.ui.mostrarAlerta(msg, 'danger');
            btn.disabled = false;
            btn.textContent = 'Crear mi cuenta';
        }
    },

    // ── Login ─────────────────────────────────────────────────
    async login() {
        const email    = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            window.ui.mostrarAlerta('Por favor completa todos los campos', 'warning');
            return;
        }

        const btn = document.getElementById('btn-login');
        btn.disabled = true;
        btn.textContent = 'Ingresando...';

        try {
            const { data, error } = await window.db.auth.signInWithPassword({ email, password });

            if (error) {
                window.ui.mostrarAlerta('Correo o contraseña incorrectos', 'danger');
                btn.disabled = false;
                btn.textContent = 'Ingresar';
                return;
            }

            window.ui.mostrarAlerta('¡Bienvenido!', 'success');
            setTimeout(() => window.location.reload(), 600);

        } catch (err) {
            console.error(err);
            window.ui.mostrarAlerta('Error al ingresar', 'danger');
            btn.disabled = false;
            btn.textContent = 'Ingresar';
        }
    },

    // ── Recuperar contraseña ──────────────────────────────────
    async recuperarPassword() {
        const email = document.getElementById('recuperar-email')?.value.trim();

        if (!email) {
            window.ui.mostrarAlerta('Ingresa tu correo', 'warning');
            return;
        }

        const btn = document.getElementById('btn-recuperar');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        const { error } = await window.db.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });

        if (error) {
            window.ui.mostrarAlerta('Error: ' + error.message, 'danger');
            btn.disabled = false;
            btn.textContent = 'Enviar correo';
        } else {
            window.ui.mostrarAlerta('✅ Si tu cuenta existe recibirás el correo en unos minutos.', 'success');
            setTimeout(() => this.cambiarVista('login'), 2500);
        }
    },

    // ── Link de invitación / recuperación por URL ─────────────
    async verificarInvitacion() {
        const hash   = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token  = params.get('access_token');
        const type   = params.get('type');

        if (token && (type === 'invite' || type === 'recovery' || type === 'signup')) {
            const { data, error } = await window.db.auth.setSession({
                access_token:  token,
                refresh_token: params.get('refresh_token') || ''
            });

            if (!error && data.user) {
                window.history.replaceState({}, document.title, window.location.pathname);
                this.mostrarFormPassword(type);
            }
        }
    },

    mostrarFormPassword(tipo) {
        const formArea = document.getElementById('form-login');
        if (!formArea) return;

        formArea.innerHTML = `
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:1.5rem;">${tipo === 'invite' ? '🎉' : '🔑'}</div>
                <div style="font-weight:700; font-size:1rem; margin-top:4px;">
                    ${tipo === 'invite' ? 'Bienvenido a NutriBalance' : 'Nueva contraseña'}
                </div>
                <div style="font-size:0.82rem; color:var(--color-texto-secundario); margin-top:4px;">
                    ${tipo === 'invite' ? 'Define tu contraseña para activar tu cuenta' : 'Ingresa tu nueva contraseña'}
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Nueva contraseña</label>
                <input type="password" id="new-password" class="form-input" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            </div>
            <div class="form-group">
                <label class="form-label">Confirmar contraseña</label>
                <input type="password" id="new-password-confirm" class="form-input" placeholder="Repite la contraseña" autocomplete="new-password">
            </div>
            <button class="btn btn-primary btn-block" id="btn-definir-password">
                ${tipo === 'invite' ? 'Activar mi cuenta' : 'Actualizar contraseña'}
            </button>
        `;

        document.getElementById('btn-definir-password')?.addEventListener('click', () => this.definirPassword());
    },

    async definirPassword() {
        const pass1 = document.getElementById('new-password').value;
        const pass2 = document.getElementById('new-password-confirm').value;

        if (pass1.length < 6) {
            window.ui.mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }
        if (pass1 !== pass2) {
            window.ui.mostrarAlerta('Las contraseñas no coinciden', 'warning');
            return;
        }

        const btn = document.getElementById('btn-definir-password');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const { error } = await window.db.auth.updateUser({ password: pass1 });
            if (error) throw error;
            window.ui.mostrarAlerta('✅ Contraseña establecida. Ingresando...', 'success');
            setTimeout(() => window.location.reload(), 800);
        } catch (err) {
            console.error(err);
            window.ui.mostrarAlerta('Error: ' + err.message, 'danger');
            btn.disabled = false;
            btn.textContent = 'Guardar';
        }
    }
};
