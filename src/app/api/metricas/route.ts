import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devPedidos } from '@/lib/supabase/dev-store'
import { mesActual } from '@/lib/utils'
import { type MetricasMensuales, type EstadoPedido } from '@/types/app'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes') ?? mesActual()

  if (isDevAuth(req)) {
    const pedidos = devPedidos.list(mes)
    const data = calcularMetricas(mes, pedidos)
    return NextResponse.json({ data })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const desde = `${mes}-01`
  const [y, m] = mes.split('-').map(Number)
  const nextMes = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`*, cliente:clientes(id, nombre), items:pedido_items(*, producto:productos(id, nombre))`)
    .eq('user_id', user.id)
    .gte('created_at', desde)
    .lt('created_at', nextMes)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const data = calcularMetricas(mes, pedidos ?? [])
  return NextResponse.json({ data })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcularMetricas(mes: string, pedidos: any[]): MetricasMensuales {
  const estados = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto'] as EstadoPedido[]
  const por_estado = Object.fromEntries(
    estados.map((e) => [e, pedidos.filter((p) => p.estado === e).length])
  ) as Record<EstadoPedido, number>

  const pedidosActivos = pedidos.filter((p) => p.estado !== 'cancelado' && p.estado !== 'devuelto')

  const total_vendido = pedidosActivos.reduce((acc, p) => acc + (p.total ?? 0), 0)

  // Productos más vendidos
  const productoMap = new Map<string, { nombre: string; cantidad_total: number; total_vendido: number }>()
  pedidosActivos.forEach((pedido) => {
    (pedido.items ?? []).forEach((item: { producto_id: string; producto?: { nombre: string }; cantidad: number; precio_unitario: number }) => {
      const key = item.producto_id
      const prev = productoMap.get(key) ?? { nombre: item.producto?.nombre ?? key, cantidad_total: 0, total_vendido: 0 }
      productoMap.set(key, {
        nombre: prev.nombre,
        cantidad_total: prev.cantidad_total + item.cantidad,
        total_vendido: prev.total_vendido + item.cantidad * item.precio_unitario,
      })
    })
  })

  const productos_mas_vendidos = Array.from(productoMap.entries())
    .map(([producto_id, v]) => ({ producto_id, ...v }))
    .sort((a, b) => b.cantidad_total - a.cantidad_total)
    .slice(0, 5)

  // Por día
  const diaMap = new Map<string, { pedidos: number; total: number }>()
  pedidos.forEach((p) => {
    const fecha = p.created_at?.slice(0, 10) ?? ''
    const prev = diaMap.get(fecha) ?? { pedidos: 0, total: 0 }
    diaMap.set(fecha, {
      pedidos: prev.pedidos + 1,
      total: prev.total + (p.estado !== 'cancelado' && p.estado !== 'devuelto' ? (p.total ?? 0) : 0),
    })
  })
  const por_dia = Array.from(diaMap.entries())
    .map(([fecha, v]) => ({ fecha, ...v }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // Clientes frecuentes (top 5)
  const clienteMap = new Map<string, { nombre: string; num_pedidos: number; total_gastado: number }>()
  pedidosActivos.forEach((pedido) => {
    const clienteId = pedido.cliente_id ?? ''
    const nombre = pedido.cliente?.nombre ?? clienteId
    const prev = clienteMap.get(clienteId) ?? { nombre, num_pedidos: 0, total_gastado: 0 }
    clienteMap.set(clienteId, {
      nombre: prev.nombre,
      num_pedidos: prev.num_pedidos + 1,
      total_gastado: prev.total_gastado + (pedido.total ?? 0),
    })
  })
  const clientes_frecuentes = Array.from(clienteMap.entries())
    .map(([cliente_id, v]) => ({ cliente_id, ...v }))
    .sort((a, b) => b.num_pedidos - a.num_pedidos || b.total_gastado - a.total_gastado)
    .slice(0, 5)

  return {
    mes,
    total_pedidos: pedidos.length,
    total_vendido,
    pedidos_por_estado: por_estado,
    productos_mas_vendidos,
    por_dia,
    clientes_frecuentes,
  }
}
