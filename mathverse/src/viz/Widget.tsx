/** Despachador de visualizaciones a partir de su especificación. */
import type { WidgetSpec } from '../content/types'
import { AccumulationWidget, AreaWidget, DerivGraphWidget, FamilyWidget, InverseWidget, LimitWidget, RiemannWidget, SecantWidget, TangentWidget } from './calculus'
import { DotWidget, GaussWidget, MatrixProductWidget, MatrixTransformWidget, SpanWidget, SystemLinesWidget, VectorsWidget } from './linear'

export function Widget({ spec }: { spec: WidgetSpec }) {
  switch (spec.type) {
    case 'family': return <FamilyWidget {...spec} />
    case 'tangent': return <TangentWidget {...spec} />
    case 'secant': return <SecantWidget {...spec} />
    case 'limit': return <LimitWidget {...spec} />
    case 'derivGraph': return <DerivGraphWidget {...spec} />
    case 'riemann': return <RiemannWidget {...spec} />
    case 'area': return <AreaWidget {...spec} />
    case 'accumulation': return <AccumulationWidget {...spec} />
    case 'inverseFn': return <InverseWidget {...spec} />
    case 'vectors': return <VectorsWidget />
    case 'dot': return <DotWidget />
    case 'span': return <SpanWidget />
    case 'matrixTransform': return <MatrixTransformWidget />
    case 'matrixProduct': return <MatrixProductWidget />
    case 'systemLines': return <SystemLinesWidget />
    case 'gauss': return <GaussWidget />
  }
}
