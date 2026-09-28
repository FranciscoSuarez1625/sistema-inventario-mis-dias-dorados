import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getExistencias } from '@/lib/data'
import { hoyISO } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import { SalidaForm, type LoteDisponible } from './salida-form'

export const metadata: Metadata = { title: 'Registrar salida' }

export default async function NuevaSalidaPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>
}) {
  await requirePerfil(EDITORES)
  const supabase = await createClient()
  const [{ producto }, productos, { data: lotes }] = await Promise.all([
    searchParams,
    getExistencias(),
    supabase
      .from('lotes')
      .select('id, producto_id, cantidad_actual, fecha_vencimiento')
      .gt('cantidad_actual', 0)
      .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
      .order('fecha_ingreso')
      .order('created_at'),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Registrar salida"
        description="Anote lo que sale de la bodega. Se descuenta primero lo que vence antes."
      />
      <div className="rounded-xl border bg-card p-5 sm:p-8">
        <SalidaForm
          productos={productos}
          lotes={(lotes ?? []) as LoteDisponible[]}
          hoy={hoyISO()}
          inicial={productos.some((p) => p.id === producto && p.stock_total > 0) ? producto : undefined}
        />
      </div>
    </div>
  )
}
