import { describe, expect, it } from 'vitest'
import { compile, diff, parse, toTeX, toText, simplify } from './expr'
import { checkExpression, compareFunctions, parseNumber } from './equivalence'
import { det, inverse, M, mmul, rref, solveSystem, mequal, identity } from './matrix'
import { frac, fstr } from './fraction'
import { angleDeg, dot, norm, proj } from './vector'
import { findRoots, numDeriv, riemannSum, simpson } from './numeric'

const at = (s: string, x: number, v = 'x') => compile(parse(s, { vars: [v] }), v)(x)

describe('parser', () => {
  it('entiende escritura informal', () => {
    expect(at('2x^2', 3)).toBeCloseTo(18)
    expect(at('2x²', 3)).toBeCloseTo(18)
    expect(at('3(x+1)', 2)).toBeCloseTo(9)
    expect(at('x sen x', 1)).toBeCloseTo(Math.sin(1))
    expect(at('sen^2 x + cos^2 x', 0.7)).toBeCloseTo(1)
    expect(at('√x', 9)).toBeCloseTo(3)
    expect(at('√x³', 4)).toBeCloseTo(8)
    expect(at('ln|x|', -Math.E)).toBeCloseTo(1)
    expect(at('e^x', 1)).toBeCloseTo(Math.E)
    expect(at('2/3x', 3)).toBeCloseTo(2)
    expect(at('x^-2', 2)).toBeCloseTo(0.25)
    expect(at('−x²', 3)).toBeCloseTo(-9)
    expect(at('(x+1)(x-1)', 3)).toBeCloseTo(8)
    expect(at('x^(1/3)', -8)).toBeCloseTo(-2)
    expect(at('2πx', 1)).toBeCloseTo(2 * Math.PI)
    expect(at('f(x) = 3x+1', 1)).toBeCloseTo(4)
  })
  it('da mensajes claros', () => {
    expect(() => parse('2x + y')).toThrow(/letra "y"/)
    expect(() => parse('(x+1')).toThrow(/paréntesis/)
    expect(() => parse('x +')).toThrow()
  })
  it('respeta la precedencia de potencia y menos', () => {
    expect(at('-x^2', 2)).toBe(-4)
    expect(at('2^3^2', 0)).toBe(512)
  })
})

describe('derivada simbólica', () => {
  const cases: Array<[string, number]> = [
    ['x^5', 1.3], ['3x^4 - 5x^2 + 7x - 2', 0.8], ['sen(x^2)', 1.1], ['e^(3x)*x^2', 0.4], ['ln(x^2+1)', 2],
    ['(x+1)/(x-1)', 3], ['sqrt(1-x^2)', 0.3], ['x^x', 1.5], ['tan(x)', 0.5], ['arctg(2x)', 0.7], ['cos(x)^3', 0.9],
  ]
  for (const [f, x] of cases) {
    it(`d/dx ${f}`, () => {
      const g = compile(parse(f))
      const d = compile(diff(parse(f)))
      expect(d(x)).toBeCloseTo(numDeriv(g, x), 5)
    })
  }
  it('simplifica a formas legibles', () => {
    expect(toText(diff(parse('x^3')))).toBe('3*x^2')
    expect(toText(diff(parse('5')))).toBe('0')
    expect(toText(simplify(parse('0 + 1*x')))).toBe('x')
    expect(toTeX(parse('x^2/2'))).toContain('\\frac')
  })
})

