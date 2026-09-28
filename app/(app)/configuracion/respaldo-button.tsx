'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DatabaseBackup } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RespaldoButton() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function descargar() {
    setPending(true)
    try {
      const res = await fetch('/api/respaldo', { method: 'POST' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const nombre =
        res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'respaldo-inventario.json'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Respaldo descargado. Guárdelo en un lugar seguro.')
      router.refresh()
    } catch {
      toast.error('No se pudo generar el respaldo. Intente de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Button size="lg" onClick={descargar} disabled={pending}>
      <DatabaseBackup aria-hidden />
      {pending ? 'Generando…' : 'Descargar respaldo'}
    </Button>
  )
}
