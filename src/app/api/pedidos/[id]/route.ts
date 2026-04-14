import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devPedidos } from '@/lib/supabase/dev-store'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (isDevAuth(req)) {
    const data = devPedidos.get(id)
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ data })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('pedidos')
    .select(`*, cliente:clientes(id, nombre, telefono, instagram), items:pedido_items(*, producto:productos(id, nombre, precio))`)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (isDevAuth(req)) {
    const data = devPedidos.update(id, body)
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ data })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Handle stock adjustments when estado changes to/from 'devuelto'
  if (body.estado) {
    const { data: current } = await supabase
      .from('pedidos')
      .select('estado')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const prevEstado = current?.estado
    const nextEstado = body.estado

    if (prevEstado !== nextEstado) {
      // Transitioning TO devuelto: restore stock
      if (nextEstado === 'devuelto' && prevEstado !== 'devuelto') {
        const { data: items } = await supabase
          .from('pedido_items')
          .select('producto_id, cantidad')
          .eq('pedido_id', id)
        if (items) {
          for (const item of items) {
            await supabase.rpc('increment_stock', { p_id: item.producto_id, p_qty: item.cantidad })
          }
        }
      }

      // Transitioning FROM devuelto: re-deduct stock
      if (prevEstado === 'devuelto' && nextEstado !== 'devuelto') {
        const { data: items } = await supabase
          .from('pedido_items')
          .select('producto_id, cantidad')
          .eq('pedido_id', id)
        if (items) {
          for (const item of items) {
            await supabase.rpc('decrement_stock', { p_id: item.producto_id, p_qty: item.cantidad })
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (isDevAuth(req)) {
    devPedidos.delete(id)
    return NextResponse.json({ ok: true })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Restaurar stock
  const { data: items } = await supabase
    .from('pedido_items')
    .select('producto_id, cantidad')
    .eq('pedido_id', id)

  if (items) {
    for (const item of items) {
      await supabase.rpc('increment_stock', { p_id: item.producto_id, p_qty: item.cantidad })
    }
  }

  const { error } = await supabase.from('pedidos').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
