'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type Producto, type ProductoCreate } from '@/types/app'
import { toast } from 'sonner'
import { soundCreado, soundGuardado, soundEliminado } from '@/lib/sounds'

async function fetchProductos(): Promise<Producto[]> {
  const res = await fetch('/api/productos')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data ?? []
}

export function useProductos() {
  return useQuery({ queryKey: ['productos'], queryFn: fetchProductos, staleTime: 0 })
}

export function useCreateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ProductoCreate) => {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Producto
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      soundCreado()
      toast.success('Producto agregado 💄')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<ProductoCreate> & { id: string }) => {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Producto
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      soundGuardado()
      toast.success('Producto actualizado ✨')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      soundEliminado()
      toast.success('Producto eliminado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
