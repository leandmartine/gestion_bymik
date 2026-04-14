'use client'

import { useState } from 'react'
import { AppLayout } from '@/app/layout-app'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductos, useCreateProducto, useUpdateProducto, useDeleteProducto } from '@/hooks/useProductos'
import { formatPrecio } from '@/lib/utils'
import { Plus, Pencil, Trash2, Package, X, Check, AlertTriangle } from 'lucide-react'
import { type Producto } from '@/types/app'

function ProductoForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: Partial<Producto>
  onSave: (data: { nombre: string; descripcion: string; precio: number; stock: number }) => void
  onCancel: () => void
  loading: boolean
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [precio, setPrecio] = useState(initial?.precio ? String(initial.precio) : '')
  const [stock, setStock] = useState(initial?.stock ? String(initial.stock) : '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre) return
    onSave({ nombre, descripcion, precio: precio ? Number(precio) : 0, stock: stock ? Number(stock) : 0 })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del producto"
        required
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black"
      />
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black resize-none"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Precio (opcional)"
          min="0"
          step="1"
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          min="0"
          className="w-24 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? '...' : initial ? 'Guardar' : 'Agregar producto'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-200 text-sm">
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default function ProductosPage() {
  const { data: productos = [], isLoading } = useProductos()
  const createM = useCreateProducto()
  const updateM = useUpdateProducto()
  const deleteM = useDeleteProducto()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <AppLayout>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Productos 💄</h1>
            <p className="text-neutral-400 text-sm">{productos.length} producto{productos.length !== 1 ? 's' : ''}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </motion.button>
        </div>

        {/* Formulario nuevo */}
        <AnimatePresence>
          {showForm && !editingId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-neutral-200 p-4"
            >
              <p className="font-semibold text-black text-sm mb-3">Nuevo producto</p>
              <ProductoForm
                onSave={(data) => createM.mutate(data, { onSuccess: () => setShowForm(false) })}
                onCancel={() => setShowForm(false)}
                loading={createM.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : productos.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
            <Package className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">No hay productos aún.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {productos.map((producto, i) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {editingId === producto.id ? (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                      <p className="font-semibold text-black text-sm mb-3">Editar producto</p>
                      <ProductoForm
                        initial={producto}
                        onSave={(data) => updateM.mutate({ id: producto.id, ...data }, { onSuccess: () => setEditingId(null) })}
                        onCancel={() => setEditingId(null)}
                        loading={updateM.isPending}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-black truncate">{producto.nombre}</p>
                            {producto.stock > 0 && producto.stock <= 3 && (
                              <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Stock bajo
                              </span>
                            )}
                          </div>
                          {producto.descripcion && (
                            <p className="text-neutral-400 text-xs mt-0.5 truncate">{producto.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-semibold text-black text-sm">
                              {producto.precio > 0 ? formatPrecio(producto.precio) : <span className="text-neutral-300">Sin precio</span>}
                            </span>
                            {producto.stock > 0 && (
                              <span className="text-neutral-400 text-xs">Stock: {producto.stock}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingId(producto.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          {confirmDelete === producto.id ? (
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteM.mutate(producto.id, { onSuccess: () => setConfirmDelete(null) })}
                                className="p-2 rounded-xl bg-red-50 text-red-600"
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmDelete(null)}
                                className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => { setConfirmDelete(producto.id); setTimeout(() => setConfirmDelete(null), 3000) }}
                              className="p-2 rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
