import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { SinPermisoRegistro } from '@/components/sin-permiso-registro'
import { requirePerfil } from '@/lib/auth'
import { EDITORES } from '@/lib/constants'
import { getCategorias, getExistencias } from '@/lib/data'
import { hoyISO } from '@/lib/format'
import { EntradaForm } from './entrada-form'

export const metadata: Metadata = { title: 'Registrar entrada' }

export default async function NuevaEntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string }>
}) {
  const perfil = await requirePerfil()
  if (!EDITORES.includes(perfil.rol)) {
    const { producto } = await searchParams
    return <SinPermisoRegistro tipo="entrada" productoId={producto} />
  }
  const [{ producto }, productos, categorias] = await Promise.all([searchParams, getExistencias(), getCategorias()])
  const conVencimiento = categorias.filter((c) => c.requiere_vencimiento).map((c) => c.nombre)

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
            conVencimiento={conVencimiento}
            inicial={productos.some((p) => p.id === producto) ? producto : undefined}
          />
        )}
      </div>
    </div>
  )
}
