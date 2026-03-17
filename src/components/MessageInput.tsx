import { Send, Square, Mic } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (content: string) => void
  onStop: () => void
  isLoading: boolean
  disabled?: boolean
  prefill?: string
  conversationId: string | null
}

export function MessageInput({ onSend, onStop, isLoading, disabled, prefill, conversationId }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  // Auto-focus when switching conversations
  useEffect(() => {
    textareaRef.current?.focus()
  }, [conversationId])

  // Apply prefill (e.g. from Edit action)
  useEffect(() => {
    if (prefill !== undefined && prefill !== '') {
      setValue(prefill)
      textareaRef.current?.focus()
    }
  }, [prefill])

  const handleSend = () => {
    if (!value.trim() || isLoading) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pb-4 pt-2">
      <div className="max-w-[58rem] mx-auto px-4">
        <div className={`flex items-end gap-2 bg-surface-800 border-2 rounded-2xl px-4 py-3 transition-all shadow-lg ${value.trim() ? 'border-accent-500 shadow-[0_0_14px_3px_rgba(99,102,241,0.4)]' : 'border-white/10 focus-within:border-accent-500 focus-within:shadow-[0_0_14px_3px_rgba(99,102,241,0.4)]'}`}>
          {/* Voice button — disabled until voice is enabled */}
          <button
            disabled
            title="Voice input (coming soon)"
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 cursor-not-allowed mb-0.5"
          >
            <Mic size={18} />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Message… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 text-sm resize-none focus:outline-none leading-relaxed max-h-48 overflow-y-auto"
          />

          {/* Send / Stop */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors mb-0.5"
              title="Stop generation"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className="flex-shrink-0 p-2 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors mb-0.5"
              title="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-2">
          Claude can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
