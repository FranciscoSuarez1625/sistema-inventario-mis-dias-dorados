import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleX, Clock, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader } from '@/components/page-header'
import { StockBadge, VencimientoBadge } from '@/components/status-badges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getConfig, getTotalAlertas, type LoteAlerta } from '@/lib/data'
import { formatCantidad, formatFecha } from '@/lib/format'

export const metadata: Metadata = { title: 'Alertas' }

function Seccion({
  id,
  titulo,
  descripcion,
  icon,
  tono,
  count,
  children,
}: {
  id: string
  titulo: string
  descripcion: string
  icon: React.ReactNode
  tono: 'destructive' | 'warning'
  count: number
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="mb-10">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={
            tono === 'destructive'
              ? 'flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'
              : 'flex size-10 items-center justify-center rounded-full bg-warning text-warning-foreground'
          }
        >
          {icon}
        </span>
        <div>
          <h2 id={id} className="text-xl font-bold">
            {titulo} <span className="text-muted-foreground">({count})</span>
          </h2>
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TablaLotes({ lotes, diasAlerta }: { lotes: LoteAlerta[]; diasAlerta: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table className="text-base">
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad del lote</TableHead>
            <TableHead className="hidden sm:table-cell">Vence</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <span className="block font-semibold">{l.producto.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {l.producto.codigo} · {l.producto.categoria} · ingresó {formatFecha(l.fecha_ingreso)}
                </span>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span className="font-bold tabular-nums">{formatCantidad(l.cantidad_actual)}</span>{' '}
                <span className="text-sm text-muted-foreground">{l.producto.unidad_medida}</span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{formatFecha(l.fecha_vencimiento)}</TableCell>
              <TableCell>
                <VencimientoBadge fecha={l.fecha_vencimiento} diasAlerta={diasAlerta} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function AlertasPage() {
  const perfil = await requirePerfil()
  const puedeEditar = EDITORES.includes(perfil.rol)
  const [{ bajo, porVencer, vencidos, total }, { dias_alerta_vencimiento }] = await Promise.all([
    getTotalAlertas(),
    getConfig(),
  ])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Alertas"
        description={
          total === 0
            ? 'No hay alertas en este momento.'
            : `Hay ${total} ${total === 1 ? 'alerta que requiere' : 'alertas que requieren'} atención.`
        }
      />

      <Seccion
        id="vencidos"
        titulo="Productos vencidos"
        descripcion="Lotes con fecha de vencimiento pasada que aún tienen existencias. Retírelos y registre la salida."
        icon={<CircleX className="size-5" aria-hidden />}
        tono="destructive"
        count={vencidos.length}
      >
        {vencidos.length === 0 ? (
          <EmptyState>No hay productos vencidos.</EmptyState>
        ) : (
          <TablaLotes lotes={vencidos} diasAlerta={dias_alerta_vencimiento} />
        )}
      </Seccion>

      <Seccion
        id="por-vencer"
        titulo="Próximos a vencer"
        descripcion={`Lotes que vencen en los próximos ${dias_alerta_vencimiento} días.`}
        icon={<Clock className="size-5" aria-hidden />}
        tono="warning"
        count={porVencer.length}
      >
        {porVencer.length === 0 ? (
          <EmptyState>Ningún producto vence pronto.</EmptyState>
        ) : (
          <TablaLotes lotes={porVencer} diasAlerta={dias_alerta_vencimiento} />
        )}
      </Seccion>

      <Seccion
        id="stock-bajo"
        titulo="Stock bajo o agotado"
        descripcion="Productos con existencias iguales o menores al mínimo establecido."
        icon={<TriangleAlert className="size-5" aria-hidden />}
        tono="warning"
        count={bajo.length}
      >
        {bajo.length === 0 ? (
          <EmptyState>Todos los productos tienen suficiente stock.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                  {puedeEditar && (
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bajo.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="block font-semibold">{p.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.codigo} · {p.categoria}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className="font-bold tabular-nums">{formatCantidad(p.stock_total)}</span>{' '}
                      <span className="text-sm text-muted-foreground">{p.unidad_medida}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right tabular-nums">
                      {formatCantidad(p.stock_minimo)}
                    </TableCell>
                    <TableCell>
                      <StockBadge estado={p.estado_stock} />
                    </TableCell>
                    {puedeEditar && (
                      <TableCell className="text-right">
                        <Button variant="outline" nativeButton={false} render={<Link href={`/entradas/nueva?producto=${p.id}`} />}>Registrar entrada</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Seccion>
    </div>
  )
}
