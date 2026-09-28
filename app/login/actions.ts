'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { usuarioAEmail } from '@/lib/constants'

export type LoginState = { error?: string; usuario?: string }

const CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos.'

export async function iniciarSesion(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const usuario = String(formData.get('usuario') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!usuario || !password) {
    return { error: 'Escriba su usuario y su contraseña.', usuario }
  }
  if (!/^[a-z0-9._-]{3,30}$/.test(usuario) || password.length > 72) {
    return { error: CREDENCIALES_INVALIDAS, usuario }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usuarioAEmail(usuario),
    password,
  })

  if (error) {
    if (error.status === 429) {
      return { error: 'Demasiados intentos. Espere unos minutos e intente de nuevo.', usuario }
    }
    if (error.code === 'user_banned') {
      return { error: 'Su usuario está desactivado. Consulte con la administración.', usuario }
    }
    if (error.code === 'invalid_credentials' || error.status === 400) {
      return { error: CREDENCIALES_INVALIDAS, usuario }
    }
    console.error('[login] error inesperado', error.code, error.message)
    return { error: 'No se pudo iniciar sesión. Intente de nuevo en unos minutos.', usuario }
  }

  const { data: perfil } = await supabase
    .from('profiles')
    .select('activo')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!perfil?.activo) {
    await supabase.auth.signOut()
    return { error: 'Su usuario está desactivado. Consulte con la administración.', usuario }
  }

  redirect('/')
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
