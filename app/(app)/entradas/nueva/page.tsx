import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getExistencias } from '@/lib/data'
import { hoyISO } from '@/lib/format'
import { EntradaForm } from './entrada-form'

export const metadata: Metadata = { title: 'Registrar entrada' }

export default async function NuevaEntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>
}) {
  await requirePerfil(EDITORES)
  const [{ producto }, productos] = await Promise.all([searchParams, getExistencias()])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Registrar entrada" description="Anote lo que llegó a la bodega: compras o donaciones." />
      <div className="rounded-xl border bg-card p-5 sm:p-8">
        {productos.length === 0 ? (
          <p className="text-base">
            Primero debe{' '}
            <Link href="/productos" className="font-semibold text-link underline">
              crear un producto
            </Link>
            .
          </p>
        ) : (
          <EntradaForm
            productos={productos}
            hoy={hoyISO()}
            inicial={productos.some((p) => p.id === producto) ? producto : undefined}
          />
        )}
      </div>
    </div>
  )
}
