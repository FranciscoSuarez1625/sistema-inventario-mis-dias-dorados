import type { Metadata } from 'next'
import { Brand } from '@/components/brand'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl sm:p-8">
        <Brand className="mb-8" />
        <h1 className="mb-1 text-2xl font-bold text-balance">Bienvenido</h1>
        <p className="mb-6 text-base text-muted-foreground">
          Ingrese con el usuario y la contraseña que le asignó la administración.
        </p>
        <LoginForm />
        <p className="mt-6 text-sm text-muted-foreground">
          ¿Olvidó su contraseña? Pida a la administración que se la restablezca.
        </p>
      </div>
    </main>
  )
}
