import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { ChatWindow } from './components/ChatWindow'
import { MessageInput } from './components/MessageInput'
import { ToastProvider } from './components/Toast'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
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
  const [showAnalytics, setShowAnalytics] = useState(false)
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
            showAnalytics={showAnalytics}
            onNew={() => { setActiveConversationId(null); setShowAnalytics(false) }}
            onSelect={id => { setActiveConversationId(id); setShowAnalytics(false) }}
            onDelete={deleteConversation}
            onRename={renameConversation}
            onPin={pinConversation}
            onModelChange={setSelectedModel}
            onSystemPromptChange={setSystemPrompt}
            onCollapse={() => setSidebarOpen(false)}
            onToggleAnalytics={() => setShowAnalytics(v => !v)}
          />
        )}

        <main className="flex flex-col flex-1 min-w-0">
          <Header
            conversation={activeConversation}
            sidebarOpen={sidebarOpen}
            showAnalytics={showAnalytics}
            onExpandSidebar={() => setSidebarOpen(true)}
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
          {showAnalytics ? (
            <AnalyticsDashboard conversations={conversations} theme={theme} />
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
