'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Boxes,
  ChartColumn,
  ClipboardList,
  FileText,
  History,
  House,
  Layers,
  PackageMinus,
  PackagePlus,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Rol } from '@/lib/constants'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: LucideIcon; roles: Rol[] }

const E: Rol[] = ['administrador', 'encargado']
const T: Rol[] = ['administrador', 'encargado', 'consulta']
const A: Rol[] = ['administrador']

const ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', icon: House, roles: T },
  { href: '/entradas/nueva', label: 'Registrar entrada', icon: PackagePlus, roles: E },
  { href: '/salidas/nueva', label: 'Registrar salida', icon: PackageMinus, roles: E },
  { href: '/existencias', label: 'Existencias', icon: Boxes, roles: T },
  { href: '/lotes', label: 'Lotes', icon: Layers, roles: T },
  { href: '/alertas', label: 'Alertas', icon: Bell, roles: T },
  { href: '/historial', label: 'Historial', icon: History, roles: T },
  { href: '/productos', label: 'Productos', icon: ClipboardList, roles: E },
  { href: '/categorias', label: 'Categorías', icon: Tags, roles: A },
  { href: '/reportes', label: 'Reportes', icon: FileText, roles: T },
  { href: '/metricas', label: 'Métricas', icon: ChartColumn, roles: T },
  { href: '/usuarios', label: 'Usuarios', icon: Users, roles: A },
  { href: '/roles', label: 'Roles', icon: ShieldCheck, roles: A },
  { href: '/configuracion', label: 'Configuración', icon: Settings, roles: A },
]

export function NavLinks({
  rol,
  alertas,
  collapsed = false,
  onNavigate,
}: {
  rol: Rol
  alertas: number
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <ul className="flex flex-col gap-1">
      {ITEMS.filter((i) => i.roles.includes(rol)).map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring',
                active
                  ? 'bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-[inset_4px_0_0_var(--gold)] [&>svg]:text-gold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className={cn('flex-1', collapsed && 'sr-only')}>{item.label}</span>
              {item.href === '/alertas' && alertas > 0 && (
                <span
                  className={cn(
                    'rounded-full bg-destructive px-2 py-0.5 text-sm font-bold text-white',
                    collapsed && 'absolute ml-7 -mt-7 px-1.5 text-xs',
                  )}
                >
                  {alertas}
                  <span className="sr-only"> alertas</span>
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
