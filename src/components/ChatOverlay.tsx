import { io, type Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import {
    getHistoryListingApi,
    getChatHistoryApi,
    type ChatSession,
    type ChatMessage,
} from "../api/agent";
import "./ChatOverlay.css";
import { FormEvent, useEffect, useRef, useState } from "react";

const CHAT_SESSION_KEY = "onedelivery_chat_session";

const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3010/ws";

function loadPersistedSessionId(): string | null {
    return sessionStorage.getItem(CHAT_SESSION_KEY) || null;
}

function persistSessionId(id: string | null) {
    if (id) {
        sessionStorage.setItem(CHAT_SESSION_KEY, id);
    } else {
        sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
}

export default function ChatOverlay() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<"sessions" | "chat">(() =>
        loadPersistedSessionId() ? "chat" : "sessions",
    );

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const [activeSessionId, setActiveSessionId] = useState<string | null>(
        loadPersistedSessionId,
    );
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [wsError, setWsError] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    // Holds the sessionId to use when opening the next WS connection.
    // Updated synchronously before state changes so the effect reads the right value.
    const chatSessionIdRef = useRef<string | null>(loadPersistedSessionId());

    const userId = user?.id ?? "";

    useEffect(() => {
        if (!user?.id) {
            logout();
        }
    }, [user, logout]);

    // Manage the WebSocket connection whenever the chat view is active.
    useEffect(() => {
        if (!open || view !== "chat") {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const sessionId = chatSessionIdRef.current;

        // Connect to the '/ws' namespace
        const socket = io(WS_BASE_URL, {
            query: sessionId ? { sessionId } : {},
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            setWsError(null);
        });

        socket.on("message", (data) => {
            if (data.type === "CHAT_RESPONSE") {
                // The server is authoritative for the response content.
                const { message } = data;
                setMessages((prev) => [
                    ...prev,
                    { type: "ai", content: String(message) },
                ]);
                setSending(false);
            } else if (data.type === "ERROR") {
                setWsError(data.message ?? "An unknown error occurred.");
                setSending(false);
            }
        });

        socket.on("connect_error", (err) => {
            setWsError(`Connection error: ${err.message}. Please try again.`);
            setSending(false);
        });

        socket.on("disconnect", (reason) => {
            // Only show an error if it's not a manual disconnect
            if (reason !== "io client disconnect") {
                setWsError(`Disconnected: ${reason}. Reconnecting...`);
            }
            socketRef.current = null;
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, view]);

    // Restore chat history over HTTP when reopening a persisted session
    useEffect(() => {
        if (open && view === "chat" && activeSessionId && userId) {
            setMessagesLoading(true);
            getChatHistoryApi(userId, activeSessionId)
                .then(setMessages)
                .catch(() => setMessages([]))
                .finally(() => setMessagesLoading(false));
        }
        // only on initial open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (open && view === "sessions" && userId) {
            setSessionsLoading(true);
            getHistoryListingApi(userId)
                .then(setSessions)
                .catch(() => setSessions([]))
                .finally(() => setSessionsLoading(false));
        }
    }, [open, view, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function selectSession(sessionId: string) {
        chatSessionIdRef.current = sessionId;
        setActiveSessionId(sessionId);
        persistSessionId(sessionId);
        setView("chat");
        setMessages([]);
        setWsError(null);
        setMessagesLoading(true);
        getChatHistoryApi(userId, sessionId)
            .then(setMessages)
            .catch(() => setMessages([]))
            .finally(() => setMessagesLoading(false));
    }

    function startNewChat() {
        const newSessionId = crypto.randomUUID();
        chatSessionIdRef.current = newSessionId;
        setActiveSessionId(newSessionId);
        persistSessionId(newSessionId);
        setMessages([]);
        setWsError(null);
        setView("chat");
    }

    function goBack() {
        socketRef.current?.disconnect();
        socketRef.current = null;
        chatSessionIdRef.current = null;
        setView("sessions");
        setActiveSessionId(null);
        persistSessionId(null);
        setMessages([]);
        setWsError(null);
    }

    function handleSend(e: FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        const socket = socketRef.current;
        if (!socket || !socket.connected) {
            setWsError("Not connected. Please wait and try again.");
            return;
        }

        const userMsg: ChatMessage = { type: "human", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setSending(true);
        setWsError(null);

        socket.emit("message", {
            type: "CHAT_MESSAGE",
            message: text,
            userId,
        });
    }

    if (!user) return null;

    return (
        <>
            <button
                type="button"
                className="chat-fab"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close chat" : "Open chat"}
            >
                {open ? "\u2715" : "\uD83D\uDCAC"}
            </button>

            {open && (
                <div className="chat-panel">
                    {view === "sessions" ? (
                        <>
                            <div className="chat-panel-header">
                                <span className="chat-panel-title">
                                    Conversations
                                </span>
                                <button
                                    type="button"
                                    className="chat-new-btn"
                                    onClick={startNewChat}
                                >
                                    + New chat
                                </button>
                            </div>

                            <div className="chat-sessions">
                                {sessionsLoading ? (
                                    <p className="chat-empty">Loading…</p>
                                ) : sessions.length === 0 ? (
                                    <p className="chat-empty">
                                        No conversations yet. Start a new chat!
                                    </p>
                                ) : (
                                    sessions.map((s) => (
                                        <button
                                            key={s.sessionId}
                                            type="button"
                                            className="chat-session-item"
                                            onClick={() =>
                                                selectSession(s.sessionId)
                                            }
                                        >
                                            <span className="chat-session-title">
                                                {s.title ||
                                                    s.sessionId.slice(0, 8)}
                                            </span>
                                            {s.lastMessage && (
                                                <span className="chat-session-preview">
                                                    {s.lastMessage}
                                                </span>
                                            )}
                                            {s.createdAt && (
                                                <span className="chat-session-date">
                                                    {new Date(
                                                        s.createdAt,
                                                    ).toLocaleDateString()}
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
                                <button
                                    type="button"
                                    className="chat-back-btn"
                                    onClick={goBack}
                                >
                                    &#8592;
                                </button>
                                <span className="chat-panel-title">Chat</span>
                            </div>

                            <div className="chat-messages">
                                {messagesLoading && (
                                    <p className="chat-empty">
                                        Loading messages…
                                    </p>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`chat-bubble ${msg.type === "human" ? "chat-bubble-user" : "chat-bubble-assistant"}`}
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
                                {wsError && (
                                    <p className="chat-error">{wsError}</p>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            <form
                                className="chat-input-bar"
                                onSubmit={handleSend}
                            >
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
    );
}
