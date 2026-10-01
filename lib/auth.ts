import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLES, type Rol } from '@/lib/constants'

export type Perfil = {
  id: string
  nombre_completo: string
  usuario: string
  /** Nivel de acceso efectivo del rol asignado; es lo que controla los permisos. */
  rol: Rol
  rol_clave: string
  rol_nombre: string
  activo: boolean
}

type PerfilRow = {
  id: string
  nombre_completo: string
  usuario: string
  rol: string
  activo: boolean
  roles: { nombre: string; acceso: string } | null
}

export const getPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, usuario, rol, activo, roles(nombre, acceso)')
    .eq('id', user.id)
    .maybeSingle<PerfilRow>()
  if (!data) return null
  const acceso = data.roles?.acceso as Rol | undefined
  return {
    id: data.id,
    nombre_completo: data.nombre_completo,
    usuario: data.usuario,
    rol: acceso && ROLES.includes(acceso) ? acceso : 'consulta',
    rol_clave: data.rol,
    rol_nombre: data.roles?.nombre ?? data.rol,
    activo: data.activo,
  }
})

export async function requirePerfil(roles?: Rol[]) {
  const perfil = await getPerfil()
  if (!perfil || !perfil.activo) redirect('/login')
  if (roles && !roles.includes(perfil.rol)) redirect('/?sin-permiso=1')
  return perfil
}

export async function checkRol(roles: Rol[]) {
  const perfil = await getPerfil()
  if (!perfil || !perfil.activo || !roles.includes(perfil.rol)) return null
  return perfil
}
