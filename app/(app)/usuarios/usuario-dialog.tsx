'use client'

import { useActionState, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, UserPlus } from 'lucide-react'
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
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { NativeSelect } from '@/components/native-select'
import { actualizarUsuario, crearUsuario } from '@/lib/actions/admin'
import type { ActionState } from '@/lib/actions/inventario'
export type UsuarioEditable = { id: string; nombre_completo: string; usuario: string; rol: string }
export type RolOpcion = { clave: string; nombre: string }

function UsuarioForm({
  usuario,
  roles,
  onDone,
}: {
  usuario?: UsuarioEditable
  roles: RolOpcion[]
  onDone: () => void
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    usuario ? actualizarUsuario : crearUsuario,
    {},
  )
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) {
      toast.success(state.message)
      onDone()
    }
  }, [state.ok, state.key, state.message, onDone])

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {usuario && <input type="hidden" name="id" value={usuario.id} />}
      <Field id="nombre_completo" label="Nombre completo" required error={fe.nombre_completo}>
        <Input
          id="nombre_completo"
          name="nombre_completo"
          defaultValue={usuario?.nombre_completo}
          maxLength={120}
          autoComplete="off"
          className="h-11"
          aria-invalid={!!fe.nombre_completo || undefined}
        />
      </Field>
      {usuario ? (
        <p className="text-base">
          Usuario: <span className="font-mono font-semibold">{usuario.usuario}</span>
        </p>
      ) : (
        <Field id="usuario" label="Nombre de usuario" required error={fe.usuario} hint="Con este nombre iniciará sesión. Ej.: maria.lopez">
          <Input
            id="usuario"
            name="usuario"
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="h-11 lowercase"
            aria-invalid={!!fe.usuario || undefined}
          />
        </Field>
      )}
      <Field id="rol" label="Rol" required error={fe.rol}>
        <NativeSelect id="rol" name="rol" defaultValue={usuario?.rol ?? 'encargado'} aria-invalid={!!fe.rol || undefined}>
          {roles.map((r) => (
            <option key={r.clave} value={r.clave}>
              {r.nombre}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field
        id="password"
        label={usuario ? 'Nueva contraseña' : 'Contraseña'}
        required={!usuario}
        error={fe.password}
        hint={usuario ? 'Déjela vacía para no cambiarla.' : 'Mínimo 8 caracteres, con letras y números.'}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          className="h-11"
          aria-invalid={!!fe.password || undefined}
        />
      </Field>
      <FormError message={state.ok ? undefined : state.error} />
      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Guardando…' : usuario ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function UsuarioDialog({ usuario, roles }: { usuario?: UsuarioEditable; roles: RolOpcion[] }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {usuario ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" title="Editar usuario" />}>
          <Pencil aria-hidden />
          <span className="sr-only">Editar a {usuario.nombre_completo}</span>
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="lg" />}>
          <UserPlus aria-hidden />
          Nuevo usuario
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription className="text-base">
            {usuario ? 'Cambie el nombre, el rol o la contraseña.' : 'Cree una cuenta para un miembro del personal.'}
          </DialogDescription>
        </DialogHeader>
        {open && <UsuarioForm usuario={usuario} roles={roles} onDone={close} />}
      </DialogContent>
    </Dialog>
  )
}
