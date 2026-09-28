import type { Metadata } from 'next'
import { TriangleAlert } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { requirePerfil } from '@/lib/auth'
import { SOLO_ADMIN } from '@/lib/constants'
import { getConfig } from '@/lib/data'
import { formatFechaHora } from '@/lib/format'
import { ConfigForm } from './config-form'
import { RespaldoButton } from './respaldo-button'

export const metadata: Metadata = { title: 'Configuración' }

export default async function ConfiguracionPage() {
  await requirePerfil(SOLO_ADMIN)
  const { dias_alerta_vencimiento, fecha_ultimo_respaldo } = await getConfig()
  const diasDesdeRespaldo = fecha_ultimo_respaldo
    ? Math.floor((Date.now() - Date.parse(fecha_ultimo_respaldo)) / 86_400_000)
    : null

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configuración" description="Ajustes generales del sistema de inventario." />

      <section aria-labelledby="alertas-h" className="mb-6 rounded-xl border bg-card p-6">
        <h2 id="alertas-h" className="mb-4 text-xl font-bold">
          Alertas de vencimiento
        </h2>
        <ConfigForm dias={dias_alerta_vencimiento} />
      </section>

      <section aria-labelledby="respaldo-h" className="rounded-xl border bg-card p-6">
        <h2 id="respaldo-h" className="mb-2 text-xl font-bold">
          Respaldo de la información
        </h2>
        <p className="mb-4 text-base text-muted-foreground text-pretty">
          Descarga un archivo con todos los productos, lotes y movimientos. Se recomienda hacerlo al menos una vez por
          semana y guardarlo en una memoria USB o en el correo.
        </p>
        <p className="mb-4 text-base">
          Último respaldo:{' '}
          <span className="font-semibold">
            {fecha_ultimo_respaldo ? formatFechaHora(fecha_ultimo_respaldo) : 'nunca'}
          </span>
        </p>
        {(diasDesdeRespaldo === null || diasDesdeRespaldo >= 7) && (
          <p className="mb-4 flex items-center gap-2 rounded-lg bg-warning p-3 text-base text-warning-foreground">
            <TriangleAlert className="size-5 shrink-0" aria-hidden />
            {diasDesdeRespaldo === null
              ? 'Todavía no se ha hecho ningún respaldo.'
              : `Han pasado ${diasDesdeRespaldo} días desde el último respaldo.`}
          </p>
        )}
        <RespaldoButton />
      </section>
    </div>
  )
}
