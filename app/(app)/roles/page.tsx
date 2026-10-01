import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requirePerfil } from '@/lib/auth'
import { ROL_LABEL, SOLO_ADMIN } from '@/lib/constants'
import { getConteoUsuariosPorRol, getRoles } from '@/lib/roles'
import { RolDialog } from './rol-dialog'
import { EliminarRol } from './eliminar-rol'

export const metadata: Metadata = { title: 'Roles' }

export default async function RolesPage() {
  await requirePerfil(SOLO_ADMIN)
  const [roles, conteo] = await Promise.all([getRoles(), getConteoUsuariosPorRol()])

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Roles"
        description="Defina los puestos del personal y el nivel de acceso de cada uno."
        actions={<RolDialog />}
      />

      {roles.length === 0 ? (
        <EmptyState>Aún no hay roles. Añada el primero.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => {
                const usuarios = conteo[r.clave] ?? 0
                return (
                  <TableRow key={r.clave}>
                    <TableCell className="align-top whitespace-normal">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{r.nombre}</span>
                        {r.sistema && <Badge variant="secondary">Sistema</Badge>}
                      </div>
                      <span className="block text-sm text-muted-foreground">
                        Acceso: {ROL_LABEL[r.acceso]} · {usuarios} {usuarios === 1 ? 'usuario' : 'usuarios'}
                      </span>
                      {r.descripcion && (
                        <span className="mt-1 block text-sm text-muted-foreground md:hidden">{r.descripcion}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden align-top whitespace-normal text-muted-foreground md:table-cell">
                      {r.descripcion || '—'}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex justify-end gap-2">
                        <RolDialog rol={r} />
                        <EliminarRol clave={r.clave} nombre={r.nombre} usuarios={usuarios} sistema={r.sistema} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
