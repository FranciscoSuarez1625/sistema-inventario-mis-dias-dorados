import { NextResponse } from 'next/server'
import { checkRol } from '@/lib/auth'
import { SOLO_ADMIN } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { hoyISO } from '@/lib/format'

export async function POST() {
  if (!(await checkRol(SOLO_ADMIN))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const supabase = await createClient()
  const [productos, lotes, movimientos, movimientoLotes, perfiles, configuracion] = await Promise.all([
    supabase.from('productos').select('id, codigo, nombre, categoria, unidad_medida, stock_minimo, descripcion, activo, created_at'),
    supabase.from('lotes').select('id, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, created_at'),
    supabase
      .from('movimientos')
      .select('id, tipo, producto_id, lote_id, cantidad, fecha, destino_o_origen, observaciones, usuario_id, created_at')
      .order('created_at'),
    supabase.from('movimiento_lotes').select('movimiento_id, lote_id, cantidad'),
    supabase.from('profiles').select('id, nombre_completo, usuario, rol, activo, created_at'),
    supabase.from('configuracion').select('dias_alerta_vencimiento').eq('id', 1).maybeSingle(),
  ])

  const fallo = [productos, lotes, movimientos, movimientoLotes, perfiles, configuracion].find((r) => r.error)
  if (fallo) {
    console.error('[respaldo]', fallo.error?.message)
    return NextResponse.json({ error: 'No se pudo generar el respaldo' }, { status: 500 })
  }

  const { data: fecha, error } = await supabase.rpc('registrar_respaldo')
  if (error) return NextResponse.json({ error: 'No se pudo registrar el respaldo' }, { status: 500 })

  const cuerpo = JSON.stringify(
    {
      sistema: 'Inventario Asilo Mis Días Dorados',
      version: 1,
      generado: fecha,
      configuracion: configuracion.data,
      usuarios: perfiles.data,
      productos: productos.data,
      lotes: lotes.data,
      movimientos: movimientos.data,
      movimiento_lotes: movimientoLotes.data,
    },
    null,
    2,
  )

  return new Response(cuerpo, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="respaldo-inventario-${hoyISO()}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
