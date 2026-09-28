export const CATEGORIAS = ['Alimentos', 'Medicamentos', 'Insumos'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const ROLES = ['administrador', 'encargado', 'consulta'] as const
export type Rol = (typeof ROLES)[number]

export const ROL_LABEL: Record<Rol, string> = {
  administrador: 'Administrador',
  encargado: 'Encargado de inventario',
  consulta: 'Consulta',
}

export const EDITORES: Rol[] = ['administrador', 'encargado']
export const TODOS: Rol[] = ['administrador', 'encargado', 'consulta']
export const SOLO_ADMIN: Rol[] = ['administrador']

export const DOMINIO_USUARIOS = 'misdiasdorados.app'

export const POR_PAGINA = 25

export function usuarioAEmail(usuario: string) {
  return `${usuario.trim().toLowerCase()}@${DOMINIO_USUARIOS}`
}

export function requiereVencimiento(categoria: string) {
  return categoria === 'Alimentos' || categoria === 'Medicamentos'
}
