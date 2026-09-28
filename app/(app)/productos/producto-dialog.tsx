'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { NativeSelect } from '@/components/native-select'
import { guardarProducto, type ActionState } from '@/lib/actions/inventario'
import { CATEGORIAS } from '@/lib/constants'

export type ProductoEditable = {
  id: string
  codigo: string
  nombre: string
  categoria: string
  unidad_medida: string
  stock_minimo: number
  descripcion: string | null
}

function ProductoForm({ producto, onDone }: { producto?: ProductoEditable; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(guardarProducto, {})
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      onDone()
    }
  }, [state.ok, state.key, state.message, onDone])

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {producto && <input type="hidden" name="id" value={producto.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="codigo" label="Código" required error={fe.codigo} hint="Ej.: ALI-010">
          <Input
            id="codigo"
            name="codigo"
            defaultValue={producto?.codigo}
            maxLength={30}
            autoCapitalize="characters"
            className="h-11 uppercase"
            aria-invalid={!!fe.codigo || undefined}
          />
        </Field>
        <Field id="categoria" label="Categoría" required error={fe.categoria}>
          <NativeSelect
            id="categoria"
            name="categoria"
            defaultValue={producto?.categoria ?? ''}
            aria-invalid={!!fe.categoria || undefined}
          >
            <option value="" disabled>
              Elija…
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field id="nombre" label="Nombre" required error={fe.nombre}>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={producto?.nombre}
          maxLength={120}
          className="h-11"
          aria-invalid={!!fe.nombre || undefined}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="unidad_medida" label="Unidad de medida" required error={fe.unidad_medida} hint="libras, cajas, unidades…">
          <Input
            id="unidad_medida"
            name="unidad_medida"
            defaultValue={producto?.unidad_medida}
            maxLength={30}
            className="h-11"
            aria-invalid={!!fe.unidad_medida || undefined}
          />
        </Field>
        <Field id="stock_minimo" label="Stock mínimo" required error={fe.stock_minimo} hint="Avisa cuando baje de aquí.">
          <Input
            id="stock_minimo"
            name="stock_minimo"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            defaultValue={producto?.stock_minimo ?? 0}
            className="h-11"
            aria-invalid={!!fe.stock_minimo || undefined}
          />
        </Field>
      </div>
      <Field id="descripcion" label="Descripción">
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={producto?.descripcion ?? ''}
          maxLength={500}
          rows={2}
          className="text-base"
        />
      </Field>
      <FormError message={state.ok ? undefined : state.error} />
      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Guardando…' : producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ProductoDialog({ producto }: { producto?: ProductoEditable }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {producto ? (
        <DialogTrigger render={<Button variant="outline" />}>
          <Pencil aria-hidden />
          Editar<span className="sr-only"> {producto.nombre}</span>
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="lg" />}>
          <Plus aria-hidden />
          Nuevo producto
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription className="text-base">
            {producto ? 'Actualice los datos del producto.' : 'Registre un producto del catálogo.'}
          </DialogDescription>
        </DialogHeader>
        {open && <ProductoForm producto={producto} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
