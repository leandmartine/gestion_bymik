'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type Pedido, type PedidoCreate, type PedidoUpdate, type EstadoPedido } from '@/types/app'
import { mesActual } from '@/lib/utils'
import { toast } from 'sonner'
import { soundPedidoOk, soundGuardado, soundEliminado, soundEstado, soundCelebracion } from '@/lib/sounds'
import { celebrarPrimerPedido, celebrarHito, randomMotivacion, triggerMotivacion } from '@/components/shared/Celebrations'

async function fetchPedidos(mes: string): Promise<Pedido[]> {
  const res = await fetch(`/api/pedidos?mes=${mes}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data ?? []
}

export function usePedidos(mes: string = mesActual()) {
  return useQuery({
    queryKey: ['pedidos', mes],
    queryFn: () => fetchPedidos(mes),
    staleTime: 0,
  })
}

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: PedidoCreate) => {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Pedido
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['pedidos'] })
      await qc.invalidateQueries({ queryKey: ['metricas'] })
      await qc.invalidateQueries({ queryKey: ['productos'] })

      const pedidos: Pedido[] | undefined = qc.getQueryData(['pedidos', mesActual()])
      const count = (pedidos ?? []).length

      if (count === 1) {
        soundCelebracion()
        celebrarPrimerPedido()
      } else {
        soundPedidoOk()
        celebrarHito(count)

        if (Math.random() < 0.25) {
          setTimeout(() => {
            const frase = randomMotivacion()
            triggerMotivacion(frase.title, frase.subtitle)
          }, 1200)
        }
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: PedidoUpdate & { id: string }) => {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Pedido
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] })
      if ('estado' in vars) {
        soundEstado()
        const labels: Record<EstadoPedido, string> = {
          pendiente: 'Pendiente', preparando: 'Preparando',
          enviado: 'Enviado ✈️', entregado: 'Entregado ✅', cancelado: 'Cancelado', devuelto: 'Devuelto',
        }
        toast.success(`Estado: ${labels[vars.estado as EstadoPedido]}`)
      } else {
        soundGuardado()
        toast.success('Pedido actualizado ✨')
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeletePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] })
      qc.invalidateQueries({ queryKey: ['productos'] })
      soundEliminado()
      toast.success('Pedido eliminado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
