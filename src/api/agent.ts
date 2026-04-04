import { apiGet, apiPost } from "./client";

export interface ChatMessage {
    id?: string;
    type: "human" | "ai" | "admin";
    content: string;
    toolCallId?: string | null;
    sequence?: number;
    createdAt?: string;
}

export interface ChatSession {
    sessionId: string;
    title?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    lastMessage?: string;
    userId?: string;
    userName?: string;
    [key: string]: unknown;
}

interface HandleIncomingMessageDto {
    userId: string;
    sessionId: string;
    message: string;
}

function normalizeSession(raw: Record<string, unknown>): ChatSession {
    return {
        ...raw,
        sessionId: (raw.sessionId ?? raw.id ?? "") as string,
    } as ChatSession;
}

/** POST agent/get-history-listing – list all chat sessions for a user */
export async function getHistoryListingApi(
    userId: string,
    sessionId = "",
): Promise<ChatSession[]> {
    const body: HandleIncomingMessageDto = { userId, sessionId, message: "" };
    const res = await apiPost<unknown>("agent", body, "/get-history-listing");
    let list: Record<string, unknown>[] = [];
    if (Array.isArray(res)) {
        list = res;
    } else if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.sessions)) list = obj.sessions;
        else if (Array.isArray(obj.data)) list = obj.data;
    }
    return list.map(normalizeSession);
}

/** POST agent/get-chat-history – get messages for a specific session */
export async function getChatHistoryApi(
    userId: string,
    sessionId: string,
): Promise<ChatMessage[]> {
    const body: HandleIncomingMessageDto = { userId, sessionId, message: "" };
    const res = await apiPost<ChatMessage[] | { messages?: ChatMessage[] }>(
        "agent",
        body,
        "/get-chat-history",
    );
    if (Array.isArray(res)) return res;
    if (
        res &&
        typeof res === "object" &&
        Array.isArray((res as { messages?: ChatMessage[] }).messages)
    ) {
        const msgs = (res as { messages: ChatMessage[] }).messages;
        return msgs;
    }
    return [];
}

/** POST agent/send-message - send a chat message */
export async function sendUserMessage(
    userId: string,
    sessionId: string,
    message: string,
): Promise<string> {
    const body: HandleIncomingMessageDto = { userId, sessionId, message };
    const res = await apiPost<
        string | { message?: string; response?: string; reply?: string }
    >("agent", body, "/chat");
    if (typeof res === "string") return res;
    if (res && typeof res === "object") {
        const obj = res as {
            message?: string;
            response?: string;
            reply?: string;
        };
        return obj.response ?? obj.reply ?? obj.message ?? "";
    }
    return "";
}

/** POST agent/send-message - send a chat message */
export async function sendAdminMessage(
    userId: string,
    sessionId: string,
    message: string,
): Promise<string> {
    const body: HandleIncomingMessageDto = { userId, sessionId, message };
    const res = await apiPost<
        string | { message?: string; response?: string; reply?: string }
    >("agent", body, "/chat-admin");
    if (typeof res === "string") return res;
    if (res && typeof res === "object") {
        const obj = res as {
            message?: string;
            response?: string;
            reply?: string;
        };
        return obj.response ?? obj.reply ?? obj.message ?? "";
    }
    return "";
}

export async function getOpenSessions(): Promise<ChatSession[]> {
    const res = await apiGet<unknown>("agent", "/get-open-sessions");
    let list: Record<string, unknown>[] = [];
    if (Array.isArray(res)) {
        list = res;
    } else if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.sessions)) list = obj.sessions;
        else if (Array.isArray(obj.data)) list = obj.data;
    }
    return list.map(normalizeSession);
}

export async function getEscalatedSessions(): Promise<ChatSession[]> {
    const res = await apiGet<unknown>("agent", "/get-escalated-sessions");
    let list: Record<string, unknown>[] = [];
    if (Array.isArray(res)) {
        list = res;
    } else if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.sessions)) list = obj.sessions;
        else if (Array.isArray(obj.data)) list = obj.data;
    }
    return list.map(normalizeSession);
}

/** POST agent/escalate-chat-session – escalate a chat session */
export async function escalateChatSessionApi(
    userId: string,
    sessionId: string,
): Promise<void> {
    await apiPost("agent", { userId, sessionId }, "/escalate-chat-session");
}

/** POST agent/end-chat-session – end a chat session */
export async function endChatSessionApi(
    userId: string,
    sessionId: string,
): Promise<void> {
    await apiPost("agent", { userId, sessionId }, "/end-chat-session");
}

/** POST agent/get-session-details – get details for a specific session */
export async function getSessionDetails(
    userId: string,
    sessionId: string,
): Promise<ChatMessage[]> {
    const body: HandleIncomingMessageDto = { userId, sessionId, message: "" };
    const res = await apiPost<ChatMessage[] | { messages?: ChatMessage[] }>(
        "agent",
        body,
        "/get-session-details",
    );
    if (Array.isArray(res)) return res;
    if (
        res &&
        typeof res === "object" &&
        Array.isArray((res as { messages?: ChatMessage[] }).messages)
    ) {
        const msgs = (res as { messages: ChatMessage[] }).messages;
        return msgs;
    }
    return [];
}
