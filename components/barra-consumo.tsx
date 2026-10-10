import { cn } from '@/lib/utils'

export function BarraConsumo({
  actual,
  inicial,
  className,
}: {
  actual: number
  inicial: number
  className?: string
}) {
  const pct = inicial > 0 ? Math.max(0, Math.min(100, (Number(actual) / Number(inicial)) * 100)) : 0
  return (
    <div
      role="meter"
      aria-label="Porcentaje disponible del lote"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-2 overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full', pct === 0 ? 'bg-transparent' : pct <= 25 ? 'bg-gold' : 'bg-primary')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
