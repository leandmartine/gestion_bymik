'use client'

import { AppLayout } from '@/app/layout-app'
import { motion } from 'framer-motion'
import { usePedidos } from '@/hooks/usePedidos'
import { useProductos } from '@/hooks/useProductos'
import { mesActual, formatPrecio, ESTADO_CONFIG } from '@/lib/utils'
import { ShoppingBag, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const mes = mesActual()
  const { data: pedidos = [] } = usePedidos(mes)
  const { data: productos = [] } = useProductos()

  const pedidosActivos = pedidos.filter((p) => p.estado !== 'cancelado')
  const totalMes = pedidosActivos.reduce((acc, p) => acc + p.total, 0)
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length
  const stockBajo = productos.filter((p) => p.stock <= 3)

  const recientes = pedidos.slice(0, 5)

  const stats = [
    { label: 'Pedidos este mes',   value: pedidos.length,          icon: ShoppingBag, color: 'bg-black text-white' },
    { label: 'Total vendido',      value: formatPrecio(totalMes),  icon: TrendingUp,  color: 'bg-neutral-800 text-white' },
    { label: 'Pendientes',         value: pendientes,              icon: ShoppingBag, color: 'bg-yellow-50 text-yellow-800' },
    { label: 'Productos',          value: productos.length,        icon: Package,     color: 'bg-neutral-100 text-black' },
  ]

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-black">Hola, Mika 🖤</h1>
          <p className="text-neutral-400 text-sm capitalize mt-0.5">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl p-4 ${stat.color} border border-neutral-100`}
            >
              <stat.icon className="w-5 h-5 mb-2 opacity-60" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-60 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Alerta stock bajo */}
        {stockBajo.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Stock bajo</p>
              <p className="text-yellow-600 text-xs mt-0.5">
                {stockBajo.map((p) => `${p.nombre} (${p.stock} ud.)`).join(' · ')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Pedidos recientes */}
        <div>
          <h2 className="font-semibold text-black mb-3">Pedidos recientes</h2>
          {recientes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">No hay pedidos este mes.</p>
              <p className="text-neutral-300 text-xs mt-1">¡Creá el primero desde Pedidos! 🖤</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recientes.map((pedido, i) => {
                const cfg = ESTADO_CONFIG[pedido.estado]
                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-black text-sm">{pedido.cliente?.nombre ?? '—'}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">
                        {pedido.items?.length ?? 0} producto{(pedido.items?.length ?? 0) !== 1 ? 's' : ''}
                        {' · '}
                        {pedido.created_at?.slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-semibold text-black text-sm">{formatPrecio(pedido.total)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
