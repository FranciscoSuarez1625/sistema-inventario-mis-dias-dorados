'use server'

import { revalidatePath } from 'next/cache'
import { checkRol } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { SOLO_ADMIN } from '@/lib/constants'
import type { ActionState } from '@/lib/actions/inventario'

const SIN_PERMISO: ActionState = { error: 'No tiene permiso para realizar esta acción.' }
const UUID = /^[0-9a-f-]{36}$/i
const HEX = /^#[0-9a-f]{6}$/i

function str(fd: FormData, k: string, max: number) {
  return String(fd.get(k) ?? '').trim().replace(/\s+/g, ' ').slice(0, max)
}

export async function guardarCategoria(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO

  const id = str(fd, 'id', 40)
  const nombre = str(fd, 'nombre', 30)
  const descripcion = String(fd.get('descripcion') ?? '').trim().slice(0, 300)
  const color = str(fd, 'color', 7)
  const requiere_vencimiento = fd.get('requiere_vencimiento') === 'on'

  const fieldErrors: Record<string, string> = {}
  if (!nombre) fieldErrors.nombre = 'Escriba el nombre de la categoría.'
  if (!HEX.test(color)) fieldErrors.color = 'Elija un color.'
  if (id && !UUID.test(id)) return { error: 'Categoría no válida.' }
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const supabase = await createClient()
  const payload = { nombre, descripcion: descripcion || null, color: color.toUpperCase(), requiere_vencimiento }
  const { error } = id
    ? await supabase.from('categorias').update(payload).eq('id', id)
    : await supabase.from('categorias').insert(payload)

  if (error) {
    if (error.code === '23505') {
      const msg = 'Ya existe una categoría con ese nombre.'
      return { fieldErrors: { nombre: msg }, error: msg }
    }
    console.error('[categorias] error al guardar', error.message)
    return { error: 'No se pudo guardar la categoría. Intente de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: id ? 'Categoría actualizada.' : 'Categoría creada.', key: Date.now() }
}

export async function eliminarCategoria(id: string): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO
  if (!UUID.test(id)) return { error: 'Categoría no válida.' }

  const supabase = await createClient()
  const { data: cat } = await supabase.from('categorias').select('nombre').eq('id', id).maybeSingle()
  if (!cat) return { error: 'La categoría ya no existe.' }

  const { count } = await supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria', cat.nombre)
  if (count && count > 0) {
    return {
      error: `No se puede eliminar: ${count} ${count === 1 ? 'producto usa' : 'productos usan'} esta categoría. Cámbielos de categoría primero.`,
    }
  }

  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') return { error: 'No se puede eliminar: hay productos en esta categoría.' }
    console.error('[categorias] error al eliminar', error.message)
    return { error: 'No se pudo eliminar la categoría. Intente de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: `Categoría "${cat.nombre}" eliminada.` }
}
