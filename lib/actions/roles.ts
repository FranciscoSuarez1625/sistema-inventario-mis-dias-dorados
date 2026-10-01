'use server'

import { revalidatePath } from 'next/cache'
import { checkRol } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ROLES, SOLO_ADMIN, type Rol } from '@/lib/constants'
import type { ActionState } from '@/lib/actions/inventario'

const SIN_PERMISO: ActionState = { error: 'Solo el administrador puede gestionar roles.' }
const CLAVE = /^[a-z0-9-]{1,40}$/i

function str(fd: FormData, k: string, max: number) {
  return String(fd.get(k) ?? '').trim().replace(/\s+/g, ' ').slice(0, max)
}

export async function guardarRol(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO

  const clave = str(fd, 'clave', 40)
  const nombre = str(fd, 'nombre', 40)
  const descripcion = String(fd.get('descripcion') ?? '').trim().slice(0, 300)
  const acceso = str(fd, 'acceso', 20) as Rol

  if (clave && !CLAVE.test(clave)) return { error: 'Rol no válido.' }

  const supabase = await createClient()
  const { data: actual } = clave
    ? await supabase.from('roles').select('sistema, acceso').eq('clave', clave).maybeSingle()
    : { data: null }
  if (clave && !actual) return { error: 'El rol ya no existe.' }

  const fieldErrors: Record<string, string> = {}
  if (!nombre) fieldErrors.nombre = 'Escriba el nombre del rol.'
  if (!actual?.sistema && !ROLES.includes(acceso)) fieldErrors.acceso = 'Elija un nivel de acceso.'
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const payload = {
    nombre,
    descripcion: descripcion || null,
    acceso: actual?.sistema ? actual.acceso : acceso,
  }
  const { error } = clave
    ? await supabase.from('roles').update(payload).eq('clave', clave)
    : await supabase.from('roles').insert(payload)

  if (error) {
    if (error.code === '23505') {
      const msg = 'Ya existe un rol con ese nombre.'
      return { fieldErrors: { nombre: msg }, error: msg }
    }
    console.error('[roles] error al guardar', error.message)
    return { error: 'No se pudo guardar el rol. Intente de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: clave ? 'Rol actualizado.' : 'Rol creado.', key: Date.now() }
}

export async function eliminarRol(clave: string): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO
  if (!CLAVE.test(clave)) return { error: 'Rol no válido.' }

  const supabase = await createClient()
  const { data: rol } = await supabase.from('roles').select('nombre, sistema').eq('clave', clave).maybeSingle()
  if (!rol) return { error: 'El rol ya no existe.' }
  if (rol.sistema) return { error: 'Los roles del sistema no se pueden eliminar.' }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('rol', clave)
  if (count && count > 0) {
    return {
      error: `No se puede eliminar: ${count} ${count === 1 ? 'usuario tiene' : 'usuarios tienen'} este rol. Asígneles otro rol primero.`,
    }
  }

  const { error } = await supabase.from('roles').delete().eq('clave', clave)
  if (error) {
    if (error.code === '23503') return { error: 'No se puede eliminar: hay usuarios con este rol.' }
    console.error('[roles] error al eliminar', error.message)
    return { error: 'No se pudo eliminar el rol. Intente de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: `Rol "${rol.nombre}" eliminado.` }
}
