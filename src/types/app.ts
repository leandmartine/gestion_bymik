// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  full_name: string | null
  email: string
  sheets_spreadsheet_id: string | null
  created_at: string
  updated_at: string
}

// ─── Categoría de Cliente ──────────────────────────────────────────────────────
export interface CategoriaCliente {
  id: string
  user_id: string
  nombre: string
  color: string
  created_at: string
}

export type CategoriaCreate = Pick<CategoriaCliente, 'nombre' | 'color'>

// ─── Cliente ──────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string
  user_id: string
  nombre: string
  telefono: string
  direccion: string | null
  instagram: string | null
  notas: string | null
  categoria_id: string | null
  activo: boolean
  created_at: string
  categoria?: Pick<CategoriaCliente, 'id' | 'nombre' | 'color'>
}

export type ClienteCreate = Pick<Cliente, 'nombre' | 'telefono'> & {
  direccion?: string | null
  instagram?: string | null
  notas?: string | null
  categoria_id?: string | null
}
export type ClienteUpdate = Partial<ClienteCreate> & { activo?: boolean }

// ─── Producto ─────────────────────────────────────────────────────────────────
export interface Producto {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  activo: boolean
  created_at: string
}

export type ProductoCreate = Pick<Producto, 'nombre' | 'precio' | 'stock'> & {
  descripcion?: string | null
}
export type ProductoUpdate = Partial<ProductoCreate> & { activo?: boolean }

// ─── Pedido ───────────────────────────────────────────────────────────────────
export type EstadoPedido = 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  producto?: Pick<Producto, 'id' | 'nombre' | 'precio'>
}

export interface Pedido {
  id: string
  user_id: string
  cliente_id: string
  estado: EstadoPedido
  tiene_envio: boolean
  direccion_envio: string | null
  retira_en_agencia: boolean
  agencia_envio: string | null
  notas: string | null
  total: number
  synced_sheets: boolean
  created_at: string
  updated_at: string
  cliente?: Pick<Cliente, 'id' | 'nombre' | 'telefono' | 'instagram'>
  items?: PedidoItem[]
}

export type PedidoCreate = {
  cliente_id: string
  tiene_envio?: boolean
  direccion_envio?: string | null
  retira_en_agencia?: boolean
  agencia_envio?: string | null
  notas?: string | null
  items: Array<{ producto_id: string; cantidad: number; precio_unitario: number }>
}

export type PedidoUpdate = {
  estado?: EstadoPedido
  tiene_envio?: boolean
  direccion_envio?: string | null
  retira_en_agencia?: boolean
  agencia_envio?: string | null
  notas?: string | null
}

// ─── Métricas ─────────────────────────────────────────────────────────────────
export interface MetricasMensuales {
  mes: string
  total_pedidos: number
  total_vendido: number
  pedidos_por_estado: Record<EstadoPedido, number>
  productos_mas_vendidos: Array<{
    producto_id: string
    nombre: string
    cantidad_total: number
    total_vendido: number
  }>
  por_dia: Array<{ fecha: string; pedidos: number; total: number }>
}

export interface SyncStatus {
  last_sync: string | null
  status: 'success' | 'error' | 'pending' | 'never'
  records_synced: number
  error_message: string | null
}
