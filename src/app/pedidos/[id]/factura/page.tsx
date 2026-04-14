'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatFecha, formatPrecio, ESTADO_CONFIG } from '@/lib/utils'
import { type Pedido } from '@/types/app'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'

export default function FacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: pedido, isLoading, isError } = useQuery<Pedido>({
    queryKey: ['pedido', id],
    queryFn: async () => {
      const res = await fetch(`/api/pedidos/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar el pedido')
      return json.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Cargando...</p>
      </div>
    )
  }

  if (isError || !pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <p className="text-black font-semibold">No se encontró el pedido</p>
          <Link href="/pedidos" className="text-sm text-neutral-400 underline">Volver a pedidos</Link>
        </div>
      </div>
    )
  }

  const cfg = ESTADO_CONFIG[pedido.estado]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-family: sans-serif; background: white; }
          .print-container { max-width: 100% !important; margin: 0 !important; padding: 24px !important; }
        }
      `}</style>

      {/* Controles — ocultos al imprimir */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
        <Link href="/pedidos" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Contenido de la factura */}
      <div className="print-container max-w-2xl mx-auto px-4 py-8 mt-16 no-print-margin">
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight">ByMik</h1>
              <p className="text-neutral-400 text-sm mt-1">Comprobante de pedido</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">Fecha</p>
              <p className="text-sm font-medium text-black">
                {pedido.created_at ? formatFecha(pedido.created_at.slice(0, 10)) : '—'}
              </p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Datos del cliente */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Cliente</p>
            <p className="text-black font-semibold">{pedido.cliente?.nombre ?? '—'}</p>
            {pedido.cliente?.telefono && (
              <p className="text-sm text-neutral-500 mt-0.5">{pedido.cliente.telefono}</p>
            )}
            {pedido.cliente?.instagram && (
              <p className="text-sm text-neutral-400 mt-0.5">@{pedido.cliente.instagram}</p>
            )}
          </div>

          {/* Tabla de items */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Productos</p>
            <div className="border border-neutral-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">Producto</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-neutral-500">Cant.</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-neutral-500">P. Unitario</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedido.items ?? []).map((item, i) => (
                    <tr key={item.id} className={i % 2 === 1 ? 'bg-neutral-50/50' : ''}>
                      <td className="px-4 py-3 text-black font-medium">{item.producto?.nombre ?? '—'}</td>
                      <td className="px-3 py-3 text-center text-neutral-600">{item.cantidad}</td>
                      <td className="px-3 py-3 text-right text-neutral-600">{formatPrecio(item.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-black">{formatPrecio(item.cantidad * item.precio_unitario)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-200 bg-neutral-50">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-black">Total</td>
                    <td className="px-4 py-3 text-right text-base font-bold text-black">{formatPrecio(pedido.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Envío */}
          {pedido.tiene_envio && (
            <div className="bg-neutral-50 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Envío</p>
              {pedido.retira_en_agencia ? (
                <p className="text-sm text-black">Retira en agencia{pedido.agencia_envio ? ` — ${pedido.agencia_envio}` : ''}</p>
              ) : (
                <>
                  {pedido.direccion_envio && <p className="text-sm text-black">{pedido.direccion_envio}</p>}
                  {pedido.agencia_envio && <p className="text-sm text-neutral-500">{pedido.agencia_envio}</p>}
                </>
              )}
            </div>
          )}

          {/* Notas */}
          {pedido.notas && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm text-neutral-600 italic">{pedido.notas}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-neutral-100 pt-4 text-center">
            <p className="text-xs text-neutral-300">ByMik — Gracias por tu compra</p>
          </div>
        </div>
      </div>
    </>
  )
}
