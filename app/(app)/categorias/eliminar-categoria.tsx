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
import { eliminarCategoria } from '@/lib/actions/categorias'

export function EliminarCategoria({ id, nombre, productos }: { id: string; nombre: string; productos: number }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const enUso = productos > 0

  function confirmar() {
    startTransition(async () => {
      const r = await eliminarCategoria(id)
      if (r.error) {
        toast.error(r.error)
        return
      }
      toast.success(r.message)
      setOpen(false)
    })
  }

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
            {enUso ? 'No se puede eliminar' : `¿Eliminar "${nombre}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {enUso
              ? `Hay ${productos} ${productos === 1 ? 'producto' : 'productos'} en esta categoría. Cámbielos a otra categoría antes de eliminarla.`
              : 'Esta acción no se puede deshacer.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" size="lg" />} disabled={pending}>
            {enUso ? 'Entendido' : 'Cancelar'}
          </AlertDialogCancel>
          {!enUso && (
            <Button variant="destructive" size="lg" onClick={confirmar} disabled={pending}>
              {pending ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
