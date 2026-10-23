/** Juego 10 · Sandbox: calculadora gráfica y simbólica libre. */
import { useEffect, useMemo, useState } from 'react'
import { compile, diff, parse, ParseError, simplify, toTeX } from '../math/expr'
import { findRoots, fmt, simpson } from '../math/numeric'
import { det, inverse, matTeX, mmul, rank, rref, transpose, type Mat } from '../math/matrix'
import { parseFrac, ftex } from '../math/fraction'
import { angleDeg, cross, dot, norm } from '../math/vector'
import { recordGame } from '../progress/store'
import { Plot } from '../ui/Plot'
import { TeX } from '../ui/Md'
import { GaussWidget } from '../viz/linear'
import { GameShell } from './common'

function FunctionsTab() {
  const [src, setSrc] = useState('x^3 - 3x + 1')
  const [a, setA] = useState('-1')
  const [b, setB] = useState('2')
  const [x0, setX0] = useState('1')
  const r = useMemo(() => {
    try {
      const n = parse(src)
      const d = simplify(diff(n))
      const d2 = simplify(diff(d))
      return { n, d, d2, f: compile(n), fd: compile(d), error: null as string | null }
    } catch (e) { return { error: e instanceof ParseError ? e.message : 'No pude leer la función.' } }
  }, [src])
  const av = Number(a.replace(',', '.')), bv = Number(b.replace(',', '.')), xv = Number(x0.replace(',', '.'))
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="card p-3">
        {'f' in r && r.f ? <Plot x={[-6, 6]} y={[-6, 6]} fns={[{ f: r.f, label: 'f(x)' }, { f: r.fd!, label: "f'(x)", dashed: true, color: 'brand2' }]} shades={isFinite(av) && isFinite(bv) ? [{ f: r.f, a: Math.min(av, bv), b: Math.max(av, bv), signed: true }] : []} points={findRoots(r.f, -6, 6).map((x) => ({ x, y: 0, color: 'ok' }))} />
          : <div className="grid h-64 place-items-center text-warn">{r.error}</div>}
      </div>
      <div className="card grid content-start gap-3 p-4 text-sm">
        <label className="grid gap-1"><span className="label">f(x) =</span><input className="input" value={src} onChange={(e) => setSrc(e.target.value)} aria-label="Función" /></label>
        {'n' in r && r.n && (
          <>
            <div className="overflow-x-auto"><TeX tex={`f(x) = ${toTeX(r.n)}`} /></div>
            <div className="overflow-x-auto"><TeX tex={`f'(x) = ${toTeX(r.d!)}`} /></div>
            <div className="overflow-x-auto"><TeX tex={`f''(x) = ${toTeX(r.d2!)}`} /></div>
            <div className="flex items-center gap-2">Evaluar en x = <input className="input !w-20 !py-1" value={x0} onChange={(e) => setX0(e.target.value)} aria-label="Valor de x" /></div>
            <div className="font-mono">f = {fmt(r.f!(xv), 5)} · f' = {fmt(r.fd!(xv), 5)}</div>
            <div className="flex items-center gap-1">∫ de <input className="input !w-16 !py-1" value={a} onChange={(e) => setA(e.target.value)} aria-label="Límite inferior" /> a <input className="input !w-16 !py-1" value={b} onChange={(e) => setB(e.target.value)} aria-label="Límite superior" /></div>
            <div className="font-mono">≈ {isFinite(av) && isFinite(bv) ? fmt(simpson(r.f!, av, bv, 4000), 6) : '—'}</div>
            <div>Raíces en [−6, 6]: <span className="font-mono">{findRoots(r.f!, -6, 6).map((x) => fmt(x, 4)).join('; ') || 'ninguna'}</span></div>
          </>
        )}
        <p className="text-xs text-muted">Podés escribir: x^2, 3x, sqrt(x), sen(x), cos(x), e^x, ln(x), |x|, pi.</p>
      </div>
    </div>
  )
}

function parseMat(text: string): Mat | null {
  const rows = text.trim().split(/[;\n]+/).map((r) => r.trim().split(/[\s,]+/).filter(Boolean))
  if (!rows.length || !rows[0].length) return null
  const n = rows[0].length
  if (rows.some((r) => r.length !== n)) return null
  const m = rows.map((r) => r.map(parseFrac))
  return m.every((r) => r.every((c) => c !== null)) ? (m as Mat) : null
}

