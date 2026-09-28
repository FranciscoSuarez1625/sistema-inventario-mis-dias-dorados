'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/form-error'
import { iniciarSesion, type LoginState } from './actions'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(iniciarSesion, {})
  const [ver, setVer] = useState(false)

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="usuario" className="text-base">
          Usuario
        </Label>
        <Input
          id="usuario"
          name="usuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.usuario}
          className="h-12 text-base"
          aria-invalid={state.error ? true : undefined}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-base">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={ver ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="h-12 pr-14 text-base"
            aria-invalid={state.error ? true : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0.5 right-0.5"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {ver ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>
      </div>

      <FormError message={state.error} />

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <LogIn aria-hidden />
        {pending ? 'Ingresando…' : 'Ingresar'}
      </Button>
    </form>
  )
}
