'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TagInputProps {
  label?: string
  placeholder?: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  className?: string
}

export default function TagInput({ label, placeholder, value, onChange, suggestions = [], className = '' }: TagInputProps) {
  const [input, setInput] = React.useState('')
  const [focused, setFocused] = React.useState(false)

  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t) return
    if (value.includes(t)) return
    onChange([...value, t])
    setInput('')
  }

  const removeTag = (idx: number) => {
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && value.length) {
      e.preventDefault()
      removeTag(value.length - 1)
    }
  }

  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(input.toLowerCase()))
    .filter(s => !value.includes(s))
    .slice(0, 6)

  return (
    <div className={className}>
      {label && <div className="mb-1 text-sm font-medium text-gray-800">{label}</div>}
      <div className={`rounded-lg border bg-white p-2 ${focused ? 'ring-2 ring-ring border-ring' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-2">
          {value.map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200">
              {tag}
              <button type="button" className="text-blue-500 hover:text-blue-700" onClick={() => removeTag(idx)} aria-label={`Remove ${tag}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            className="flex-1 min-w-[120px] outline-none text-sm px-1 py-1"
            placeholder={placeholder || 'Type and press Enter'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>
      {focused && filtered.length > 0 && (
        <div className="mt-1 border rounded-lg bg-white shadow-sm overflow-hidden">
          {filtered.map((sugg) => (
            <button
              type="button"
              key={sugg}
              className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50"
              onMouseDown={(e) => { e.preventDefault(); addTag(sugg) }}
            >
              {sugg}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}




