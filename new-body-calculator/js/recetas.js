/* ============================================================
   MÓDULO M8: RECETAS Y SAZÓN INTELIGENTE
   NutriBalance · by Ronald Castro
   v1 — Base de recetas hardcodeada por alimento
   ============================================================ */

window.recetas = {

  // ─── BASE DE RECETAS ──────────────────────────────────────
  // Indexada por código de alimento
  // Cada alimento tiene hasta 5 recetas
  // ─────────────────────────────────────────────────────────

  BASE: {

    // ══════════════════════════════════════════════════════
    // PROTEÍNAS
    // ══════════════════════════════════════════════════════

    'A-0001': [ // Pechuga de pollo
      {
        nombre: 'Pollo al limón y ajo',
        tiempo_min: 20,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🍋',
        ingredientes: [
          'Pechuga de pollo (según tu porción)',
          '2 dientes de ajo picados',
          '2 cucharadas de jugo de limón',
          'Sal y pimienta al gusto',
          'Orégano seco',
          '1 cucharadita de aceite de oliva'
        ],
        pasos: [
          'Aplana la pechuga con un mazo o cuchillo para que quede pareja.',
          'Mezcla el ajo, limón, sal, pimienta y orégano. Unta sobre el pollo.',
          'Calienta el aceite en sartén a fuego medio-alto.',
          'Cocina el pollo 6-7 minutos por cada lado hasta que esté dorado.',
          'Reposa 2 minutos antes de cortar. Sirve con limón adicional.'
        ],
        sazon: { libre: ['limón', 'ajo', 'orégano'], controlado: [] },
        calorias_extra: 15,
        tip: '💡 El reposo es clave — evita que el pollo quede seco.'
      },
      {
        nombre: 'Pollo fajita estilo fitness',
        tiempo_min: 25,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🌶️',
        ingredientes: [
          'Pechuga de pollo en tiras (según tu porción)',
          '½ cebolla en tiras',
          '½ chile verde o pimiento en tiras',
          'Comino, paprika, sal al gusto',
          '1 cucharadita de aceite'
        ],
        pasos: [
          'Sazona las tiras de pollo con comino, paprika y sal.',
          'Calienta el aceite en sartén a fuego alto.',
          'Cocina el pollo 4-5 min hasta dorar. Retira y reserva.',
          'En la misma sartén saltea la cebolla y el pimiento 3 min.',
          'Regresa el pollo, mezcla todo y sirve caliente.'
        ],
        sazon: { libre: ['comino', 'paprika', 'cebolla', 'chile'], controlado: ['aceite'] },
        calorias_extra: 20,
        tip: '💡 Sirve sobre tortilla de maíz o arroz integral.'
      },
      {
        nombre: 'Pollo encebollado salvadoreño',
        tiempo_min: 30,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🧅',
        ingredientes: [
          'Pechuga de pollo (según tu porción)',
          '1 cebolla grande en rodajas',
          '2 tomates picados',
          'Sal, comino, achiote al gusto',
          '½ taza de agua'
        ],
        pasos: [
          'Sazona el pollo con sal, comino y achiote.',
          'Dora el pollo en sartén caliente 4 min por lado.',
          'Agrega la cebolla y el tomate encima del pollo.',
          'Agrega el agua, tapa y cocina a fuego bajo 15 min.',
          'Sirve con arroz y tortilla.'
        ],
        sazon: { libre: ['comino', 'achiote', 'cebolla', 'tomate'], controlado: [] },
        calorias_extra: 25,
        tip: '💡 El achiote le da el color y sabor típico salvadoreño.'
      },
      {
        nombre: 'Pollo al horno con mostaza',
        tiempo_min: 35,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🍯',
        ingredientes: [
          'Pechuga de pollo (según tu porción)',
          '1 cucharada de mostaza sin azúcar',
          '1 diente de ajo rallado',
          'Sal, pimienta, tomillo al gusto',
          'Jugo de ½ limón'
        ],
        pasos: [
          'Precalienta el horno a 200°C (400°F).',
          'Mezcla mostaza, ajo, limón, sal y tomillo.',
          'Unta la mezcla sobre el pollo completamente.',
          'Hornea 25-30 minutos hasta que esté cocido por dentro.',
          'Deja reposar 3 minutos antes de servir.'
        ],
        sazon: { libre: ['mostaza', 'ajo', 'tomillo', 'limón'], controlado: [] },
        calorias_extra: 10,
        tip: '💡 Sin aceite — la mostaza actúa como marinado y sella el jugo.'
      },
      {
        nombre: 'Pollo air fryer rápido',
        tiempo_min: 18,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '⚡',
        ingredientes: [
          'Pechuga de pollo (según tu porción)',
          'Sal de ajo, paprika, pimienta',
          'Spray de aceite (mínimo)'
        ],
        pasos: [
          'Precalienta el air fryer a 190°C por 3 minutos.',
          'Sazona el pollo por ambos lados con sal de ajo y paprika.',
          'Aplica spray de aceite ligeramente.',
          'Cocina 10-12 minutos, volteando a la mitad.',
          'Verifica que el interior esté blanco/cocinado antes de servir.'
        ],
        sazon: { libre: ['sal de ajo', 'paprika', 'pimienta'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 Sin air fryer: usa sartén de teflón sin aceite a fuego medio.'
      }
    ],

    'A-0002': [ // Muslo de pollo
      {
        nombre: 'Muslo horneado con especias',
        tiempo_min: 40,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🌿',
        ingredientes: [
          'Muslo de pollo (según tu porción)',
          'Ajo en polvo, paprika, comino, sal',
          '1 cucharadita de aceite',
          'Jugo de limón'
        ],
        pasos: [
          'Precalienta horno a 200°C.',
          'Mezcla todas las especias con aceite y limón.',
          'Unta la mezcla sobre el muslo, incluyendo debajo de la piel.',
          'Hornea 35-40 minutos hasta que la piel esté crujiente.',
          'Verifica que el jugo salga claro antes de servir.'
        ],
        sazon: { libre: ['ajo', 'paprika', 'comino', 'limón'], controlado: ['aceite'] },
        calorias_extra: 20,
        tip: '💡 El muslo tolera más cocción sin secarse — ideal para principiantes.'
      },
      {
        nombre: 'Muslo guisado con tomate',
        tiempo_min: 35,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🍅',
        ingredientes: [
          'Muslo de pollo (según tu porción)',
          '2 tomates maduros picados',
          '½ cebolla picada',
          '2 dientes de ajo',
          'Sal, achiote, comino'
        ],
        pasos: [
          'Dora el muslo sazonado en sartén caliente 5 min por lado.',
          'Agrega cebolla y ajo, sofríe 2 minutos.',
          'Agrega el tomate y especias, mezcla bien.',
          'Cubre y cocina a fuego bajo 20 minutos.',
          'Sirve con arroz blanco y ensalada.'
        ],
        sazon: { libre: ['achiote', 'comino', 'tomate', 'ajo'], controlado: [] },
        calorias_extra: 30,
        tip: '💡 El achiote da color y el tomate crea una salsa natural sin añadir calorías.'
      }
    ],

    'A-0005': [ // Carne de res
      {
        nombre: 'Carne encebollada',
        tiempo_min: 25,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🧅',
        ingredientes: [
          'Posta de res en bistec (según tu porción)',
          '1 cebolla grande en rodajas',
          'Sal, pimienta, comino',
          '1 cucharadita de salsa worcestershire',
          'Jugo de limón'
        ],
        pasos: [
          'Sazona la carne con sal, pimienta y comino.',
          'Calienta sartén a fuego alto sin aceite.',
          'Sella la carne 3-4 min por lado. Retira y reserva.',
          'En la misma sartén cocina la cebolla con worcestershire 5 min.',
          'Sirve la carne cubierta con la cebolla y unas gotas de limón.'
        ],
        sazon: { libre: ['comino', 'worcestershire', 'limón'], controlado: [] },
        calorias_extra: 15,
        tip: '💡 Sartén muy caliente = sellado perfecto, carne jugosa por dentro.'
      },
      {
        nombre: 'Carne con tomate salvadoreño',
        tiempo_min: 30,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🍅',
        ingredientes: [
          'Posta de res (según tu porción)',
          '2 tomates picados',
          '½ cebolla picada',
          '1 chile verde picado',
          'Sal, achiote, cilantro'
        ],
        pasos: [
          'Cocina la carne a término medio en sartén caliente.',
          'Reserva y pica en trozos si deseas.',
          'Sofríe cebolla y chile 2 minutos en la misma sartén.',
          'Agrega el tomate, achiote y sal, cocina 5 minutos.',
          'Regresa la carne, mezcla y espolvorea cilantro al servir.'
        ],
        sazon: { libre: ['achiote', 'cilantro', 'chile verde'], controlado: [] },
        calorias_extra: 20,
        tip: '💡 Esta preparación es excelente con tortilla de maíz caliente.'
      },
      {
        nombre: 'Bistec fajita fitness',
        tiempo_min: 20,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🌶️',
        ingredientes: [
          'Res en tiras delgadas (según tu porción)',
          '½ pimiento rojo en tiras',
          '½ cebolla en tiras',
          'Comino, ajo en polvo, sal, pimienta'
        ],
        pasos: [
          'Sazona las tiras de res con especias.',
          'Sartén muy caliente, sin aceite o con spray mínimo.',
          'Cocina la carne en tiras 2-3 min sin mover para sellar.',
          'Agrega pimiento y cebolla, saltea 3 minutos más.',
          'Sirve sobre arroz o en tortilla de maíz.'
        ],
        sazon: { libre: ['comino', 'ajo en polvo', 'pimienta'], controlado: [] },
        calorias_extra: 10,
        tip: '💡 Tiras delgadas = cocción rápida y uniforme.'
      }
    ],

    'A-0006': [ // Carne molida
      {
        nombre: 'Carne molida con tomate y cebolla',
        tiempo_min: 20,
        dificultad: 'Muy fácil',
        tipo: 'casero',
        emoji: '🍝',
        ingredientes: [
          'Carne molida (según tu porción)',
          '1 tomate picado',
          '¼ cebolla picada',
          'Sal, comino, ajo en polvo',
          'Cilantro al gusto'
        ],
        pasos: [
          'Calienta sartén a fuego medio-alto.',
          'Agrega la carne molida y desbarata con espátula.',
          'Cocina 5-7 min hasta que no haya partes rosadas.',
          'Escurre el exceso de grasa si la carne es muy grasosa.',
          'Agrega tomate, cebolla y especias. Cocina 5 minutos más.',
          'Espolvorea cilantro y sirve.'
        ],
        sazon: { libre: ['comino', 'ajo', 'cilantro'], controlado: [] },
        calorias_extra: 20,
        tip: '💡 Escurrir la grasa reduce hasta 30% las calorías en carne molida regular.'
      },
      {
        nombre: 'Bowl de res molida fitness',
        tiempo_min: 25,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🥣',
        ingredientes: [
          'Carne molida magra (según tu porción)',
          'Salsa de soya baja en sodio (1 cda)',
          'Ajo rallado, jengibre en polvo',
          '½ cebolla picada',
          'Cebollín para decorar'
        ],
        pasos: [
          'Sofríe el ajo y la cebolla 2 minutos.',
          'Agrega la carne molida y cocina bien.',
          'Añade salsa de soya y jengibre, mezcla 2 minutos.',
          'Sirve sobre arroz blanco o integral.',
          'Decora con cebollín picado.'
        ],
        sazon: { libre: ['ajo', 'jengibre', 'cebollín'], controlado: ['salsa de soya'] },
        calorias_extra: 15,
        tip: '💡 La salsa de soya da sabor umami profundo sin muchas calorías.'
      }
    ],

    'A-0008': [ // Atún en agua
      {
        nombre: 'Atún al limón (sin cocción)',
        tiempo_min: 5,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '🐟',
        ingredientes: [
          'Atún en agua escurrido (según tu porción)',
          'Jugo de 1 limón',
          'Sal, pimienta',
          'Cilantro o perejil picado'
        ],
        pasos: [
          'Escurre bien el atún.',
          'Mezcla con jugo de limón, sal y pimienta.',
          'Agrega cilantro o perejil picado.',
          'Sirve sobre tostadas, tortilla o arroz.'
        ],
        sazon: { libre: ['limón', 'cilantro'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 Sin cocción — perfecto para llevar o preparar en minutos.'
      },
      {
        nombre: 'Atún con aguacate',
        tiempo_min: 8,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '🥑',
        ingredientes: [
          'Atún en agua escurrido (según tu porción)',
          '¼ aguacate maduro',
          'Jugo de limón, sal',
          'Cebolla morada picada (opcional)'
        ],
        pasos: [
          'Aplasta el aguacate con tenedor.',
          'Mezcla con limón y sal hasta tener una pasta.',
          'Agrega el atún escurrido y mezcla.',
          'Incorpora cebolla si deseas.',
          'Sirve inmediatamente para evitar oxidación.'
        ],
        sazon: { libre: ['limón', 'cebolla morada'], controlado: ['aguacate (grasa)'] },
        calorias_extra: 60,
        tip: '💡 Alto en proteína y grasas buenas — ideal para objetivo fitness.'
      },
      {
        nombre: 'Atún con tomate y mostaza',
        tiempo_min: 5,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '🍅',
        ingredientes: [
          'Atún en agua escurrido (según tu porción)',
          '1 tomate picado en cubos',
          '1 cucharadita de mostaza',
          'Sal, pimienta, orégano'
        ],
        pasos: [
          'Escurre el atún perfectamente.',
          'Mezcla con mostaza, sal y orégano.',
          'Agrega el tomate en cubos.',
          'Mezcla suave para no desbaratar el tomate.',
          'Sirve sobre pan integral o con galletas de agua.'
        ],
        sazon: { libre: ['mostaza', 'orégano'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 La mostaza agrega sabor sin calorías significativas.'
      },
      {
        nombre: 'Atún salteado con cebolla',
        tiempo_min: 12,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🧅',
        ingredientes: [
          'Atún en agua escurrido (según tu porción)',
          '½ cebolla en rodajas',
          '1 tomate en cubos',
          'Sal, worcestershire, limón'
        ],
        pasos: [
          'Sofríe la cebolla en sartén con spray de aceite 3 min.',
          'Agrega el tomate y cocina 2 minutos más.',
          'Incorpora el atún escurrido.',
          'Agrega worcestershire y limón, mezcla 1 minuto.',
          'Sirve caliente con tortilla o arroz.'
        ],
        sazon: { libre: ['worcestershire', 'limón'], controlado: [] },
        calorias_extra: 10,
        tip: '💡 El atún caliente cambia completamente la textura y sabor — muy recomendado.'
      }
    ],

    'A-0010': [ // Tilapia
      {
        nombre: 'Tilapia al vapor con limón',
        tiempo_min: 15,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🐠',
        ingredientes: [
          'Filete de tilapia (según tu porción)',
          'Jugo de 1 limón',
          'Ajo en polvo, sal, pimienta',
          'Cilantro fresco'
        ],
        pasos: [
          'Sazona el filete con ajo en polvo, sal y pimienta.',
          'Coloca sobre papel aluminio, agrega limón y cilantro.',
          'Cierra el papel formando un paquete sellado.',
          'Cocina en sartén tapada a fuego medio 12-15 min.',
          'Abre el paquete con cuidado del vapor. Sirve.'
        ],
        sazon: { libre: ['limón', 'ajo', 'cilantro'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 Al vapor en papel aluminio es la forma más limpia y sin calorías extra.'
      },
      {
        nombre: 'Tilapia a la plancha con especias',
        tiempo_min: 15,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '♨️',
        ingredientes: [
          'Filete de tilapia (según tu porción)',
          'Paprika, comino, sal de ajo',
          'Spray de aceite',
          'Limón para servir'
        ],
        pasos: [
          'Seca bien el filete con papel absorbente.',
          'Sazona con paprika, comino y sal de ajo.',
          'Calienta sartén con spray de aceite a fuego alto.',
          'Cocina 4-5 min por lado sin mover.',
          'Sirve con rodajas de limón.'
        ],
        sazon: { libre: ['paprika', 'comino', 'limón'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 Secar el filete antes garantiza que se dore y no se cueza al vapor.'
      }
    ],

    'A-0003': [ // Huevo entero
      {
        nombre: 'Huevos revueltos fitness',
        tiempo_min: 8,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '🍳',
        ingredientes: [
          'Huevos (según tu porción)',
          'Sal, pimienta',
          'Cebollín o perejil picado',
          'Sartén antiadherente'
        ],
        pasos: [
          'Bate los huevos con sal y pimienta.',
          'Calienta sartén antiadherente a fuego medio-bajo.',
          'Sin aceite o con spray mínimo.',
          'Vierte los huevos. Mueve suavemente con espátula.',
          'Retira del fuego cuando aún estén ligeramente húmedos.',
          'Sirve con cebollín y acompañamiento elegido.'
        ],
        sazon: { libre: ['cebollín', 'perejil', 'pimienta'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 Fuego bajo y retirar antes de que sequen = huevos cremosos, no de goma.'
      },
      {
        nombre: 'Omelette relleno',
        tiempo_min: 12,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🥚',
        ingredientes: [
          'Huevos (según tu porción)',
          '¼ pimiento picado',
          '¼ cebolla picada',
          'Sal, pimienta, orégano',
          'Spray de aceite'
        ],
        pasos: [
          'Bate los huevos con sal, pimienta y orégano.',
          'Sofríe el pimiento y cebolla 2 minutos.',
          'Retira las verduras y limpia un poco la sartén.',
          'Vierte los huevos batidos a fuego medio-bajo.',
          'Cuando los bordes cuajen, agrega las verduras en el centro.',
          'Dobla el omelette por la mitad. Sirve.'
        ],
        sazon: { libre: ['orégano', 'pimiento', 'cebolla'], controlado: [] },
        calorias_extra: 15,
        tip: '💡 Agrega queso fresco rallado para un toque salvadoreño (+50 kcal).'
      },
      {
        nombre: 'Huevos con tomate salvadoreño',
        tiempo_min: 15,
        dificultad: 'Muy fácil',
        tipo: 'casero',
        emoji: '🍅',
        ingredientes: [
          'Huevos (según tu porción)',
          '1 tomate maduro picado',
          '¼ cebolla picada',
          'Sal, achiote, cilantro'
        ],
        pasos: [
          'Sofríe la cebolla en sartén caliente 2 minutos.',
          'Agrega el tomate y achiote, cocina 3 minutos.',
          'Rompe los huevos encima de la salsa.',
          'Revuelve todo o cocina con los huevos encima.',
          'Agrega sal y cilantro. Sirve con tortilla caliente.'
        ],
        sazon: { libre: ['achiote', 'cilantro'], controlado: [] },
        calorias_extra: 20,
        tip: '💡 Clásico salvadoreño — sirve siempre con tortilla de maíz.'
      },
      {
        nombre: 'Huevos con aguacate',
        tiempo_min: 10,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '🥑',
        ingredientes: [
          'Huevos (según tu porción)',
          '¼ aguacate en rebanadas',
          'Sal, pimienta, chile en polvo',
          'Jugo de limón'
        ],
        pasos: [
          'Prepara los huevos a tu gusto (revueltos o estrellados).',
          'Rebana el aguacate y sazona con limón y sal.',
          'Sirve los huevos junto al aguacate.',
          'Espolvorea chile en polvo al gusto.'
        ],
        sazon: { libre: ['limón', 'chile en polvo'], controlado: ['aguacate (grasa)'] },
        calorias_extra: 60,
        tip: '💡 Proteína completa + grasa saludable — desayuno ideal.'
      }
    ],

    'A-0004': [ // Clara de huevo
      {
        nombre: 'Claras con espinacas',
        tiempo_min: 8,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '💪',
        ingredientes: [
          'Claras de huevo (según tu porción)',
          'Un puñado de espinacas',
          'Ajo en polvo, sal, pimienta',
          'Spray de aceite'
        ],
        pasos: [
          'Bate las claras con sal y ajo en polvo.',
          'Calienta sartén con spray a fuego medio.',
          'Saltea las espinacas 1 minuto.',
          'Agrega las claras y revuelve constantemente.',
          'Retira del fuego cuando cuajen pero aún estén húmedas.'
        ],
        sazon: { libre: ['ajo', 'espinacas', 'pimienta'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 Claras puras = proteína casi sin grasa — perfecto para déficit calórico.'
      }
    ],

    'A-0016': [ // Frijoles rojos
      {
        nombre: 'Frijoles licuados caseros',
        tiempo_min: 15,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🫘',
        ingredientes: [
          'Frijoles cocidos (según tu porción)',
          '¼ cebolla',
          '1 diente de ajo',
          'Sal al gusto',
          '½ taza de agua o caldo'
        ],
        pasos: [
          'Si son frijoles de lata, escurre y enjuaga.',
          'Licúa los frijoles con el agua, cebolla y ajo.',
          'Calienta en sartén con un poco de aceite.',
          'Agrega sal y cocina a fuego medio 8 minutos revolviendo.',
          'Ajusta consistencia con agua. Sirve.'
        ],
        sazon: { libre: ['ajo', 'cebolla'], controlado: ['aceite (mínimo)'] },
        calorias_extra: 15,
        tip: '💡 Base proteica y de fibra — fundamental en la dieta salvadoreña.'
      },
      {
        nombre: 'Frijoles con huevo revuelto',
        tiempo_min: 12,
        dificultad: 'Muy fácil',
        tipo: 'casero',
        emoji: '🍳',
        ingredientes: [
          'Frijoles cocidos (según tu porción)',
          '1-2 huevos',
          'Sal, achiote',
          'Tortilla para acompañar'
        ],
        pasos: [
          'Calienta los frijoles en sartén.',
          'Rompe los huevos directamente sobre los frijoles.',
          'Revuelve todo junto hasta que el huevo esté cocido.',
          'Sazona con sal y achiote.',
          'Sirve con tortilla caliente.'
        ],
        sazon: { libre: ['achiote'], controlado: [] },
        calorias_extra: 70,
        tip: '💡 Proteína vegetal + animal — combinación muy completa nutricionalmente.'
      },
      {
        nombre: 'Frijoles de la olla',
        tiempo_min: 10,
        dificultad: 'Muy fácil',
        tipo: 'casero',
        emoji: '🥘',
        ingredientes: [
          'Frijoles cocidos con caldo (según tu porción)',
          'Sal al gusto',
          'Crema para decorar (opcional)',
          'Queso fresco rallado (opcional)'
        ],
        pasos: [
          'Calienta los frijoles enteros en su caldo a fuego medio.',
          'Ajusta sal.',
          'Sirve en taza o plato hondo.',
          'Agrega crema o queso solo si tu plan lo permite.'
        ],
        sazon: { libre: [], controlado: ['crema (opcional)', 'queso (opcional)'] },
        calorias_extra: 0,
        tip: '💡 Los frijoles de la olla son la versión más nutritiva — sin frituras.'
      }
    ],

    // ══════════════════════════════════════════════════════
    // CARBOHIDRATOS
    // ══════════════════════════════════════════════════════

    'A-0021': [ // Arroz blanco
      {
        nombre: 'Arroz blanco cocido perfecto',
        tiempo_min: 20,
        dificultad: 'Fácil',
        tipo: 'casero',
        emoji: '🍚',
        ingredientes: [
          'Arroz (según tu porción en gramos)',
          'Agua (el doble del volumen de arroz)',
          'Sal al gusto',
          '¼ cebolla (opcional)',
          '1 diente de ajo (opcional)'
        ],
        pasos: [
          'Lava el arroz hasta que el agua salga clara.',
          'Por cada taza de arroz, usa 2 tazas de agua.',
          'Hierve el agua con sal, cebolla y ajo.',
          'Agrega el arroz, tapa y reduce a fuego bajo.',
          'Cocina 15-18 min sin destapar. Esponja con tenedor.'
        ],
        sazon: { libre: ['ajo', 'cebolla'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 No destapes durante la cocción — el vapor es lo que cuece el arroz correctamente.'
      },
      {
        nombre: 'Arroz frito fitness',
        tiempo_min: 15,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '🍳',
        ingredientes: [
          'Arroz cocido frío (según tu porción)',
          '1 huevo',
          'Salsa de soya baja en sodio (1 cda)',
          'Cebollín, ajo en polvo',
          'Spray de aceite'
        ],
        pasos: [
          'El arroz debe estar frío (del día anterior de preferencia).',
          'Calienta sartén con spray a fuego alto.',
          'Agrega el arroz y saltea 3 minutos.',
          'Haz un espacio, agrega el huevo y revuelve.',
          'Mezcla todo con soya y cebollín. Listo.'
        ],
        sazon: { libre: ['cebollín', 'ajo'], controlado: ['soya (sodio)'] },
        calorias_extra: 70,
        tip: '💡 Arroz frío = granos sueltos, no pegajosos. Clave para el arroz frito.'
      }
    ],

    'A-0026': [ // Avena
      {
        nombre: 'Avena caliente básica',
        tiempo_min: 8,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '🥣',
        ingredientes: [
          'Avena en hojuelas (según tu porción)',
          'Agua o leche (el doble del volumen de avena)',
          'Canela en polvo',
          'Sal (pizca)'
        ],
        pasos: [
          'Hierve el agua o leche.',
          'Agrega la avena y reduce el fuego.',
          'Cocina 5 minutos revolviendo ocasionalmente.',
          'Agrega canela y una pizca de sal.',
          'Sirve con fruta fresca encima.'
        ],
        sazon: { libre: ['canela'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 Agregar proteína en polvo a la avena eleva considerablemente su valor proteico.'
      },
      {
        nombre: 'Overnight oats (avena fría)',
        tiempo_min: 5,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '🌙',
        ingredientes: [
          'Avena en hojuelas (según tu porción)',
          'Leche o agua (igual volumen)',
          'Canela, vainilla (unas gotas)',
          'Fruta fresca al gusto'
        ],
        pasos: [
          'Mezcla la avena con la leche en un frasco con tapa.',
          'Agrega canela y vainilla.',
          'Tapa y refrigera toda la noche.',
          'Por la mañana agrega fruta fresca.',
          'Lista para comer fría o calentarla 1 minuto en microondas.'
        ],
        sazon: { libre: ['canela', 'vainilla'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 Prepara de noche — en la mañana tienes el desayuno listo en 0 minutos.'
      },
      {
        nombre: 'Bowl de avena fitness con proteína',
        tiempo_min: 10,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '💪',
        ingredientes: [
          'Avena en hojuelas (según tu porción)',
          '1 scoop de proteína en polvo (opcional)',
          'Leche descremada',
          'Banano en rodajas',
          'Canela'
        ],
        pasos: [
          'Cocina la avena con leche descremada.',
          'Retira del fuego y agrega la proteína en polvo.',
          'Mezcla bien hasta integrar.',
          'Sirve en bowl y decora con rodajas de banano.',
          'Espolvorea canela.'
        ],
        sazon: { libre: ['canela', 'banano'], controlado: [] },
        calorias_extra: 100,
        tip: '💡 Agrega la proteína fuera del fuego para evitar que se cueza y pierda propiedades.'
      }
    ],

    'A-0028': [ // Papa cocida
      {
        nombre: 'Papa cocida simple',
        tiempo_min: 20,
        dificultad: 'Muy fácil',
        tipo: 'casero',
        emoji: '🥔',
        ingredientes: [
          'Papa (según tu porción)',
          'Agua con sal',
          'Hierbas al gusto (tomillo, orégano)'
        ],
        pasos: [
          'Lava bien la papa. Puedes pelarla o dejar la cáscara.',
          'Córtala en cubos del mismo tamaño.',
          'Hierve en agua con sal hasta que estén tiernas (15-18 min).',
          'Escurre y sazona con las hierbas elegidas.',
          'Sirve caliente.'
        ],
        sazon: { libre: ['tomillo', 'orégano', 'hierbas'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 La cáscara tiene fibra y nutrientes — lávala bien y déjala.'
      },
      {
        nombre: 'Papa al horno con especias',
        tiempo_min: 35,
        dificultad: 'Fácil',
        tipo: 'fitness',
        emoji: '♨️',
        ingredientes: [
          'Papa mediana (según tu porción)',
          'Paprika, ajo en polvo, sal',
          'Spray de aceite',
          'Yogur griego para dip (opcional)'
        ],
        pasos: [
          'Precalienta horno a 200°C.',
          'Corta la papa en gajos o cubos.',
          'Aplica spray de aceite y espolvorea las especias.',
          'Hornea 25-30 min volteando a mitad del tiempo.',
          'Sirve con yogur griego como dip (reemplaza la crema).'
        ],
        sazon: { libre: ['paprika', 'ajo en polvo'], controlado: [] },
        calorias_extra: 5,
        tip: '💡 El yogur griego como dip da proteína extra y cremosidad sin grasa saturada.'
      }
    ],

    'A-0029': [ // Camote
      {
        nombre: 'Camote al horno fitness',
        tiempo_min: 35,
        dificultad: 'Muy fácil',
        tipo: 'fitness',
        emoji: '🍠',
        ingredientes: [
          'Camote (según tu porción)',
          'Canela en polvo',
          'Sal (pizca)',
          'Spray de aceite'
        ],
        pasos: [
          'Precalienta horno a 200°C.',
          'Corta el camote en rodajas o gajos.',
          'Aplica spray y espolvorea canela y sal.',
          'Hornea 25-30 min hasta que estén tiernos.',
          'Sirve como acompañante de cena.'
        ],
        sazon: { libre: ['canela'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 El camote tiene índice glucémico más bajo que la papa — ideal para cenas fitness.'
      }
    ],

    // ── FALLBACK ──────────────────────────────────────────
    '_default': [
      {
        nombre: 'Preparación simple al gusto',
        tiempo_min: 10,
        dificultad: 'Muy fácil',
        tipo: 'rapido',
        emoji: '🍽️',
        ingredientes: [
          'El alimento según tu porción indicada',
          'Sal y pimienta al gusto',
          'Limón o especias al gusto'
        ],
        pasos: [
          'Prepara el alimento según su forma natural de consumo.',
          'Sazona con sal, pimienta y limón.',
          'Agrega especias sin calorías al gusto.',
          'Sirve como parte de tu comida principal.'
        ],
        sazon: { libre: ['sal', 'limón', 'especias'], controlado: [] },
        calorias_extra: 0,
        tip: '💡 Recuerda: el sazón libre (limón, ajo, especias) no suma calorías significativas.'
      }
    ]
  },

  // ─── SAZÓN INTELIGENTE ────────────────────────────────────
  SAZON: {
    libre: {
      titulo: '✅ Sazón libre (sin impacto calórico)',
      items: ['Limón', 'Ajo fresco o en polvo', 'Cebolla', 'Cilantro', 'Orégano', 'Comino', 'Paprika', 'Pimienta negra', 'Tomillo', 'Achiote', 'Chile en polvo', 'Vinagre', 'Mostaza sin azúcar', 'Salsa worcestershire (poca)', 'Hierbas frescas'],
      descripcion: 'Puedes usarlos libremente — aportan sabor sin afectar tus macros.'
    },
    controlado: {
      titulo: '⚠️ Sazón controlado (cuenta en tus macros)',
      items: [
        { nombre: 'Aceite de oliva',  kcal_cda: 120, nota: 'Máx 1 cda por comida' },
        { nombre: 'Mantequilla',      kcal_cda: 100, nota: 'Usa con moderación' },
        { nombre: 'Crema de leche',   kcal_cda: 50,  nota: 'Alta en grasa saturada' },
        { nombre: 'Queso fresco',     kcal_30g: 90,  nota: '30g es una porción' },
        { nombre: 'Crema de maní',    kcal_cda: 95,  nota: 'Muy densa en calorías' }
      ]
    }
  },

  // ─── API PÚBLICA ─────────────────────────────────────────

  obtenerRecetas(codigo) {
    return this.BASE[codigo] || this.BASE['_default'];
  },

  mostrarPanelRecetas(codigo, nombre, uid) {
    const recetasDisp = this.obtenerRecetas(codigo);

    // Cerrar paneles previos
    document.querySelectorAll('.panel-recetas-wrap').forEach(p => p.remove());

    const panel = document.createElement('div');
    panel.className = 'panel-recetas-wrap';
    panel.id = `panel-recetas-${uid}`;

    panel.innerHTML = `
      <div class="recetas-container">
        <div class="recetas-header">
          <span class="recetas-titulo">👨‍🍳 Recetas para: <strong>${nombre}</strong></span>
          <button class="recetas-cerrar" onclick="document.getElementById('panel-recetas-${uid}').remove()">✕</button>
        </div>
        <div class="recetas-lista">
          ${recetasDisp.map((r, i) => `
            <div class="receta-opcion" onclick="window.recetas.verReceta('${codigo}',${i},'${uid}')">
              <span class="receta-emoji">${r.emoji}</span>
              <div class="receta-info">
                <div class="receta-nombre">${r.nombre}</div>
                <div class="receta-meta">⏱️ ${r.tiempo_min} min · ${r.dificultad} · <span class="receta-tipo receta-tipo-${r.tipo}">${r.tipo}</span></div>
              </div>
              <span class="receta-flecha">›</span>
            </div>
          `).join('')}
        </div>
        <div class="recetas-sazon-btn-wrap">
          <button class="btn-sazon" onclick="window.recetas.mostrarSazon()">🧂 Ver sazón inteligente</button>
        </div>
      </div>`;

    // Insertar como modal en body para compatibilidad con todas las versiones
    const wrap = document.getElementById(`wrap-${uid}`) || document.getElementById(`iw-${uid}`);
    if (wrap) {
      wrap.insertAdjacentElement('afterend', panel);
    } else {
      // Fallback: insertar como modal flotante
      panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;max-height:60vh;overflow-y:auto;background:var(--color-superficie,white);border-radius:16px 16px 0 0;box-shadow:0 -4px 20px rgba(0,0,0,0.15);animation:slideUpR 0.25s ease;';
      document.body.appendChild(panel);
    }
  },

  verReceta(codigo, idx, uid) {
    const receta = this.obtenerRecetas(codigo)[idx];
    if (!receta) return;
    document.getElementById('modal-receta')?.remove();

    const sazonLibreHtml  = receta.sazon.libre.length
      ? `<div class="receta-sazon-libre">✅ Libre: ${receta.sazon.libre.join(', ')}</div>` : '';
    const sazonCtrlHtml   = receta.sazon.controlado.length
      ? `<div class="receta-sazon-ctrl">⚠️ Controlado: ${receta.sazon.controlado.join(', ')}</div>` : '';
    const calExtraHtml    = receta.calorias_extra > 0
      ? `<div class="receta-kcal-extra">+${receta.calorias_extra} kcal extra por el sazón</div>` : '';

    document.body.insertAdjacentHTML('beforeend', `
      <div id="modal-receta" class="modal-receta-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal-receta-box">
          <div class="modal-receta-header">
            <div>
              <div class="modal-receta-emoji">${receta.emoji}</div>
              <div class="modal-receta-nombre">${receta.nombre}</div>
              <div class="modal-receta-meta">
                ⏱️ ${receta.tiempo_min} min · ${receta.dificultad}
                <span class="receta-tipo receta-tipo-${receta.tipo}">${receta.tipo}</span>
              </div>
            </div>
            <button class="modal-receta-cerrar" onclick="document.getElementById('modal-receta').remove()">✕</button>
          </div>
          <div class="modal-receta-body">
            <div class="receta-seccion">
              <div class="receta-seccion-titulo">📋 Ingredientes</div>
              <ul class="receta-ingredientes">
                ${receta.ingredientes.map(ing => `<li>${ing}</li>`).join('')}
              </ul>
            </div>
            <div class="receta-seccion">
              <div class="receta-seccion-titulo">👨‍🍳 Preparación</div>
              <ol class="receta-pasos">
                ${receta.pasos.map(paso => `<li>${paso}</li>`).join('')}
              </ol>
            </div>
            ${sazonLibreHtml || sazonCtrlHtml ? `
            <div class="receta-seccion">
              <div class="receta-seccion-titulo">🧂 Sazón</div>
              ${sazonLibreHtml}${sazonCtrlHtml}${calExtraHtml}
            </div>` : ''}
            ${receta.tip ? `<div class="receta-tip">${receta.tip}</div>` : ''}
          </div>
          <div class="modal-receta-footer">
            <button class="btn btn-outline" onclick="document.getElementById('modal-receta').remove();window.recetas.mostrarPanelRecetas('${codigo}','','${uid}')">← Volver a recetas</button>
          </div>
        </div>
      </div>`);
  },

  mostrarSazon() {
    document.getElementById('modal-sazon')?.remove();
    const s = this.SAZON;
    const ctrlHtml = s.controlado.items.map(item => `
      <div class="sazon-ctrl-item">
        <div class="sazon-ctrl-nombre">${item.nombre}</div>
        <div class="sazon-ctrl-nota">${item.nota}</div>
        <div class="sazon-ctrl-kcal">${item.kcal_cda ? item.kcal_cda+' kcal/cda' : item.kcal_30g+' kcal/30g'}</div>
      </div>`).join('');

    document.body.insertAdjacentHTML('beforeend', `
      <div id="modal-sazon" class="modal-receta-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal-receta-box">
          <div class="modal-receta-header">
            <div>
              <div class="modal-receta-nombre">🧂 Sazón Inteligente</div>
              <div class="modal-receta-meta">Qué puedes usar libremente y qué debes controlar</div>
            </div>
            <button class="modal-receta-cerrar" onclick="document.getElementById('modal-sazon').remove()">✕</button>
          </div>
          <div class="modal-receta-body">
            <div class="receta-seccion">
              <div class="receta-seccion-titulo sazon-libre-titulo">${s.libre.titulo}</div>
              <p style="font-size:0.82rem;color:var(--color-texto-secundario);margin-bottom:10px;">${s.libre.descripcion}</p>
              <div class="sazon-libre-tags">
                ${s.libre.items.map(i => `<span class="sazon-tag-libre">${i}</span>`).join('')}
              </div>
            </div>
            <div class="receta-seccion">
              <div class="receta-seccion-titulo sazon-ctrl-titulo">${s.controlado.titulo}</div>
              <div class="sazon-ctrl-lista">${ctrlHtml}</div>
            </div>
          </div>
          <div class="modal-receta-footer">
            <button class="btn btn-outline" onclick="document.getElementById('modal-sazon').remove()">✕ Cerrar</button>
          </div>
        </div>
      </div>`);
  },

  renderEstilos() {
    return `<style id="estilos-recetas">
      .panel-recetas-wrap { margin:4px 0 8px; animation:slideDownR 0.2s ease; }
      @keyframes slideDownR { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      .recetas-container { background:var(--color-superficie);border:1.5px solid var(--color-borde);border-radius:10px;overflow:hidden; }
      .recetas-header { display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--color-superficie-hover);border-bottom:1px solid var(--color-borde); }
      .recetas-titulo { font-size:0.82rem;color:var(--color-texto-secundario); }
      .recetas-cerrar { background:none;border:none;cursor:pointer;color:var(--color-texto-secundario);font-size:1rem;padding:2px 6px; }
      .recetas-lista { display:flex;flex-direction:column; }
      .receta-opcion { display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--color-borde);cursor:pointer;transition:background 0.15s; }
      .receta-opcion:last-child { border-bottom:none; }
      .receta-opcion:hover { background:var(--color-superficie-hover); }
      .receta-emoji { font-size:1.4rem;min-width:28px;text-align:center; }
      .receta-info { flex:1; }
      .receta-nombre { font-weight:600;font-size:0.9rem;color:var(--color-texto-principal); }
      .receta-meta { font-size:0.75rem;color:var(--color-texto-secundario);margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap; }
      .receta-flecha { font-size:1.2rem;color:var(--color-texto-claro); }
      .receta-tipo { display:inline-block;padding:1px 7px;border-radius:999px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em; }
      .receta-tipo-fitness  { background:#d1fae5;color:#065f46; }
      .receta-tipo-rapido   { background:#fef9c3;color:#92400e; }
      .receta-tipo-casero   { background:#fee2e2;color:#991b1b; }
      .recetas-sazon-btn-wrap { padding:10px 14px;border-top:1px solid var(--color-borde);background:var(--color-superficie-hover); }
      .btn-sazon { width:100%;padding:7px 0;border:1.5px solid var(--color-borde);border-radius:8px;background:transparent;font-size:0.82rem;font-weight:600;color:var(--color-texto-secundario);cursor:pointer;font-family:inherit;transition:background 0.15s; }
      .btn-sazon:hover { background:white; }
      .modal-receta-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center;animation:fadeInR 0.2s ease; }
      @keyframes fadeInR { from{opacity:0} to{opacity:1} }
      .modal-receta-box { background:var(--color-superficie,white);border-radius:20px 20px 0 0;width:100%;max-width:540px;max-height:90vh;display:flex;flex-direction:column;animation:slideUpR 0.25s ease; }
      @keyframes slideUpR { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
      .modal-receta-header { display:flex;justify-content:space-between;align-items:flex-start;padding:20px 20px 14px;border-bottom:1px solid var(--color-borde);flex-shrink:0; }
      .modal-receta-emoji { font-size:2rem;margin-bottom:4px; }
      .modal-receta-nombre { font-size:1.1rem;font-weight:700;color:var(--color-texto-principal); }
      .modal-receta-meta { font-size:0.8rem;color:var(--color-texto-secundario);margin-top:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
      .modal-receta-cerrar { background:none;border:none;cursor:pointer;font-size:1.3rem;color:var(--color-texto-secundario);padding:0 4px;flex-shrink:0; }
      .modal-receta-body { overflow-y:auto;padding:16px 20px;flex:1; }
      .modal-receta-footer { padding:12px 20px;border-top:1px solid var(--color-borde);flex-shrink:0; }
      .receta-seccion { margin-bottom:18px; }
      .receta-seccion-titulo { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--color-texto-secundario);margin-bottom:8px; }
      .receta-ingredientes { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px; }
      .receta-ingredientes li { font-size:0.88rem;color:var(--color-texto-principal);padding:6px 10px;background:var(--color-superficie-hover);border-radius:6px;display:flex;align-items:center;gap:6px; }
      .receta-ingredientes li::before { content:'•';color:#10b981;font-weight:700; }
      .receta-pasos { padding-left:0;margin:0;counter-reset:paso;display:flex;flex-direction:column;gap:8px;list-style:none; }
      .receta-pasos li { font-size:0.88rem;color:var(--color-texto-principal);line-height:1.5;padding:8px 12px 8px 40px;background:var(--color-superficie-hover);border-radius:8px;position:relative;counter-increment:paso; }
      .receta-pasos li::before { content:counter(paso);position:absolute;left:10px;top:50%;transform:translateY(-50%);width:22px;height:22px;background:#10b981;color:white;border-radius:50%;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center; }
      .receta-sazon-libre { font-size:0.82rem;color:#065f46;background:#d1fae5;border-radius:6px;padding:7px 10px;margin-bottom:6px; }
      .receta-sazon-ctrl  { font-size:0.82rem;color:#92400e;background:#fef9c3;border-radius:6px;padding:7px 10px;margin-bottom:6px; }
      .receta-kcal-extra { font-size:0.78rem;color:var(--color-texto-secundario);padding:4px 0; }
      .receta-tip { background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:10px 14px;font-size:0.83rem;color:#1d4ed8;line-height:1.5; }
      .sazon-libre-titulo { color:#065f46; }
      .sazon-ctrl-titulo  { color:#92400e; }
      .sazon-libre-tags { display:flex;flex-wrap:wrap;gap:6px;margin-top:4px; }
      .sazon-tag-libre { padding:4px 10px;background:#d1fae5;color:#065f46;border-radius:999px;font-size:0.78rem;font-weight:600; }
      .sazon-ctrl-lista { display:flex;flex-direction:column;gap:8px;margin-top:6px; }
      .sazon-ctrl-item { display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fef9c3;border-radius:8px; }
      .sazon-ctrl-nombre { font-weight:600;font-size:0.85rem;flex:1; }
      .sazon-ctrl-nota   { font-size:0.75rem;color:#92400e; }
      .sazon-ctrl-kcal   { font-size:0.78rem;font-weight:700;color:#d97706;white-space:nowrap; }
    </style>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('estilos-recetas')) {
    document.head.insertAdjacentHTML('beforeend', window.recetas.renderEstilos());
  }
});
