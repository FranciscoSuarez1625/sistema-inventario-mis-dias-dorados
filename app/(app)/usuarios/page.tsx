import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { SOLO_ADMIN } from '@/lib/constants'
import { getRoles } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'
import { UsuarioDialog } from './usuario-dialog'
import { ToggleUsuario } from './toggle-usuario'

export const metadata: Metadata = { title: 'Usuarios' }

type UsuarioRow = {
  id: string
  nombre_completo: string
  usuario: string
  rol: string
  activo: boolean
}

export default async function UsuariosPage() {
  const yo = await requirePerfil(SOLO_ADMIN)
  const supabase = await createClient()
  const [{ data }, roles] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nombre_completo, usuario, rol, activo')
      .order('activo', { ascending: false })
      .order('nombre_completo'),
    getRoles(),
  ])
  const usuarios = (data ?? []) as UsuarioRow[]
  const opciones = roles.map((r) => ({ clave: r.clave, nombre: r.nombre }))
  const nombreRol = Object.fromEntries(roles.map((r) => [r.clave, r.nombre]))

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Usuarios"
        description="Personal con acceso al sistema y lo que puede hacer cada uno."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" render={<Link href="/roles" />}>
              <ShieldCheck aria-hidden />
              Gestionar roles
            </Button>
            <UsuarioDialog roles={opciones} />
          </div>
        }
      />

      <dl className="mb-6 grid gap-3 rounded-xl border bg-card p-4 text-base sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div key={r.clave}>
            <dt className="font-semibold">{r.nombre}</dt>
            <dd className="text-muted-foreground">{r.descripcion || 'Sin descripción.'}</dd>
          </div>
        ))}
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
                <TableCell>{nombreRol[u.rol] ?? u.rol}</TableCell>
                <TableCell>
                  <ToggleUsuario id={u.id} nombre={u.nombre_completo} activo={u.activo} disabled={u.id === yo.id} />
                </TableCell>
                <TableCell className="text-right">
                  <UsuarioDialog
                    roles={opciones}
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
