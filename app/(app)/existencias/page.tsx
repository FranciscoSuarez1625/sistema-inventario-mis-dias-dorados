import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageMinus, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader } from '@/components/page-header'
import { FiltrosInventario } from '@/components/filtros-inventario'
import { StockBadge, VencimientoBadge } from '@/components/status-badges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getConfig, getExistencias } from '@/lib/data'
import { formatCantidad } from '@/lib/format'

export const metadata: Metadata = { title: 'Existencias' }

export default async function ExistenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; estado?: string }>
}) {
  const perfil = await requirePerfil()
  const puedeEditar = EDITORES.includes(perfil.rol)
  const sp = await searchParams
  const [productos, { dias_alerta_vencimiento }] = await Promise.all([getExistencias(sp), getConfig()])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Existencias" description="Cuánto hay de cada producto en este momento." />
      <FiltrosInventario action="/existencias" q={sp.q} categoria={sp.categoria} estado={sp.estado} />

      {productos.length === 0 ? (
        <EmptyState>No se encontraron productos con esos filtros.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Próximo vencimiento</TableHead>
                {puedeEditar && (
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block font-semibold">{p.nombre}</span>
                    <span className="font-mono text-sm text-muted-foreground">{p.codigo}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.categoria}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <span className="text-lg font-bold tabular-nums">{formatCantidad(p.stock_total)}</span>{' '}
                    <span className="text-sm text-muted-foreground">{p.unidad_medida}</span>
                    <span className="block text-sm text-muted-foreground">mín. {formatCantidad(p.stock_minimo)}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StockBadge estado={p.estado_stock} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {p.stock_total > 0 ? (
                      <VencimientoBadge fecha={p.proximo_vencimiento} diasAlerta={dias_alerta_vencimiento} />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  {puedeEditar && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Registrar entrada" nativeButton={false} render={<Link href={`/entradas/nueva?producto=${p.id}`} />}>
                            <PackagePlus aria-hidden />
                            <span className="sr-only">Registrar entrada de {p.nombre}</span>
                          </Button>
                        {p.stock_total > 0 && (
                          <Button variant="ghost" size="icon" title="Registrar salida" nativeButton={false} render={<Link href={`/salidas/nueva?producto=${p.id}`} />}>
                              <PackageMinus aria-hidden />
                              <span className="sr-only">Registrar salida de {p.nombre}</span>
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
