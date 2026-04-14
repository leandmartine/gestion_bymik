import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isDevAuth } from '@/lib/supabase/auth-dev'
import { mesActual } from '@/lib/utils'

export async function POST(req: NextRequest) {
  if (isDevAuth(req)) {
    return NextResponse.json({ ok: true, records_synced: 0, message: 'Dev mode — sync omitido' })
  }

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('sheets_spreadsheet_id, google_credentials')
      .eq('id', user.id)
      .single()

    if (!profile?.sheets_spreadsheet_id || !profile?.google_credentials) {
      return NextResponse.json({ ok: false, message: 'Google Sheets no configurado' })
    }

    const mes = mesActual()
    const [y, m] = mes.split('-').map(Number)
    const nextMes = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*, cliente:clientes(nombre, telefono), items:pedido_items(cantidad, precio_unitario, producto:productos(nombre))')
      .eq('user_id', user.id)
      .gte('created_at', `${mes}-01`)
      .lt('created_at', nextMes)

    if (!pedidos?.length) return NextResponse.json({ ok: true, records_synced: 0 })

    const { GoogleAuth } = await import('google-auth-library')
    const { google } = await import('googleapis')

    const credentials = JSON.parse(profile.google_credentials)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() as Parameters<typeof google.sheets>[0]['auth'] })

    const sheetTitle = mes
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: profile.sheets_spreadsheet_id,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
      })
    } catch {}

    const headers = [['# Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Producto', 'Cantidad', 'Precio unit.', 'Subtotal', 'Total pedido', 'Estado', 'Envío', 'Agencia', 'Dirección envío', 'Notas']]
    const rows: (string | number)[][] = []
    let totalItems = 0
    for (const p of pedidos) {
      const pedidoId = p.id.slice(0, 8).toUpperCase()
      const items = (p.items ?? []) as Array<{ cantidad: number; precio_unitario: number; producto?: { nombre: string } }>
      if (items.length === 0) {
        rows.push([pedidoId, p.created_at?.slice(0, 10) ?? '', p.cliente?.nombre ?? '', p.cliente?.telefono ?? '', '—', 0, 0, 0, p.total ?? 0, p.estado ?? '', p.tiene_envio ? 'Sí' : 'No', p.agencia_envio ?? '', p.direccion_envio ?? '', p.notas ?? ''])
        totalItems++
      } else {
        for (const item of items) {
          const subtotal = item.cantidad * item.precio_unitario
          rows.push([pedidoId, p.created_at?.slice(0, 10) ?? '', p.cliente?.nombre ?? '', p.cliente?.telefono ?? '', item.producto?.nombre ?? '?', item.cantidad, item.precio_unitario, subtotal, p.total ?? 0, p.estado ?? '', p.tiene_envio ? 'Sí' : 'No', p.agencia_envio ?? '', p.direccion_envio ?? '', p.notas ?? ''])
          totalItems++
        }
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: profile.sheets_spreadsheet_id,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [...headers, ...rows] },
    })

    // Formato encabezado negro
    const { data: spreadsheet } = await sheets.spreadsheets.get({ spreadsheetId: profile.sheets_spreadsheet_id })
    const sheet = spreadsheet.sheets?.find((s) => s.properties?.title === sheetTitle)
    if (sheet?.properties?.sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: profile.sheets_spreadsheet_id,
        requestBody: {
          requests: [{
            repeatCell: {
              range: { sheetId: sheet.properties.sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.04, green: 0.04, blue: 0.04 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          }],
        },
      })
    }

    await supabase.from('sync_log').insert({
      user_id: user.id, status: 'success',
      records_synced: totalItems, synced_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, records_synced: totalItems })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    await supabase.from('sync_log').insert({
      user_id: user.id, status: 'error',
      records_synced: 0, error_message: msg, synced_at: new Date().toISOString(),
    })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
