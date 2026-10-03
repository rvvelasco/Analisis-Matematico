# Analista en Sistemas · Centro de estudio

Portal de estudio interactivo para la carrera de Analista en Sistemas. Guías teóricas, ejercicios resueltos y un simulador de exámenes, todo en HTML estático (sin dependencias, sin build).

## Contenido

| Archivo | Qué es |
|---|---|
| `index.html` | Portal principal. Punto de entrada del sitio. |
| `guia-teoria-de-conjuntos.html` | **Análisis Matemático · Unidades 1 y 3**: teoría de conjuntos, producto cartesiano, matrices (tipos, propiedades, aplicaciones), determinantes de orden n (Sarrus, Laplace, cálculo con propiedades), adjunta e inversa, Gauss-Jordan, Cramer y sistemas (Rouché-Frobenius, conjunto solución, parámetros, problemas). |
| `guia-vectores.html` | **Análisis Matemático · Unidad 2**: vectores de n componentes, operaciones, producto escalar, norma, proyecciones, producto vectorial, dependencia lineal, base, dimensión y transformaciones lineales (matriz, núcleo, imagen, composición). |
| `guia-relaciones-funciones.html` | **Análisis Matemático · Unidad 4**: relaciones y sus propiedades, equivalencia y orden, funciones (inyectiva, sobreyectiva, biyectiva, composición, inversa, gráficas e intersecciones), Venn con 3 conjuntos y conteo, conjunto potencia, numerabilidad, aritmética modular y congruencias. |
| `guia-bases-de-datos.html` | **Bases de Datos**: modelo Entidad-Relación, paso a tablas, integridad referencial, Verdadero/Falso conceptual. |
| `guia-logica-computacional.html` | **Lógica Computacional**: sistemas de numeración y conversiones entre bases (binario, octal, decimal, hexadecimal). |
| `simulador-examenes.html` | Simulador de exámenes de Análisis: 20 temas en 4 niveles (básico, normal, examen y **parcial terciario**), 4 parciales modelo por unidad y un integrador. Incluye preguntas de V/F que se responden interpretando gráficos o situaciones. Las de opción múltiple y V/F se corrigen solas; las de desarrollo tienen la solución explicada y autoevaluación. |
| `graficos.js` | Mini-librería de gráficos SVG (funciones, vectores, Venn, diagramas sagitales, grafos, reloj modular) que usan las guías y el simulador. |
| `examenes-datos.js` | Banco de preguntas del simulador. |

Cada guía tiene conceptos clave clickeables (abren su definición), cajas **"En criollo"** en lenguaje cotidiano y ejercicios resueltos, incluyendo ejercicios de dificultad **"nivel libro"**.

## Cómo publicarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub (por ejemplo, `estudio-analista`).
2. Subí **todos los archivos de esta carpeta** a la raíz del repo (podés arrastrarlos en *Add file → Upload files*).
3. En el repo, andá a **Settings → Pages**.
4. En *Build and deployment → Source*, elegí **Deploy from a branch**.
5. Elegí la rama `main` y la carpeta `/ (root)`. Guardá.
6. Esperá un minuto y tu sitio queda online en:
   `https://TU-USUARIO.github.io/estudio-analista/`

El sitio abre por `index.html` automáticamente y desde ahí navegás a cada materia.

## Notas

- Es 100% estático: no necesita servidor, base de datos ni instalación.
- Las tipografías se cargan desde Google Fonts (por internet); si estás sin conexión, se ven con fuentes de respaldo.
- El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll (no hace falta tocarlo).
