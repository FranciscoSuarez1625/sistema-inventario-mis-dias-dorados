import type { Metadata } from 'next'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { NativeSelect } from '@/components/native-select'
import { EmptyState, PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { getSalidasEntre } from '@/lib/data'
import { formatCantidad, hoyISO } from '@/lib/format'
import { RankingChart, TendenciaChart, type RankingItem } from './metricas-charts'

export const metadata: Metadata = { title: 'Métricas de consumo' }

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]
const PRIMER_ANIO = 2024

function leerPeriodo(sp: Record<string, string | string[] | undefined>) {
  const [anioHoy, mesHoy] = hoyISO().split('-').map(Number)
  const s = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
  const vista = s('vista') === 'anio' ? 'anio' : 'mes'
  const anioNum = Number.parseInt(s('anio') ?? '', 10)
  const anio = anioNum >= PRIMER_ANIO && anioNum <= anioHoy ? anioNum : anioHoy
  const mesNum = Number.parseInt(s('mes') ?? '', 10)
  const mes = mesNum >= 1 && mesNum <= 12 ? mesNum : anio === anioHoy ? mesHoy : 12
  return { vista, anio, mes, anioHoy } as const
}

const clave = (anio: number, mes: number) => `${anio}-${String(mes).padStart(2, '0')}`

function Variacion({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0) {
    return <span className="text-sm text-muted-foreground">{actual > 0 ? 'Nuevo' : '—'}</span>
  }
  const pct = Math.round(((actual - anterior) / anterior) * 100)
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums">
      <Icon className="size-4" aria-hidden />
      {pct > 0 ? '+' : ''}
      {pct}%
    </span>
  )
}

