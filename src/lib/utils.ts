import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { type EstadoPedido } from '@/types/app'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea precio como "$1.200" */
export function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-UY')}`
}

/** Fecha en formato legible "13 de abril" */
export function formatFecha(fecha: string): string {
  return format(parseISO(fecha), "d 'de' MMMM", { locale: es })
}

/** Fecha completa "lunes 13 de abril de 2026" */
export function formatFechaCompleta(fecha: string): string {
  return format(parseISO(fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
}

/** "abril 2026" */
export function formatMes(mesYYYYMM: string): string {
  const date = parseISO(`${mesYYYYMM}-01`)
  return format(date, 'MMMM yyyy', { locale: es })
}

/** Hoy en formato YYYY-MM-DD */
export function hoy(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Mes actual en formato YYYY-MM */
export function mesActual(): string {
  return format(new Date(), 'yyyy-MM')
}

/** Iniciales de un nombre */
export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/** Estado del pedido en español con color */
export const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pendiente',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  preparando:  { label: 'Preparando',  color: 'text-blue-700',   bg: 'bg-blue-100'   },
  enviado:     { label: 'Enviado',     color: 'text-purple-700', bg: 'bg-purple-100' },
  entregado:   { label: 'Entregado',   color: 'text-green-700',  bg: 'bg-green-100'  },
  cancelado:   { label: 'Cancelado',   color: 'text-red-700',    bg: 'bg-red-100'    },
  devuelto:    { label: 'Devuelto',    color: 'text-neutral-600', bg: 'bg-neutral-100' },
}

/** Colores para categorías de clientes */
export const COLORES_CATEGORIA = [
  '#000000',
  '#404040',
  '#737373',
  '#a3a3a3',
  '#d4d4d4',
  '#1a1a1a',
  '#262626',
  '#525252',
]

/** Texto contrastante para un fondo */
export function colorTexto(hexBg: string): string {
  const r = parseInt(hexBg.slice(1, 3), 16)
  const g = parseInt(hexBg.slice(3, 5), 16)
  const b = parseInt(hexBg.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
