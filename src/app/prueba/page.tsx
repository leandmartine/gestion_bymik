'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ─── DATA ──────────────────────────────────────────────────────────────────────

type ItemType = 'pdf' | 'link'

interface MenuItem {
  id: string
  icon: string
  title: string
  description: string
  detail: string
  type: ItemType
  href: string
  size?: string
  tag?: string
  tagColor?: string
}

interface Folder {
  id: string
  icon: string
  title: string
  subtitle: string
  borderColor: string
  items: MenuItem[]
}

const FOLDERS: Folder[] = [
  {
    id: 'practica',
    icon: '🎯',
    title: 'Práctica',
    subtitle: 'Simulá el examen y repasá errores',
    borderColor: 'border-emerald-400/40',
    items: [
      {
        id: 'simulador',
        icon: '🚗',
        title: 'Simulador de Examen',
        description: 'Respondé 25 preguntas aleatorias y chequeá cuánto sabés.',
        detail: 'Simulador completo con 87 preguntas reales de la Categoría E: reglamentarias, hospitales, comisarías, normativa, vehículo, seguridad vial y más. Modo Práctica (muestra explicaciones) y modo Examen (sin ayudas). Al terminar podés repasar únicamente los errores.',
        type: 'link',
        href: '/prueba/simulador',
        tag: '87 preguntas',
        tagColor: 'bg-emerald-400/20 text-emerald-300',
      },
    ],
  },
  {
    id: 'material',
    icon: '📚',
    title: 'Material Oficial',
    subtitle: 'Documentos de la IMM para estudiar',
    borderColor: 'border-blue-400/40',
    items: [
      {
        id: 'manual',
        icon: '📖',
        title: 'Manual Oficial — Categoría E',
        description: 'El manual completo de la Intendencia de Montevideo.',
        detail: 'Documento oficial de la IMM con toda la reglamentación vigente para obtener la Categoría E: normativa, requisitos del vehículo, conducta del conductor, hospitales, comisarías y más. Es el material base del examen.',
        type: 'pdf',
        href: '/prueba/Manual-Oficial-Categoria-E-IMM.pdf',
        size: '33 MB',
        tag: 'Completo',
        tagColor: 'bg-blue-400/20 text-blue-300',
      },
      {
        id: 'preguntas',
        icon: '❓',
        title: 'Preguntas Oficiales del Examen',
        description: 'El banco de preguntas del examen según la IMM.',
        detail: 'Compendio de preguntas oficiales extraídas del manual de la IMM. Incluye las preguntas más frecuentes del examen teórico de Categoría E. Ideal para estudiar junto al simulador.',
        type: 'pdf',
        href: '/prueba/Preguntas-Oficiales-Examen-Categoria-E.pdf',
        size: '140 KB',
        tag: 'Examen',
        tagColor: 'bg-blue-400/20 text-blue-300',
      },
      {
        id: 'resumen',
        icon: '📝',
        title: 'Resumen del Manual — Categoría E',
        description: 'Los puntos clave condensados para repasar rápido.',
        detail: 'Versión resumida y organizada del manual oficial. Perfecto para un repaso ágil antes del examen o para recordar datos específicos como direcciones de hospitales y comisarías.',
        type: 'pdf',
        href: '/prueba/Resumen-Manual-Categoria-E.pdf',
        size: '412 KB',
        tag: 'Resumen',
        tagColor: 'bg-blue-400/20 text-blue-300',
      },
      {
        id: 'plan',
        icon: '🗓️',
        title: 'Plan de Estudio y Organización',
        description: 'Cómo organizar el estudio para el examen.',
        detail: 'Guía práctica con un plan de estudio estructurado: qué estudiar cada día, en qué orden abordar los temas y cómo combinar el simulador con la lectura del manual para llegar preparado/a al examen.',
        type: 'pdf',
        href: '/prueba/Plan-de-Estudio-y-Organizacion.pdf',
        size: '17 KB',
        tag: 'Guía',
        tagColor: 'bg-blue-400/20 text-blue-300',
      },
    ],
  },
]

// ─── INFO BADGE (mobile) ──────────────────────────────────────────────────────

function InfoBadge({ detail }: { detail: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex-shrink-0 sm:hidden">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v) }}
        className="w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center text-sm font-extrabold shadow-lg hover:bg-sky-500 active:scale-95 transition-all"
        aria-label="Más información"
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-10 z-50 w-72 bg-gray-900 text-white text-sm rounded-2xl p-4 shadow-2xl leading-relaxed border border-white/15"
            >
              <p>{detail}</p>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false) }}
                className="mt-3 text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: MenuItem }) {
  const [showDetail, setShowDetail] = useState(false)

  const cardContent = (
    <div className="space-y-0">
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-200 cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.07)' }}
        onMouseEnter={() => setShowDetail(true)}
        onMouseLeave={() => setShowDetail(false)}
      >
        {/* Icon */}
        <span className="text-3xl flex-shrink-0">{item.icon}</span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <span className="text-white font-bold text-base leading-snug">{item.title}</span>
            {item.tag && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${item.tagColor}`}>
                {item.tag}
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm leading-snug">{item.description}</p>
          {item.size && (
            <span className="text-white/35 text-xs font-medium mt-0.5 inline-block">{item.size}</span>
          )}
        </div>

        {/* Desktop: arrow */}
        <span className="text-white/40 text-xl flex-shrink-0 hidden sm:block group-hover:text-white/80 transition-colors">→</span>

        {/* Mobile: info button */}
        <InfoBadge detail={item.detail} />
      </div>

      {/* Desktop expandable detail panel */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden hidden sm:block"
            onMouseEnter={() => setShowDetail(true)}
            onMouseLeave={() => setShowDetail(false)}
          >
            <div className="mt-1 px-5 py-3 rounded-xl bg-gray-900/80 border border-white/10 text-white/80 text-sm leading-relaxed">
              {item.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (item.type === 'pdf') {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    )
  }

  return <Link href={item.href} className="block">{cardContent}</Link>
}

// ─── FOLDER CARD ──────────────────────────────────────────────────────────────

function FolderCard({ folder, index }: { folder: Folder; index: number }) {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl border ${folder.borderColor} backdrop-blur-sm`}
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors text-left rounded-2xl"
      >
        <span className="text-3xl">{folder.icon}</span>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg leading-tight">{folder.title}</h2>
          <p className="text-white/50 text-sm mt-0.5">{folder.subtitle}</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40 text-2xl font-light flex-shrink-0"
        >
          ›
        </motion.span>
      </button>

      {/* Items */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {folder.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function PruebaMenuPage() {
  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center rounded-2xl border border-white/10 backdrop-blur-sm px-6 py-8"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div className="text-5xl mb-3">🚗</div>
          <h1 className="text-3xl font-bold text-white mb-2">Licencia Categoría E</h1>
          <p className="text-white/60 text-base">Material de estudio y simulador de examen · Montevideo</p>

          {/* Instrucciones según dispositivo */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="sm:hidden flex items-center gap-2 text-white/50 text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-400 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">i</span>
              Tocá el círculo celeste para saber de qué trata cada archivo
            </span>
            <span className="hidden sm:block text-white/45 text-sm">
              Pasá el cursor sobre cada archivo para ver más información
            </span>
          </div>
        </motion.div>

        {/* Folders */}
        {FOLDERS.map((folder, i) => (
          <FolderCard key={folder.id} folder={folder} index={i} />
        ))}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/30 text-sm pb-6"
        >
          Material basado en la normativa de la Intendencia de Montevideo (IMM)
        </motion.p>

      </div>
    </main>
  )
}
