// client/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Chat from "./Chat";

/**
 * App — default export expected by the rest of the app.
 * This component is just the router wrapper for / and /chat.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
