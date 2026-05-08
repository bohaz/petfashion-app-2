'use client'

import React from 'react'
import { X } from 'lucide-react'

// ── ModalShell ────────────────────────────────────────────────

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function ModalShell({ title, onClose, children, footer }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center backdrop-enter">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-stone-50 w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl modal-enter">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 shrink-0">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-lg hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-stone-200 p-3 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
  subtext?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, text, subtext, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center">
      <div className="text-stone-400 flex justify-center mb-2">{icon}</div>
      <p className="font-semibold text-stone-700">{text}</p>
      {subtext && <p className="text-sm text-stone-500 mt-1">{subtext}</p>}
      {action}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────

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
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400"
      />
      {hint && <p className="text-[11px] text-stone-500 mt-1">{hint}</p>}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">{title}</h3>
      {children}
    </div>
  )
}

// ── StickyBar ─────────────────────────────────────────────────

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-16 inset-x-0 bg-white border-t border-stone-200 p-3 z-20">
      <div className="max-w-md mx-auto">{children}</div>
    </div>
  )
}

// ── SubHeader ─────────────────────────────────────────────────

export function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-5 -mt-2">
      <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-stone-100">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1 className="text-xl font-extrabold">{title}</h1>
    </div>
  )
}

// ── ActionButton ──────────────────────────────────────────────

interface ActionButtonProps {
  color: 'green' | 'green-soft' | 'amber' | 'sky' | 'stone'
  icon: React.ReactNode
  label: string
  desc?: string
  onClick: () => void
}

const ACTION_COLORS: Record<string, string> = {
  green:      'bg-[#25D366] text-white border-[#25D366]',
  'green-soft':'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber:      'bg-amber-50 text-amber-900 border-amber-200',
  sky:        'bg-sky-50 text-sky-900 border-sky-200',
  stone:      'bg-stone-100 text-stone-800 border-stone-200',
}

export function ActionButton({ color, icon, label, desc, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full ${ACTION_COLORS[color]} border rounded-xl p-3 flex items-center gap-3 text-left transition active:scale-[0.99]`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{label}</p>
        {desc && <p className="text-[11px] opacity-80">{desc}</p>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ── StatCard ──────────────────────────────────────────────────

export function StatCard({ label, value, sub, small }: { label: string; value: string | number; sub?: string; small?: boolean }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">{label}</p>
      <p className={`${small ? 'text-xl' : 'text-3xl'} font-extrabold mt-1 tabular`}>{value}</p>
      {sub && <p className="text-[11px] text-stone-500 mt-1 tabular">{sub}</p>}
    </div>
  )
}
