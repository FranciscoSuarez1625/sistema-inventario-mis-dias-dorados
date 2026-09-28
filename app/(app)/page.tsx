import Link from 'next/link'
import { Bell, Boxes, CircleX, Clock, PackageMinus, PackagePlus, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/form-error'
import { TipoBadge } from '@/components/status-badges'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getConfig, getExistencias, getMovimientos, getTotalAlertas } from '@/lib/data'
import { formatCantidad, formatFecha } from '@/lib/format'
import { cn } from '@/lib/utils'

function Resumen({
  href,
  label,
  value,
  icon: Icon,
  tone,
}: {
  href: string
  label: string
  value: number
  icon: typeof Boxes
  tone: 'neutral' | 'warning' | 'danger'
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors outline-none hover:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        tone === 'warning' && value > 0 && 'border-warning-foreground/25 bg-warning',
        tone === 'danger' && value > 0 && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground',
          tone === 'warning' && value > 0 && 'bg-warning-foreground/10 text-warning-foreground',
          tone === 'danger' && value > 0 && 'bg-destructive/10 text-destructive',
        )}
      >
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        <span className="text-base text-muted-foreground">{label}</span>
      </span>
    </Link>
  )
}

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const perfil = await requirePerfil()
  const puedeEditar = EDITORES.includes(perfil.rol)
  const [{ dias_alerta_vencimiento }, productos, alertas, { movimientos }] = await Promise.all([
    getConfig(),
    getExistencias(),
    getTotalAlertas(),
    getMovimientos({ pagina: 1 }),
  ])

  const primerNombre = perfil.nombre_completo.split(' ')[0]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Buenos días, {primerNombre}</h1>
          <p className="mt-1 text-base text-muted-foreground">Así está la bodega hoy.</p>
        </div>
        {puedeEditar && (
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/entradas/nueva">
                <PackagePlus aria-hidden />
                Registrar entrada
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/salidas/nueva">
                <PackageMinus aria-hidden />
                Registrar salida
              </Link>
            </Button>
          </div>
        )}
      </div>

      {sp['sin-permiso'] && <FormError message="No tiene permiso para ver esa sección." />}

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Resumen href="/existencias" label="Productos activos" value={productos.length} icon={Boxes} tone="neutral" />
        <Resumen
          href="/alertas#stock-bajo"
          label="Con stock bajo"
          value={alertas.bajo.length}
          icon={TriangleAlert}
          tone="warning"
        />
        <Resumen
          href="/alertas#por-vencer"
          label={`Lotes por vencer (${dias_alerta_vencimiento} días)`}
          value={alertas.porVencer.length}
          icon={Clock}
          tone="warning"
        />
        <Resumen
          href="/alertas#vencidos"
          label="Lotes vencidos"
          value={alertas.vencidos.length}
          icon={CircleX}
          tone="danger"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border bg-card lg:col-span-3" aria-labelledby="ult-mov">
          <div className="flex items-center justify-between border-b p-5">
            <h2 id="ult-mov" className="text-xl font-bold">
              Últimos movimientos
            </h2>
            <Link href="/historial" className="text-base font-semibold text-link underline-offset-4 hover:underline">
              Ver todo
            </Link>
          </div>
          {movimientos.length === 0 ? (
            <p className="p-5 text-base text-muted-foreground">Todavía no hay movimientos registrados.</p>
          ) : (
            <ul className="divide-y">
              {movimientos.slice(0, 8).map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-semibold">{m.producto.nombre}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatFecha(m.fecha)}
                      {m.destino_o_origen ? ` · ${m.destino_o_origen}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold tabular-nums">
                      {m.tipo === 'entrada' ? '+' : '−'}
                      {formatCantidad(m.cantidad)} {m.producto.unidad_medida}
                    </span>
                    <TipoBadge tipo={m.tipo} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card lg:col-span-2" aria-labelledby="atencion">
          <div className="flex items-center justify-between border-b p-5">
            <h2 id="atencion" className="flex items-center gap-2 text-xl font-bold">
              <Bell className="size-5" aria-hidden />
              Requiere atención
            </h2>
            <Link href="/alertas" className="text-base font-semibold text-link underline-offset-4 hover:underline">
              Ver alertas
            </Link>
          </div>
          {alertas.total === 0 ? (
            <p className="p-5 text-base text-muted-foreground">Todo en orden. No hay alertas.</p>
          ) : (
            <ul className="divide-y">
              {alertas.vencidos.slice(0, 3).map((l) => (
                <li key={`v-${l.id}`} className="flex flex-col px-5 py-3">
                  <span className="text-base font-semibold">{l.producto.nombre}</span>
                  <span className="text-sm font-semibold text-destructive">
                    Vencido el {formatFecha(l.fecha_vencimiento)} · {formatCantidad(l.cantidad_actual)}{' '}
                    {l.producto.unidad_medida}
                  </span>
                </li>
              ))}
              {alertas.porVencer.slice(0, 3).map((l) => (
                <li key={`p-${l.id}`} className="flex flex-col px-5 py-3">
                  <span className="text-base font-semibold">{l.producto.nombre}</span>
                  <span className="text-sm text-warning-foreground">
                    Vence el {formatFecha(l.fecha_vencimiento)} · {formatCantidad(l.cantidad_actual)}{' '}
                    {l.producto.unidad_medida}
                  </span>
                </li>
              ))}
              {alertas.bajo.slice(0, 3).map((p) => (
                <li key={`b-${p.id}`} className="flex flex-col px-5 py-3">
                  <span className="text-base font-semibold">{p.nombre}</span>
                  <span className="text-sm text-warning-foreground">
                    {p.estado_stock === 'agotado' ? 'Agotado' : 'Stock bajo'}: {formatCantidad(p.stock_total)} de{' '}
                    {formatCantidad(p.stock_minimo)} {p.unidad_medida} mínimo
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
