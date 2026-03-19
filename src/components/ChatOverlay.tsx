import { useState, useEffect, useRef, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getHistoryListingApi,
  getChatHistoryApi,
  sendChatMessageApi,
  type ChatSession,
  type ChatMessage,
} from '../api/agent'
import './ChatOverlay.css'

const CHAT_SESSION_KEY = 'onedelivery_chat_session'

function generateSessionId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function loadPersistedSessionId(): string | null {
  return sessionStorage.getItem(CHAT_SESSION_KEY) || null
}

function persistSessionId(id: string | null) {
  if (id) {
    sessionStorage.setItem(CHAT_SESSION_KEY, id)
  } else {
    sessionStorage.removeItem(CHAT_SESSION_KEY)
  }
}

export default function ChatOverlay() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'sessions' | 'chat'>(() =>
    loadPersistedSessionId() ? 'chat' : 'sessions',
  )

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  const [activeSessionId, setActiveSessionId] = useState<string | null>(loadPersistedSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const userId = user?.id ?? ''

  useEffect(() => {
    if (!user?.id) {
      logout()
    }
  }, [user, logout])

  // Restore chat history when reopening with a persisted session
  useEffect(() => {
    if (open && view === 'chat' && activeSessionId && userId) {
      setMessagesLoading(true)
      getChatHistoryApi(userId, activeSessionId)
        .then(setMessages)
        .catch(() => setMessages([]))
        .finally(() => setMessagesLoading(false))
    }
  // only on initial open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open && view === 'sessions' && userId) {
      setSessionsLoading(true)
      getHistoryListingApi(userId)
        .then(setSessions)
        .catch(() => setSessions([]))
        .finally(() => setSessionsLoading(false))
    }
  }, [open, view, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function selectSession(sessionId: string) {
    setActiveSessionId(sessionId)
    persistSessionId(sessionId)
    setView('chat')
    setMessages([])
    setMessagesLoading(true)
    getChatHistoryApi(userId, sessionId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false))
  }

  function startNewChat() {
    const newId = generateSessionId()
    setActiveSessionId(newId)
    persistSessionId(newId)
    setMessages([])
    setView('chat')
  }

  function goBack() {
    setView('sessions')
    setActiveSessionId(null)
    persistSessionId(null)
    setMessages([])
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !activeSessionId || sending) return

    const userMsg: ChatMessage = { type: 'human', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const reply = await sendChatMessageApi(userId, activeSessionId, text)
      setMessages((prev) => [...prev, { type: 'ai', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '\u2715' : '\uD83D\uDCAC'}
      </button>

      {open && (
        <div className="chat-panel">
          {view === 'sessions' ? (
            <>
              <div className="chat-panel-header">
                <span className="chat-panel-title">Conversations</span>
                <button type="button" className="chat-new-btn" onClick={startNewChat}>
                  + New chat
                </button>
              </div>

              <div className="chat-sessions">
                {sessionsLoading ? (
                  <p className="chat-empty">Loading…</p>
                ) : sessions.length === 0 ? (
                  <p className="chat-empty">No conversations yet. Start a new chat!</p>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.sessionId}
                      type="button"
                      className="chat-session-item"
                      onClick={() => selectSession(s.sessionId)}
                    >
                      <span className="chat-session-title">
                        {s.title || s.sessionId.slice(0, 8)}
                      </span>
                      {s.lastMessage && (
                        <span className="chat-session-preview">{s.lastMessage}</span>
                      )}
                      {s.createdAt && (
                        <span className="chat-session-date">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="chat-panel-header">
                <button type="button" className="chat-back-btn" onClick={goBack}>
                  &#8592;
                </button>
                <span className="chat-panel-title">Chat</span>
              </div>

              <div className="chat-messages">
                {messagesLoading && <p className="chat-empty">Loading messages…</p>}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-bubble ${msg.type === 'human' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {sending && (
                  <div className="chat-bubble chat-bubble-assistant chat-typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  autoFocus
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={sending || !input.trim()}
                >
                  &#9654;
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
