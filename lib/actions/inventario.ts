'use server'

import { revalidatePath } from 'next/cache'
import { checkRol } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { EDITORES } from '@/lib/constants'
import { hoyISO, isFechaISO, permiteDecimales } from '@/lib/format'

export type ActionState = {
  ok?: boolean
  error?: string
  fieldErrors?: Record<string, string>
  message?: string
  key?: number
}

const SIN_PERMISO: ActionState = { error: 'No tiene permiso para realizar esta acción.' }
const UUID = /^[0-9a-f-]{36}$/i

function str(fd: FormData, k: string, max = 500) {
  return String(fd.get(k) ?? '').trim().slice(0, max)
}

function num(fd: FormData, k: string) {
  const raw = String(fd.get(k) ?? '').trim().replace(',', '.')
  if (!raw) return Number.NaN
  return Number(raw)
}

function mensajeDb(message?: string) {
  if (!message) return 'Ocurrió un error inesperado. Intente de nuevo.'
  if (message.includes('duplicate key') && message.includes('codigo')) return 'Ya existe un producto con ese código.'
  const conocidos = [
    'Stock insuficiente',
    'La cantidad',
    'La fecha',
    'La fecha de vencimiento',
    'El producto',
    'Indique el destino',
    'No tiene permiso',
    'El número de lote',
  ]
  if (conocidos.some((c) => message.startsWith(c))) return message
  console.error('[inventario] error de base de datos', message)
  return 'Ocurrió un error inesperado. Intente de nuevo.'
}

function revalidarInventario() {
  revalidatePath('/', 'layout')
}

export async function guardarProducto(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(EDITORES))) return SIN_PERMISO

  const id = str(fd, 'id', 40)
  const codigo = str(fd, 'codigo', 30).toUpperCase()
  const nombre = str(fd, 'nombre', 120)
  const categoria = str(fd, 'categoria', 30)
  const unidad_medida = str(fd, 'unidad_medida', 30)
  const stock_minimo = num(fd, 'stock_minimo')
  const descripcion = str(fd, 'descripcion', 500)

  const fieldErrors: Record<string, string> = {}
  if (!codigo) fieldErrors.codigo = 'Escriba un código.'
  else if (!/^[A-Z0-9-]+$/.test(codigo)) fieldErrors.codigo = 'Use solo letras, números y guiones.'
  if (!nombre) fieldErrors.nombre = 'Escriba el nombre del producto.'
  if (!categoria) fieldErrors.categoria = 'Elija una categoría.'
  if (!unidad_medida) fieldErrors.unidad_medida = 'Escriba la unidad (ej.: libras, cajas, unidades).'
  if (!Number.isFinite(stock_minimo) || stock_minimo < 0 || stock_minimo > 1_000_000) {
    fieldErrors.stock_minimo = 'Escriba un número igual o mayor que cero.'
  } else if (unidad_medida && !permiteDecimales(unidad_medida) && !Number.isInteger(stock_minimo)) {
    fieldErrors.stock_minimo = `Use un número entero para productos en ${unidad_medida}.`
  }
  if (id && !UUID.test(id)) return { error: 'Producto no válido.' }
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const supabase = await createClient()
  const payload = {
    codigo,
    nombre,
    categoria,
    unidad_medida,
    stock_minimo: Math.round(stock_minimo * 100) / 100,
    descripcion: descripcion || null,
  }
  const { error } = id
    ? await supabase.from('productos').update(payload).eq('id', id)
    : await supabase.from('productos').insert(payload)

  if (error) {
    if (error.message.includes('productos_categoria_fkey')) {
      const msg = 'La categoría elegida ya no existe.'
      return { fieldErrors: { categoria: msg }, error: msg }
    }
    const msg = mensajeDb(error.message)
    if (msg.includes('código')) return { fieldErrors: { codigo: msg }, error: msg }
    if (msg.startsWith('La cantidad en bodega')) return { fieldErrors: { unidad_medida: msg }, error: msg }
    if (msg.startsWith('La cantidad')) return { fieldErrors: { stock_minimo: msg }, error: msg }
    return { error: msg }
  }

  revalidarInventario()
  return { ok: true, message: id ? 'Producto actualizado.' : 'Producto creado.', key: Date.now() }
}

