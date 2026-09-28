'use client'

import { useState } from 'react'
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Brand } from '@/components/brand'
import { cerrarSesion } from '@/app/login/actions'
import { ROL_LABEL, type Rol } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { NavLinks } from './nav-links'

type Props = {
  nombre: string
  rol: Rol
  alertas: number
  children: React.ReactNode
}

function UserBox({ nombre, rol, collapsed }: { nombre: string; rol: Rol; collapsed?: boolean }) {
  return (
    <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
      {!collapsed && (
        <div className="px-1">
          <p className="truncate text-base font-semibold">{nombre}</p>
          <p className="text-sm opacity-80">{ROL_LABEL[rol]}</p>
        </div>
      )}
      <form action={cerrarSesion}>
        <Button
          type="submit"
          variant="ghost"
          className={cn(
            'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut aria-hidden />
          <span className={cn(collapsed && 'sr-only')}>Cerrar sesión</span>
        </Button>
      </form>
    </div>
  )
}

export function AppShell({ nombre, rol, alertas, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      <aside
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground transition-[width] lg:flex print:hidden',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <div className={cn('flex items-center justify-between gap-2', collapsed && 'flex-col')}>
          {collapsed ? <Brand subtitle={false} className="[&>span:last-child]:sr-only" /> : <Brand />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
          </Button>
        </div>
        <nav aria-label="Menú principal" className="flex-1 overflow-y-auto">
          <NavLinks rol={rol} alertas={alertas} collapsed={collapsed} />
        </nav>
        <UserBox nombre={nombre} rol={rol} collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden print:hidden">
          <Brand subtitle={false} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Abrir menú"
          >
            <Menu aria-hidden />
          </Button>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="flex w-80 flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <Brand />
            <nav aria-label="Menú principal" className="flex-1 overflow-y-auto">
              <NavLinks rol={rol} alertas={alertas} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <UserBox nombre={nombre} rol={rol} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 print:p-0">{children}</main>
      </div>
    </div>
  )
}
