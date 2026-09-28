'use server'

import { revalidatePath } from 'next/cache'
import { checkRol } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROLES, SOLO_ADMIN, usuarioAEmail, type Rol } from '@/lib/constants'
import type { ActionState } from '@/lib/actions/inventario'

const SIN_PERMISO: ActionState = { error: 'Solo el administrador puede realizar esta acción.' }
const UUID = /^[0-9a-f-]{36}$/i
const USUARIO = /^[a-z0-9._-]{3,30}$/

function str(fd: FormData, k: string, max = 200) {
  return String(fd.get(k) ?? '').trim().slice(0, max)
}

function validarPassword(p: string) {
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (p.length > 72) return 'La contraseña es demasiado larga.'
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Use letras y al menos un número.'
  return null
}

export async function crearUsuario(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO

  const nombre_completo = str(fd, 'nombre_completo', 120)
  const usuario = str(fd, 'usuario', 30).toLowerCase()
  const rol = str(fd, 'rol', 20) as Rol
  const password = String(fd.get('password') ?? '')

  const fieldErrors: Record<string, string> = {}
  if (!nombre_completo) fieldErrors.nombre_completo = 'Escriba el nombre completo.'
  if (!USUARIO.test(usuario)) fieldErrors.usuario = 'De 3 a 30 caracteres: letras minúsculas, números, punto o guion.'
  if (!ROLES.includes(rol)) fieldErrors.rol = 'Elija un rol.'
  const pErr = validarPassword(password)
  if (pErr) fieldErrors.password = pErr
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: usuarioAEmail(usuario),
    password,
    email_confirm: true,
    user_metadata: { nombre_completo, usuario },
    app_metadata: { rol },
  })
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes('already')) {
      return { fieldErrors: { usuario: 'Ese nombre de usuario ya existe.' }, error: 'Ese nombre de usuario ya existe.' }
    }
    console.error('[usuarios] crear', error?.message)
    return { error: 'No se pudo crear el usuario. Intente de nuevo.' }
  }

  const { error: pErrDb } = await admin
    .from('profiles')
    .upsert({ id: data.user.id, nombre_completo, usuario, rol, activo: true })
  if (pErrDb) {
    console.error('[usuarios] perfil', pErrDb.message)
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: 'No se pudo crear el usuario. Intente de nuevo.' }
  }

  revalidatePath('/usuarios')
  return { ok: true, message: `Usuario "${usuario}" creado.`, key: Date.now() }
}

export async function actualizarUsuario(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const yo = await checkRol(SOLO_ADMIN)
  if (!yo) return SIN_PERMISO

  const id = str(fd, 'id', 40)
  const nombre_completo = str(fd, 'nombre_completo', 120)
  const rol = str(fd, 'rol', 20) as Rol
  const password = String(fd.get('password') ?? '')

  if (!UUID.test(id)) return { error: 'Usuario no válido.' }
  const fieldErrors: Record<string, string> = {}
  if (!nombre_completo) fieldErrors.nombre_completo = 'Escriba el nombre completo.'
  if (!ROLES.includes(rol)) fieldErrors.rol = 'Elija un rol.'
  if (id === yo.id && rol !== 'administrador') fieldErrors.rol = 'No puede quitarse a sí mismo el rol de administrador.'
  if (password) {
    const pErr = validarPassword(password)
    if (pErr) fieldErrors.password = pErr
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ nombre_completo, rol }).eq('id', id)
  if (error) return { error: 'No se pudo guardar. Intente de nuevo.' }

  const admin = createAdminClient()
  const { error: aErr } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { rol },
    ...(password ? { password } : {}),
  })
  if (aErr) {
    console.error('[usuarios] actualizar', aErr.message)
    return { error: 'Se guardaron los datos, pero no se pudo cambiar la contraseña.' }
  }

  // Changing a password can revoke the user's existing refresh tokens; renew our own session.
  if (password && id === yo.id) {
    const { error: sErr } = await supabase.auth.signInWithPassword({
      email: usuarioAEmail(yo.usuario),
      password,
    })
    if (sErr) console.error('[usuarios] renovar sesión', sErr.message)
  }

  revalidatePath('/usuarios')
  return { ok: true, message: password ? 'Usuario y contraseña actualizados.' : 'Usuario actualizado.', key: Date.now() }
}

export async function cambiarEstadoUsuario(id: string, activo: boolean): Promise<ActionState> {
  const yo = await checkRol(SOLO_ADMIN)
  if (!yo) return SIN_PERMISO
  if (!UUID.test(id)) return { error: 'Usuario no válido.' }
  if (id === yo.id) return { error: 'No puede desactivar su propia cuenta.' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ activo }).eq('id', id)
  if (error) return { error: 'No se pudo cambiar el estado.' }

  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(id, { ban_duration: activo ? 'none' : '876000h' })

  revalidatePath('/usuarios')
  return { ok: true, message: activo ? 'Usuario activado.' : 'Usuario desactivado. Ya no podrá iniciar sesión.' }
}

export async function guardarConfiguracion(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(SOLO_ADMIN))) return SIN_PERMISO
  const dias = Number.parseInt(str(fd, 'dias_alerta_vencimiento', 5), 10)
  if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
    return {
      fieldErrors: { dias_alerta_vencimiento: 'Escriba un número de días entre 1 y 365.' },
      error: 'Revise los campos marcados.',
    }
  }
  const supabase = await createClient()
  const { error } = await supabase.from('configuracion').update({ dias_alerta_vencimiento: dias }).eq('id', 1)
  if (error) return { error: 'No se pudo guardar la configuración.' }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Configuración guardada.', key: Date.now() }
}
