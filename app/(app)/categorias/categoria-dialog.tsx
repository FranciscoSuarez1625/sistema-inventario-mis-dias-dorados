'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, Plus } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { guardarCategoria } from '@/lib/actions/categorias'
import type { ActionState } from '@/lib/actions/inventario'
import type { Categoria } from '@/lib/data'
import { cn } from '@/lib/utils'

const COLORES = [
  { hex: '#174A7E', nombre: 'Azul institucional' },
  { hex: '#D4A72C', nombre: 'Dorado' },
  { hex: '#2E8B57', nombre: 'Verde' },
  { hex: '#2A8C9A', nombre: 'Turquesa' },
  { hex: '#7A4EA3', nombre: 'Morado' },
  { hex: '#C0632B', nombre: 'Naranja' },
  { hex: '#B23B3B', nombre: 'Rojo' },
  { hex: '#5F6B76', nombre: 'Gris' },
]

function CategoriaForm({ categoria, onDone }: { categoria?: Categoria; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(guardarCategoria, {})
  const [color, setColor] = useState(categoria?.color ?? COLORES[0].hex)
  const [vence, setVence] = useState(categoria?.requiere_vencimiento ?? false)
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      onDone()
    }
  }, [state.ok, state.key, state.message, onDone])

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <Field id="cat-nombre" label="Nombre" required error={fe.nombre} hint="Ej.: Higiene personal">
        <Input
          id="cat-nombre"
          name="nombre"
          defaultValue={categoria?.nombre}
          maxLength={30}
          className="h-11"
          aria-invalid={!!fe.nombre || undefined}
        />
      </Field>

      <Field id="cat-descripcion" label="Descripción">
        <Textarea
          id="cat-descripcion"
          name="descripcion"
          defaultValue={categoria?.descripcion ?? ''}
          maxLength={300}
          rows={3}
          className="text-base"
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-base font-medium">
          Color <span className="text-destructive" aria-hidden>*</span>
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          {COLORES.map((c) => {
            const activo = color.toUpperCase() === c.hex
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-pressed={activo}
                aria-label={c.nombre}
                title={c.nombre}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 transition outline-none focus-visible:ring-ring',
                  activo ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                )}
                style={{ backgroundColor: c.hex }}
              >
                {activo && <Check className="size-5 text-white" aria-hidden />}
              </button>
            )
          })}
          <label className="ml-1 flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm hover:bg-accent">
            <input
              type="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            Otro color
          </label>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          Vista previa:
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium text-foreground"
            style={{ borderColor: color, backgroundColor: `${color}1A` }}
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            {categoria?.nombre || 'Categoría'}
          </span>
          <span className="font-mono">{color.toUpperCase()}</span>
        </p>
        {fe.color && <p className="text-sm font-semibold text-destructive">{fe.color}</p>}
      </fieldset>

      <label className="flex items-start gap-3 rounded-lg bg-secondary p-4 text-base">
        <Switch
          name="requiere_vencimiento"
          checked={vence}
          onCheckedChange={setVence}
          className="mt-0.5"
        />
        <span>
          <span className="font-semibold">Exigir fecha de vencimiento</span>
          <span className="block text-sm text-muted-foreground">
            Al registrar entradas de esta categoría la fecha de vencimiento será obligatoria.
          </span>
        </span>
      </label>

      <FormError message={state.ok ? undefined : state.error} />
      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Guardando…' : categoria ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CategoriaDialog({ categoria }: { categoria?: Categoria }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {categoria ? (
        <DialogTrigger render={<Button variant="outline" />}>
          <Pencil aria-hidden />
          Editar<span className="sr-only"> {categoria.nombre}</span>
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="lg" />}>
          <Plus aria-hidden />
          Añadir categoría
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{categoria ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogDescription className="text-base">
            {categoria
              ? 'Si cambia el nombre, los productos de esta categoría se actualizan automáticamente.'
              : 'Agrupe los productos del inventario.'}
          </DialogDescription>
        </DialogHeader>
        {open && <CategoriaForm categoria={categoria} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
