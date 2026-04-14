'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/app/layout-app'
import { motion } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Settings, RefreshCw, LogOut } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { soundGuardado } from '@/lib/sounds'

function SyncStatus() {
  const { data } = useQuery({
    queryKey: ['sync-status'],
    queryFn: async () => {
      const res = await fetch('/api/sync/sheets')
      if (!res.ok) return null
      const json = await res.json()
      return json.data
    },
    staleTime: 30000,
  })

  const syncM = useMutation({
    mutationFn: () => fetch('/api/sync/sheets', { method: 'POST' }).then((r) => r.json()),
    onSuccess: (d) => toast.success(`Sincronizado: ${d.records_synced ?? 0} pedidos 🖤`),
    onError: () => toast.error('Error al sincronizar'),
  })

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => syncM.mutate()}
      disabled={syncM.isPending}
      className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${syncM.isPending ? 'animate-spin' : ''}`} />
      {syncM.isPending ? 'Sincronizando...' : 'Sincronizar con Google Sheets'}
      {data?.last_sync && (
        <span className="ml-auto text-xs text-neutral-400">{data.last_sync.slice(0, 10)}</span>
      )}
    </motion.button>
  )
}

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  const [fullName, setFullName] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [googleCredentials, setGoogleCredentials] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles')
      .select('full_name, sheets_spreadsheet_id, google_credentials')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { full_name: string | null; sheets_spreadsheet_id: string | null; google_credentials: string | null } | null }) => {
        if (data) {
          setFullName(data.full_name ?? '')
          setSpreadsheetId(data.sheets_spreadsheet_id ?? '')
          setGoogleCredentials(data.google_credentials ? '••••••••' : '')
        }
      })
  }, [user, supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const update: Record<string, string> = { full_name: fullName, sheets_spreadsheet_id: spreadsheetId.trim() }
    if (googleCredentials && !googleCredentials.includes('•')) {
      update.google_credentials = googleCredentials
    }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...update })
    setSaving(false)
    if (error) toast.error(error.message)
    else { soundGuardado(); toast.success('Configuración guardada 🖤') }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AppLayout>
      <div className="space-y-5 max-w-lg">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Configuración</h1>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-black block mb-1.5">Nombre</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-black transition-colors" />
          </div>

          <div>
            <label className="text-sm font-medium text-black block mb-1.5">Email</label>
            <p className="text-sm text-neutral-400 px-4 py-2.5">{user?.email}</p>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <p className="text-sm font-semibold text-black mb-3">Google Sheets</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">ID de la planilla</label>
                <input value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-black transition-colors font-mono" />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Credenciales cuenta de servicio (JSON)</label>
                <textarea value={googleCredentials} onChange={(e) => setGoogleCredentials(e.target.value)}
                  placeholder='{"type":"service_account",...}'
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-black transition-colors font-mono resize-none" />
              </div>
              <SyncStatus />
            </div>
          </div>

          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </motion.button>
        </form>

        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </AppLayout>
  )
}