function MatricesTab() {
  const [ta, setTa] = useState('2 1 0; 1 3 1; 0 1 2')
  const [tb, setTb] = useState('1 0 0; 0 1 0; 0 0 1')
  const A = parseMat(ta), B = parseMat(tb)
  const square = A && A.length === A[0].length
  let prod: string
  try { prod = A && B ? matTeX(mmul(A, B)) : '' } catch (e) { prod = `\\text{${(e as Error).message.replace(/[{}\\]/g, '')}}` }
  const inv = square ? inverse(A!) : null
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card grid content-start gap-3 p-4">
        <label className="grid gap-1"><span className="label">Matriz A (filas separadas por ;)</span><textarea className="input min-h-[4.5rem]" value={ta} onChange={(e) => setTa(e.target.value)} /></label>
        <label className="grid gap-1"><span className="label">Matriz B</span><textarea className="input min-h-[4.5rem]" value={tb} onChange={(e) => setTb(e.target.value)} /></label>
        {!A && <p className="text-warn text-sm">A no es una matriz válida (todas las filas con la misma cantidad de números).</p>}
      </div>
      {A && (
        <div className="card grid content-start gap-3 overflow-x-auto p-4 text-sm">
          <TeX tex={`A = ${matTeX(A)}`} display />
          {square ? <><TeX tex={`\\det A = ${ftex(det(A))}`} display />{inv ? <TeX tex={`A^{-1} = ${matTeX(inv)}`} display /> : <p>A no es invertible (det = 0).</p>}</> : <p>A no es cuadrada: no tiene determinante ni inversa.</p>}
          <TeX tex={`A^T = ${matTeX(transpose(A))}`} display />
          <TeX tex={`\\operatorname{rg}A = ${rank(A)}, \\quad \\operatorname{rref}(A) = ${matTeX(rref(A).matrix)}`} display />
          {B && <TeX tex={`A\\cdot B = ${prod}`} display />}
        </div>
      )}
    </div>
  )
}

function VectorsTab() {
  const [tu, setTu] = useState('1, 2, 2')
  const [tv, setTv] = useState('3, 0, 4')
  const pv = (t: string) => { const xs = t.split(/[\s,;]+/).filter(Boolean).map((x) => Number(x.replace(',', '.'))); return xs.length >= 2 && xs.every(isFinite) ? xs : null }
  const u = pv(tu), v = pv(tv)
  const same = u && v && u.length === v.length
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card grid content-start gap-3 p-4">
        <label className="grid gap-1"><span className="label">u</span><input className="input" value={tu} onChange={(e) => setTu(e.target.value)} /></label>
        <label className="grid gap-1"><span className="label">v</span><input className="input" value={tv} onChange={(e) => setTv(e.target.value)} /></label>
        {u && v && u.length === 2 && v.length === 2 && <Plot x={[-6, 6]} y={[-5, 5]} equal interactive={false} vectors={[{ to: [u[0], u[1]], label: 'u' }, { to: [v[0], v[1]], label: 'v', color: 'brand2' }, { to: [u[0] + v[0], u[1] + v[1]], label: 'u+v', color: 'ok' }]} />}
      </div>
      <div className="card grid content-start gap-2 p-4 font-mono text-sm">
        {!same ? <p className="font-sans text-warn">Escribí dos vectores de la misma dimensión (2 o 3 componentes).</p> : (
          <>
            <div>|u| = {fmt(norm(u!), 5)} · |v| = {fmt(norm(v!), 5)}</div>
            <div>u + v = ({u!.map((x, i) => fmt(x + v![i], 4)).join('; ')})</div>
            <div>u − v = ({u!.map((x, i) => fmt(x - v![i], 4)).join('; ')})</div>
            <div>u · v = {fmt(dot(u!, v!), 5)}</div>
            <div>ángulo = {angleDeg(u!, v!) === null ? '—' : fmt(angleDeg(u!, v!)!, 3) + '°'}</div>
            {u!.length === 3 && <div>u × v = ({cross(u!, v!).map((x) => fmt(x, 4)).join('; ')})</div>}
          </>
        )}
      </div>
    </div>
  )
}

const TABS = [{ id: 'f', label: 'Funciones' }, { id: 'm', label: 'Matrices' }, { id: 'v', label: 'Vectores' }, { id: 's', label: 'Sistemas (Gauss)' }]

export default function Sandbox() {
  const [tab, setTab] = useState('f')
  useEffect(() => { recordGame('sandbox', {}) }, [])
  return (
    <GameShell id="sandbox">
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">{TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={'btn ' + (tab === t.id ? 'bg-brand text-white' : 'border border-line bg-surface2/60')} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      {tab === 'f' && <FunctionsTab />}
      {tab === 'm' && <MatricesTab />}
      {tab === 'v' && <VectorsTab />}
      {tab === 's' && <div className="card-pad"><GaussWidget /></div>}
    </GameShell>
  )
}
