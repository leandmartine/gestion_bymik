import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devProductos } from '@/lib/supabase/dev-store'

export async function GET(req: NextRequest) {
  if (isDevAuth(req)) {
    return NextResponse.json({ data: devProductos.list() })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('user_id', user.id)
    .eq('activo', true)
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, descripcion, precio, stock } = body

  if (!nombre || precio === undefined || stock === undefined) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  if (isDevAuth(req)) {
    const data = devProductos.create({ nombre, descripcion, precio: Number(precio), stock: Number(stock) })
    return NextResponse.json({ data }, { status: 201 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('productos')
    .insert({ user_id: user.id, nombre, descripcion: descripcion || null, precio: Number(precio), stock: Number(stock) })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
