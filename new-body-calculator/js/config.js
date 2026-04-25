/* ============================================================
   CONFIGURACIÓN - NEW BODY CALCULATOR
   ============================================================
   Credenciales de Supabase configuradas para el proyecto
   new-body-calculator (RONALD CASTRO)
   ============================================================ */

window.APP_CONFIG = {
    SUPABASE_URL: 'https://rpdoacfxuizpgdpnfklq.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZG9hY2Z4dWl6cGdkcG5ma2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTIzNjksImV4cCI6MjA5MjM4ODM2OX0.ZLGRkTFGZcdaZMzOjQbj4IjH8-cBFg9Eir8Ye-rhUTE',

    APP_NAME: 'New Body Calculator',
    APP_VERSION: '1.0.0',

    // Factores de actividad (TDEE)
    FACTORES_ACTIVIDAD: {
        sedentario: 1.2,
        ligero: 1.375,
        moderado: 1.55,
        activo: 1.725,
        muy_activo: 1.9
    },

    // Valores por defecto
    DEFAULTS: {
        proteina_g_kg: 2.2,
        grasa_g_kg: 0.9,
        porcentaje_deficit: 10,
        num_comidas: 4
    }
};
