'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { eliminarRol } from '@/lib/actions/roles'

export function EliminarRol({
  clave,
  nombre,
  usuarios,
  sistema,
}: {
  clave: string
  nombre: string
  usuarios: number
  sistema: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const bloqueado = sistema || usuarios > 0

  function confirmar() {
    startTransition(async () => {
      const r = await eliminarRol(clave)
      if (r.error) {
        toast.error(r.error)
        return
      }
      toast.success(r.message)
      setOpen(false)
    })
  }

  const motivo = sistema
    ? 'Este es un rol del sistema y es necesario para que la aplicación funcione. Puede editar su nombre y descripción.'
    : `Hay ${usuarios} ${usuarios === 1 ? 'usuario' : 'usuarios'} con este rol. Asígneles otro rol en Usuarios antes de eliminarlo.`

  return (
    <AlertDialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      <AlertDialogTrigger
        render={<Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" />}
      >
        <Trash2 aria-hidden />
        Eliminar<span className="sr-only"> {nombre}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            {bloqueado ? 'No se puede eliminar' : `¿Eliminar el rol "${nombre}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {bloqueado ? motivo : 'Esta acción no se puede deshacer.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" size="lg" />} disabled={pending}>
            {bloqueado ? 'Entendido' : 'Cancelar'}
          </AlertDialogCancel>
          {!bloqueado && (
            <Button variant="destructive" size="lg" onClick={confirmar} disabled={pending}>
              {pending ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
