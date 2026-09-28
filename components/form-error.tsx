import { CircleAlert } from 'lucide-react'

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-base text-destructive"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  )
}
