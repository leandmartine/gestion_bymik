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
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*, cliente:clientes(nombre, telefono), items:pedido_items(cantidad, precio_unitario, producto:productos(nombre))')
      .eq('user_id', user.id)
      .gte('created_at', `${mes}-01`)

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

    const headers = [['Fecha', 'Cliente', 'Teléfono', 'Productos', 'Total', 'Estado', 'Envío', 'Agencia', 'Dirección envío', 'Notas']]
    const rows = pedidos.map((p) => {
      const productos = (p.items ?? [])
        .map((i: { cantidad: number; producto?: { nombre: string }; precio_unitario: number }) =>
          `${i.cantidad}x ${i.producto?.nombre ?? '?'} ($${i.precio_unitario})`)
        .join(', ')
      return [
        p.created_at?.slice(0, 10) ?? '',
        p.cliente?.nombre ?? '',
        p.cliente?.telefono ?? '',
        productos,
        p.total ?? 0,
        p.estado ?? '',
        p.tiene_envio ? 'Sí' : 'No',
        p.agencia_envio ?? '',
        p.direccion_envio ?? '',
        p.notas ?? '',
      ]
    })

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
      records_synced: pedidos.length, synced_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, records_synced: pedidos.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    await supabase.from('sync_log').insert({
      user_id: user.id, status: 'error',
      records_synced: 0, error_message: msg, synced_at: new Date().toISOString(),
    })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
