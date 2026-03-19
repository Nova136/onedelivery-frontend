import { apiPost } from './client'

export interface ChatMessage {
  id?: string
  type: 'human' | 'ai'
  content: string
  toolCallId?: string | null
  sequence?: number
  createdAt?: string
}

export interface ChatSession {
  sessionId: string
  title?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  lastMessage?: string
  [key: string]: unknown
}

interface HandleIncomingMessageDto {
  userId: string
  sessionId: string
  message: string
}

function normalizeSession(raw: Record<string, unknown>): ChatSession {
  return {
    ...raw,
    sessionId: (raw.sessionId ?? raw.id ?? '') as string,
  } as ChatSession
}

/** POST agent/get-history-listing – list all chat sessions for a user */
export async function getHistoryListingApi(
  userId: string,
  sessionId = '',
): Promise<ChatSession[]> {
  const body: HandleIncomingMessageDto = { userId, sessionId, message: '' }
  const res = await apiPost<unknown>('agent', body, '/get-history-listing')
  let list: Record<string, unknown>[] = []
  if (Array.isArray(res)) {
    list = res
  } else if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.sessions)) list = obj.sessions
    else if (Array.isArray(obj.data)) list = obj.data
  }
  return list.map(normalizeSession)
}

/** POST agent/get-chat-history – get messages for a specific session */
export async function getChatHistoryApi(
  userId: string,
  sessionId: string,
): Promise<ChatMessage[]> {
  const body: HandleIncomingMessageDto = { userId, sessionId, message: '' }
  const res = await apiPost<ChatMessage[] | { messages?: ChatMessage[] }>('agent', body, '/get-chat-history')
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object' && Array.isArray((res as { messages?: ChatMessage[] }).messages)) {
    const msgs = (res as { messages: ChatMessage[] }).messages
    return msgs.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
  }
  return []
}

/** POST agent/chat – send a chat message and get the agent's reply */
export async function sendChatMessageApi(
  userId: string,
  sessionId: string,
  message: string,
): Promise<string> {
  const body: HandleIncomingMessageDto = { userId, sessionId, message }
  const res = await apiPost<string | { message?: string; response?: string; reply?: string }>(
    'agent',
    body,
    '/chat',
  )
  if (typeof res === 'string') return res
  if (res && typeof res === 'object') {
    const obj = res as { message?: string; response?: string; reply?: string }
    return obj.response ?? obj.reply ?? obj.message ?? ''
  }
  return ''
}
