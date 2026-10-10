import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, PackageMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader } from '@/components/page-header'
import { TipoBadge, VencimientoBadge } from '@/components/status-badges'
import { BarraConsumo } from '@/components/barra-consumo'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getConfig, getLoteDetalle } from '@/lib/data'
import { formatCantidad, formatFecha } from '@/lib/format'

export const metadata: Metadata = { title: 'Detalle de lote' }

export default async function LoteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await requirePerfil()
  const { id } = await params
  const [detalle, { dias_alerta_vencimiento }] = await Promise.all([getLoteDetalle(id), getConfig()])
  if (!detalle) notFound()
  const { lote, movimientos } = detalle
  const unidad = lote.producto.unidad_medida
  const salido = Number(lote.cantidad_inicial) - Number(lote.cantidad_actual)
  const puedeEditar = EDITORES.includes(perfil.rol)

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" className="mb-2 -ml-2" nativeButton={false} render={<Link href="/lotes" />}>
        <ArrowLeft aria-hidden />
        Volver a lotes
      </Button>

      <PageHeader
        title={`Lote ${lote.numero_lote}`}
        description={`${lote.producto.nombre} · ${lote.producto.codigo} · ${lote.producto.categoria}`}
        actions={
          puedeEditar && lote.cantidad_actual > 0 ? (
            <Button size="lg" nativeButton={false} render={<Link href={`/salidas/nueva?producto=${lote.producto.id}`} />}>
              <PackageMinus aria-hidden />
              Registrar salida
            </Button>
          ) : undefined
        }
      />

      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <dt className="text-sm font-medium text-muted-foreground">Disponible</dt>
          <dd className="mt-1">
            <span className="text-3xl font-bold tabular-nums text-primary">{formatCantidad(lote.cantidad_actual)}</span>{' '}
            <span className="text-base text-muted-foreground">
              de {formatCantidad(lote.cantidad_inicial)} {unidad}
            </span>
            <BarraConsumo actual={lote.cantidad_actual} inicial={lote.cantidad_inicial} className="mt-3" />
            <span className="mt-1 block text-sm text-muted-foreground">
              Han salido {formatCantidad(salido)} {unidad}
            </span>
          </dd>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <dt className="text-sm font-medium text-muted-foreground">Fecha de ingreso</dt>
          <dd className="mt-1 text-2xl font-bold">{formatFecha(lote.fecha_ingreso)}</dd>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <dt className="text-sm font-medium text-muted-foreground">Vencimiento</dt>
          <dd className="mt-1 flex flex-col items-start gap-2">
            <span className="text-2xl font-bold">{formatFecha(lote.fecha_vencimiento)}</span>
            {lote.cantidad_actual > 0 && lote.fecha_vencimiento && (
              <VencimientoBadge fecha={lote.fecha_vencimiento} diasAlerta={dias_alerta_vencimiento} />
            )}
            {lote.cantidad_actual <= 0 && <span className="text-base text-muted-foreground">Lote agotado</span>}
          </dd>
        </div>
      </dl>

      <h2 className="mb-3 text-xl font-bold text-primary">Recorrido del lote</h2>
      {movimientos.length === 0 ? (
        <EmptyState>Este lote no tiene movimientos registrados.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="hidden md:table-cell">Origen / destino</TableHead>
                <TableHead className="hidden lg:table-cell">Registró</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((m) => (
                <TableRow key={m.movimiento.id}>
                  <TableCell className="whitespace-nowrap">{formatFecha(m.movimiento.fecha)}</TableCell>
                  <TableCell>
                    <TipoBadge tipo={m.movimiento.tipo} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <span className="font-bold tabular-nums">
                      {m.movimiento.tipo === 'entrada' ? '+' : '−'}
                      {formatCantidad(m.cantidad)}
                    </span>{' '}
                    <span className="text-sm text-muted-foreground">{unidad}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {m.movimiento.destino_o_origen ?? '—'}
                    {m.movimiento.observaciones && (
                      <span className="block text-sm text-muted-foreground">{m.movimiento.observaciones}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{m.movimiento.usuario?.nombre_completo ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
