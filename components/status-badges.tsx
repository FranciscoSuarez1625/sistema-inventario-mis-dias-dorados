import { CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { diasHasta } from '@/lib/format'

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold whitespace-nowrap'

export function StockBadge({ estado }: { estado: 'normal' | 'bajo' | 'agotado' }) {
  if (estado === 'agotado') {
    return (
      <span className={cn(BASE, 'border-destructive/30 bg-destructive/10 text-destructive')}>
        <CircleX className="size-4" aria-hidden />
        Agotado
      </span>
    )
  }
  if (estado === 'bajo') {
    return (
      <span className={cn(BASE, 'border-warning-foreground/25 bg-warning text-warning-foreground')}>
        <TriangleAlert className="size-4" aria-hidden />
        Stock bajo
      </span>
    )
  }
  return (
    <span className={cn(BASE, 'border-success/25 bg-secondary text-secondary-foreground')}>
      <CircleCheck className="size-4" aria-hidden />
      Normal
    </span>
  )
}

export function VencimientoBadge({ fecha, diasAlerta }: { fecha: string | null; diasAlerta: number }) {
  if (!fecha) return <span className="text-muted-foreground">Sin vencimiento</span>
  const dias = diasHasta(fecha)
  if (dias < 0) {
    return (
      <span className={cn(BASE, 'border-destructive/30 bg-destructive/10 text-destructive')}>
        <CircleX className="size-4" aria-hidden />
        Vencido hace {Math.abs(dias)} {Math.abs(dias) === 1 ? 'día' : 'días'}
      </span>
    )
  }
  if (dias <= diasAlerta) {
    return (
      <span className={cn(BASE, 'border-warning-foreground/25 bg-warning text-warning-foreground')}>
        <Clock className="size-4" aria-hidden />
        {dias === 0 ? 'Vence hoy' : `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`}
      </span>
    )
  }
  return (
    <span className={cn(BASE, 'border-success/25 bg-secondary text-secondary-foreground')}>
      <CircleCheck className="size-4" aria-hidden />
      En {dias} días
    </span>
  )
}

export function TipoBadge({ tipo }: { tipo: 'entrada' | 'salida' }) {
  return tipo === 'entrada' ? (
    <span className={cn(BASE, 'border-success/25 bg-secondary text-secondary-foreground')}>Entrada</span>
  ) : (
    <span className={cn(BASE, 'border-border bg-accent text-accent-foreground')}>Salida</span>
  )
}
