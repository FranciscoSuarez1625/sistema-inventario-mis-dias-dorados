import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/native-select'
import { EmptyState, PageHeader } from '@/components/page-header'
import { VencimientoBadge } from '@/components/status-badges'
import { BarraConsumo } from '@/components/barra-consumo'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { ESTADOS_LOTE, LIMITE_LOTES, getCategorias, getConfig, getLotes, leerEstadoLote } from '@/lib/data'
import { formatCantidad, formatFecha } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Lotes' }

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; estado?: string }>
}) {
  await requirePerfil()
  const sp = await searchParams
  const estado = leerEstadoLote(sp.estado)
  const [{ dias_alerta_vencimiento }, categorias] = await Promise.all([getConfig(), getCategorias()])
  const lotes = await getLotes({ q: sp.q, categoria: sp.categoria, estado, diasAlerta: dias_alerta_vencimiento })

  const urlCon = (nuevoEstado: string) => {
    const params = new URLSearchParams()
    if (sp.q) params.set('q', sp.q)
    if (sp.categoria) params.set('categoria', sp.categoria)
    if (nuevoEstado !== 'activos') params.set('estado', nuevoEstado)
    const s = params.toString()
    return s ? `/lotes?${s}` : '/lotes'
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Lotes"
        description="Busque un lote por su número o por el producto, y vea de dónde vino y a dónde se fue."
      />

      <form
        action="/lotes"
        role="search"
        className="mb-4 flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-end"
      >
        {estado !== 'activos' && <input type="hidden" name="estado" value={estado} />}
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="q" className="text-base">
            Buscar lote
          </Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="q"
              name="q"
              type="search"
              defaultValue={sp.q}
              placeholder="Número de lote, producto o código"
              maxLength={60}
              className="h-11 pl-10 text-base"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:w-48">
          <Label htmlFor="categoria-f" className="text-base">
            Categoría
          </Label>
          <NativeSelect id="categoria-f" name="categoria" defaultValue={sp.categoria ?? ''}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            Buscar
          </Button>
          {(sp.q || sp.categoria) && (
            <Button variant="ghost" size="lg" nativeButton={false} render={<Link href={urlCon(estado)} />}>
              Limpiar
            </Button>
          )}
        </div>
      </form>

      <nav aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-2">
        {ESTADOS_LOTE.map((e) => {
          const activo = e.value === estado
          return (
            <Link
              key={e.value}
              href={urlCon(e.value)}
              aria-current={activo ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-10 items-center rounded-full border px-4 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                activo
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-accent',
              )}
            >
              {e.label}
            </Link>
          )
        })}
      </nav>

      {lotes.length === 0 ? (
        <EmptyState>No se encontraron lotes con esos filtros.</EmptyState>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted-foreground" aria-live="polite">
            {lotes.length === LIMITE_LOTES
              ? `Mostrando los primeros ${LIMITE_LOTES} lotes. Use la búsqueda para encontrar uno en particular.`
              : `${lotes.length} ${lotes.length === 1 ? 'lote' : 'lotes'}`}
          </p>
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead className="hidden md:table-cell">Ingreso</TableHead>
                  <TableHead className="hidden sm:table-cell">Vencimiento</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Ver detalle</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotes.map((l) => (
                  <TableRow key={l.id} className="relative">
                    <TableCell>
                      <Link
                        href={`/lotes/${l.id}`}
                        className="font-mono font-semibold text-primary outline-none after:absolute after:inset-0 hover:underline focus-visible:underline"
                      >
                        {l.numero_lote}
                      </Link>
                      <span className="block font-medium">{l.producto.nombre}</span>
                      <span className="block text-sm text-muted-foreground">{l.producto.categoria}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell whitespace-nowrap">
                      {formatFecha(l.fecha_ingreso)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {l.cantidad_actual > 0 ? (
                        <VencimientoBadge fecha={l.fecha_vencimiento} diasAlerta={dias_alerta_vencimiento} />
                      ) : (
                        <span className="text-muted-foreground">{formatFecha(l.fecha_vencimiento)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className="text-lg font-bold tabular-nums">{formatCantidad(l.cantidad_actual)}</span>{' '}
                      <span className="text-sm text-muted-foreground">
                        de {formatCantidad(l.cantidad_inicial)} {l.producto.unidad_medida}
                      </span>
                      <BarraConsumo
                        actual={l.cantidad_actual}
                        inicial={l.cantidad_inicial}
                        className="mt-1.5 ml-auto w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
