'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/hoy')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'var(--pf-bg)' }}>
      {/* ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(201,146,42,0.12) 0%, transparent 65%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(201,146,42,0.06) 0%, transparent 65%)' }} />

      <div className="w-full max-w-sm relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{ background: 'rgba(201,146,42,0.1)', border: '1px solid var(--pf-gold-border)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="var(--pf-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
              <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
              <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/>
              <path d="M6.5 17.5c-.875 1.563-1.5 2.5-2 3"/>
              <path d="M17.5 17.5c.875 1.563 1.5 2.5 2 3"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl text-white">
            Pet <em className="italic" style={{ color: 'var(--pf-gold-l)' }}>Fashion</em>
          </h1>
          <p className="text-xs mt-1.5 tracking-wider" style={{ color: 'rgba(245,240,232,0.35)' }}>
            SISTEMA DE GESTIÓN
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="section-label mb-5">Iniciar sesión</div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label>Email</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required className="w-full" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label>Contraseña</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="w-full pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,240,232,0.35)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-sm text-center"
                   style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-1">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <hr className="gold-divider my-5" />
          <p className="text-center text-xs" style={{ color: 'rgba(245,240,232,0.25)' }}>
            Pet Fashion · Solo para uso del equipo
          </p>
        </div>
      </div>
    </div>
  )
}