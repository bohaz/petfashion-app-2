'use client'

import { useState } from 'react'
import { BusinessFinances } from '@/components/finances/BusinessFinances'
import type { FinanceTab } from '@/components/finances/FinanceControls'
import { HomeFinances } from '@/components/finances/HomeFinances'
import { startOfMonth } from '@/lib/finance'

type Module = 'negocio' | 'hogar'

export default function FinanzasPage() {
  const [module, setModule] = useState<Module>('negocio')
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [tab, setTab] = useState<FinanceTab>('resumen')

  const monthMove = (n: number) => setMonthCursor(startOfMonth(monthCursor, n))

  return (
    <div>
      <header className="mb-6">
        <div className="section-label">Contabilidad</div>
        <h1 className="display">Finanzas</h1>
      </header>

      {/* Module toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => {
            setModule('negocio')
            setTab('resumen')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={
            module === 'negocio'
              ? {
                  background: 'var(--pf-gold)',
                  color: 'var(--pf-bg)',
                  border: '1px solid var(--pf-gold)',
                }
              : {
                  background: 'var(--pf-bg2)',
                  color: 'rgba(245,240,232,0.5)',
                  border: '1px solid var(--pf-border)',
                }
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
            <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z" />
          </svg>
          Pet Fashion
        </button>
        <button
          onClick={() => {
            setModule('hogar')
            setTab('resumen')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={
            module === 'hogar'
              ? {
                  background: 'rgba(99,102,241,0.9)',
                  color: 'white',
                  border: '1px solid rgba(99,102,241,0.9)',
                }
              : {
                  background: 'var(--pf-bg2)',
                  color: 'rgba(245,240,232,0.5)',
                  border: '1px solid var(--pf-border)',
                }
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Hogar
        </button>
      </div>

      {module === 'negocio' ? (
        <BusinessFinances
          monthCursor={monthCursor}
          monthMove={monthMove}
          tab={tab}
          setTab={setTab}
        />
      ) : (
        <HomeFinances monthCursor={monthCursor} monthMove={monthMove} tab={tab} setTab={setTab} />
      )}
    </div>
  )
}
