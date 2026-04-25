/* ============================================================
   MÓDULO M4: MOTOR DE CÁLCULO
   ============================================================
   Fórmulas:
   - TMB: Mifflin-St Jeor (más precisa que Harris-Benedict)
   - TDEE: TMB × Factor de actividad
   - Calorías objetivo: según meta (déficit/mantenimiento/superávit)
   - Macros: proteína y grasa por kg, carbohidratos como remanente
   ============================================================ */

window.calculo = {

    /**
     * Calcula la edad en años a partir de una fecha de nacimiento
     */
    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    },

    /**
     * Calcula TMB usando fórmula Mifflin-St Jeor
     * Hombres: (10 × peso) + (6.25 × talla) - (5 × edad) + 5
     * Mujeres: (10 × peso) + (6.25 × talla) - (5 × edad) - 161
     */
    calcularTMB(sexo, pesoKg, tallaCm, edad) {
        const base = (10 * pesoKg) + (6.25 * tallaCm) - (5 * edad);
        return sexo === 'M' ? base + 5 : base - 161;
    },

    /**
     * Calcula TDEE (gasto energético total diario)
     * TDEE = TMB × factor de actividad
     */
    calcularTDEE(tmb, nivelActividad) {
        const factor = window.APP_CONFIG.FACTORES_ACTIVIDAD[nivelActividad] || 1.2;
        return tmb * factor;
    },

    /**
     * Calcula las calorías objetivo según la meta
     * @param {number} tdee - Gasto energético total
     * @param {string} meta - 'deficit', 'mantenimiento', 'superavit'
     * @param {number} porcentaje - % de déficit o superávit (por defecto 10)
     */
    calcularCaloriasObjetivo(tdee, meta, porcentaje = 10) {
        const factor = porcentaje / 100;
        switch (meta) {
            case 'deficit':
                return tdee * (1 - factor);
            case 'superavit':
                return tdee * (1 + factor);
            case 'mantenimiento':
            default:
                return tdee;
        }
    },

    /**
     * Calcula los macronutrientes
     * Proteína y grasa se calculan por kg de peso
     * Carbohidratos son el remanente calórico
     *
     * Calorías por gramo:
     * - Proteína: 4 kcal/g
     * - Grasa: 9 kcal/g
     * - Carbohidratos: 4 kcal/g
     */
    calcularMacros(caloriasObjetivo, pesoKg, proteinaGKg = 2.2, grasaGKg = 0.9) {
        const proteinaG = pesoKg * proteinaGKg;
        const grasaG = pesoKg * grasaGKg;

        const kcalProteina = proteinaG * 4;
        const kcalGrasa = grasaG * 9;
        const kcalCarbos = caloriasObjetivo - kcalProteina - kcalGrasa;
        const carboG = kcalCarbos / 4;

        // Regla de seguridad: advertir si carbohidratos son muy bajos
        const advertencia = carboG < 50
            ? 'Los carbohidratos son muy bajos. Considera reducir proteína o grasa.'
            : null;

        return {
            proteina_g: Math.round(proteinaG),
            grasa_g: Math.round(grasaG),
            carbo_g: Math.round(Math.max(carboG, 0)),
            kcal_proteina: Math.round(kcalProteina),
            kcal_grasa: Math.round(kcalGrasa),
            kcal_carbos: Math.round(Math.max(kcalCarbos, 0)),
            advertencia: advertencia
        };
    },

    /**
     * Función principal: ejecuta todo el cálculo completo
     * Retorna un objeto con TMB, TDEE, kcal objetivo y macros
     */
    calcularCompleto(perfil, config) {
        const edad = this.calcularEdad(perfil.fecha_nacimiento);
        const tmb = this.calcularTMB(perfil.sexo, perfil.peso_actual_kg, perfil.talla_cm, edad);
        const tdee = this.calcularTDEE(tmb, perfil.nivel_actividad);

        const porcentaje = config?.porcentaje_deficit || window.APP_CONFIG.DEFAULTS.porcentaje_deficit;
        const kcalObjetivo = this.calcularCaloriasObjetivo(tdee, perfil.meta, porcentaje);

        const proteinaGKg = config?.proteina_g_kg || window.APP_CONFIG.DEFAULTS.proteina_g_kg;
        const grasaGKg = config?.grasa_g_kg || window.APP_CONFIG.DEFAULTS.grasa_g_kg;

        const macros = this.calcularMacros(kcalObjetivo, perfil.peso_actual_kg, proteinaGKg, grasaGKg);

        return {
            edad: edad,
            tmb: Math.round(tmb),
            tdee: Math.round(tdee),
            kcal_objetivo: Math.round(kcalObjetivo),
            proteina_g: macros.proteina_g,
            grasa_g: macros.grasa_g,
            carbo_g: macros.carbo_g,
            kcal_proteina: macros.kcal_proteina,
            kcal_grasa: macros.kcal_grasa,
            kcal_carbos: macros.kcal_carbos,
            advertencia: macros.advertencia,
            // Distribución porcentual
            porc_proteina: Math.round((macros.kcal_proteina / kcalObjetivo) * 100),
            porc_grasa: Math.round((macros.kcal_grasa / kcalObjetivo) * 100),
            porc_carbos: Math.round((macros.kcal_carbos / kcalObjetivo) * 100)
        };
    },

    /**
     * Guarda un plan generado en la base de datos
     */
    async guardarPlan(usuarioId, resultado, plantillaId = null) {
        const { data, error } = await window.db
            .from('planes_generados')
            .insert({
                usuario_id: usuarioId,
                tmb: resultado.tmb,
                tdee: resultado.tdee,
                kcal_objetivo: resultado.kcal_objetivo,
                proteina_g: resultado.proteina_g,
                grasa_g: resultado.grasa_g,
                carbo_g: resultado.carbo_g,
                plantilla_id: plantillaId
            })
            .select()
            .single();

        if (error) {
            console.error('Error guardando plan:', error);
            return null;
        }
        return data;
    }
};
