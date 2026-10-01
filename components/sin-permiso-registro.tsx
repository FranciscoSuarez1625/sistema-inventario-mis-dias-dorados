import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { getProductosOpciones } from '@/lib/data'

export async function SinPermisoRegistro({
  tipo,
  productoId,
}: {
  tipo: 'entrada' | 'salida'
  productoId?: string
}) {
  const productos = productoId ? await getProductosOpciones(false) : []
  const producto = productos.find((p) => p.id === productoId)
  const titulo = tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={titulo} />
      <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Lock className="size-6" aria-hidden />
        </span>
        {producto && (
          <div>
            <p className="text-sm text-muted-foreground">Producto seleccionado</p>
            <p className="text-lg font-semibold">
              {producto.nombre} <span className="font-normal text-muted-foreground">· {producto.codigo}</span>
            </p>
          </div>
        )}
        <p className="text-base leading-relaxed">
          Su usuario es de solo consulta y no puede registrar {tipo === 'entrada' ? 'entradas' : 'salidas'}. Avise al
          encargado de bodega o a un administrador para que la registre.
        </p>
        <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/alertas" />}>
          Volver a alertas
        </Button>
      </div>
    </div>
  )
}
