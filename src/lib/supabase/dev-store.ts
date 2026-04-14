/**
 * Store en memoria para desarrollo local sin Supabase.
 */

import {
  type Cliente, type Producto, type Pedido, type PedidoItem,
  type CategoriaCliente,
} from '@/types/app'

export const DEV_USER_ID = 'dev-user-mika-bymik-0000-0000-0000-000000000001'

declare global {
  // eslint-disable-next-line no-var
  var __devStoreBymik: DevStore | undefined
}

interface DevStore {
  categorias: CategoriaCliente[]
  clientes: Cliente[]
  productos: Producto[]
  pedidos: Pedido[]
  pedidoItems: PedidoItem[]
}

function initStore(): DevStore {
  return { categorias: [], clientes: [], productos: [], pedidos: [], pedidoItems: [] }
}

export function getDevStore(): DevStore {
  if (!globalThis.__devStoreBymik) {
    globalThis.__devStoreBymik = initStore()
  }
  return globalThis.__devStoreBymik
}

function uuid() { return crypto.randomUUID() }
function now()  { return new Date().toISOString() }

// ─── Categorías ───────────────────────────────────────────────────────────────
export const devCategorias = {
  list: () => getDevStore().categorias,

  create: (body: { nombre: string; color: string }): CategoriaCliente => {
    const item: CategoriaCliente = {
      id: uuid(), user_id: DEV_USER_ID,
      nombre: body.nombre, color: body.color, created_at: now(),
    }
    getDevStore().categorias.push(item)
    return item
  },

  delete: (id: string) => {
    const store = getDevStore()
    const idx = store.categorias.findIndex((c) => c.id === id)
    if (idx !== -1) store.categorias.splice(idx, 1)
  },
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const devClientes = {
  list: () => {
    const store = getDevStore()
    return store.clientes
      .filter((c) => c.activo)
      .map((c) => ({
        ...c,
        categoria: store.categorias.find((cat) => cat.id === c.categoria_id),
      }))
  },

  get: (id: string) => {
    const store = getDevStore()
    const c = store.clientes.find((c) => c.id === id)
    if (!c) return null
    return { ...c, categoria: store.categorias.find((cat) => cat.id === c.categoria_id) }
  },

  create: (body: {
    nombre: string; telefono: string
    direccion?: string | null; instagram?: string | null
    notas?: string | null; categoria_id?: string | null
  }): Cliente => {
    const item: Cliente = {
      id: uuid(), user_id: DEV_USER_ID,
      nombre: body.nombre, telefono: body.telefono,
      direccion: body.direccion ?? null,
      instagram: body.instagram ?? null,
      notas: body.notas ?? null,
      categoria_id: body.categoria_id ?? null,
      activo: true, created_at: now(),
    }
    getDevStore().clientes.push(item)
    return item
  },

  update: (id: string, body: Partial<Cliente>): Cliente | null => {
    const store = getDevStore()
    const idx = store.clientes.findIndex((c) => c.id === id)
    if (idx === -1) return null
    store.clientes[idx] = { ...store.clientes[idx], ...body }
    return store.clientes[idx]
  },

  softDelete: (id: string) => devClientes.update(id, { activo: false }),
}

// ─── Productos ────────────────────────────────────────────────────────────────
export const devProductos = {
  list: () => getDevStore().productos.filter((p) => p.activo),

  get: (id: string) => getDevStore().productos.find((p) => p.id === id) ?? null,

  create: (body: {
    nombre: string; descripcion?: string | null
    precio: number; stock: number
  }): Producto => {
    const item: Producto = {
      id: uuid(), user_id: DEV_USER_ID,
      nombre: body.nombre, descripcion: body.descripcion ?? null,
      precio: body.precio, stock: body.stock,
      activo: true, created_at: now(),
    }
    getDevStore().productos.push(item)
    return item
  },

  update: (id: string, body: Partial<Producto>): Producto | null => {
    const store = getDevStore()
    const idx = store.productos.findIndex((p) => p.id === id)
    if (idx === -1) return null
    store.productos[idx] = { ...store.productos[idx], ...body }
    return store.productos[idx]
  },

  softDelete: (id: string) => devProductos.update(id, { activo: false }),

  adjustStock: (id: string, delta: number) => {
    const store = getDevStore()
    const idx = store.productos.findIndex((p) => p.id === id)
    if (idx !== -1) store.productos[idx].stock = Math.max(0, store.productos[idx].stock + delta)
  },
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────
export const devPedidos = {
  list: (mes?: string) => {
    const store = getDevStore()
    let pedidos = store.pedidos
    if (mes) pedidos = pedidos.filter((p) => p.created_at.startsWith(mes))
    return pedidos
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((p) => ({
        ...p,
        cliente: store.clientes.find((c) => c.id === p.cliente_id),
        items: store.pedidoItems
          .filter((i) => i.pedido_id === p.id)
          .map((i) => ({
            ...i,
            producto: store.productos.find((pr) => pr.id === i.producto_id),
          })),
      }))
  },

  get: (id: string) => {
    const store = getDevStore()
    const p = store.pedidos.find((p) => p.id === id)
    if (!p) return null
    return {
      ...p,
      cliente: store.clientes.find((c) => c.id === p.cliente_id),
      items: store.pedidoItems
        .filter((i) => i.pedido_id === p.id)
        .map((i) => ({
          ...i,
          producto: store.productos.find((pr) => pr.id === i.producto_id),
        })),
    }
  },

  create: (body: {
    cliente_id: string
    tiene_envio?: boolean; direccion_envio?: string | null
    retira_en_agencia?: boolean; agencia_envio?: string | null
    notas?: string | null
    items: Array<{ producto_id: string; cantidad: number; precio_unitario: number }>
  }): Pedido => {
    const store = getDevStore()
    const total = body.items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0)
    const pedido: Pedido = {
      id: uuid(), user_id: DEV_USER_ID,
      cliente_id: body.cliente_id,
      estado: 'pendiente',
      tiene_envio: body.tiene_envio ?? false,
      direccion_envio: body.direccion_envio ?? null,
      retira_en_agencia: body.retira_en_agencia ?? false,
      agencia_envio: body.agencia_envio ?? null,
      notas: body.notas ?? null,
      total, synced_sheets: false,
      created_at: now(), updated_at: now(),
    }
    store.pedidos.push(pedido)

    // Items + ajustar stock
    body.items.forEach((item) => {
      store.pedidoItems.push({
        id: uuid(), pedido_id: pedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      })
      devProductos.adjustStock(item.producto_id, -item.cantidad)
    })

    return pedido
  },

  update: (id: string, body: Partial<Pedido>): Pedido | null => {
    const store = getDevStore()
    const idx = store.pedidos.findIndex((p) => p.id === id)
    if (idx === -1) return null
    store.pedidos[idx] = { ...store.pedidos[idx], ...body, updated_at: now() }
    return store.pedidos[idx]
  },

  delete: (id: string) => {
    const store = getDevStore()
    const idx = store.pedidos.findIndex((p) => p.id === id)
    if (idx !== -1) {
      // Restaurar stock
      store.pedidoItems
        .filter((i) => i.pedido_id === id)
        .forEach((i) => devProductos.adjustStock(i.producto_id, i.cantidad))
      store.pedidos.splice(idx, 1)
      store.pedidoItems = store.pedidoItems.filter((i) => i.pedido_id !== id)
    }
  },
}
