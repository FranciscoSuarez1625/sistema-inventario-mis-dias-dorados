import { LotesLista } from '@/components/lotes-lista'
import { TipoBadge } from '@/components/status-badges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Movimiento } from '@/lib/data'
import { formatCantidad, formatFecha } from '@/lib/format'

export function TablaMovimientos({ movimientos }: { movimientos: Movimiento[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card print:rounded-none print:border-0">
      <Table className="text-base print:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="hidden md:table-cell print:table-cell">Origen / destino</TableHead>
            <TableHead className="hidden lg:table-cell print:table-cell">Registrado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="whitespace-nowrap">{formatFecha(m.fecha)}</TableCell>
              <TableCell>
                <TipoBadge tipo={m.tipo} />
              </TableCell>
              <TableCell>
                <span className="block font-semibold">{m.producto.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {m.producto.codigo} · {m.producto.categoria}
                </span>
                <span className="mt-1 block text-sm">
                  <LotesLista lotes={m.lotes} unidad={m.producto.unidad_medida} conCantidad={m.lotes.length > 1} />
                </span>
                {m.observaciones && (
                  <span className="mt-1 block text-sm text-muted-foreground italic">{m.observaciones}</span>
                )}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span className="font-bold tabular-nums">
                  {m.tipo === 'salida' ? '−' : '+'}
                  {formatCantidad(m.cantidad)}
                </span>{' '}
                <span className="text-sm text-muted-foreground">{m.producto.unidad_medida}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell print:table-cell">{m.destino_o_origen ?? '—'}</TableCell>
              <TableCell className="hidden lg:table-cell print:table-cell">
                {m.usuario?.nombre_completo ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
