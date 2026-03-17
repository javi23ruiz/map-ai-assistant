import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { ModelInfo } from '../types'

const BADGE_STYLES: Record<string, string> = {
  purple: 'bg-purple-500/20 text-purple-300',
  blue:   'bg-blue-500/20   text-blue-300',
  green:  'bg-emerald-500/20 text-emerald-300',
}

interface Props {
  models: ModelInfo[]
  selected: string
  onChange: (id: string) => void
}

export function ModelSelector({ models, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = models.find(m => m.id === selected)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-900 border border-white/8 hover:border-white/20 transition-colors text-sm text-gray-200"
      >
        <span className="truncate">{current?.name ?? 'Select model'}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl bg-surface-900 border border-white/10 shadow-xl overflow-hidden animate-fade-in">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false) }}
              className={`w-full flex flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${
                m.id === selected ? 'bg-accent-500/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${m.id === selected ? 'text-accent-400' : 'text-gray-200'}`}>
                  {m.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${BADGE_STYLES[m.badgeColor]}`}>
                  {m.badge}
                </span>
              </div>
              <span className="text-[11px] text-gray-500">{m.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
