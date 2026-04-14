'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { soundBienvenida } from '@/lib/sounds'

export function LoginForm() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shakeKey, setShakeKey] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (
      process.env.NODE_ENV === 'development' &&
      email === 'mikagonz@gmail.com' &&
      password === '12345678'
    ) {
      document.cookie = 'dev-auth=true; path=/; max-age=86400'
      soundBienvenida()
      toast.success('¡Bienvenida a ByMik! 🖤')
      router.push('/dashboard')
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos 🔒')
      setShakeKey((k) => k + 1)
      setLoading(false)
      return
    }

    soundBienvenida()
    toast.success('¡Bienvenida! 🖤')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      {/* Decoración fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['💄', '✨', '🖤', '💅', '⭐'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-10"
            style={{ left: `${10 + i * 20}%`, top: `${5 + (i % 3) * 30}%` }}
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-black/8 p-8 border border-neutral-100">
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white text-2xl font-bold">B</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-black">ByMik</h1>
            <p className="text-neutral-400 text-sm mt-1">Tu panel de gestión ✨</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-neutral-200 bg-neutral-50 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full h-12 rounded-xl text-base font-medium transition-all',
                'bg-black text-white hover:bg-neutral-800',
                'shadow-lg shadow-black/20',
                'disabled:opacity-50'
              )}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Entrar 🖤'}
            </motion.button>
          </form>

          <p className="text-center text-xs text-neutral-300 mt-6">Tu espacio seguro y privado 🔒</p>
        </div>
      </motion.div>
    </div>
  )
}
