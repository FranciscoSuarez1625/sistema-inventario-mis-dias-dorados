const TZ = 'America/Guatemala'

export function hoyISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

export function sumarDias(fechaISO: string, dias: number) {
  const d = new Date(`${fechaISO}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function diasHasta(fechaISO: string, desdeISO = hoyISO()) {
  const a = Date.parse(`${desdeISO}T00:00:00Z`)
  const b = Date.parse(`${fechaISO}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

export function formatFecha(fechaISO: string | null | undefined) {
  if (!fechaISO) return '—'
  const [y, m, d] = fechaISO.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function formatFechaHora(ts: string | null | undefined) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('es-GT', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(ts))
}

export function formatCantidad(n: number | string | null | undefined) {
  const v = Number(n ?? 0)
  return new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 }).format(v)
}

// Keep in sync with public.unidad_permite_decimales() in the database.
const UNIDADES_DECIMALES = new Set([
  'libra', 'libras', 'lb', 'lbs', 'kilo', 'kilos', 'kg', 'kilogramo', 'kilogramos', 'gramo', 'gramos', 'g', 'gr',
  'onza', 'onzas', 'oz', 'litro', 'litros', 'l', 'lt', 'mililitro', 'mililitros', 'ml', 'galón', 'galon', 'galones',
])

export function permiteDecimales(unidad: string | null | undefined) {
  return UNIDADES_DECIMALES.has((unidad ?? '').trim().toLowerCase())
}

export function isFechaISO(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
}
