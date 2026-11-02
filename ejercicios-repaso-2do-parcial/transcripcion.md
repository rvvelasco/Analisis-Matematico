# Repaso 2.º parcial (29/10/26) — transcripción de las capturas

Capturas originales: `1.png` … `10.png` (en esta carpeta). Pendiente: instrucciones sobre qué hacer con ellas.

## 1) Gráfico e intervalo de análisis (`1.png`)
- Curva sobre el eje x, marcas en −2π, −4/5, π/2, π, (π/2 en círculo amarillo, posiblemente otro valor), 8π/2.
- Puntos marcados en la curva: picos/esquinas (derivabilidad).
- Al costado: x₀ = π/2, dibujo de una "V" (punta → no derivable), definición
  lím_{Δx→0} [f(x₀+Δx) − f(x₀)] / Δx, con Δx = (x − x₀).
- Intervalo de análisis: [−2π ; −4/5] ∪ (π ; 8π/2).
- Nota al pie: "USD (1,59 + 0,004 = 1,5904)".

## V/F de teoría (`2.png`)
1. Una función integrable es derivable. Para un intervalo dado. Para todo su dominio.
2. La derivada es una variación y la integración una acumulación.
3. La integración es evaluada en un intervalo.
4. La derivada se calcula en un punto.
5. La integral es un límite de una suma.
6. La suma de dos integrales es la integral de la suma.
7. Una función derivable es integrable.
8. Si una función f es integrable con primitiva F + C (constante de integración), existe la derivada.
9. Una función derivable es integrable. Para un intervalo dado. Para todo su dominio.

(Ya están cargados en la app como V/F de la unidad i7.)

## 3) (`3.png`)
∫₁₀¹⁰ (cos²x + sen x) dx = 0 (límites iguales). Dibujo de sumas de Riemann: rectángulos f(xᵢ)·Δxᵢ; "si a = b".

## 4) Límites (`4.png`)
lím_{x→?} f(x) puede ser +∞, −∞ o un valor. valor/0 → ±∞. Indeterminaciones 0/0 y ∞/∞.

## 5) Antes de límite/derivada/integral, mirar el álgebra (`5.png`)
Problemas en las raíces del denominador: (x − a); x² − 2x + 7; sen(x); cos(x); tg(4x² + 8x − 7) (se anota 4x² + 8x − 7 = 0 / π / 2π).
sen(x) = 0 ⇔ x = nπ, n ∈ ℤ. En la pizarra: cos(x) = 0 ⇔ x = nπ/2 (ojo: lo correcto es x = π/2 + nπ).

## 6) V o F (`6.png`)
a) ∫(cos x + sen x) dx = ∫cos x dx − 2∫sen x dx + ∫sen x dx → la pizarra opera (−2 + 1) = −1 y queda ∫cos x dx − ∫sen x dx → **F**.
b) ∫₋₂¹ x²/3 dx = ∫₋₂⁰ x²/3 dx + ∫₀¹ x²/3 dx → V.
c) ∫₋₂π²π sen(x) dx = 0 → −cos x |₋₂π²π = cos(−2π) − cos(2π) = 1 − 1 = 0 → V.

## 7) Cambio de variable (`7.png`)
∫₀^{π/2} sen(t/2) dt: u = t/2, du = dt/2, dt = 2 du → ∫2 sen(u) du = −2cos(u) → −2cos(t/2) |₀^{π/2} = −2[cos(π/4) − cos 0] = 2 − √2 ≈ 0,586.
Recuadro: ∫₀^{2π} sen(x/2) dt — la variable es t, sen(x/2) es constante: = sen(x/2)·t |₀^{2π} = 2π sen(x/2).

## 8) (`8.png`)
0 · ∫_{−π/2}^{π} arctg(ln(x³/(x − 4)⁵)) dx = 0 (multiplicar por 0).
(Ojo: en rigor el logaritmo no está definido en parte de ese intervalo.)

## 9) (`8.png`)
4 · ∫₂² (2 − x)² dx = 0 (límites iguales).

## 11) V o F (`9.png`)
∫ sen(√x) dx = 2√x cos√x + 2 sen√x + C → **F**.
u = √x, dx = 2u du → 2∫u sen u du = 2[−u cos u + sen u] + C = −2√x cos√x + 2 sen√x + C (el signo del primer término es −).

## 12) (`10.png`)
f = c (constante) → df/dx = dc/dx = 0.
