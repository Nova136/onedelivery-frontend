import { FormEvent, useEffect, useRef, useState } from "react";
import {
    getOpenSessions,
    getEscalatedSessions,
    sendAdminMessage,
    escalateChatSessionApi,
    endChatSessionApi,
    type ChatSession,
    type ChatMessage,
    getSessionDetails,
} from "../api/agent";
import { useAuth } from "../contexts/AuthContext";
import "./AdminChatMonitor.css";

export default function AdminChatMonitor() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"open" | "escalated">("open");
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
        null,
    );
    const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (user?.role === "admin") {
            fetchSessions();
        }
    }, [user, activeTab]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sessionMessages]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [newMessage]);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data =
                activeTab === "open"
                    ? await getOpenSessions()
                    : await getEscalatedSessions();
            const sorted = data.sort(
                (a, b) =>
                    new Date(b.updatedAt || 0).getTime() -
                    new Date(a.updatedAt || 0).getTime(),
            );
            setSessions(sorted);
        } catch (err) {
            setError("Failed to load chat sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessages = async (session: ChatSession) => {
        setSelectedSession(session);
        setHistoryLoading(true);
        setError(null);
        try {
            const messages = await getSessionDetails(
                session.userId || "",
                session.sessionId,
            );
            setSessionMessages(messages);
        } catch (err) {
            setError("Failed to load session history");
            setSessionMessages([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeSessionDetails = () => {
        setSelectedSession(null);
        setSessionMessages([]);
        setNewMessage("");
    };

    const handleSendNewMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedSession || !newMessage.trim() || !user) return;

        setSending(true);
        setError(null);

        try {
            const outgoing = newMessage.trim();
            const reply = await sendAdminMessage(
                selectedSession.userId || "",
                selectedSession.sessionId,
                outgoing,
            );

            setSessionMessages((prev) => [
                ...prev,
                {
                    type: "admin",
                    content: outgoing,
                    createdAt: new Date().toISOString(),
                },
                {
                    type: "ai",
                    content: reply || "(no response)",
                    createdAt: new Date().toISOString(),
                },
            ]);
            setNewMessage("");
        } catch (err) {
            setError("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleEscalate = async (userId: string, sessionId: string) => {
        try {
            await escalateChatSessionApi(userId, sessionId);
            fetchSessions();
        } catch (err) {
            setError("Failed to escalate chat session");
        }
    };

    const handleCloseSession = async (userId: string, sessionId: string) => {
        try {
            await endChatSessionApi(userId, sessionId);
            fetchSessions();
        } catch (err) {
            setError("Failed to close chat session");
        }
    };

    if (user?.role !== "admin") {
        return <div>Access denied</div>;
    }

    return (
        <div className="admin-chat-monitor">
            <header className="page-header">
                <h1>Chat Session Monitor</h1>
                <p>Monitor and manage AI chat sessions</p>
            </header>
            <div className="tab-row">
                <button
                    className={`tab-button ${activeTab === "open" ? "active" : ""}`}
                    onClick={() => setActiveTab("open")}
                >
                    Open Sessions
                </button>
                <button
                    className={`tab-button ${activeTab === "escalated" ? "active" : ""}`}
                    onClick={() => setActiveTab("escalated")}
                >
                    Escalated Sessions
                </button>
            </div>
            {error && <div className="error">{error}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Session</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => (
                                <tr key={session.sessionId}>
                                    <td>
                                        <strong>
                                            {session.title || session.sessionId}
                                        </strong>
                                    </td>
                                    <td>
                                        {session.userName || session.userId}
                                    </td>
                                    <td>
                                        <span
                                            className={`status ${session.status?.toLowerCase()}`}
                                        >
                                            {session.status}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(
                                            session.updatedAt || "",
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    handleViewMessages(session)
                                                }
                                            >
                                                View
                                            </button>
                                            {activeTab === "open" && (
                                                <button
                                                    className="takeover-btn"
                                                    onClick={() =>
                                                        handleEscalate(
                                                            session.userId ||
                                                                "",
                                                            session.sessionId,
                                                        )
                                                    }
                                                >
                                                    Take Over
                                                </button>
                                            )}
                                            <button
                                                className="close-btn"
                                                onClick={() =>
                                                    handleCloseSession(
                                                        session.userId || "",
                                                        session.sessionId,
                                                    )
                                                }
                                            >
                                                End
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSession && (
                <div className="session-modal-overlay">
                    <div className="session-modal">
                        <div className="chat-panel-header">
                            <h2 className="chat-panel-title">
                                Session: {selectedSession.sessionId}
                            </h2>
                            <button
                                className="close-modal"
                                onClick={closeSessionDetails}
                            >
                                ×
                            </button>
                        </div>
                        <div className="chat-messages">
                            {historyLoading ? (
                                <div className="chat-empty">
                                    Loading messages...
                                </div>
                            ) : sessionMessages.length === 0 ? (
                                <div className="chat-empty">
                                    No messages for this session.
                                </div>
                            ) : (
                                sessionMessages.map((message, index) => (
                                    <div
                                        key={
                                            message.id ||
                                            `msg-${index}-${message.sequence || "no-seq"}-${Date.now()}`
                                        }
                                        className={`chat-bubble ${
                                            message.type === "human"
                                                ? "chat-bubble-user"
                                                : message.type === "admin"
                                                  ? "chat-bubble-admin"
                                                  : "chat-bubble-assistant"
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {selectedSession.status?.toLowerCase() ===
                            "escalated" && (
                            <form
                                ref={formRef}
                                className="chat-input-bar"
                                onSubmit={handleSendNewMessage}
                            >
                                <textarea
                                    ref={textareaRef}
                                    className="chat-input"
                                    placeholder="Type a message…"
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(
                                            e.target.value.slice(0, 300),
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            formRef.current?.requestSubmit();
                                        }
                                    }}
                                    disabled={sending}
                                    autoFocus
                                    rows={1}
                                    style={{
                                        minHeight: "36px",
                                        maxHeight: "120px",
                                        resize: "none",
                                    }}
                                />
                                <div className="chat-input-footer">
                                    <span className="char-count">
                                        {newMessage.length}/300
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    className="chat-send-btn"
                                    disabled={sending || !newMessage.trim()}
                                >
                                    &#9654;
                                </button>
                            </form>
                        )}

                        {error && <div className="error">{error}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
