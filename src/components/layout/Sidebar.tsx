'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DogIcon } from '@/components/ui/DogIcon'

const NAV_ITEMS = [
  {
    href: '/hoy',
    label: 'Hoy',
    icon: (active: boolean) => (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/agenda',
    label: 'Agenda',
    icon: (active: boolean) => (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/perros',
    label: 'Perros',
    icon: () => <DogIcon size={17} />,
  },
  {
    href: '/finanzas',
    label: 'Finanzas',
    icon: (active: boolean) => (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/mas',
    label: 'Ajustes',
    icon: (active: boolean) => (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function NavContent() {
    return (
      <>
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--pf-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(201,146,42,0.1)',
                border: '1px solid var(--pf-gold-border)',
                color: 'var(--pf-gold)',
              }}
            >
              <DogIcon size={18} />
            </div>
            <div>
              <p className="font-display text-base text-white leading-tight">
                Pet{' '}
                <em className="italic" style={{ color: 'var(--pf-gold-l)' }}>
                  Fashion
                </em>
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(245,240,232,0.35)' }}>
                Dog Salon
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(245,240,232,0.4)' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? 'rgba(201,146,42,0.1)' : 'transparent',
                  color: active ? 'var(--pf-gold-l)' : 'rgba(245,240,232,0.55)',
                  border: active ? '1px solid var(--pf-gold-border)' : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {icon(active)}
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid var(--pf-border)' }}>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-colors hover:bg-white/5"
            style={{ color: 'rgba(245,240,232,0.35)' }}
          >
            <LogOut size={15} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile topbar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--pf-bg2)', borderBottom: '1px solid var(--pf-border)' }}
      >
        <div className="flex items-center gap-2" style={{ color: 'var(--pf-gold)' }}>
          <DogIcon size={18} />
          <p className="font-display text-base text-white">
            Pet{' '}
            <em className="italic" style={{ color: 'var(--pf-gold-l)' }}>
              Fashion
            </em>
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(245,240,232,0.6)' }}
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-60 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--pf-bg2)', borderRight: '1px solid var(--pf-border)' }}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen"
        style={{ background: 'var(--pf-bg2)', borderRight: '1px solid var(--pf-border)' }}
      >
        <NavContent />
      </aside>
    </>
  )
}
