'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, ShoppingBag, Package, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Inicio',    icon: LayoutDashboard },
  { href: '/pedidos',       label: 'Pedidos',   icon: ShoppingBag },
  { href: '/productos',     label: 'Productos', icon: Package },
  { href: '/clientes',      label: 'Clientes',  icon: Users },
  { href: '/configuracion', label: 'Config',    icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/90 backdrop-blur-md border-t border-neutral-100 shadow-lg">
        <div className="flex items-center justify-around px-2 pb-safe">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3 px-3 min-w-[60px] relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full"
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn('p-1.5 rounded-xl transition-colors', isActive ? 'bg-black' : '')}
                >
                  <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-neutral-400')} />
                </motion.div>
                <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-black' : 'text-neutral-400')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
