import { NextResponse, type NextRequest } from 'next/server'
import { checkRol } from '@/lib/auth'
import { TODOS } from '@/lib/constants'
import { csvResponse, toCSV } from '@/lib/csv'
import { textoLotes } from '@/components/lotes-lista'
import { getConfig, getExistencias, getLotesDisponiblesPorProducto, getLotesPorVencer, getLotesVencidos, getMovimientos, leerFiltrosMovimientos } from '@/lib/data'
import { formatFecha, hoyISO } from '@/lib/format'

const ESTADO: Record<string, string> = { normal: 'Normal', bajo: 'Stock bajo', agotado: 'Agotado' }

export async function GET(req: NextRequest) {
  if (!(await checkRol(TODOS))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const sp = Object.fromEntries(req.nextUrl.searchParams)
  const tipo = sp.reporte
  const hoy = hoyISO()

  if (tipo === 'existencias') {
    const [rows, lotes] = await Promise.all([
      getExistencias({ categoria: sp.categoria, estado: sp.estado }),
      getLotesDisponiblesPorProducto(),
    ])
    return csvResponse(
      `existencias-${hoy}.csv`,
      toCSV(
        ['Código', 'Producto', 'Lotes en bodega', 'Categoría', 'Disponible', 'Unidad', 'Stock mínimo', 'Estado', 'Próximo vencimiento'],
        rows.map((r) => [
          r.codigo,
          r.nombre,
          textoLotes(lotes.get(r.id) ?? [], r.unidad_medida),
          r.categoria,
          r.stock_total,
          r.unidad_medida,
          r.stock_minimo,
          ESTADO[r.estado_stock],
          r.stock_total > 0 ? formatFecha(r.proximo_vencimiento) : '',
        ]),
      ),
    )
  }

  if (tipo === 'movimientos') {
    const { movimientos } = await getMovimientos({ ...leerFiltrosMovimientos(sp), todos: true })
    return csvResponse(
      `movimientos-${hoy}.csv`,
      toCSV(
        ['Fecha', 'Tipo', 'Código', 'Producto', 'Lote', 'Categoría', 'Cantidad', 'Unidad', 'Origen / destino', 'Observaciones', 'Registrado por'],
        movimientos.map((m) => [
          formatFecha(m.fecha),
          m.tipo === 'entrada' ? 'Entrada' : 'Salida',
          m.producto.codigo,
          m.producto.nombre,
          textoLotes(m.lotes, m.producto.unidad_medida),
          m.producto.categoria,
          m.cantidad,
          m.producto.unidad_medida,
          m.destino_o_origen ?? '',
          m.observaciones ?? '',
          m.usuario?.nombre_completo ?? '',
        ]),
      ),
    )
  }

  if (tipo === 'vencimientos') {
    const { dias_alerta_vencimiento } = await getConfig()
    const [vencidos, porVencer] = await Promise.all([
      getLotesVencidos(),
      getLotesPorVencer(dias_alerta_vencimiento),
    ])
    return csvResponse(
      `vencimientos-${hoy}.csv`,
      toCSV(
        ['Situación', 'Código', 'Producto', 'Lote', 'Categoría', 'Cantidad', 'Unidad', 'Fecha de ingreso', 'Fecha de vencimiento'],
        [
          ...vencidos.map((l) => ['Vencido', l]),
          ...porVencer.map((l) => ['Por vencer', l]),
        ].map(([s, l]) => {
          const lote = l as (typeof vencidos)[number]
          return [
            s,
            lote.producto.codigo,
            lote.producto.nombre,
            lote.numero_lote,
            lote.producto.categoria,
            lote.cantidad_actual,
            lote.producto.unidad_medida,
            formatFecha(lote.fecha_ingreso),
            formatFecha(lote.fecha_vencimiento),
          ]
        }),
      ),
    )
  }

  return NextResponse.json({ error: 'Reporte no válido' }, { status: 400 })
}