export async function cambiarEstadoProducto(id: string, activo: boolean): Promise<ActionState> {
  if (!(await checkRol(EDITORES))) return SIN_PERMISO
  if (!UUID.test(id)) return { error: 'Producto no válido.' }
  const supabase = await createClient()
  const { error } = await supabase.from('productos').update({ activo }).eq('id', id)
  if (error) return { error: mensajeDb(error.message) }
  revalidarInventario()
  return { ok: true, message: activo ? 'Producto activado.' : 'Producto desactivado.' }
}

export async function registrarEntrada(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(EDITORES))) return SIN_PERMISO

  const producto_id = str(fd, 'producto_id', 40)
  const cantidad = num(fd, 'cantidad')
  const fecha = str(fd, 'fecha', 10)
  const fecha_vencimiento = str(fd, 'fecha_vencimiento', 10)
  const origen = str(fd, 'origen', 200)
  const observaciones = str(fd, 'observaciones', 500)
  const numero_lote = String(fd.get('numero_lote') ?? '').trim().toUpperCase()

  const fieldErrors: Record<string, string> = {}
  if (!UUID.test(producto_id)) fieldErrors.producto_id = 'Elija un producto.'
  if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 1_000_000) {
    fieldErrors.cantidad = 'Escriba una cantidad mayor que cero.'
  }
  if (numero_lote.length > 40) fieldErrors.numero_lote = 'Máximo 40 caracteres.'
  else if (numero_lote && !/^[A-Z0-9][A-Z0-9-/._]*$/.test(numero_lote)) {
    fieldErrors.numero_lote = 'Use solo letras, números, guiones, puntos o barras.'
  }
  if (!isFechaISO(fecha)) fieldErrors.fecha = 'Elija la fecha de ingreso.'
  else if (fecha > hoyISO()) fieldErrors.fecha = 'La fecha de ingreso no puede ser futura.'
  if (fecha_vencimiento && !isFechaISO(fecha_vencimiento)) fieldErrors.fecha_vencimiento = 'Fecha no válida.'
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('registrar_entrada', {
    p_producto_id: producto_id,
    p_cantidad: Math.round(cantidad * 100) / 100,
    p_fecha: fecha,
    p_fecha_vencimiento: fecha_vencimiento || null,
    p_origen: origen,
    p_observaciones: observaciones,
    p_numero_lote: numero_lote || null,
  })
  if (error) {
    const msg = mensajeDb(error.message)
    if (msg.startsWith('La fecha de vencimiento')) return { fieldErrors: { fecha_vencimiento: msg }, error: msg }
    if (msg.startsWith('El número de lote')) return { fieldErrors: { numero_lote: msg }, error: msg }
    if (msg.startsWith('La cantidad')) return { fieldErrors: { cantidad: msg }, error: msg }
    return { error: msg }
  }

  revalidarInventario()
  return { ok: true, message: 'Entrada registrada correctamente.', key: Date.now() }
}

export async function registrarSalida(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await checkRol(EDITORES))) return SIN_PERMISO

  const producto_id = str(fd, 'producto_id', 40)
  const cantidad = num(fd, 'cantidad')
  const fecha = str(fd, 'fecha', 10)
  const destino = str(fd, 'destino', 200)
  const observaciones = str(fd, 'observaciones', 500)

  const fieldErrors: Record<string, string> = {}
  if (!UUID.test(producto_id)) fieldErrors.producto_id = 'Elija un producto.'
  if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 1_000_000) {
    fieldErrors.cantidad = 'Escriba una cantidad mayor que cero.'
  }
  if (!isFechaISO(fecha)) fieldErrors.fecha = 'Elija la fecha de salida.'
  else if (fecha > hoyISO()) fieldErrors.fecha = 'La fecha de salida no puede ser futura.'
  if (!destino) fieldErrors.destino = 'Indique el destino o motivo (ej.: cocina, enfermería).'
  if (Object.keys(fieldErrors).length) return { fieldErrors, error: 'Revise los campos marcados.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('registrar_salida', {
    p_producto_id: producto_id,
    p_cantidad: Math.round(cantidad * 100) / 100,
    p_fecha: fecha,
    p_destino: destino,
    p_observaciones: observaciones,
  })
  if (error) {
    const msg = mensajeDb(error.message)
    if (msg.startsWith('Stock insuficiente') || msg.startsWith('La cantidad')) {
      return { fieldErrors: { cantidad: msg }, error: msg }
    }
    return { error: msg }
  }

  revalidarInventario()
  return { ok: true, message: 'Salida registrada correctamente.', key: Date.now() }
}
