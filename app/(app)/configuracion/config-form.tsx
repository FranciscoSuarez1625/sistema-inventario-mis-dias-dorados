'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/field'
import { FormError } from '@/components/form-error'
import { guardarConfiguracion } from '@/lib/actions/admin'
import type { ActionState } from '@/lib/actions/inventario'

export function ConfigForm({ dias }: { dias: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(guardarConfiguracion, {})
  const fe = state.ok ? {} : (state.fieldErrors ?? {})

  useEffect(() => {
    if (state.ok && state.key) toast.success(state.message)
  }, [state.ok, state.key, state.message])

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field
        id="dias_alerta_vencimiento"
        label="Avisar con cuántos días de anticipación"
        required
        error={fe.dias_alerta_vencimiento}
        hint="Los productos que vencen dentro de este plazo aparecerán en Alertas."
      >
        <div className="flex items-center gap-3">
          <Input
            id="dias_alerta_vencimiento"
            name="dias_alerta_vencimiento"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            defaultValue={dias}
            className="h-11 w-28 text-base"
            aria-invalid={!!fe.dias_alerta_vencimiento || undefined}
          />
          <span className="text-base">días</span>
        </div>
      </Field>
      <FormError message={state.ok ? undefined : state.error} />
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
