'use client'

import { useState } from 'react'
import { AppLayout } from '@/app/layout-app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useClientes, useCategorias, useCreateCliente, useUpdateCliente,
  useDeleteCliente, useCreateCategoria, useDeleteCategoria,
} from '@/hooks/useClientes'
import { iniciales, COLORES_CATEGORIA, colorTexto } from '@/lib/utils'
import { Plus, Pencil, Trash2, Users, X, Check, Tag, Phone } from 'lucide-react'
import { type Cliente } from '@/types/app'

function ClienteForm({
  initial,
  onSave,
  onCancel,
  loading,
  categorias,
}: {
  initial?: Partial<Cliente>
  onSave: (data: Partial<Cliente>) => void
  onCancel: () => void
  loading: boolean
  categorias: { id: string; nombre: string; color: string }[]
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [telefono, setTelefono] = useState(initial?.telefono ?? '')
  const [direccion, setDireccion] = useState(initial?.direccion ?? '')
  const [instagram, setInstagram] = useState(initial?.instagram ?? '')
  const [notas, setNotas] = useState(initial?.notas ?? '')
  const [categoriaId, setCategoriaId] = useState(initial?.categoria_id ?? '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || !telefono) return
    onSave({ nombre, telefono, direccion: direccion || null, instagram: instagram || null, notas: notas || null, categoria_id: categoriaId || null })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre *" required
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
      <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono *" required
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
      <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram / contacto"
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
      <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección (opcional)"
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black" />
      <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas" rows={2}
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black resize-none" />
      {categorias.length > 0 && (
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black">
          <option value="">Sin categoría</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 py-2 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? '...' : initial ? 'Guardar' : 'Agregar cliente'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"><X className="w-4 h-4" /></button>
      </div>
    </form>
  )
}

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes()
  const { data: categorias = [] } = useCategorias()
  const createM = useCreateCliente()
  const updateM = useUpdateCliente()
  const deleteM = useDeleteCliente()
  const createCat = useCreateCategoria()
  const deleteCat = useDeleteCategoria()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catNombre, setCatNombre] = useState('')
  const [catColor, setCatColor] = useState(COLORES_CATEGORIA[0])
  const [busqueda, setBusqueda] = useState('')

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda) ||
    (c.instagram ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Clientes 👥</h1>
            <p className="text-neutral-400 text-sm">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </motion.button>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap items-center gap-2">
          {categorias.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: cat.color, color: colorTexto(cat.color) }}>
              {cat.nombre}
              <button onClick={() => deleteCat.mutate(cat.id)} className="ml-0.5 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {showCatForm ? (
            <div className="flex items-center gap-1">
              <input value={catNombre} onChange={(e) => setCatNombre(e.target.value)} placeholder="Categoría"
                className="px-2 py-1 rounded-lg border border-neutral-200 text-xs w-24 focus:outline-none focus:border-black" />
              <div className="flex gap-1">
                {COLORES_CATEGORIA.map((c) => (
                  <button key={c} onClick={() => setCatColor(c)}
                    className="w-4 h-4 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: catColor === c ? 'black' : 'transparent' }} />
                ))}
              </div>
              <button onClick={() => { if (catNombre) createCat.mutate({ nombre: catNombre, color: catColor }, { onSuccess: () => { setCatNombre(''); setShowCatForm(false) } }) }}
                className="text-xs bg-black text-white px-2 py-1 rounded-lg">OK</button>
              <button onClick={() => setShowCatForm(false)} className="text-xs text-neutral-400"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <button onClick={() => setShowCatForm(true)} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black transition-colors">
              <Tag className="w-3 h-3" /> Nueva categoría
            </button>
          )}
        </div>

        {/* Buscador */}
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente..."
          className="w-full px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-black" />

        {/* Formulario nuevo */}
        <AnimatePresence>
          {showForm && !editingId && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="font-semibold text-black text-sm mb-3">Nuevo cliente</p>
              <ClienteForm categorias={categorias}
                onSave={(data) => createM.mutate(data as Parameters<typeof createM.mutate>[0], { onSuccess: () => setShowForm(false) })}
                onCancel={() => setShowForm(false)} loading={createM.isPending} />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
            <Users className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">{busqueda ? 'Sin resultados.' : 'No hay clientes aún.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clientesFiltrados.map((cliente, i) => (
              <motion.div key={cliente.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <AnimatePresence mode="wait">
                  {editingId === cliente.id ? (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                      <p className="font-semibold text-black text-sm mb-3">Editar cliente</p>
                      <ClienteForm initial={cliente} categorias={categorias}
                        onSave={(data) => updateM.mutate({ id: cliente.id, ...data } as Parameters<typeof updateM.mutate>[0], { onSuccess: () => setEditingId(null) })}
                        onCancel={() => setEditingId(null)} loading={updateM.isPending} />
                    </motion.div>
                  ) : (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {iniciales(cliente.nombre)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-black truncate">{cliente.nombre}</p>
                              {cliente.categoria && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: cliente.categoria.color, color: colorTexto(cliente.categoria.color) }}>
                                  {cliente.categoria.nombre}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-400">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cliente.telefono}</span>
                              {cliente.instagram && <span className="flex items-center gap-1">@{cliente.instagram}</span>}
                            </div>
                            {cliente.notas && <p className="text-xs text-neutral-300 mt-0.5 truncate">{cliente.notas}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingId(cliente.id)}
                            className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          {confirmDelete === cliente.id ? (
                            <div className="flex items-center gap-1">
                              <motion.button whileTap={{ scale: 0.9 }}
                                onClick={() => deleteM.mutate(cliente.id, { onSuccess: () => setConfirmDelete(null) })}
                                className="p-2 rounded-xl bg-red-50 text-red-600"><Check className="w-4 h-4" /></motion.button>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfirmDelete(null)}
                                className="p-2 rounded-xl text-neutral-400"><X className="w-4 h-4" /></motion.button>
                            </div>
                          ) : (
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => { setConfirmDelete(cliente.id); setTimeout(() => setConfirmDelete(null), 3000) }}
                              className="p-2 rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors">
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
