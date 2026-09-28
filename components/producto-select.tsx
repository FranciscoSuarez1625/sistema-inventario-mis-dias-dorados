'use client'

import { NativeSelect } from '@/components/native-select'
import { formatCantidad } from '@/lib/format'

export type ProductoOpcion = {
  id: string
  codigo: string
  nombre: string
  categoria: string
  unidad_medida: string
  stock_total: number
}

export function ProductoSelect({
  productos,
  value,
  onChange,
  mostrarStock = false,
  invalid,
}: {
  productos: ProductoOpcion[]
  value: string
  onChange: (id: string) => void
  mostrarStock?: boolean
  invalid?: boolean
}) {
  return (
    <NativeSelect
      id="producto_id"
      name="producto_id"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? 'producto_id-error' : undefined}
      className="h-12"
    >
      <option value="" disabled>
        Elija un producto…
      </option>
      {[...new Set(productos.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, 'es')).map((cat) => {
        const items = productos.filter((p) => p.categoria === cat)
        if (!items.length) return null
        return (
          <optgroup key={cat} label={cat}>
            {items.map((p) => (
              <option key={p.id} value={p.id} disabled={mostrarStock && p.stock_total <= 0}>
                {p.nombre} ({p.codigo})
                {mostrarStock ? ` — ${formatCantidad(p.stock_total)} ${p.unidad_medida}` : ''}
              </option>
            ))}
          </optgroup>
        )
      })}
    </NativeSelect>
  )
}
