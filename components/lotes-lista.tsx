import Link from 'next/link'
import { formatCantidad, formatFecha } from '@/lib/format'

export type LoteRef = {
  id: string
  numero_lote: string
  cantidad?: number
  fecha_vencimiento?: string | null
}

export function LotesLista({
  lotes,
  unidad,
  conCantidad = false,
  conVencimiento = false,
  max,
}: {
  lotes: LoteRef[]
  unidad?: string
  conCantidad?: boolean
  conVencimiento?: boolean
  max?: number
}) {
  if (lotes.length === 0) return <span className="text-muted-foreground">Sin lote</span>
  const visibles = max ? lotes.slice(0, max) : lotes
  const ocultos = lotes.length - visibles.length

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-muted-foreground">{lotes.length > 1 ? 'Lotes' : 'Lote'}</span>
      {visibles.map((l) => (
        <span key={l.id} className="inline-flex items-center gap-1 whitespace-nowrap">
          <Link
            href={`/lotes/${l.id}`}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold text-foreground underline-offset-2 hover:underline print:bg-transparent print:p-0"
          >
            {l.numero_lote}
          </Link>
          {(conCantidad || conVencimiento) && (
            <span className="text-muted-foreground">
              {'('}
              {conCantidad && l.cantidad !== undefined && `${formatCantidad(l.cantidad)}${unidad ? ` ${unidad}` : ''}`}
              {conCantidad && conVencimiento && l.fecha_vencimiento && ' · '}
              {conVencimiento && l.fecha_vencimiento && `vence ${formatFecha(l.fecha_vencimiento)}`}
              {')'}
            </span>
          )}
        </span>
      ))}
      {ocultos > 0 && <span className="text-muted-foreground print:hidden">y {ocultos} más</span>}
    </span>
  )
}

export function textoLotes(lotes: LoteRef[], unidad?: string) {
  return lotes
    .map((l) =>
      l.cantidad !== undefined && lotes.length > 1
        ? `${l.numero_lote} (${formatCantidad(l.cantidad)}${unidad ? ` ${unidad}` : ''})`
        : l.numero_lote,
    )
    .join('; ')
}
