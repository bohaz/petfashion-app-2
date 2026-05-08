'use client'

import React from 'react'
import { X } from 'lucide-react'

// ── ModalShell ─────────────────────────────────────────────────────────────

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function ModalShell({ title, onClose, children, footer }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center backdrop-enter">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl modal-enter"
           style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
             style={{ borderBottom: '1px solid var(--pf-border)' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>{title}</div>
          <button onClick={onClose}
                  className="p-1.5 -m-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(245,240,232,0.4)' }}>
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--pf-border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
  subtext?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, text, subtext, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl p-10 text-center"
         style={{ background: 'var(--pf-bg2)', border: '1px dashed rgba(245,240,232,0.1)' }}>
      <div className="flex justify-center mb-3" style={{ color: 'rgba(245,240,232,0.18)' }}>{icon}</div>
      <p className="font-semibold text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>{text}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: 'rgba(245,240,232,0.3)' }}>{subtext}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Field ──────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
  hint?: string
  placeholder?: string
}

export function Field({ label, value, onChange, type = 'text', inputMode, hint, placeholder }: FieldProps) {
  return (
    <div>
      <label className="block mb-1.5">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      {hint && <p className="text-xs mt-1" style={{ color: 'rgba(245,240,232,0.3)' }}>{hint}</p>}
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}>
      <div className="section-label">{title}</div>
      {children}
    </div>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, small }: {
  label: string
  value: string | number
  sub?: string
  small?: boolean
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}>
      <div className="section-label" style={{ marginBottom: '8px' }}>{label}</div>
      <p className={`font-display font-bold tabular text-white ${small ? 'text-xl' : 'text-3xl'}`}>{value}</p>
      {sub && <p className="text-xs mt-1 tabular" style={{ color: 'rgba(245,240,232,0.35)' }}>{sub}</p>}
    </div>
  )
}

// ── ActionButton ───────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  green:        { bg: '#25D366',                   color: '#0f0e0c',                border: '#25D366' },
  'green-soft': { bg: 'rgba(74,222,128,0.07)',     color: '#4ade80',                border: 'rgba(74,222,128,0.2)' },
  amber:        { bg: 'rgba(234,179,8,0.07)',      color: '#fbbf24',                border: 'rgba(234,179,8,0.2)' },
  sky:          { bg: 'rgba(56,189,248,0.07)',     color: '#7dd3fc',                border: 'rgba(56,189,248,0.2)' },
  stone:        { bg: 'rgba(245,240,232,0.04)',    color: 'rgba(245,240,232,0.75)', border: 'rgba(245,240,232,0.1)' },
}

interface ActionButtonProps {
  color: 'green' | 'green-soft' | 'amber' | 'sky' | 'stone'
  icon: React.ReactNode
  label: string
  desc?: string
  onClick: () => void
}

export function ActionButton({ color, icon, label, desc, onClick }: ActionButtonProps) {
  const s = ACTION_STYLES[color] || ACTION_STYLES.stone
  return (
    <button onClick={onClick}
      className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.99]"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        {desc && <p className="text-xs opacity-70 mt-0.5">{desc}</p>}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ── StickyBar ──────────────────────────────────────────────────────────────

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 inset-x-0 p-3 z-20"
         style={{ background: 'var(--pf-bg2)', borderTop: '1px solid var(--pf-border)' }}>
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  )
}

// ── SubHeader ──────────────────────────────────────────────────────────────

export function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6 -mt-2">
      <button onClick={onBack}
              className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(245,240,232,0.4)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1 className="font-display text-2xl text-white">{title}</h1>
    </div>
  )
}
