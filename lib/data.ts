import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { POR_PAGINA } from '@/lib/constants'
import { hoyISO, isFechaISO, sumarDias } from '@/lib/format'

export type Existencia = {
  id: string
  codigo: string
  nombre: string
  categoria: string
  unidad_medida: string
  stock_minimo: number
  descripcion: string | null
  activo: boolean
  stock_total: number
  proximo_vencimiento: string | null
  estado_stock: 'normal' | 'bajo' | 'agotado'
}

export type LoteAlerta = {
  id: string
  cantidad_actual: number
  fecha_ingreso: string
  fecha_vencimiento: string
  producto: { id: string; codigo: string; nombre: string; categoria: string; unidad_medida: string }
}

export type Movimiento = {
  id: string
  tipo: 'entrada' | 'salida'
  cantidad: number
  fecha: string
  destino_o_origen: string | null
  observaciones: string | null
  created_at: string
  producto: { codigo: string; nombre: string; categoria: string; unidad_medida: string }
  usuario: { nombre_completo: string } | null
}

export type Categoria = {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  requiere_vencimiento: boolean
}

export const getCategorias = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, descripcion, color, requiere_vencimiento')
    .order('nombre')
  if (error) throw new Error('No se pudieron cargar las categorías.')
  return (data ?? []) as Categoria[]
})

export async function getConteoProductosPorCategoria() {
  const supabase = await createClient()
  const { data } = await supabase.from('productos').select('categoria')
  const conteo: Record<string, number> = {}
  for (const p of data ?? []) conteo[p.categoria] = (conteo[p.categoria] ?? 0) + 1
  return conteo
}

function categoriaValida(c?: string): c is string {
  return !!c && c.length <= 30
}

const EXISTENCIA_COLS =
  'id, codigo, nombre, categoria, unidad_medida, stock_minimo, descripcion, activo, stock_total, proximo_vencimiento, estado_stock'

export const getConfig = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracion')
    .select('dias_alerta_vencimiento, fecha_ultimo_respaldo')
    .eq('id', 1)
    .maybeSingle()
  return {
    dias_alerta_vencimiento: data?.dias_alerta_vencimiento ?? 30,
    fecha_ultimo_respaldo: (data?.fecha_ultimo_respaldo as string | null) ?? null,
  }
})

function limpiarBusqueda(q?: string) {
  return (q ?? '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60)
}

export async function getExistencias(filtros: {
  q?: string
  categoria?: string
  estado?: string
  incluirInactivos?: boolean
} = {}) {
  const supabase = await createClient()
  let query = supabase.from('existencias').select(EXISTENCIA_COLS).order('nombre')
  if (!filtros.incluirInactivos) query = query.eq('activo', true)
  const q = limpiarBusqueda(filtros.q)
  if (q) query = query.or(`nombre.ilike.%${q}%,codigo.ilike.%${q}%`)
  if (categoriaValida(filtros.categoria)) {
    query = query.eq('categoria', filtros.categoria)
  }
  if (filtros.estado === 'bajo') query = query.in('estado_stock', ['bajo', 'agotado'])
  else if (filtros.estado === 'normal') query = query.eq('estado_stock', 'normal')
  const { data, error } = await query
  if (error) throw new Error('No se pudieron cargar las existencias.')
  return (data ?? []) as Existencia[]
}

export async function getStockBajo() {
  return getExistencias({ estado: 'bajo' })
}

const LOTE_COLS =
  'id, cantidad_actual, fecha_ingreso, fecha_vencimiento, producto:productos!inner(id, codigo, nombre, categoria, unidad_medida, activo)'

export async function getLotesPorVencer(dias: number) {
  const supabase = await createClient()
  const hoy = hoyISO()
  const { data, error } = await supabase
    .from('lotes')
    .select(LOTE_COLS)
    .gt('cantidad_actual', 0)
    .gte('fecha_vencimiento', hoy)
    .lte('fecha_vencimiento', sumarDias(hoy, dias))
    .eq('producto.activo', true)
    .order('fecha_vencimiento')
  if (error) throw new Error('No se pudieron cargar los productos por vencer.')
  return (data ?? []) as unknown as LoteAlerta[]
}

export async function getLotesVencidos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lotes')
    .select(LOTE_COLS)
    .gt('cantidad_actual', 0)
    .lt('fecha_vencimiento', hoyISO())
    .eq('producto.activo', true)
    .order('fecha_vencimiento')
  if (error) throw new Error('No se pudieron cargar los productos vencidos.')
  return (data ?? []) as unknown as LoteAlerta[]
}

export const getTotalAlertas = cache(async () => {
  const { dias_alerta_vencimiento } = await getConfig()
  const [bajo, porVencer, vencidos] = await Promise.all([
    getStockBajo(),
    getLotesPorVencer(dias_alerta_vencimiento),
    getLotesVencidos(),
  ])
  return { bajo, porVencer, vencidos, total: bajo.length + porVencer.length + vencidos.length }
})

export type FiltrosMovimientos = {
  desde?: string
  hasta?: string
  tipo?: string
  categoria?: string
  producto?: string
  pagina?: number
  todos?: boolean
}

export function leerFiltrosMovimientos(sp: Record<string, string | string[] | undefined>): FiltrosMovimientos {
  const s = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
  const pagina = Math.max(1, Math.min(10_000, Number.parseInt(s('pagina') ?? '1', 10) || 1))
  return {
    desde: s('desde'),
    hasta: s('hasta'),
    tipo: s('tipo'),
    categoria: s('categoria'),
    producto: s('producto'),
    pagina,
  }
}

const MOV_COLS =
  'id, tipo, cantidad, fecha, destino_o_origen, observaciones, created_at, producto:productos!inner(codigo, nombre, categoria, unidad_medida), usuario:profiles(nombre_completo)'

export async function getMovimientos(f: FiltrosMovimientos) {
  const supabase = await createClient()
  let query = supabase
    .from('movimientos')
    .select(MOV_COLS, { count: 'exact' })
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (f.desde && isFechaISO(f.desde)) query = query.gte('fecha', f.desde)
  if (f.hasta && isFechaISO(f.hasta)) query = query.lte('fecha', f.hasta)
  if (f.tipo === 'entrada' || f.tipo === 'salida') query = query.eq('tipo', f.tipo)
  if (categoriaValida(f.categoria)) {
    query = query.eq('producto.categoria', f.categoria)
  }
  if (f.producto && /^[0-9a-f-]{36}$/i.test(f.producto)) query = query.eq('producto_id', f.producto)

  if (f.todos) {
    query = query.limit(5000)
  } else {
    const pagina = f.pagina ?? 1
    const desde = (pagina - 1) * POR_PAGINA
    query = query.range(desde, desde + POR_PAGINA - 1)
  }

  const { data, count, error } = await query
  if (error) throw new Error('No se pudo cargar el historial.')
  return { movimientos: (data ?? []) as unknown as Movimiento[], total: count ?? 0 }
}

export async function getProductosOpciones(soloActivos = true) {
  const supabase = await createClient()
  let query = supabase.from('productos').select('id, codigo, nombre, categoria, unidad_medida').order('nombre')
  if (soloActivos) query = query.eq('activo', true)
  const { data } = await query
  return (data ?? []) as { id: string; codigo: string; nombre: string; categoria: string; unidad_medida: string }[]
}
