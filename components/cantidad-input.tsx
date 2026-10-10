'use client'

import type { ComponentProps, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'

type Props = Omit<ComponentProps<typeof Input>, 'type' | 'step' | 'inputMode'> & {
  decimales: boolean
  permitirCero?: boolean
}

export function CantidadInput({ decimales, permitirCero = false, onKeyDown, ...props }: Props) {
  function bloquear(e: KeyboardEvent<HTMLInputElement>) {
    const prohibidas = decimales ? ['-', '+', 'e', 'E'] : ['-', '+', 'e', 'E', '.', ',']
    if (prohibidas.includes(e.key)) e.preventDefault()
    onKeyDown?.(e)
  }

  return (
    <Input
      {...props}
      type="number"
      inputMode={decimales ? 'decimal' : 'numeric'}
      min={permitirCero ? 0 : decimales ? 0.01 : 1}
      step={decimales ? 0.01 : 1}
      onKeyDown={bloquear}
    />
  )
}
