function celda(v: unknown) {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(encabezados: string[], filas: unknown[][]) {
  const lineas = [encabezados, ...filas].map((f) => f.map(celda).join(';'))
  return `\uFEFF${lineas.join('\r\n')}`
}

export function csvResponse(nombre: string, contenido: string) {
  return new Response(contenido, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
