'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { cambiarEstadoUsuario } from '@/lib/actions/admin'

export function ToggleUsuario({
  id,
  nombre,
  activo,
  disabled,
}: {
  id: string
  nombre: string
  activo: boolean
  disabled?: boolean
}) {
  const [pending, startTransition] = useTransition()
  return (
    <label className="flex items-center gap-2 text-base">
      <Switch
        checked={activo}
        disabled={disabled || pending}
        aria-label={`${activo ? 'Desactivar' : 'Activar'} a ${nombre}`}
        onCheckedChange={(v) =>
          startTransition(async () => {
            const r = await cambiarEstadoUsuario(id, v)
            if (r.error) toast.error(r.error)
            else toast.success(r.message)
          })
        }
      />
      <span className={activo ? '' : 'text-muted-foreground'}>{activo ? 'Activo' : 'Inactivo'}</span>
    </label>
  )
}
