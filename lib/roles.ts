import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Rol } from '@/lib/constants'

export type RolRegistro = {
  clave: string
  nombre: string
  descripcion: string | null
  acceso: Rol
  sistema: boolean
}

export async function getRoles(): Promise<RolRegistro[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('clave, nombre, descripcion, acceso, sistema')
    .order('sistema', { ascending: false })
    .order('nombre')
  return (data ?? []) as RolRegistro[]
}

export async function getConteoUsuariosPorRol(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('rol')
  const conteo: Record<string, number> = {}
  for (const p of data ?? []) conteo[p.rol] = (conteo[p.rol] ?? 0) + 1
  return conteo
}
