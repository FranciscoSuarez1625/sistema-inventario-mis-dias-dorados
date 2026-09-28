import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil, type Perfil } from '@/lib/auth'
import { ROL_LABEL, SOLO_ADMIN } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { UsuarioDialog } from './usuario-dialog'
import { ToggleUsuario } from './toggle-usuario'

export const metadata: Metadata = { title: 'Usuarios' }

export default async function UsuariosPage() {
  const yo = await requirePerfil(SOLO_ADMIN)
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, usuario, rol, activo')
    .order('activo', { ascending: false })
    .order('nombre_completo')
  const usuarios = (data ?? []) as Perfil[]

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Usuarios"
        description="Personal con acceso al sistema y lo que puede hacer cada uno."
        actions={<UsuarioDialog />}
      />

      <dl className="mb-6 grid gap-3 rounded-xl border bg-card p-4 text-base sm:grid-cols-3">
        <div>
          <dt className="font-semibold">Administrador</dt>
          <dd className="text-muted-foreground">Acceso total: usuarios, configuración y respaldos.</dd>
        </div>
        <div>
          <dt className="font-semibold">Encargado de inventario</dt>
          <dd className="text-muted-foreground">Registra entradas, salidas y productos.</dd>
        </div>
        <div>
          <dt className="font-semibold">Consulta</dt>
          <dd className="text-muted-foreground">Solo puede ver existencias, alertas y reportes.</dd>
        </div>
      </dl>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table className="text-base">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} className={u.activo ? '' : 'opacity-70'}>
                <TableCell className="font-semibold">
                  {u.nombre_completo}
                  {u.id === yo.id && <span className="ml-2 text-sm font-normal text-muted-foreground">(usted)</span>}
                  <span className="block font-mono text-sm font-normal text-muted-foreground sm:hidden">{u.usuario}</span>
                </TableCell>
                <TableCell className="hidden font-mono sm:table-cell">{u.usuario}</TableCell>
                <TableCell>{ROL_LABEL[u.rol]}</TableCell>
                <TableCell>
                  <ToggleUsuario id={u.id} nombre={u.nombre_completo} activo={u.activo} disabled={u.id === yo.id} />
                </TableCell>
                <TableCell className="text-right">
                  <UsuarioDialog
                    usuario={{ id: u.id, nombre_completo: u.nombre_completo, usuario: u.usuario, rol: u.rol }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
