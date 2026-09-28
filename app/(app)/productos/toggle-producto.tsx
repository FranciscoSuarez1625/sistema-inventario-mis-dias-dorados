'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cambiarEstadoProducto } from '@/lib/actions/inventario'

export function ToggleProducto({ id, nombre, activo }: { id: string; nombre: string; activo: boolean }) {
  const [pending, start] = useTransition()

  const ejecutar = () =>
    start(async () => {
      const res = await cambiarEstadoProducto(id, !activo)
      if (res.ok) toast.success(res.message)
      else toast.error(res.error)
    })

  if (!activo) {
    return (
      <Button variant="outline" size="sm" onClick={ejecutar} disabled={pending}>
        <Power aria-hidden />
        Activar<span className="sr-only"> {nombre}</span>
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={pending}>
          <PowerOff aria-hidden />
          Desactivar<span className="sr-only"> {nombre}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar {nombre}?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Ya no aparecerá para registrar entradas. El historial se conserva y puede activarlo de nuevo cuando quiera.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={ejecutar}>Desactivar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