export default async function MetricasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePerfil()
  const { vista, anio, mes, anioHoy } = leerPeriodo(await searchParams)
  const salidas = await getSalidasEntre(`${anio - 1}-01-01`, `${anio}-12-31`)

  const mesAnterior = mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 }
  const enActual = (fecha: string) =>
    vista === 'anio' ? fecha.startsWith(`${anio}-`) : fecha.startsWith(clave(anio, mes))
  const enAnterior = (fecha: string) =>
    vista === 'anio' ? fecha.startsWith(`${anio - 1}-`) : fecha.startsWith(clave(mesAnterior.anio, mesAnterior.mes))

  const etiquetaActual = vista === 'anio' ? String(anio) : `${MESES[mes - 1]} ${anio}`
  const etiquetaAnterior =
    vista === 'anio' ? String(anio - 1) : `${MESES[mesAnterior.mes - 1]} ${mesAnterior.anio}`

  const porProducto = new Map<string, RankingItem & { codigo: string; movimientos: number }>()
  const anuales = new Map<string, number>()
  for (const s of salidas) {
    const cantidad = Number(s.cantidad)
    if (s.fecha.startsWith(`${anio}-`)) anuales.set(s.producto_id, (anuales.get(s.producto_id) ?? 0) + cantidad)
    const actual = enActual(s.fecha)
    const anterior = enAnterior(s.fecha)
    if (!actual && !anterior) continue
    const item = porProducto.get(s.producto_id) ?? {
      id: s.producto_id,
      codigo: s.producto.codigo,
      etiqueta: s.producto.nombre.length > 18 ? `${s.producto.nombre.slice(0, 17)}…` : s.producto.nombre,
      nombre: s.producto.nombre,
      unidad: s.producto.unidad_medida,
      actual: 0,
      anterior: 0,
      movimientos: 0,
    }
    if (actual) {
      item.actual += cantidad
      item.movimientos += 1
    } else {
      item.anterior += cantidad
    }
    porProducto.set(s.producto_id, item)
  }

  const ranking = [...porProducto.values()]
    .filter((p) => p.actual > 0)
    .sort((a, b) => b.actual - a.actual || a.codigo.localeCompare(b.codigo))
  const top = ranking.slice(0, 10)
  const totalMovimientos = ranking.reduce((acc, p) => acc + p.movimientos, 0)

  const topAnual = [...anuales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const nombres = new Map(salidas.map((s) => [s.producto_id, s.producto.nombre]))
  const series = topAnual.map(([id], i) => ({ key: `p${i}`, label: nombres.get(id) ?? '', id }))
  const ultimoMes = anio === anioHoy ? Number(hoyISO().split('-')[1]) : 12
  const tendencia = MESES.slice(0, ultimoMes).map((nombre, i) => {
    const fila: Record<string, number | string> = { mes: nombre.slice(0, 3) }
    for (const s of series) fila[s.key] = 0
    return fila
  })
  for (const s of salidas) {
    if (!s.fecha.startsWith(`${anio}-`)) continue
    const serie = series.find((x) => x.id === s.producto_id)
    const fila = tendencia[Number(s.fecha.slice(5, 7)) - 1]
    if (serie && fila) fila[serie.key] = (fila[serie.key] as number) + Number(s.cantidad)
  }

  const anios = Array.from({ length: anioHoy - PRIMER_ANIO + 1 }, (_, i) => anioHoy - i)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Métricas de consumo"
        description="Compare qué productos salen más de la bodega por mes o por año."
      />

      <form
        action="/metricas"
        className="mb-6 grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="vista" className="text-base">
            Comparar por
          </Label>
          <NativeSelect id="vista" name="vista" defaultValue={vista}>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="anio" className="text-base">
            Año
          </Label>
          <NativeSelect id="anio" name="anio" defaultValue={String(anio)}>
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mes" className="text-base">
            Mes <span className="font-normal text-muted-foreground">(vista mensual)</span>
          </Label>
          <NativeSelect id="mes" name="mes" defaultValue={String(mes)}>
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" size="lg">
          Ver métricas
        </Button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Salidas en {etiquetaActual}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{totalMovimientos}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Productos consumidos</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{ranking.length}</p>
        </div>
        <div className="rounded-xl border border-l-4 border-l-chart-2 bg-card p-5">
          <p className="text-sm text-muted-foreground">Más consumido</p>
          {top[0] ? (
            <p className="mt-1 text-lg font-bold leading-snug text-primary">
              {top[0].nombre}{' '}
              <span className="block text-sm font-normal text-muted-foreground">
                {formatCantidad(top[0].actual)} {top[0].unidad}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-muted-foreground">—</p>
          )}
        </div>
      </div>

      <section aria-labelledby="ranking" className="mb-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="ranking" className="text-xl font-bold">
          Productos más consumidos
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {etiquetaActual} comparado con {etiquetaAnterior}. Cada producto se mide en su propia unidad.
        </p>
        {top.length === 0 ? (
          <EmptyState>No hay salidas registradas en {etiquetaActual}.</EmptyState>
        ) : (
          <>
            <RankingChart data={top} etiquetaActual={etiquetaActual} etiquetaAnterior={etiquetaAnterior} />
            <div className="mt-6 overflow-x-auto rounded-lg border">
              <Table className="text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">{etiquetaActual}</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">{etiquetaAnterior}</TableHead>
                    <TableHead className="text-right">Cambio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="tabular-nums text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <span className="block font-semibold">{p.nombre}</span>
                        <span className="text-sm text-muted-foreground">{p.codigo}</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span className="font-bold tabular-nums">{formatCantidad(p.actual)}</span>{' '}
                        <span className="text-sm text-muted-foreground">{p.unidad}</span>
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {formatCantidad(p.anterior)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Variacion actual={p.actual} anterior={p.anterior} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="tendencia" className="mb-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="tendencia" className="text-xl font-bold">
          Consumo mes a mes en {anio}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Los 5 productos con más salidas del año.</p>
        {series.length === 0 ? (
          <EmptyState>No hay salidas registradas en {anio}.</EmptyState>
        ) : (
          <TendenciaChart data={tendencia} series={series.map(({ key, label }) => ({ key, label }))} />
        )}
      </section>
    </div>
  )
}
