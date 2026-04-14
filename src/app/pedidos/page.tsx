'use client'

import { useState } from 'react'
import { AppLayout } from '@/app/layout-app'
import { motion, AnimatePresence } from 'framer-motion'
import { usePedidos, useCreatePedido, useUpdatePedido, useDeletePedido } from '@/hooks/usePedidos'
import { useClientes, useCreateCliente } from '@/hooks/useClientes'
import { useProductos, useCreateProducto } from '@/hooks/useProductos'
import { mesActual, formatPrecio, formatFecha, ESTADO_CONFIG } from '@/lib/utils'
import {
  Plus, Truck, X, Check, Trash2, ChevronDown, ChevronUp, User, ShoppingBag, FileText, Package,
} from 'lucide-react'
import Link from 'next/link'
import { type EstadoPedido, type PedidoCreate } from '@/types/app'

const ESTADOS: EstadoPedido[] = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto']

function NuevoPedidoForm({ onClose }: { onClose: () => void }) {
  const { data: clientes = [] } = useClientes()
  const { data: productos = [] } = useProductos()
  const createM = useCreatePedido()
  const createCliente = useCreateCliente()
  const createProducto = useCreateProducto()

  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState<Array<{ producto_id: string; cantidad: number; precio_unitario: number }>>([])
  const [tieneEnvio, setTieneEnvio] = useState(false)
  const [direccionEnvio, setDireccionEnvio] = useState('')
  const [retiraAgencia, setRetiraAgencia] = useState(false)
  const [agenciaEnvio, setAgenciaEnvio] = useState('')
  const [notas, setNotas] = useState('')

  // Nuevo cliente rápido
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')

  // Nuevo producto rápido
  const [showNuevoProducto, setShowNuevoProducto] = useState(false)
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState('')
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState('')

  function addItem(productoId: string) {
    const prod = productos.find((p) => p.id === productoId)
    if (!prod) return
    const existing = items.findIndex((i) => i.producto_id === productoId)
    if (existing !== -1) {
      const next = [...items]
      next[existing].cantidad += 1
      setItems(next)
    } else {
      setItems([...items, { producto_id: productoId, cantidad: 1, precio_unitario: prod.precio }])
    }
  }

  function updateCantidad(productoId: string, cant: number) {
    if (cant <= 0) {
      setItems(items.filter((i) => i.producto_id !== productoId))
    } else {
      setItems(items.map((i) => i.producto_id === productoId ? { ...i, cantidad: cant } : i))
    }
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0)

  async function crearClienteRapido() {
    if (!nuevoNombre || !nuevoTelefono) return
    const result = await createCliente.mutateAsync({ nombre: nuevoNombre, telefono: nuevoTelefono })
    setClienteId(result.id)
    setShowNuevoCliente(false)
    setNuevoNombre('')
    setNuevoTelefono('')
  }

  async function crearProductoRapido() {
    if (!nuevoProductoNombre) return
    const result = await createProducto.mutateAsync({
      nombre: nuevoProductoNombre,
      precio: nuevoProductoPrecio ? Number(nuevoProductoPrecio) : 0,
      stock: 0,
    })
    addItem(result.id)
    setShowNuevoProducto(false)
    setNuevoProductoNombre('')
    setNuevoProductoPrecio('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId || items.length === 0) return
    const data: PedidoCreate = {
      cliente_id: clienteId,
      items,
      tiene_envio: tieneEnvio,
      direccion_envio: tieneEnvio && !retiraAgencia ? direccionEnvio || null : null,
      retira_en_agencia: retiraAgencia,
      agencia_envio: tieneEnvio ? agenciaEnvio || null : null,
      notas: notas || null,
    }
    createM.mutate(data, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-bold text-black text-lg">Nuevo pedido</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Cliente *</label>
            <div className="flex gap-2">
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.telefono}</option>)}
              </select>
              <button type="button" onClick={() => setShowNuevoCliente(!showNuevoCliente)}
                className="px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors whitespace-nowrap flex items-center gap-1">
                <User className="w-4 h-4" /> Nuevo
              </button>
            </div>

            <AnimatePresence>
              {showNuevoCliente && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-50 rounded-xl p-3 space-y-2 overflow-hidden border border-neutral-200">
                  <p className="text-xs font-medium text-neutral-600">Cliente rápido</p>
                  <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre *"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-black" />
                  <input value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} placeholder="Teléfono *"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-black" />
                  <button type="button" onClick={crearClienteRapido} disabled={createCliente.isPending}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50">
                    {createCliente.isPending ? '...' : 'Crear y seleccionar'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Productos */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Productos *</label>
            <div className="flex gap-2">
              <select onChange={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = '' } }}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black">
                <option value="">Agregar producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}{p.precio > 0 ? ` — ${formatPrecio(p.precio)}` : ''}{p.stock > 0 ? ` (${p.stock})` : ''}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNuevoProducto(!showNuevoProducto)}
                className="shrink-0 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center gap-1">
                <Package className="w-4 h-4" /> Nuevo
              </button>
            </div>

            <AnimatePresence>
              {showNuevoProducto && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-50 rounded-xl p-3 space-y-2 overflow-hidden border border-neutral-200">
                  <p className="text-xs font-medium text-neutral-600">Producto rápido</p>
                  <input value={nuevoProductoNombre} onChange={(e) => setNuevoProductoNombre(e.target.value)} placeholder="Nombre *"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-black" />
                  <input type="number" value={nuevoProductoPrecio} onChange={(e) => setNuevoProductoPrecio(e.target.value)} placeholder="Precio (opcional)"
                    min="0" className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-black" />
                  <button type="button" onClick={crearProductoRapido} disabled={createProducto.isPending || !nuevoProductoNombre}
                    className="w-full py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50">
                    {createProducto.isPending ? '...' : 'Crear y agregar'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {items.length > 0 && (
              <div className="space-y-1.5">
                {items.map((item) => {
                  const prod = productos.find((p) => p.id === item.producto_id)
                  return (
                    <div key={item.producto_id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                      <span className="text-sm text-black truncate flex-1">{prod?.nombre}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <button type="button" onClick={() => updateCantidad(item.producto_id, item.cantidad - 1)}
                          className="w-6 h-6 rounded-lg bg-neutral-200 text-black flex items-center justify-center text-sm font-bold">−</button>
                        <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                        <button type="button" onClick={() => updateCantidad(item.producto_id, item.cantidad + 1)}
                          className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">+</button>
                        <span className="text-xs text-neutral-400 w-16 text-right">{formatPrecio(item.cantidad * item.precio_unitario)}</span>
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-end">
                  <span className="font-bold text-black">Total: {formatPrecio(total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Envío */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={tieneEnvio} onChange={(e) => setTieneEnvio(e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="text-sm font-semibold text-black flex items-center gap-1">
                <Truck className="w-4 h-4" /> Tiene envío
              </span>
            </label>

            <AnimatePresence>
              {tieneEnvio && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={retiraAgencia} onChange={(e) => setRetiraAgencia(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm text-neutral-700">Retira en agencia</span>
                  </label>
                  {!retiraAgencia && (
                    <input value={direccionEnvio} onChange={(e) => setDireccionEnvio(e.target.value)} placeholder="Dirección de envío"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
                  )}
                  <input value={agenciaEnvio} onChange={(e) => setAgenciaEnvio(e.target.value)} placeholder="Agencia de envíos (ej: OCA, Correo)"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notas */}
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas del pedido (opcional)" rows={2}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black resize-none" />

          <button type="submit" disabled={!clienteId || items.length === 0 || createM.isPending}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold disabled:opacity-50 transition-opacity">
            {createM.isPending ? 'Creando...' : `Crear pedido${total > 0 ? ` — ${formatPrecio(total)}` : ''}`}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function PedidosPage() {
  const mes = mesActual()
  const { data: pedidos = [], isLoading } = usePedidos(mes)
  const updateM = useUpdatePedido()
  const deleteM = useDeletePedido()

  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <AppLayout>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Pedidos 🛍️</h1>
            <p className="text-neutral-400 text-sm">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} este mes</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </motion.button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">No hay pedidos este mes.</p>
            <p className="text-neutral-300 text-xs mt-1">¡Creá el primero! 🖤</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pedidos.map((pedido, i) => {
              const cfg = ESTADO_CONFIG[pedido.estado]
              const isExpanded = expanded === pedido.id
              return (
                <motion.div key={pedido.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl border overflow-hidden ${pedido.estado === 'devuelto' ? 'border-neutral-200 opacity-70' : 'border-neutral-100'}`}>
                  {/* Header */}
                  <div className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${pedido.estado === 'devuelto' ? 'text-neutral-400 line-through' : 'text-black'}`}>{pedido.cliente?.nombre ?? '—'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-neutral-400 text-xs mt-0.5">
                        {pedido.created_at ? formatFecha(pedido.created_at.slice(0, 10)) : ''}
                        {pedido.tiene_envio && <span className="ml-2">📦 {pedido.agencia_envio || 'Envío'}</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-bold text-black">{formatPrecio(pedido.total)}</span>
                        <span className="text-neutral-400 text-xs">{pedido.items?.length ?? 0} producto{(pedido.items?.length ?? 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/pedidos/${pedido.id}/factura`} target="_blank"
                        className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 transition-colors"
                        title="Ver factura">
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setExpanded(isExpanded ? null : pedido.id)}
                        className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {confirmDelete === pedido.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteM.mutate(pedido.id, { onSuccess: () => setConfirmDelete(null) })}
                            className="p-2 rounded-xl bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="p-2 rounded-xl text-neutral-400"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setConfirmDelete(pedido.id); setTimeout(() => setConfirmDelete(null), 3000) }}
                          className="p-2 rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-100 overflow-hidden">
                        <div className="p-4 space-y-3">
                          {/* Items */}
                          {(pedido.items ?? []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-neutral-700">{item.producto?.nombre ?? '?'}</span>
                              <span className="text-neutral-400">{item.cantidad}x {formatPrecio(item.precio_unitario)}</span>
                            </div>
                          ))}

                          {/* Contacto */}
                          {pedido.cliente?.telefono && (
                            <a href={`https://wa.me/${pedido.cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-green-600 hover:underline">
                              📱 WhatsApp — {pedido.cliente.telefono}
                            </a>
                          )}

                          {pedido.notas && <p className="text-xs text-neutral-400 italic">{pedido.notas}</p>}

                          {/* Estado */}
                          <div>
                            <p className="text-xs font-medium text-neutral-600 mb-1.5">Cambiar estado:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {ESTADOS.map((estado) => {
                                const c = ESTADO_CONFIG[estado]
                                const isActive = pedido.estado === estado
                                return (
                                  <button key={estado}
                                    onClick={() => updateM.mutate({ id: pedido.id, estado })}
                                    disabled={isActive || updateM.isPending}
                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all border ${
                                      isActive
                                        ? `${c.bg} ${c.color} border-transparent`
                                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-black'
                                    }`}>
                                    {c.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <NuevoPedidoForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </AppLayout>
  )
}
