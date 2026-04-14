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
  const hasta = `${mes}-31`

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`*, items:pedido_items(*, producto:productos(id, nombre))`)
    .eq('user_id', user.id)
    .gte('created_at', desde)
    .lte('created_at', hasta)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const data = calcularMetricas(mes, pedidos ?? [])
  return NextResponse.json({ data })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcularMetricas(mes: string, pedidos: any[]): MetricasMensuales {
  const estados = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'] as EstadoPedido[]
  const por_estado = Object.fromEntries(
    estados.map((e) => [e, pedidos.filter((p) => p.estado === e).length])
  ) as Record<EstadoPedido, number>

  const total_vendido = pedidos
    .filter((p) => p.estado !== 'cancelado')
    .reduce((acc, p) => acc + (p.total ?? 0), 0)

  // Productos más vendidos
  const productoMap = new Map<string, { nombre: string; cantidad_total: number; total_vendido: number }>()
  pedidos.filter((p) => p.estado !== 'cancelado').forEach((pedido) => {
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
      total: prev.total + (p.estado !== 'cancelado' ? (p.total ?? 0) : 0),
    })
  })
  const por_dia = Array.from(diaMap.entries())
    .map(([fecha, v]) => ({ fecha, ...v }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  return {
    mes,
    total_pedidos: pedidos.length,
    total_vendido,
    pedidos_por_estado: por_estado,
    productos_mas_vendidos,
    por_dia,
  }
}
