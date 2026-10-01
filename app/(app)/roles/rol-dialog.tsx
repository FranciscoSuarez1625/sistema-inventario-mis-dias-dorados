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
import { guardarRol } from '@/lib/actions/roles'
import type { ActionState } from '@/lib/actions/inventario'
import { ACCESO_DESCRIPCION, ROLES, ROL_LABEL, type Rol } from '@/lib/constants'

export type RolEditable = {
  clave: string
  nombre: string
  descripcion: string | null
  acceso: Rol
  sistema: boolean
}

function RolForm({ rol, onDone }: { rol?: RolEditable; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(guardarRol, {})
  const [acceso, setAcceso] = useState<Rol>(rol?.acceso ?? 'consulta')
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      onDone()
    }
  }, [state.ok, state.key, state.message, onDone])

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {rol && <input type="hidden" name="clave" value={rol.clave} />}
      <Field id="rol-nombre" label="Nombre" required error={fe.nombre} hint="Ej.: Enfermería">
        <Input
          id="rol-nombre"
          name="nombre"
          defaultValue={rol?.nombre}
          maxLength={40}
          autoComplete="off"
          className="h-11"
          aria-invalid={!!fe.nombre || undefined}
        />
      </Field>

      <Field id="rol-descripcion" label="Descripción" hint="Explique para quién es este rol o qué hace.">
        <Textarea
          id="rol-descripcion"
          name="descripcion"
          defaultValue={rol?.descripcion ?? ''}
          maxLength={300}
          rows={3}
          className="text-base"
        />
      </Field>

      <Field
        id="rol-acceso"
        label="Nivel de acceso"
        required
        error={fe.acceso}
        hint={rol?.sistema ? 'El nivel de acceso de los roles del sistema no se puede cambiar.' : ACCESO_DESCRIPCION[acceso]}
      >
        <NativeSelect
          id="rol-acceso"
          name="acceso"
          value={acceso}
          onChange={(e) => setAcceso(e.target.value as Rol)}
          disabled={rol?.sistema}
          aria-invalid={!!fe.acceso || undefined}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROL_LABEL[r]}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <FormError message={state.ok ? undefined : state.error} />
      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Guardando…' : rol ? 'Guardar cambios' : 'Crear rol'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function RolDialog({ rol }: { rol?: RolEditable }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {rol ? (
        <DialogTrigger render={<Button variant="outline" />}>
          <Pencil aria-hidden />
          Editar<span className="sr-only"> {rol.nombre}</span>
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="lg" />}>
          <Plus aria-hidden />
          Añadir rol
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{rol ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
          <DialogDescription className="text-base">
            {rol
              ? 'Los cambios se aplican de inmediato a los usuarios con este rol.'
              : 'Cree un rol y elija qué puede hacer en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        {open && <RolForm rol={rol} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
