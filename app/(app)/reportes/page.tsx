import type { Metadata } from 'next'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader } from '@/components/page-header'
import { FiltrosMovimientosForm } from '@/components/filtros-movimientos'
import { PrintButton } from '@/components/print-button'
import { StockBadge, VencimientoBadge } from '@/components/status-badges'
import { TablaMovimientos } from '@/components/tabla-movimientos'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import {
  getConfig,
  getExistencias,
  getLotesPorVencer,
  getLotesVencidos,
  getMovimientos,
  getProductosOpciones,
  leerFiltrosMovimientos,
} from '@/lib/data'
import { formatCantidad, formatFecha, formatFechaHora } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reportes' }

const REPORTES = [
  { id: 'existencias', label: 'Existencias actuales' },
  { id: 'movimientos', label: 'Entradas y salidas' },
  { id: 'vencimientos', label: 'Vencimientos' },
] as const
type ReporteId = (typeof REPORTES)[number]['id']

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePerfil()
  const sp = await searchParams
  const reporte: ReporteId = REPORTES.some((r) => r.id === sp.reporte) ? (sp.reporte as ReporteId) : 'existencias'
  const csvParams = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) if (typeof v === 'string' && v && k !== 'pagina') csvParams.set(k, v)
  csvParams.set('reporte', reporte)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reportes"
        description="Genere, imprima o descargue la información del inventario."
        actions={
          <>
            <PrintButton />
            <Button variant="outline" size="lg" nativeButton={false} render={<a href={`/api/exportar?${csvParams.toString()}`} download />}>
                <Download aria-hidden />
                Descargar Excel (CSV)
              </Button>
          </>
        }
      />

      <nav aria-label="Tipo de reporte" className="mb-6 flex flex-wrap gap-2 print:hidden">
        {REPORTES.map((r) => (
          <Link
            key={r.id}
            href={`/reportes?reporte=${r.id}`}
            aria-current={r.id === reporte ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-lg border px-4 text-base font-medium transition-colors',
              r.id === reporte ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
            )}
          >
            {r.label}
          </Link>
        ))}
      </nav>

      <div className="mb-4 hidden print:block">
        <h1 className="text-2xl font-bold">Asilo Mis Días Dorados</h1>
        <p className="text-base">
          {REPORTES.find((r) => r.id === reporte)?.label} · generado el {formatFechaHora(new Date().toISOString())}
        </p>
      </div>

      {reporte === 'existencias' && <ReporteExistencias />}
      {reporte === 'movimientos' && <ReporteMovimientos sp={sp} />}
      {reporte === 'vencimientos' && <ReporteVencimientos />}
    </div>
  )
}

async function ReporteExistencias() {
  const productos = await getExistencias()
  if (productos.length === 0) return <EmptyState>No hay productos registrados.</EmptyState>
  return (
    <div className="overflow-hidden rounded-xl border bg-card print:border-0">
      <Table className="text-base print:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="hidden sm:table-cell print:table-cell">Categoría</TableHead>
            <TableHead className="text-right">Disponible</TableHead>
            <TableHead className="hidden md:table-cell print:table-cell text-right">Mínimo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-sm">{p.codigo}</TableCell>
              <TableCell className="font-semibold">{p.nombre}</TableCell>
              <TableCell className="hidden sm:table-cell print:table-cell">{p.categoria}</TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums">
                {formatCantidad(p.stock_total)} {p.unidad_medida}
              </TableCell>
              <TableCell className="hidden md:table-cell print:table-cell text-right tabular-nums">
                {formatCantidad(p.stock_minimo)}
              </TableCell>
              <TableCell>
                <StockBadge estado={p.estado_stock} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

async function ReporteMovimientos({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const filtros = leerFiltrosMovimientos(sp)
  const [{ movimientos, total }, productos] = await Promise.all([
    getMovimientos({ ...filtros, todos: true }),
    getProductosOpciones(false),
  ])
  const entradas = movimientos.filter((m) => m.tipo === 'entrada').length
  return (
    <>
      <FiltrosMovimientosForm
        action="/reportes"
        filtros={filtros}
        productos={productos}
        hidden={{ reporte: 'movimientos' }}
      />
      <p className="mb-3 text-base text-muted-foreground">
        {filtros.desde || filtros.hasta
          ? `Periodo: ${filtros.desde ? formatFecha(filtros.desde) : 'inicio'} a ${filtros.hasta ? formatFecha(filtros.hasta) : 'hoy'}. `
          : ''}
        {total} movimientos ({entradas} entradas, {total - entradas} salidas).
        {total > movimientos.length && ` Se muestran los primeros ${movimientos.length}.`}
      </p>
      {movimientos.length === 0 ? (
        <EmptyState>No hay movimientos con esos filtros.</EmptyState>
      ) : (
        <TablaMovimientos movimientos={movimientos} />
      )}
    </>
  )
}

async function ReporteVencimientos() {
  const { dias_alerta_vencimiento } = await getConfig()
  const [vencidos, porVencer] = await Promise.all([getLotesVencidos(), getLotesPorVencer(dias_alerta_vencimiento)])
  const lotes = [...vencidos, ...porVencer]
  if (lotes.length === 0) {
    return (
      <EmptyState>
        No hay productos vencidos ni por vencer en los próximos {dias_alerta_vencimiento} días.
      </EmptyState>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card print:border-0">
      <Table className="text-base print:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="hidden sm:table-cell print:table-cell">Ingreso</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <span className="block font-semibold">{l.producto.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {l.producto.codigo} · Lote {l.numero_lote} · {l.producto.categoria}
                </span>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums">
                {formatCantidad(l.cantidad_actual)} {l.producto.unidad_medida}
              </TableCell>
              <TableCell className="hidden sm:table-cell print:table-cell">{formatFecha(l.fecha_ingreso)}</TableCell>
              <TableCell>{formatFecha(l.fecha_vencimiento)}</TableCell>
              <TableCell>
                <VencimientoBadge fecha={l.fecha_vencimiento} diasAlerta={dias_alerta_vencimiento} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
