import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { ChatWindow } from './components/ChatWindow'
import { MessageInput } from './components/MessageInput'
import { ToastProvider } from './components/Toast'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { OpenStreetMapView } from './components/OpenStreetMapView'
import { useChat } from './hooks/useChat'

export default function App() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    models,
    selectedModel,
    isLoading,
    systemPrompt,
    setSystemPrompt,
    setSelectedModel,
    setActiveConversationId,
    fetchModels,
    deleteConversation,
    renameConversation,
    pinConversation,
    sendMessage,
    stopStreaming,
    removeLastExchange,
  } = useChat()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [prefill, setPrefill] = useState<string>('')
  const [prefillKey, setPrefillKey] = useState(0)
  const [activeView, setActiveView] = useState<'chat' | 'analytics' | 'map'>('chat')
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => { fetchModels() }, [fetchModels])

  const handleRegenerate = useCallback(() => {
    const content = removeLastExchange()
    if (content) sendMessage(content)
  }, [removeLastExchange, sendMessage])

  const handleEdit = useCallback(() => {
    const content = removeLastExchange()
    if (content) {
      setPrefill(content)
      setPrefillKey(k => k + 1)
    }
  }, [removeLastExchange])

  return (
    <ToastProvider>
      <div className="flex h-screen bg-surface-900 text-gray-100 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            models={models}
            selectedModel={selectedModel}
            systemPrompt={systemPrompt}
            activeView={activeView}
            onNew={() => { setActiveConversationId(null); setActiveView('chat') }}
            onSelect={id => { setActiveConversationId(id); setActiveView('chat') }}
            onDelete={deleteConversation}
            onRename={renameConversation}
            onPin={pinConversation}
            onModelChange={setSelectedModel}
            onSystemPromptChange={setSystemPrompt}
            onCollapse={() => setSidebarOpen(false)}
            onSetView={setActiveView}
          />
        )}

        <main className="flex flex-col flex-1 min-w-0">
          <Header
            conversation={activeConversation}
            sidebarOpen={sidebarOpen}
            activeView={activeView}
            onExpandSidebar={() => setSidebarOpen(true)}
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
          {activeView === 'analytics' ? (
            <AnalyticsDashboard conversations={conversations} theme={theme} />
          ) : activeView === 'map' ? (
            <OpenStreetMapView
              conversation={activeConversation}
              isLoading={isLoading}
              theme={theme}
              activeConversationId={activeConversationId}
              prefill={prefill}
              prefillKey={prefillKey}
              onSend={sendMessage}
              onStop={stopStreaming}
              onRegenerate={handleRegenerate}
              onEdit={handleEdit}
            />
          ) : (
            <>
              <ChatWindow
                conversation={activeConversation}
                isLoading={isLoading}
                theme={theme}
                onSend={sendMessage}
                onRegenerate={handleRegenerate}
                onEdit={handleEdit}
              />
              <MessageInput
                onSend={sendMessage}
                onStop={stopStreaming}
                isLoading={isLoading}
                prefill={prefill}
                key={prefillKey}
                conversationId={activeConversationId}
              />
            </>
          )}
        </main>
      </div>
    </ToastProvider>
  )
}
