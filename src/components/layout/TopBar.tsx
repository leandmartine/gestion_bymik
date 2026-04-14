'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
        <div>
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
      </div>
    </header>
  )
}
