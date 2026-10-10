'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { ProductoSelect, type ProductoOpcion } from '@/components/producto-select'
import { registrarEntrada, type ActionState } from '@/lib/actions/inventario'
import { CantidadInput } from '@/components/cantidad-input'
import { formatCantidad, permiteDecimales } from '@/lib/format'

export function EntradaForm({
  productos,
  hoy,
  inicial,
  conVencimiento,
}: {
  productos: ProductoOpcion[]
  hoy: string
  inicial?: string
  conVencimiento: string[]
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(registrarEntrada, {})
  const [productoId, setProductoId] = useState(inicial ?? '')
  const [formKey, setFormKey] = useState(0)
  const producto = productos.find((p) => p.id === productoId)
  const vencObligatorio = producto ? conVencimiento.includes(producto.categoria) : false
  const decimales = producto ? permiteDecimales(producto.unidad_medida) : true
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      setProductoId('')
      setFormKey(state.key)
    }
  }, [state.ok, state.key, state.message])

  return (
    <form key={formKey} action={action} className="flex flex-col gap-6" noValidate>
      <Field id="producto_id" label="Producto" required error={fe.producto_id}>
        <ProductoSelect productos={productos} value={productoId} onChange={setProductoId} invalid={!!fe.producto_id} />
      </Field>

      {producto && (
        <p className="rounded-lg bg-secondary px-4 py-3 text-base text-secondary-foreground">
          Categoría: <strong>{producto.categoria}</strong> · Hay{' '}
          <strong>
            {formatCantidad(producto.stock_total)} {producto.unidad_medida}
          </strong>{' '}
          en bodega.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="cantidad"
          label={`Cantidad${producto ? ` (${producto.unidad_medida})` : ''}`}
          required
          error={fe.cantidad}
          hint={
            producto
              ? decimales
                ? 'Puede usar decimales (ej.: 2.5).'
                : 'Solo números enteros, sin decimales.'
              : 'Mayor que cero.'
          }
        >
          <CantidadInput
            id="cantidad"
            name="cantidad"
            decimales={decimales}
            required
            className="h-12 text-lg"
            aria-invalid={!!fe.cantidad || undefined}
          />
        </Field>
        <Field id="fecha" label="Fecha de ingreso" required error={fe.fecha}>
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

      <Field
        id="fecha_vencimiento"
        label="Fecha de vencimiento"
        required={vencObligatorio}
        error={fe.fecha_vencimiento}
        hint={
          producto
            ? vencObligatorio
              ? `Obligatoria para ${producto.categoria.toLowerCase()}.`
              : 'Opcional para esta categoría; déjela vacía si no aplica.'
            : 'Obligatoria según la categoría del producto.'
        }
      >
        <Input
          id="fecha_vencimiento"
          name="fecha_vencimiento"
          type="date"
          required={vencObligatorio}
          className="h-12 sm:max-w-xs"
          aria-invalid={!!fe.fecha_vencimiento || undefined}
        />
      </Field>

      <div className="rounded-lg border border-dashed border-border px-4 py-3 text-base">
        <p className="font-medium">Número de lote</p>
        <p className="text-muted-foreground">
          Se asigna automáticamente al guardar
          {producto ? (
            <>
              {' '}
              (ej.: <span className="font-mono text-foreground">{`${producto.codigo}-${hoy.slice(2).replaceAll('-', '')}-01`}</span>)
            </>
          ) : null}
          : código del producto, fecha de ingreso y número de entrada del día.
        </p>
      </div>

      <Field id="origen" label="Origen o proveedor" hint="Ej.: Donación parroquia, Compra mercado.">
        <Input id="origen" name="origen" maxLength={200} className="h-12" />
      </Field>

      <Field id="observaciones" label="Observaciones">
        <Textarea id="observaciones" name="observaciones" maxLength={500} rows={3} className="text-base" />
      </Field>

      <FormError message={state.ok ? undefined : state.error} />

      <Button type="submit" size="lg" disabled={pending} className="sm:self-start">
        <PackagePlus aria-hidden />
        {pending ? 'Guardando…' : 'Guardar entrada'}
      </Button>
    </form>
  )
}
