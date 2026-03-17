import { useEffect, useRef, useState, useCallback } from 'react'
import { Bot, ChevronDown } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import type { Conversation } from '../types'

interface Props {
  conversation: Conversation | null
  isLoading: boolean
  onSend: (content: string) => void
  onRegenerate: () => void
  onEdit: () => void
}

export function ChatWindow({ conversation, isLoading, onSend, onRegenerate, onEdit }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const nearBottomRef = useRef(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const dist = el!.scrollHeight - el!.scrollTop - el!.clientHeight
      nearBottomRef.current = dist < 120
      setShowScrollBtn(dist > 120)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (nearBottomRef.current) scrollToBottom('smooth')
  }, [conversation?.messages.length, isLoading, scrollToBottom])

  useEffect(() => {
    scrollToBottom('instant')
    setShowScrollBtn(false)
    nearBottomRef.current = true
  }, [conversation?.id, scrollToBottom])

  if (!conversation || conversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
          <Bot size={28} className="text-accent-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-1">Voice Model Lab</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Test different Claude models. Voice capabilities coming soon.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="px-3 py-2 text-xs text-gray-400 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 hover:text-gray-200 hover:border-white/15 transition-all text-left cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const msgs = conversation.messages
  const lastNonStreamingIdx = (() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (!msgs[i].isStreaming) return i
    }
    return -1
  })()

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto py-6 scroll-smooth scrollbar-thin"
      >
        <div className="max-w-[58rem] mx-auto px-6 space-y-6">
          {msgs.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLast={i === lastNonStreamingIdx}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 border border-white/12 text-xs text-gray-300 shadow-lg hover:bg-surface-700 hover:text-white transition-all animate-fade-in"
        >
          <ChevronDown size={13} />
          Scroll to latest
        </button>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Compare writing styles',
  'Explain a concept simply',
  'Brainstorm ideas',
  'Debug my code',
]
