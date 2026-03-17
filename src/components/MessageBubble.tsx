import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Bot, User, Copy, RefreshCw, Pencil } from 'lucide-react'
import { useState } from 'react'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '../types'

interface Props {
  message: Message
  isLast?: boolean
  onRegenerate?: () => void
  onEdit?: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={copy}
        className="p-1 rounded text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-colors"
        title="Copy message"
      >
        <Copy size={13} />
      </button>
      {copied && (
        <span className="text-[11px] font-medium text-accent-400 animate-fade-in">
          Copied!
        </span>
      )}
    </span>
  )
}

export function MessageBubble({ message, isLast, onRegenerate, onEdit }: Props) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${
        message.isStreaming && message.content === '' ? 'animate-fade-in' : 'animate-slide-up'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-accent-500 text-white'
            : 'bg-surface-800 border border-white/10 text-accent-400'
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div className={`group flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-500 text-white rounded-tr-sm'
              : 'bg-surface-800 border border-white/8 text-gray-200 rounded-tl-sm'
          }`}
        >
          {message.isStreaming && message.content === '' ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none break-words">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isBlock = match !== null
                    if (isBlock) {
                      return (
                        <SyntaxHighlighter
                          style={vscDarkPlus as Record<string, React.CSSProperties>}
                          language={match[1]}
                          PreTag="div"
                          className="!rounded-lg !text-xs !mt-2 !mb-2"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      )
                    }
                    return (
                      <code
                        className="bg-black/30 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-accent-400 ml-0.5 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Meta row */}
        {!message.isStreaming && (
          <div
            className={`flex items-center gap-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="text-[10px] text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && message.model && (
              <span className="text-[10px] text-gray-400">{message.model}</span>
            )}
            <CopyButton text={message.content} />
            {isLast && isUser && onEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-colors"
                title="Edit message"
              >
                <Pencil size={13} />
              </button>
            )}
            {isLast && !isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={13} />
              </button>
            )}
            {message.usage && !isUser && (
              <span className="text-[10px] text-gray-500">
                {message.usage.input_tokens}↑ {message.usage.output_tokens}↓
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
