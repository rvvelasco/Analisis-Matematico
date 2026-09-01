# Analista en Sistemas · Centro de estudio

Portal de estudio interactivo para la carrera de Analista en Sistemas. Guías teóricas, ejercicios resueltos y un simulador de exámenes, todo en HTML estático (sin dependencias, sin build).

## Contenido

| Archivo | Qué es |
|---|---|
| `index.html` | Portal principal. Punto de entrada del sitio. |
| `guia-teoria-de-conjuntos.html` | **Análisis Matemático**: teoría de conjuntos, producto cartesiano, matrices, determinantes, inversa, Cramer y matriz aumentada. |
| `guia-bases-de-datos.html` | **Bases de Datos**: modelo Entidad-Relación, paso a tablas, integridad referencial, Verdadero/Falso conceptual. |
| `guia-logica-computacional.html` | **Lógica Computacional**: sistemas de numeración y conversiones entre bases (binario, octal, decimal, hexadecimal). |
| `simulador-examenes.html` | Simulador de exámenes de Análisis: 33 exámenes en 3 dificultades, con corrección automática. |

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
