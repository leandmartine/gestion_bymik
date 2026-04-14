'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type Cliente, type ClienteCreate, type CategoriaCliente, type CategoriaCreate } from '@/types/app'
import { toast } from 'sonner'
import { soundCreado, soundGuardado, soundEliminado } from '@/lib/sounds'

async function fetchClientes(): Promise<Cliente[]> {
  const res = await fetch('/api/clientes')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data ?? []
}

async function fetchCategorias(): Promise<CategoriaCliente[]> {
  const res = await fetch('/api/clientes/categorias')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data ?? []
}

export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: fetchClientes, staleTime: 0 })
}

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: fetchCategorias })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ClienteCreate) => {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Cliente
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      soundCreado()
      toast.success('Cliente agregado 👤')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<ClienteCreate> & { id: string }) => {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Cliente
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      soundGuardado()
      toast.success('Cliente actualizado ✨')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      soundEliminado()
      toast.success('Cliente eliminado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useCreateCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: CategoriaCreate) => {
      const res = await fetch('/api/clientes/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as CategoriaCliente
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] })
      soundCreado()
      toast.success('Categoría creada')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clientes/categorias/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] })
      soundEliminado()
      toast.success('Categoría eliminada')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
