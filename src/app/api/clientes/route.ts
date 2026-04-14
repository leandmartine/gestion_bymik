import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { devClientes } from '@/lib/supabase/dev-store'

export async function GET(req: NextRequest) {
  if (isDevAuth(req)) {
    return NextResponse.json({ data: devClientes.list() })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('clientes')
    .select('*, categoria:categorias_clientes(id, nombre, color)')
    .eq('user_id', user.id)
    .eq('activo', true)
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, telefono, direccion, instagram, notas, categoria_id } = body

  if (!nombre || !telefono) {
    return NextResponse.json({ error: 'Nombre y teléfono son requeridos' }, { status: 400 })
  }

  if (isDevAuth(req)) {
    const data = devClientes.create({ nombre, telefono, direccion, instagram, notas, categoria_id })
    return NextResponse.json({ data }, { status: 201 })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      user_id: user.id, nombre, telefono,
      direccion: direccion || null, instagram: instagram || null,
      notas: notas || null, categoria_id: categoria_id || null,
    })
    .select('*, categoria:categorias_clientes(id, nombre, color)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
