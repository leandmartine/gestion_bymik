import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devPedidos } from '@/lib/supabase/dev-store'
import { mesActual } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes') ?? mesActual()

  if (isDevAuth(req)) {
    return NextResponse.json({ data: devPedidos.list(mes) })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const desde = `${mes}-01`
  const hasta = `${mes}-31`

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes(id, nombre, telefono, instagram),
      items:pedido_items(*, producto:productos(id, nombre, precio))
    `)
    .eq('user_id', user.id)
    .gte('created_at', desde)
    .lte('created_at', hasta)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cliente_id, items, tiene_envio, direccion_envio, retira_en_agencia, agencia_envio, notas } = body

  if (!cliente_id || !items?.length) {
    return NextResponse.json({ error: 'Cliente e items son requeridos' }, { status: 400 })
  }

  if (isDevAuth(req)) {
    const data = devPedidos.create({ cliente_id, items, tiene_envio, direccion_envio, retira_en_agencia, agencia_envio, notas })
    return NextResponse.json({ data }, { status: 201 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Calcular total
  const total = items.reduce((acc: number, i: { cantidad: number; precio_unitario: number }) =>
    acc + i.cantidad * i.precio_unitario, 0)

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      user_id: user.id, cliente_id,
      tiene_envio: tiene_envio ?? false,
      direccion_envio: direccion_envio || null,
      retira_en_agencia: retira_en_agencia ?? false,
      agencia_envio: agencia_envio || null,
      notas: notas || null,
      total, estado: 'pendiente',
    })
    .select()
    .single()

  if (pedidoError) return NextResponse.json({ error: pedidoError.message }, { status: 500 })

  // Insertar items y ajustar stock
  const itemsData = items.map((i: { producto_id: string; cantidad: number; precio_unitario: number }) => ({
    pedido_id: pedido.id,
    producto_id: i.producto_id,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
  }))

  const { error: itemsError } = await supabase.from('pedido_items').insert(itemsData)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  // Ajustar stock de productos
  for (const item of items) {
    await supabase.rpc('decrement_stock', { p_id: item.producto_id, p_qty: item.cantidad })
  }

  // Sync sheets en background
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/sheets`, {
    method: 'POST',
    headers: { Cookie: req.headers.get('cookie') ?? '' },
  }).catch(() => {})

  return NextResponse.json({ data: pedido }, { status: 201 })
}
