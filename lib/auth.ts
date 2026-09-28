import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Rol } from '@/lib/constants'

export type Perfil = {
  id: string
  nombre_completo: string
  usuario: string
  rol: Rol
  activo: boolean
}

export const getPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, usuario, rol, activo')
    .eq('id', user.id)
    .maybeSingle()
  return (data as Perfil | null) ?? null
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
