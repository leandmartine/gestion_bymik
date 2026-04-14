'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? 'http://localhost:3000'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Inicio ✨',
  '/pedidos':       'Pedidos 🛍️',
  '/productos':     'Productos 💄',
  '/clientes':      'Clientes 👥',
  '/metricas':      'Métricas 📊',
  '/configuracion': 'Configuración ⚙️',
}

export function TopBar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'ByMik'
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <header className="sticky top-0 z-40 md:hidden bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="px-4 py-3 flex items-center gap-3">
        <span data-easter-egg className="font-bold text-black text-xl select-none cursor-pointer">B</span>
        <div className="flex-1">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-black leading-tight"
          >
            {title}
          </motion.h1>
          <p className="text-xs text-neutral-400 capitalize">{today}</p>
        </div>
        <a href={HUB_URL}>
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-200 hover:text-black transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </motion.div>
        </a>
      </div>
    </header>
  )
}
