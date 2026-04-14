import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devCategorias } from '@/lib/supabase/dev-store'

export async function GET(req: NextRequest) {
  if (isDevAuth(req)) {
    return NextResponse.json({ data: devCategorias.list() })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('categorias_clientes')
    .select('*')
    .eq('user_id', user.id)
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, color } = body

  if (!nombre || !color) {
    return NextResponse.json({ error: 'Nombre y color requeridos' }, { status: 400 })
  }

  if (isDevAuth(req)) {
    const data = devCategorias.create({ nombre, color })
    return NextResponse.json({ data }, { status: 201 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('categorias_clientes')
    .insert({ user_id: user.id, nombre, color })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
