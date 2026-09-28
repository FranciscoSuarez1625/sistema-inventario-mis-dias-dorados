import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Faltan variables de Supabase')

const db = createClient(url, key, { auth: { persistSession: false } })
const DOMINIO = 'misdiasdorados.app'

const usuarios = [
  { usuario: 'admin', nombre: 'María Elena Recinos', rol: 'administrador', password: 'Admin2026!' },
  { usuario: 'encargado', nombre: 'José Luis Mérida', rol: 'encargado', password: 'Encargado2026!' },
  { usuario: 'consulta', nombre: 'Ana Lucía Villatoro', rol: 'consulta', password: 'Consulta2026!' },
]

const ids = {}
for (const u of usuarios) {
  const email = `${u.usuario}@${DOMINIO}`
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 })
  let user = list.users.find((x) => x.email === email)
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: u.password,
      email_confirm: true,
      user_metadata: { nombre_completo: u.nombre, usuario: u.usuario },
      app_metadata: { rol: u.rol },
    })
    if (error) throw error
    user = data.user
  }
  ids[u.rol] = user.id
  console.log('usuario', u.usuario, user.id)
}

const { count } = await db.from('productos').select('id', { count: 'exact', head: true })
if (count && count > 0) {
  console.log('Productos ya existen, se omite la carga.')
  process.exit(0)
}

const hoy = new Date()
const dia = (n) => {
  const d = new Date(hoy)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// [codigo, nombre, categoria, unidad, minimo, descripcion, lotes: [cantidad, ingresoDiasAtras, vencimientoDias|null], salidas: [cantidad, diasAtras, destino]]
const productos = [
  ['ALI-001', 'Arroz blanco', 'Alimentos', 'libras', 20, 'Arroz para almuerzos', [[50, 40, 240]], [[18, 10, 'Cocina - almuerzo']]],
  ['ALI-002', 'Frijol negro', 'Alimentos', 'libras', 20, null, [[30, 35, 200]], [[14, 7, 'Cocina - almuerzo']]],
  ['ALI-003', 'Leche en polvo', 'Alimentos', 'botes', 6, 'Bote de 1.8 kg', [[4, 60, 12], [6, 15, 150]], [[3, 5, 'Cocina - refacción']]],
  ['ALI-004', 'Avena en hojuelas', 'Alimentos', 'bolsas', 8, null, [[12, 50, -5], [10, 20, 120]], [[4, 3, 'Cocina - desayuno']]],
  ['ALI-005', 'Azúcar', 'Alimentos', 'libras', 15, null, [[25, 30, 365]], [[6, 8, 'Cocina']]],
  ['ALI-006', 'Aceite vegetal', 'Alimentos', 'botellas', 4, 'Botella de 1 litro', [[5, 45, 180]], [[3, 12, 'Cocina']]],
  ['MED-001', 'Paracetamol 500 mg', 'Medicamentos', 'tabletas', 50, null, [[100, 60, 20], [100, 10, 400]], [[40, 6, 'Enfermería']]],
  ['MED-002', 'Losartán 50 mg', 'Medicamentos', 'tabletas', 60, 'Tratamiento de presión arterial', [[90, 40, 300]], [[45, 4, 'Enfermería']]],
  ['MED-003', 'Metformina 850 mg', 'Medicamentos', 'tabletas', 60, null, [[120, 30, 25]], [[30, 2, 'Enfermería']]],
  ['MED-004', 'Omeprazol 20 mg', 'Medicamentos', 'cápsulas', 30, null, [[28, 90, -12]], []],
  ['MED-005', 'Suero oral', 'Medicamentos', 'sobres', 10, null, [[20, 25, 500]], [[20, 1, 'Enfermería - hidratación']]],
  ['INS-001', 'Pañales para adulto talla M', 'Insumos', 'unidades', 40, null, [[120, 20, null]], [[70, 3, 'Área de cuidado']]],
  ['INS-002', 'Guantes de látex', 'Insumos', 'cajas', 3, 'Caja de 100 unidades', [[6, 30, 700]], [[2, 9, 'Enfermería']]],
  ['INS-003', 'Alcohol en gel', 'Insumos', 'frascos', 5, null, [[10, 15, null]], [[2, 5, 'Recepción']]],
  ['INS-004', 'Toallas húmedas', 'Insumos', 'paquetes', 10, null, [[24, 12, null]], [[6, 2, 'Área de cuidado']]],
]

for (const [codigo, nombre, categoria, unidad_medida, stock_minimo, descripcion, lotes, salidas] of productos) {
  const { data: prod, error } = await db
    .from('productos')
    .insert({ codigo, nombre, categoria, unidad_medida, stock_minimo, descripcion })
    .select('id')
    .single()
  if (error) throw error

  const lotesCreados = []
  for (const [cantidad, atras, venc] of lotes) {
    const { data: lote, error: e1 } = await db
      .from('lotes')
      .insert({
        producto_id: prod.id,
        cantidad_inicial: cantidad,
        cantidad_actual: cantidad,
        fecha_ingreso: dia(-atras),
        fecha_vencimiento: venc === null ? null : dia(venc),
      })
      .select('id, cantidad_actual, fecha_vencimiento, fecha_ingreso')
      .single()
    if (e1) throw e1
    lotesCreados.push(lote)
    const { data: mov, error: e2 } = await db
      .from('movimientos')
      .insert({
        tipo: 'entrada',
        producto_id: prod.id,
        lote_id: lote.id,
        cantidad,
        fecha: dia(-atras),
        destino_o_origen: 'Donación / compra local',
        usuario_id: ids.encargado,
      })
      .select('id')
      .single()
    if (e2) throw e2
    await db.from('movimiento_lotes').insert({ movimiento_id: mov.id, lote_id: lote.id, cantidad })
  }

  for (const [cantidad, atras, destino] of salidas) {
    const { data: mov, error: e3 } = await db
      .from('movimientos')
      .insert({
        tipo: 'salida',
        producto_id: prod.id,
        cantidad,
        fecha: dia(-atras),
        destino_o_origen: destino,
        usuario_id: ids.encargado,
      })
      .select('id')
      .single()
    if (e3) throw e3
    let restante = cantidad
    const orden = [...lotesCreados]
      .filter((l) => !l.fecha_vencimiento || l.fecha_vencimiento >= dia(0))
      .sort((a, b) => (a.fecha_vencimiento ?? '9999').localeCompare(b.fecha_vencimiento ?? '9999'))
    for (const l of orden) {
      if (restante <= 0) break
      const toma = Math.min(l.cantidad_actual, restante)
      if (toma <= 0) continue
      l.cantidad_actual -= toma
      restante -= toma
      await db.from('lotes').update({ cantidad_actual: l.cantidad_actual }).eq('id', l.id)
      await db.from('movimiento_lotes').insert({ movimiento_id: mov.id, lote_id: l.id, cantidad: toma })
    }
  }
  console.log('producto', codigo)
}
console.log('Listo')
