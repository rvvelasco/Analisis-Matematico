# MathVerse

Plataforma interactiva para aprender matemática de nivel universitario inicial: **Funciones, Matrices, Vectores, Derivadas e Integrales**. Cada tema se descubre, se visualiza, se practica, se juega y se demuestra. Todo en español rioplatense, sin servicios pagos y funcionando sin conexión una vez cargada.

- **Online:** https://rvvelasco.github.io/Analisis-Matematico/mathverse-app/
- **Código:** esta carpeta (`mathverse/`). La versión compilada que publica GitHub Pages está en `../mathverse-app/`.

---

## Requisitos

- **Node.js 20 o superior** (recomendado 22 LTS). Descarga: https://nodejs.org (instalador para Windows, "LTS").
- npm (viene con Node).
- Un navegador moderno (Chrome, Edge, Firefox o Safari).

## Instalar y ejecutar en Windows

Abrí **PowerShell** o **Símbolo del sistema** (cmd) y escribí:

```bat
cd C:\ruta\donde\descomprimiste\mathverse
npm install
npm run dev
```

Se abre un servidor local; entrá a la dirección que muestra (normalmente **http://localhost:5173**).

> Si PowerShell dice que "la ejecución de scripts está deshabilitada" al usar `npm`, usá `cmd` en lugar de PowerShell, o ejecutá una vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Otros comandos (iguales en Windows, macOS y Linux)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática. |
| `npm test` | Corre todas las pruebas automáticas (motor matemático, banco de ejercicios, currículo, progreso). |
| `npm run typecheck` | Verifica tipos de TypeScript (debe terminar sin errores). |
| `npm run build` | Verifica tipos y genera la versión final en `dist/`. |
| `npm run preview` | Sirve la carpeta `dist/` para probar la versión final (http://localhost:4173). |

### Usarla sin conexión

- Después de `npm install`, `npm run dev` y `npm run build` no necesitan internet (no hay CDNs: KaTeX y las fuentes van incluidas).
- La versión publicada registra un *service worker*: después de abrirla una vez, todas las pantallas funcionan sin conexión. En el celular se puede "Agregar a la pantalla de inicio".

### Publicar la versión compilada

```bat
npm run build
```

y copiá el contenido de `dist\` a la carpeta que sirva tu hosting. En este repositorio se copia a `..\mathverse-app\` (GitHub Pages la sirve tal cual: usa rutas relativas y navegación por `#`, así que funciona en cualquier subcarpeta).

---

## Qué incluye

### Contenido
- **5 áreas, 43 unidades**, ordenadas pedagógicamente con prerrequisitos (Funciones → Matrices → Vectores → Derivadas → Integrales; Derivadas e Integrales son las más completas: 11 y 9 unidades).
- **Lecciones en 10 etapas**: Descubrí · Entendé · Visualizá · Teoría · Ejemplo resuelto · Practicá · Desafiá tu intuición · Jugá · Demostrá · Repasá.
- **138 plantillas de ejercicios** con parámetros controlados (miles de variantes) en **6 niveles**: Explorador, Aprendiz, Analista, Experto, Parcial y Final. Cada ejercicio explica **por qué pertenece a su nivel**.
- **Tipos de ejercicio**: opción múltiple, verdadero/falso con justificación, numérico, expresión algebraica, completar casilleros, ordenar pasos, relacionar, matriz, encontrar el error (con corrección), problemas con partes (tipo parcial/final) y desafíos con controles deslizantes.

### Corrección inteligente
- Las expresiones se comparan por **equivalencia matemática** (evaluando en muchos puntos), nunca por texto: `2x·3`, `6x`, `6*x` o `x*6` valen lo mismo. Acepta notación libre: `x²`, `·`, `sen`, `√`, `|x|`, coma decimal, multiplicación implícita, `+ C`.
- Si no se puede decidir (por ejemplo, la expresión casi no se puede evaluar), el resultado es **"no lo puedo decidir"**, nunca "incorrecto".
- **Diagnóstico de errores**: signo cambiado, factor constante (típico de olvidar la regla de la cadena), copiar la función, derivar en vez de integrar y viceversa, olvidar la constante, errores típicos específicos de cada ejercicio.
- **Ayuda gradual**: diagnóstico → pista sutil → pista concreta → solución completa. Siempre podés elegir reintentar, pedir pista o ver la solución.

### Visualizaciones (17)
Familias con parámetros, ondas, función inversa, límites, secante → tangente, tangente arrastrable, f y f′ sincronizadas, sumas de Riemann (4 métodos), área con signo, función acumulada (TFC), suma de vectores, producto escalar y proyección, combinación lineal, transformaciones lineales, producto de matrices, sistemas como rectas y Gauss paso a paso. Todas con zoom/desplazamiento y responsive.

### Juegos (10)
1. Laboratorio de funciones · 2. Cazador de errores · 3. Duelo contra reloj · 4. Puzzle algebraico · 5. Constructor de integrales · 6. Fábrica de derivadas · 7. Arquitecto de matrices · 8. Arena de parciales (simulacros) · 9. Desafío diario · 10. Sandbox.

### Progreso y adaptación
- Por concepto: intentos, correctos, incorrectos, pistas, soluciones vistas, tiempo, última práctica, nivel máximo resuelto sin ayuda y **dominio estimado**. Estados: visto / practicado / dominado.
- **Dominado** exige resolver bien sin ayuda ejercicios de nivel Analista o superior (practicar solo nivel 1 no alcanza).
- **Desbloqueos por dominio demostrado** (no por puntos), o por **prueba de nivel**.
- Práctica adaptativa (elige nivel y conceptos según tu dominio), repaso espaciado de errores (1, 3 y 7 días), recomendaciones, XP y niveles, rachas, misiones diarias, 22 logros, récords y estadísticas.
- Persistencia local versionada y validada; **exportar/importar** en JSON.

### Diseño
Modo oscuro y claro, navegación lateral (escritorio) e inferior (celular), accesible con teclado, textos alternativos, tamaño de letra configurable y movimiento reducido.

---

## Estructura

```
mathverse/
├─ index.html                 entrada (aplica el tema antes de pintar)
├─ public/                    favicon, manifest y service worker (offline)
├─ vite.config.ts             build + lista de archivos para uso offline
└─ src/
   ├─ math/                   MOTOR MATEMÁTICO (sin interfaz)
   │  ├─ expr.ts              parser tolerante, evaluación, derivada simbólica, simplificación, TeX
   │  ├─ equivalence.ts       equivalencia de expresiones (exacta / salvo constante) y números
   │  ├─ fraction.ts          fracciones exactas
   │  ├─ matrix.ts            matrices exactas: det, inversa, Gauss-Jordan con pasos, Rouché
   │  ├─ vector.ts            vectores
   │  └─ numeric.ts           azar con semilla, Simpson, Riemann, raíces, formato
   ├─ engine/                 MOTOR DE EJERCICIOS Y EVALUACIÓN
   │  ├─ types.ts             modelo de ejercicio (unión discriminada por tipo)
   │  ├─ registry.ts          plantilla + semilla + nivel → ejercicio reproducible
   │  ├─ validate.ts          corrección y diagnóstico para cada tipo
   │  ├─ adaptive.ts          práctica adaptativa, pruebas, simulacros, desafío diario
   │  └─ sliderChecks.ts      criterios de los desafíos con controles
   ├─ content/                BANCO DE CONTENIDOS
   │  ├─ curriculum.ts        áreas, unidades, prerrequisitos y conceptos
   │  ├─ lessons/*.ts         lecciones (10 etapas) por área
   │  └─ templates/*.ts       plantillas de ejercicios por área
   ├─ progress/               PROGRESO, GAMIFICACIÓN Y PERSISTENCIA
   │  ├─ schema.ts            esquema versionado, validación, exportar/importar
   │  ├─ mastery.ts           dominio, estados, desbloqueos, recomendaciones
   │  ├─ gamification.ts      XP, niveles, logros, misiones
   │  └─ store.ts             almacén (localStorage) y acciones
   ├─ viz/                    VISUALIZACIONES
   ├─ exercise/               reproductor de ejercicios y controles de respuesta
   ├─ games/                  los 10 juegos
   ├─ pages/                  pantallas
   └─ ui/                     diseño: gráfico SVG, KaTeX, layout, íconos
```

## Pruebas

`npm test` ejecuta 250 pruebas:

- **Motor matemático**: lectura de expresiones, derivadas, equivalencias, matrices, vectores, métodos numéricos e impresión TeX.
- **Banco de ejercicios**: para **cada plantilla, en cada nivel, con 40 semillas**, verifica que la respuesta correcta se acepte, que ningún "error típico" coincida con la respuesta, que las opciones múltiples tengan una sola correcta, que haya pistas, resolución y explicación, y (en integrales) que la derivada de la primitiva sea el integrando.
- **Currículo**: unidades con ejercicios, prerrequisitos válidos y sin ciclos, fórmulas de las visualizaciones legibles.
- **Verificación independiente** (`src/engine/audit.test.ts`): recalcula las respuestas con métodos distintos a los del motor (derivadas numéricas, Simpson propio, determinantes por Laplace, sustitución en sistemas, búsqueda exhaustiva de extremos, límites evaluados cerca del punto) y prueba que el auditor detecte respuestas alteradas.
- **Equivalencias** (`src/engine/equivalence.audit.test.ts`): formas equivalentes que deben aceptarse (factorizada/desarrollada, identidades, `+ C`, `ln|x|`, redondeos razonables) y errores que deben rechazarse.
- **Progreso**: validación de datos dañados, exportar/importar, dominio, desbloqueos, repaso espaciado, XP y misiones.

## Cómo seguir desarrollando

- **Agregar un ejercicio**: creá una plantilla en `src/content/templates/<área>.ts` con `id`, `unit`, `levels` y `gen(r, level)` usando `make(...)`. El test del banco la valida sola: corré `npm test`.
- **Agregar una unidad**: sumala en `src/content/lessons/<área>.ts` (con sus 10 etapas y prerrequisitos) y nombrá sus conceptos en `src/content/curriculum.ts`.
- **Agregar una visualización**: componente en `src/viz/`, un caso en `WidgetSpec` (`src/content/types.ts`) y en `src/viz/Widget.tsx`.
- **Agregar un juego**: componente en `src/games/`, entrada en `src/games/catalog.ts` y ruta en `src/App.tsx`.
- Si cambia la forma de los datos guardados, subí `SCHEMA_VERSION` y adaptá `sanitize()` en `src/progress/schema.ts`.
