import { Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Brand({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sun className="size-6" aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold">Mis Días Dorados</span>
        {subtitle && <span className="text-sm opacity-80">Inventario · Huehuetenango</span>}
      </span>
    </div>
  )
}
