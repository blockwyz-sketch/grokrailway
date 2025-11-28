// client/src/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chat.css";
import logo from "./assets/grokern.png";

const RAW_API_BASE = import.meta.env.VITE_API_BASE || "";

function normalizeBase(b) {
  if (!b) return "";
  return b.trim().replace(/\/+$/, ""); // hilangkan slash belakang
}
const API_BASE = normalizeBase(RAW_API_BASE);

function uid() {
  let id = localStorage.getItem("grum_clientId");
  if (!id) {
    id = `local-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("grum_clientId", id);
  }
  return id;
}

const initialAssistant = {
  role: "assistant",
  content: "Gorkern is online. It’s grumpy — talk if you dare."
};

export default function Chat() {
  const clientId = uid();
  const [messages, setMessages] = useState([initialAssistant]);
  const [text, setText] = useState("");
  const [safeMode, setSafeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("grum_sessions") || "[]");
    setSessionsCount(list.length);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const newConversation = () => {
    setMessages([initialAssistant]);
    setText("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const saveSession = () => {
    const saved = JSON.parse(localStorage.getItem("grum_sessions") || "[]");
    const session = {
      id: `sess-${Date.now()}`,
      createdAt: new Date().toISOString(),
      messages,
      safeMode,
    };
    saved.unshift(session);
    localStorage.setItem("grum_sessions", JSON.stringify(saved.slice(0, 30)));
    setSessionsCount(saved.length);
    alert("Session disimpan.");
  };

  const restoreLatestSession = () => {
    const saved = JSON.parse(localStorage.getItem("grum_sessions") || "[]");
    if (!saved.length) return alert("Tidak ada session.");

    const latest = saved[0];
    setMessages(latest.messages || [initialAssistant]);
    setSafeMode(!!latest.safeMode);
    setTimeout(() => textareaRef.current?.focus(), 50);
    alert("Session terakhir dipulihkan.");
  };

  const sendMessage = async (from = "composer") => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (from !== "top") setText("");

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    const endpoint = API_BASE ? `${API_BASE}/api/chat` : `/api/chat`;

    try {
      const res = await axios.post(
        endpoint,
        { clientId, message: trimmed, safeMode },
        { timeout: 120000 }
      );

      const assistant = res.data?.assistant || "Aku males jawab itu.";
      setMessages(prev => [...prev, { role: "assistant", content: assistant }]);

    } catch (err) {
      console.error("Error chat:", err);

      let msg = "Server error. Something pissed me off.";

      if (err.response?.data?.assistant) {
        msg = err.response.data.assistant;
      } else {
        const errorText = err.response?.data?.error;
        const details = err.response?.data?.details;
        if (errorText || details) msg = [errorText, details].filter(Boolean).join(': ');
        else if (err.message) msg = err.message;
      }

      setMessages(prev => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth"
      }), 40);

      if (from === "top") setText("");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-app">
      <aside className="sidebar">
        <div className="profile">
          <img src={logo} alt="logo" className="profile-logo" />
          <div className="profile-title">Grokkern</div>
          <div className="profile-sub">Angry Intellegence</div>
        </div>

        <button className="btn primary" onClick={saveSession}>Save Conversation</button>
        <button className="btn ghost" onClick={newConversation}>New Conversation</button>

        <div className="history">
          <h4>History</h4>
          <div>{sessionsCount ? `${sessionsCount} saved session(s)` : "No saved sessions"}</div>
          <button className="btn ghost" onClick={restoreLatestSession} disabled={!sessionsCount}>Restore Last</button>
        </div>
      </aside>

      <main className="main-area">
        <div className="messages-wrap" ref={messagesRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
        </div>

        <div className="composer">
          <textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
          />
          <div className="composer-actions">
            <button
              type="button"
              className="send"
              onClick={sendMessage}
              disabled={loading || !text.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
