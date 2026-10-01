import { AppShell } from '@/components/app-shell/app-shell'
import { requirePerfil } from '@/lib/auth'
import { getTotalAlertas } from '@/lib/data'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await requirePerfil()
  const { total } = await getTotalAlertas()

  return (
    <AppShell nombre={perfil.nombre_completo} rol={perfil.rol} rolNombre={perfil.rol_nombre} alertas={total}>
      {children}
    </AppShell>
  )
}
