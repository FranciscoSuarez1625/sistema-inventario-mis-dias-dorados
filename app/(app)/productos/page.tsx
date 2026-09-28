import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/page-header'
import { FiltrosInventario } from '@/components/filtros-inventario'
import { StockBadge } from '@/components/status-badges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getExistencias } from '@/lib/data'
import { formatCantidad } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ProductoDialog } from './producto-dialog'
import { ToggleProducto } from './toggle-producto'

export const metadata: Metadata = { title: 'Productos' }

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; estado?: string }>
}) {
  await requirePerfil(EDITORES)
  const sp = await searchParams
  const productos = await getExistencias({ ...sp, incluirInactivos: true })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Productos"
        description="Catálogo de alimentos, medicamentos e insumos."
        actions={<ProductoDialog />}
      />
      <FiltrosInventario action="/productos" q={sp.q} categoria={sp.categoria} estado={sp.estado} />

      {productos.length === 0 ? (
        <EmptyState>No se encontraron productos con esos filtros.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Stock / mínimo</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p) => (
                <TableRow key={p.id} className={cn(!p.activo && 'text-muted-foreground')}>
                  <TableCell className="font-mono text-sm">{p.codigo}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{p.nombre}</span>
                    {!p.activo && <span className="ml-2 text-sm">(inactivo)</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.categoria}</TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {formatCantidad(p.stock_total)} / {formatCantidad(p.stock_minimo)}{' '}
                    <span className="text-sm text-muted-foreground">{p.unidad_medida}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.activo ? <StockBadge estado={p.estado_stock} /> : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <ProductoDialog producto={p} />
                      <ToggleProducto id={p.id} nombre={p.nombre} activo={p.activo} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
