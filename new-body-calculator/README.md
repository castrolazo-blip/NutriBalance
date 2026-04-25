# New Body Calculator - M1 (Base + Auth)

App de cálculo de calorías, macronutrientes y dieta sugerida.

## Estado actual: Módulo M1 (Base) + M2 (Autenticación)

✅ Shell responsivo (mobile, tablet, desktop)
✅ Esquema de base de datos Supabase completo (10 tablas)
✅ Sistema de autenticación (login + registro)
✅ Navegación y router
✅ Placeholders de todas las páginas

## 📋 Próximos módulos

- M3: Perfil / Onboarding (datos físicos y preferencias)
- M4: Motor de cálculo (TMB, TDEE, macros)
- M5: Pantalla de resultado
- M6: Matriz de alimentos + panel admin
- M7: Motor de dieta sugerida
- M8: Sustituciones
- M9: Historial y progreso

## 🚀 Instalación (pasos a seguir antes del próximo módulo)

### 1. Crear proyecto en Supabase
- Ve a https://supabase.com → New Project
- Guarda el **Project URL** y la **anon key**

### 2. Crear las tablas
- Entra a tu proyecto Supabase → SQL Editor
- Copia todo el contenido de `sql/schema.sql`
- Ejecútalo (crea tablas, RLS, trigger de perfil automático, y datos semilla de plantillas)

### 3. Configurar credenciales
Edita `js/config.js` y reemplaza:
```javascript
SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
SUPABASE_ANON_KEY: 'TU-ANON-KEY-AQUI',
```

### 4. Desplegar
- **Opción local:** Abre `index.html` directamente o usa Live Server de VS Code
- **Netlify:** Arrastra la carpeta completa a netlify.com/drop
- **Otra:** Cualquier hosting estático sirve

### 5. Crear tu primer usuario admin
Después de registrarte con tu cuenta, entra a Supabase → Table Editor → `perfiles` → 
cambia el campo `rol` de tu usuario a `admin`. Con eso verás el panel de Gestionar Alimentos.

## 📁 Estructura

```
new-body-calculator/
├── index.html              # Shell principal
├── css/styles.css          # Estilos responsivos
├── js/
│   ├── config.js           # ⚠️ Aquí pones tus credenciales
│   ├── supabase.js         # Cliente DB + helpers
│   ├── auth.js             # M2 - Login/registro
│   ├── app.js              # Router y navegación
│   └── [próximos módulos]
└── sql/schema.sql          # Base de datos completa
```

## 🎨 Responsive

- **Desktop (>1024px):** Sidebar fijo + contenido
- **Tablet (768-1024px):** Sidebar compacto
- **Mobile (<768px):** Sidebar colapsable con menú hamburguesa
