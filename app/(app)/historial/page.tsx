import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader } from '@/components/page-header'
import { FiltrosMovimientosForm } from '@/components/filtros-movimientos'
import { TablaMovimientos } from '@/components/tabla-movimientos'
import { requirePerfil } from '@/lib/auth'
import { POR_PAGINA } from '@/lib/constants'
import { getMovimientos, getProductosOpciones, leerFiltrosMovimientos } from '@/lib/data'

export const metadata: Metadata = { title: 'Historial de movimientos' }

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePerfil()
  const filtros = leerFiltrosMovimientos(await searchParams)
  const [{ movimientos, total }, productos] = await Promise.all([
    getMovimientos(filtros),
    getProductosOpciones(false),
  ])
  const pagina = filtros.pagina ?? 1
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  const hrefPagina = (n: number) => {
    const p = new URLSearchParams()
    for (const k of ['desde', 'hasta', 'tipo', 'categoria', 'producto'] as const) {
      const v = filtros[k]
      if (v) p.set(k, v)
    }
    p.set('pagina', String(n))
    return `/historial?${p.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Historial" description="Todas las entradas y salidas registradas, de la más reciente a la más antigua." />
      <FiltrosMovimientosForm action="/historial" filtros={filtros} productos={productos} />

      {movimientos.length === 0 ? (
        <EmptyState>No hay movimientos con esos filtros.</EmptyState>
      ) : (
        <>
          <TablaMovimientos movimientos={movimientos} />
          <nav aria-label="Paginación" className="mt-4 flex items-center justify-between gap-4">
            <p className="text-base text-muted-foreground">
              {total} {total === 1 ? 'movimiento' : 'movimientos'} · página {pagina} de {paginas}
            </p>
            <div className="flex gap-2">
              {pagina > 1 ? (
                <Button variant="outline" size="lg" nativeButton={false} render={<Link href={hrefPagina(pagina - 1)} />}>
                    <ChevronLeft aria-hidden />
                    Anterior
                  </Button>
              ) : (
                <Button variant="outline" size="lg" disabled>
                  <ChevronLeft aria-hidden />
                  Anterior
                </Button>
              )}
              {pagina < paginas ? (
                <Button variant="outline" size="lg" nativeButton={false} render={<Link href={hrefPagina(pagina + 1)} />}>
                    Siguiente
                    <ChevronRight aria-hidden />
                  </Button>
              ) : (
                <Button variant="outline" size="lg" disabled>
                  Siguiente
                  <ChevronRight aria-hidden />
                </Button>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
