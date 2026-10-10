'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PackageMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { ProductoSelect, type ProductoOpcion } from '@/components/producto-select'
import { registrarSalida, type ActionState } from '@/lib/actions/inventario'
import { CantidadInput } from '@/components/cantidad-input'
import { formatCantidad, formatFecha, permiteDecimales } from '@/lib/format'

export type LoteDisponible = {
  id: string
  producto_id: string
  numero_lote: string
  cantidad_actual: number
  fecha_vencimiento: string | null
}

const DESTINOS = ['Cocina', 'Enfermería', 'Limpieza', 'Lavandería', 'Merma / vencido']

export function SalidaForm({
  productos,
  lotes,
  hoy,
  inicial,
}: {
  productos: ProductoOpcion[]
  lotes: LoteDisponible[]
  hoy: string
  inicial?: string
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(registrarSalida, {})
  const [productoId, setProductoId] = useState(inicial ?? '')
  const [cantidad, setCantidad] = useState('')
  const [formKey, setFormKey] = useState(0)
  const producto = productos.find((p) => p.id === productoId)
  const lotesProducto = lotes.filter((l) => l.producto_id === productoId)
  const cant = Number(cantidad.replace(',', '.'))
  const decimales = producto ? permiteDecimales(producto.unidad_medida) : true
  const excede = producto && Number.isFinite(cant) && cant > producto.stock_total
  const conDecimal = !decimales && cantidad !== '' && Number.isFinite(cant) && !Number.isInteger(cant)
  const fe = state.ok ? {} : (state.fieldErrors ?? {})
  const errorCantidad =
    fe.cantidad ??
    (conDecimal
      ? `Use un número entero para productos en ${producto?.unidad_medida}.`
      : excede
        ? `Solo hay ${formatCantidad(producto.stock_total)} ${producto.unidad_medida} disponibles.`
        : undefined)

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      setProductoId('')
      setCantidad('')
      setFormKey(state.key)
    }
  }, [state.ok, state.key, state.message])

  let restante = Number.isFinite(cant) && cant > 0 ? cant : 0

  return (
    <form key={formKey} action={action} className="flex flex-col gap-6" noValidate>
      <Field id="producto_id" label="Producto" required error={fe.producto_id} hint="Los productos sin existencias no se pueden elegir.">
        <ProductoSelect
          productos={productos}
          value={productoId}
          onChange={setProductoId}
          mostrarStock
          invalid={!!fe.producto_id}
        />
      </Field>

      {producto && (
        <div className="rounded-lg bg-secondary px-4 py-3 text-base text-secondary-foreground">
          <p>
            Disponible:{' '}
            <strong>
              {formatCantidad(producto.stock_total)} {producto.unidad_medida}
            </strong>
          </p>
          {lotesProducto.length > 0 && (
            <div className="mt-2">
              <p className="text-sm">Se descontará primero de lo que vence antes:</p>
              <ul className="mt-1 flex flex-col gap-1 text-sm">
                {lotesProducto.map((l) => {
                  const toma = Math.min(l.cantidad_actual, restante)
                  restante -= toma
                  return (
                    <li key={l.id} className="flex justify-between gap-3 tabular-nums">
                      <span>
                        <span className="font-mono font-semibold">{l.numero_lote}</span> ·{' '}
                        {l.fecha_vencimiento ? `Vence ${formatFecha(l.fecha_vencimiento)}` : 'Sin vencimiento'} ·{' '}
                        {formatCantidad(l.cantidad_actual)} {producto.unidad_medida}
                      </span>
                      {toma > 0 && <strong>−{formatCantidad(toma)}</strong>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="cantidad"
          label={`Cantidad${producto ? ` (${producto.unidad_medida})` : ''}`}
          required
          error={errorCantidad}
        >
          <CantidadInput
            id="cantidad"
            name="cantidad"
            decimales={decimales}
            max={producto?.stock_total}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            className="h-12 text-lg"
            aria-invalid={!!errorCantidad || undefined}
          />
        </Field>
        <Field id="fecha" label="Fecha de salida" required error={fe.fecha}>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            max={hoy}
            defaultValue={hoy}
            required
            className="h-12"
            aria-invalid={!!fe.fecha || undefined}
          />
        </Field>
      </div>

      <Field id="destino" label="Destino o motivo" required error={fe.destino}>
        <Input
          id="destino"
          name="destino"
          list="destinos"
          maxLength={200}
          required
          className="h-12"
          aria-invalid={!!fe.destino || undefined}
        />
        <datalist id="destinos">
          {DESTINOS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </Field>

      <Field id="observaciones" label="Observaciones">
        <Textarea id="observaciones" name="observaciones" maxLength={500} rows={3} className="text-base" />
      </Field>

      <FormError message={state.ok ? undefined : state.error} />

      <Button type="submit" size="lg" disabled={pending || !!excede} className="sm:self-start">
        <PackageMinus aria-hidden />
        {pending ? 'Guardando…' : 'Guardar salida'}
      </Button>
    </form>
  )
}
