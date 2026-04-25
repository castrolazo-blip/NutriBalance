/* ============================================================
   MÓDULO: UNIDADES Y CONVERSIONES
   ============================================================
   La base de datos siempre guarda en kg y cm (estándar científico).
   Este módulo convierte al sistema elegido por el usuario.

   Sistemas soportados:
   - salvadoreno: libras (lb) + centímetros (cm)
   - imperial:    libras (lb) + pies y pulgadas (ft'in")
   - metrico:     kilogramos (kg) + centímetros (cm)
   ============================================================ */

window.unidades = {

    // Factores de conversión
    KG_A_LB: 2.20462,
    LB_A_KG: 0.453592,
    CM_A_PULGADAS: 0.393701,
    PULGADAS_A_CM: 2.54,
    CM_A_PIES: 0.0328084,
    PIES_A_CM: 30.48,

    // Configuración de cada sistema
    SISTEMAS: {
        'salvadoreno': {
            nombre: 'Salvadoreño',
            bandera: '🇸🇻',
            unidad_peso: 'lb',
            unidad_talla: 'cm',
            descripcion: 'Libras + centímetros'
        },
        'imperial': {
            nombre: 'Imperial (EEUU)',
            bandera: '🇺🇸',
            unidad_peso: 'lb',
            unidad_talla: 'ft-in',
            descripcion: 'Libras + pies/pulgadas'
        },
        'metrico': {
            nombre: 'Métrico',
            bandera: '🌍',
            unidad_peso: 'kg',
            unidad_talla: 'cm',
            descripcion: 'Kilogramos + centímetros'
        }
    },

    // ============================================================
    // CONVERSIONES DE PESO
    // ============================================================

    /**
     * Convierte peso de kg (BD) a la unidad del sistema del usuario
     * @param {number} kg - Peso en kilogramos
     * @param {string} sistema - Sistema del usuario
     * @returns {number} Peso en la unidad correspondiente
     */
    kgADisplay(kg, sistema) {
        if (!kg) return 0;
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];
        if (s.unidad_peso === 'lb') {
            return Math.round(kg * this.KG_A_LB * 10) / 10; // 1 decimal
        }
        return Math.round(kg * 10) / 10; // kg con 1 decimal
    },

    /**
     * Convierte peso del display (lb o kg) a kg para guardar en BD
     * @param {number} valor - Peso en la unidad del usuario
     * @param {string} sistema - Sistema del usuario
     * @returns {number} Peso en kg
     */
    displayAKg(valor, sistema) {
        if (!valor) return 0;
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];
        if (s.unidad_peso === 'lb') {
            return Math.round(valor * this.LB_A_KG * 100) / 100; // 2 decimales
        }
        return Math.round(valor * 100) / 100;
    },

    // ============================================================
    // CONVERSIONES DE TALLA / ESTATURA
    // ============================================================

    /**
     * Convierte talla de cm (BD) a la unidad del sistema
     * Para sistemas cm: devuelve {cm: 170}
     * Para sistema ft-in: devuelve {pies: 5, pulgadas: 7, textoCompleto: "5'7\""}
     */
    cmADisplay(cm, sistema) {
        if (!cm) return { cm: 0, pies: 0, pulgadas: 0, texto: '' };

        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];

        if (s.unidad_talla === 'ft-in') {
            const pulgadasTotal = cm * this.CM_A_PULGADAS;
            const pies = Math.floor(pulgadasTotal / 12);
            const pulgadas = Math.round(pulgadasTotal - (pies * 12));
            // Si al redondear llegamos a 12, subir un pie
            if (pulgadas === 12) {
                return { cm: cm, pies: pies + 1, pulgadas: 0, texto: `${pies + 1}'0"` };
            }
            return { cm: cm, pies: pies, pulgadas: pulgadas, texto: `${pies}'${pulgadas}"` };
        }

        // cm
        return { cm: Math.round(cm * 10) / 10, pies: 0, pulgadas: 0, texto: `${Math.round(cm * 10) / 10} cm` };
    },

    /**
     * Convierte talla del display a cm para guardar en BD
     */
    displayACm(valor1, valor2, sistema) {
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];

        if (s.unidad_talla === 'ft-in') {
            // valor1 = pies, valor2 = pulgadas
            const pies = parseFloat(valor1) || 0;
            const pulgadas = parseFloat(valor2) || 0;
            const cm = (pies * this.PIES_A_CM) + (pulgadas * this.PULGADAS_A_CM);
            return Math.round(cm * 10) / 10;
        }

        // cm directo
        return parseFloat(valor1) || 0;
    },

    // ============================================================
    // HELPERS DE UI
    // ============================================================

    /**
     * Genera la etiqueta de unidad para mostrar
     */
    etiquetaPeso(sistema) {
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];
        return s.unidad_peso;
    },

    etiquetaTalla(sistema) {
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];
        return s.unidad_talla === 'ft-in' ? 'pies/pulgadas' : 'cm';
    },

    /**
     * Formatea un peso para mostrar con su unidad
     */
    formatearPeso(kg, sistema) {
        const valor = this.kgADisplay(kg, sistema);
        const unidad = this.etiquetaPeso(sistema);
        return `${valor} ${unidad}`;
    },

    /**
     * Formatea talla para mostrar con su unidad
     */
    formatearTalla(cm, sistema) {
        const r = this.cmADisplay(cm, sistema);
        const s = this.SISTEMAS[sistema] || this.SISTEMAS['salvadoreno'];
        if (s.unidad_talla === 'ft-in') {
            return r.texto;
        }
        return `${r.cm} cm`;
    },

    /**
     * Obtiene el sistema del usuario actual (desde memoria o default)
     */
    obtenerSistemaUsuario() {
        return window.app?.perfilNutricional?.sistema_unidades
            || window.resultado?.perfilActual?.sistema_unidades
            || 'salvadoreno';
    }
};
