import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/native-select'
import { getCategorias } from '@/lib/data'

export async function FiltrosInventario({
  action,
  q,
  categoria,
  estado,
  mostrarEstado = true,
  extra,
}: {
  action: string
  q?: string
  categoria?: string
  estado?: string
  mostrarEstado?: boolean
  extra?: React.ReactNode
}) {
  const categorias = await getCategorias()
  const hayFiltros = !!(q || categoria || estado)
  return (
    <form
      action={action}
      role="search"
      className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-end print:hidden"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="q" className="text-base">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Nombre o código"
            maxLength={60}
            className="h-11 pl-10 text-base"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 md:w-48">
        <Label htmlFor="categoria-f" className="text-base">
          Categoría
        </Label>
        <NativeSelect id="categoria-f" name="categoria" defaultValue={categoria ?? ''}>
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </NativeSelect>
      </div>
      {mostrarEstado && (
        <div className="flex flex-col gap-2 md:w-48">
          <Label htmlFor="estado-f" className="text-base">
            Estado del stock
          </Label>
          <NativeSelect id="estado-f" name="estado" defaultValue={estado ?? ''}>
            <option value="">Todos</option>
            <option value="bajo">Bajo o agotado</option>
            <option value="normal">Normal</option>
          </NativeSelect>
        </div>
      )}
      {extra}
      <div className="flex gap-2">
        <Button type="submit" size="lg">
          Filtrar
        </Button>
        {hayFiltros && (
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href={action} />}>Limpiar</Button>
        )}
      </div>
    </form>
  )
}