describe('equivalencia', () => {
  it('acepta formas equivalentes', () => {
    expect(checkExpression('e^x(x^2+2x)', '2x e^x + x^2 e^x').status).toBe('equal')
    expect(checkExpression('(x+1)^2', 'x^2+2x+1').status).toBe('equal')
    expect(checkExpression('1/(2√x)', '0.5x^(-1/2)', { domain: [0.1, 5] }).status).toBe('equal')
  })
  it('integral: acepta diferencias en una constante', () => {
    expect(checkExpression('(x+1)^3/3 + C', 'x^3/3 + x^2 + x', { mode: 'upToConstant' }).status).toBe('equal')
    expect(checkExpression('x^3/3', 'x^3/3 + x', { mode: 'upToConstant' }).status).toBe('different')
    const r = checkExpression('x^2/2 + C', 'x^2/2', { mode: 'upToConstant' })
    expect(r.hadC).toBe(true)
  })
  it('detecta diferencias', () => {
    expect(checkExpression('2x e^x', '2x e^x + x^2 e^x').status).toBe('different')
  })
  it('reconoce cuando no puede decidir', () => {
    // la respuesta esperada no existe en el dominio pedido
    expect(compareFunctions((x) => Math.sqrt(-x - 10), (x) => x, { domain: [0, 5] }).status).toBe('unknown')
  })
  it('lee números escritos de varias formas', () => {
    expect(parseNumber('3/4')).toBeCloseTo(0.75)
    expect(parseNumber('-1,5')).toBeCloseTo(-1.5)
    expect(parseNumber('2pi')).toBeCloseTo(2 * Math.PI)
    expect(parseNumber('sqrt(2)')).toBeCloseTo(Math.SQRT2)
    expect(parseNumber('abc')).toBeNull()
  })
})

describe('matrices', () => {
  it('producto no conmutativo', () => {
    const A = M([[1, 2], [3, 4]]), B = M([[0, 1], [1, 0]])
    expect(mequal(mmul(A, B), M([[2, 1], [4, 3]]))).toBe(true)
    expect(mequal(mmul(B, A), M([[3, 4], [1, 2]]))).toBe(true)
  })
  it('determinante e inversa exactos', () => {
    const A = M([[2, 0, 1], [1, 1, 0], [0, 3, 1]])
    expect(fstr(det(A))).toBe('5')
    const inv = inverse(A)!
    expect(mequal(mmul(A, inv), identity(3))).toBe(true)
    expect(inverse(M([[1, 2], [2, 4]]))).toBeNull()
    expect(fstr(det(M([[1, 2, 0, 1], [2, 4, 1, 3], [0, 1, 1, 1], [3, 6, 0, 4]])))).toBe('-1')
  })
  it('Gauss-Jordan y Rouché-Frobenius', () => {
    const r = solveSystem(M([[1, 1, 1], [2, -1, 1], [1, 2, -1]]), [6, 3, 2].map((v) => frac(v)))
    expect(r.kind).toBe('SCD')
    expect(r.solution!.map(fstr)).toEqual(['1', '2', '3'])
    expect(solveSystem(M([[1, 1], [2, 2]]), [frac(1), frac(3)]).kind).toBe('SI')
    expect(solveSystem(M([[1, 1], [2, 2]]), [frac(1), frac(2)]).kind).toBe('SCI')
    expect(rref(M([[1, 2], [3, 4]])).steps.length).toBeGreaterThan(0)
  })
})

describe('vectores', () => {
  it('producto escalar, norma, ángulo y proyección', () => {
    expect(dot([1, 2, 3], [4, 0, -1])).toBe(1)
    expect(norm([3, 4])).toBe(5)
    expect(angleDeg([2, 1], [1, 3])).toBeCloseTo(45)
    expect(proj([2, 3], [4, 0])).toEqual([2, 0])
  })
})

describe('numérico', () => {
  it('integra y suma de Riemann', () => {
    expect(simpson((x) => x * x, 0, 2)).toBeCloseTo(8 / 3, 8)
    expect(riemannSum((x) => x * x, 0, 2, 4, 'der')).toBeCloseTo(3.75)
    expect(riemannSum((x) => x * x, 0, 2, 4, 'izq')).toBeCloseTo(1.75)
  })
  it('encuentra raíces', () => {
    const r = findRoots((x) => x * x - 2 * x - 3, -5, 5)
    expect(r.map((v) => Math.round(v * 1e6) / 1e6)).toEqual([-1, 3])
  })
})

describe('impresión TeX legible', () => {
  const t = (s: string) => toTeX(parse(s))
  it('omite coeficientes 1, sumandos 0 y escribe bien los signos', () => {
    expect(t('1*(x + 0)^2 + 1')).toBe('x^{2} + 1')
    expect(t('2*x^2 + 0*x - 3')).toBe('2x^{2} - 3')
    expect(t('2*e^x + -3*ln(x)')).toBe('2e^{x} - 3\\ln x')
    expect(t('-1*(x - 3)^2 - 2')).toBe('-\\left(x - 3\\right)^{2} - 2')
    expect(t('x - (-4)')).toBe('x + 4')
  })
})
