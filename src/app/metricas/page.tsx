'use client'

import { useState } from 'react'
import { AppLayout } from '@/app/layout-app'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useProductos } from '@/hooks/useProductos'
import { mesActual, formatMes, formatPrecio, ESTADO_CONFIG } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { type MetricasMensuales } from '@/types/app'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

function addMonth(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function MetricasPage() {
  const [mes, setMes] = useState(mesActual())
  const { data: productos = [] } = useProductos()

  const { data: metricas, isLoading } = useQuery<MetricasMensuales>({
    queryKey: ['metricas', mes],
    queryFn: async () => {
      const res = await fetch(`/api/metricas?mes=${mes}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
  })

  const stockBajo = productos.filter((p) => p.stock <= 3)

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl">
        {/* Header + navegación mes */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Métricas 📊</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setMes(addMonth(mes, -1))} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-black capitalize w-32 text-center">{formatMes(mes)}</span>
            <button onClick={() => setMes(addMonth(mes, 1))} disabled={mes >= mesActual()}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
        ) : !metricas ? null : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pedidos', value: metricas.total_pedidos, icon: ShoppingBag },
                { label: 'Total vendido', value: formatPrecio(metricas.total_vendido), icon: TrendingUp },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-neutral-100 p-4">
                  <s.icon className="w-5 h-5 text-neutral-400 mb-2" />
                  <p className="text-2xl font-bold text-black">{s.value}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Por estado */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <p className="font-semibold text-black mb-3 text-sm">Pedidos por estado</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metricas.pedidos_por_estado).map(([estado, count]) => {
                  const cfg = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG]
                  return (
                    <div key={estado} className={`flex items-center justify-between rounded-xl px-3 py-2 ${cfg.bg}`}>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className={`text-sm font-bold ${cfg.color}`}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Gráfico por día */}
            {metricas.por_dia.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-4">
                <p className="font-semibold text-black mb-3 text-sm">Pedidos por día</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.por_dia} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="fecha" tickFormatter={(v) => format(parseISO(v), 'd', { locale: es })}
                      tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [Number(v), 'Pedidos']}
                      labelFormatter={(l) => formatPrecio(Number(l))}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                    />
                    <Bar dataKey="pedidos" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Productos más vendidos */}
            {metricas.productos_mas_vendidos.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-4">
                <p className="font-semibold text-black mb-3 text-sm">Más vendidos</p>
                <div className="space-y-2">
                  {metricas.productos_mas_vendidos.map((p, i) => (
                    <div key={p.producto_id} className="flex items-center gap-3">
                      <span className="w-5 text-xs text-neutral-400 font-medium">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm text-black font-medium">{p.nombre}</span>
                          <span className="text-xs text-neutral-500">{p.cantidad_total} ud.</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(p.cantidad_total / (metricas.productos_mas_vendidos[0]?.cantidad_total ?? 1)) * 100}%` }}
                            className="h-full bg-black rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 w-16 text-right">{formatPrecio(p.total_vendido)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-neutral-400" />
                <p className="font-semibold text-black text-sm">Control de stock</p>
              </div>
              {stockBajo.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Stock bajo (≤3 unidades)</p>
                    <p className="text-xs text-yellow-600 mt-0.5">{stockBajo.map((p) => `${p.nombre}: ${p.stock}`).join(' · ')}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {productos.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-black truncate">{p.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%` }} />
                      </div>
                      <span className={`text-xs font-medium w-8 text-right ${p.stock <= 3 ? 'text-yellow-600' : 'text-neutral-500'}`}>{p.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
