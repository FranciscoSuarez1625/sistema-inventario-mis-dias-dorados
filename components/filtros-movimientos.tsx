import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/native-select'
import { getCategorias, type FiltrosMovimientos } from '@/lib/data'

export async function FiltrosMovimientosForm({
  action,
  filtros,
  productos,
  hidden,
}: {
  action: string
  filtros: FiltrosMovimientos
  productos: { id: string; codigo: string; nombre: string }[]
  hidden?: Record<string, string>
}) {
  const categorias = await getCategorias()
  const hayFiltros = !!(filtros.desde || filtros.hasta || filtros.tipo || filtros.categoria || filtros.producto)
  const limpiar = hidden ? `${action}?${new URLSearchParams(hidden).toString()}` : action
  return (
    <form
      action={action}
      className="mb-6 grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end print:hidden"
    >
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="flex flex-col gap-2">
        <Label htmlFor="desde" className="text-base">
          Desde
        </Label>
        <Input id="desde" name="desde" type="date" defaultValue={filtros.desde} className="h-11 text-base" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="hasta" className="text-base">
          Hasta
        </Label>
        <Input id="hasta" name="hasta" type="date" defaultValue={filtros.hasta} className="h-11 text-base" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo" className="text-base">
          Tipo
        </Label>
        <NativeSelect id="tipo" name="tipo" defaultValue={filtros.tipo ?? ''}>
          <option value="">Entradas y salidas</option>
          <option value="entrada">Solo entradas</option>
          <option value="salida">Solo salidas</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="categoria-m" className="text-base">
          Categoría
        </Label>
        <NativeSelect id="categoria-m" name="categoria" defaultValue={filtros.categoria ?? ''}>
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="producto-m" className="text-base">
          Producto
        </Label>
        <NativeSelect id="producto-m" name="producto" defaultValue={filtros.producto ?? ''}>
          <option value="">Todos</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="lg" className="flex-1">
          Filtrar
        </Button>
        {hayFiltros && (
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href={limpiar} />}>Limpiar</Button>
        )}
      </div>
    </form>
  )
}
