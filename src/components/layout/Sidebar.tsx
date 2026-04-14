'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/pedidos',       label: 'Pedidos',      icon: ShoppingBag },
  { href: '/productos',     label: 'Productos',    icon: Package },
  { href: '/clientes',      label: 'Clientes',     icon: Users },
  { href: '/metricas',      label: 'Métricas',     icon: BarChart2 },
  { href: '/configuracion', label: 'Configuración',icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('¡Hasta luego! 👋')
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-neutral-100 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div
            data-easter-egg
            className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md cursor-pointer select-none"
          >
            <span className="text-white text-lg font-bold pointer-events-none">B</span>
          </div>
          <div>
            <h1 className="font-bold text-black text-sm leading-tight">ByMik</h1>
            <p className="text-neutral-400 text-xs">Panel de gestión</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-neutral-400 hover:bg-neutral-100 hover:text-black'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-100 hover:text-black transition-all"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </aside>
  )
}
