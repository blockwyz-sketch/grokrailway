// client/src/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chat.css";
import logo from "./assets/grokern.png";

const API_BASE = import.meta.env.VITE_API_BASE || "";
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";


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
    alert("Session saved locally (" + new Date(session.createdAt).toLocaleString() + ").");
  };

  const restoreLatestSession = () => {
    const saved = JSON.parse(localStorage.getItem("grum_sessions") || "[]");
    if (!saved.length) {
      alert("No saved sessions.");
      return;
    }
    const latest = saved[0];
    setMessages(latest.messages || [initialAssistant]);
    setSafeMode(!!latest.safeMode);
    setTimeout(() => textareaRef.current?.focus(), 50);
    alert("Restored last saved session from " + new Date(latest.createdAt).toLocaleString());
  };

  const sendMessage = async (from = "composer") => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // If top search-pill triggered send, keep the text in composer too (send same content)
    if (from === "top") {
      // when using top send, don't clear composer so user sees it; but still send
    } else {
      setText("");
    }

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/chat`,
        { clientId, message: trimmed, safeMode },
        { timeout: 120000 }
      );

      const assistant = res.data?.assistant ?? "I don't feel like answering that.";
      setMessages(prev => [...prev, { role: "assistant", content: assistant }]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Server error. Something pissed me off." }]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 40);
      if (from === "top") {
        // if top send was used, clear text after send to avoid duplicate sends accidentally
        setText("");
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage("composer");
    }
  };

  return (
    <div className="chat-app">
      <aside className="sidebar">
        <div className="profile">
          <img src={logo} alt="Grokkern logo" className="profile-logo" />
          <div className="profile-title">Grokkern</div>
          <div className="profile-sub">Angry AI — proceed with caution</div>
        </div>

        <button className="btn primary" onClick={saveSession}>Save Conversation</button>
        <button className="btn ghost" onClick={newConversation}>New Conversation</button>

        <div className="history">
          <h4>History</h4>
          <div className="history-empty">{sessionsCount ? `${sessionsCount} saved session(s)` : "No saved sessions"}</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn ghost" onClick={restoreLatestSession} disabled={!sessionsCount}>Restore Last</button>
          </div>
        </div>

   
      </aside>

      <main className="main-area">
        {/* TOP SEARCH PILL (restored) */}
      

        {/* MESSAGES */}
        <div className="messages-wrap" ref={messagesRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
        </div>

        {/* COMPOSER (bottom) */}
        <div className="composer">
          <textarea
            ref={textareaRef}
            placeholder="Type your message — be ready for attitude."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
          />
          <div className="composer-actions">
           
             
       

            <button className="send" onClick={() => sendMessage("composer")} disabled={loading || !text.trim()}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
