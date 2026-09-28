import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { SOLO_ADMIN } from '@/lib/constants'
import { getCategorias, getConteoProductosPorCategoria } from '@/lib/data'
import { CategoriaDialog } from './categoria-dialog'
import { EliminarCategoria } from './eliminar-categoria'

export const metadata: Metadata = { title: 'Categorías' }

export default async function CategoriasPage() {
  await requirePerfil(SOLO_ADMIN)
  const [categorias, conteo] = await Promise.all([getCategorias(), getConteoProductosPorCategoria()])

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Categorías"
        description="Grupos en los que se organizan los productos del inventario."
        actions={<CategoriaDialog />}
      />

      {categorias.length === 0 ? (
        <EmptyState>Aún no hay categorías. Añada la primera.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((c) => {
                const productos = conteo[c.nombre] ?? 0
                return (
                  <TableRow key={c.id}>
                    <TableCell className="align-top whitespace-normal">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-1 size-4 shrink-0 rounded-full ring-2 ring-white shadow"
                          style={{ backgroundColor: c.color }}
                          aria-hidden
                        />
                        <div>
                          <span className="font-semibold">{c.nombre}</span>
                          <span className="block text-sm text-muted-foreground">
                            {productos} {productos === 1 ? 'producto' : 'productos'}
                            {c.requiere_vencimiento && ' · Exige vencimiento'}
                          </span>
                          {c.descripcion && (
                            <span className="mt-1 block text-sm text-muted-foreground md:hidden">{c.descripcion}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden align-top whitespace-normal text-muted-foreground md:table-cell">
                      {c.descripcion || '—'}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex justify-end gap-2">
                        <CategoriaDialog categoria={c} />
                        <EliminarCategoria id={c.id} nombre={c.nombre} productos={productos} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
