import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useRef, useState, useCallback, useEffect } from 'react'
import { ChatWindow } from './ChatWindow'
import { MessageInput } from './MessageInput'
import type { Conversation } from '../types'

interface Props {
  conversation: Conversation | null
  isLoading: boolean
  theme: 'dark' | 'light'
  activeConversationId: string | null
  prefill: string
  prefillKey: number
  onSend: (content: string) => void
  onStop: () => void
  onRegenerate: () => void
  onEdit: () => void
}

const UAE_CENTER: [number, number] = [23.4241, 53.8478]
const UAE_ZOOM = 6
const MIN_PCT = 15
const MAX_PCT = 85

/** Invalidates Leaflet's cached size whenever splitPct changes */
function MapResizer({ splitPct }: { splitPct: number }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0)
    return () => clearTimeout(t)
  }, [map, splitPct])
  return null
}

export function OpenStreetMapView({
  conversation,
  isLoading,
  theme,
  activeConversationId,
  prefill,
  prefillKey,
  onSend,
  onStop,
  onRegenerate,
  onEdit,
}: Props) {
  const [splitPct, setSplitPct] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - left) / width) * 100
    setSplitPct(Math.min(MAX_PCT, Math.max(MIN_PCT, pct)))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left: Chatbot */}
      <div
        className="flex flex-col min-h-0 min-w-0 overflow-hidden"
        style={{ width: `${splitPct}%` }}
      >
        <ChatWindow
          conversation={conversation}
          isLoading={isLoading}
          theme={theme}
          onSend={onSend}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
        />
        <MessageInput
          onSend={onSend}
          onStop={onStop}
          isLoading={isLoading}
          prefill={prefill}
          key={prefillKey}
          conversationId={activeConversationId}
        />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="relative flex-shrink-0 flex items-center justify-center cursor-col-resize group z-10"
        style={{ width: '9px' }}
      >
        {/* visible line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/15 group-hover:bg-accent-500/70 transition-colors duration-150" />
        {/* grip dots */}
        <div className="relative flex flex-col items-center gap-[5px] z-10">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-white/25 group-hover:bg-accent-400 transition-colors duration-150"
            />
          ))}
        </div>
      </div>

      {/* Right: Map */}
      <div
        className="relative min-h-0 min-w-0 overflow-hidden"
        style={{ width: `${100 - splitPct}%` }}
      >
        <MapContainer
          center={UAE_CENTER}
          zoom={UAE_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className={theme === 'dark' ? 'map-tiles-dark' : ''}
          />
          <MapResizer splitPct={splitPct} />
        </MapContainer>
      </div>
    </div>
  )
}
