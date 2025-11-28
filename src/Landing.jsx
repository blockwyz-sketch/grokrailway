// client/src/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import hero from "./assets/hero.png";    // keep your hero gif here
import "./styles.css";
import logo from "./assets/grokern.png";


export default function Landing() {
  const nav = useNavigate();

  const enterChat = () => {
    try { localStorage.setItem("seenLanding", "true"); } catch { void 0 }
    nav("/chat");
  };

  const open = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="landing-root landing-red chalk-vibe">
      <div className="matrix-bg" aria-hidden="true" />

     <header className="landing-header">
  <div className="brand">
    <img src={logo} alt="Grokkern Logo" className="grokern-logo" />

    <div>
      <h1>Gorkern</h1>
      <div className="subtitle">Angry AI • Brutally Honest</div>
    </div>
  </div>

  <div className="header-actions">
    <button className="cta" onClick={enterChat}>Try Gorkern</button>
  </div>
</header>


      <main className="landing-main">
        <section className="hero">
          <div className="hero-left">
            <h2 className="ascii-title chalk-title">Gorkern — The Irritable Assistant</h2>

            <p className="hero-copy">
              Gorkern cuts the useless parts and serves direct answers — fast, blunt,
              and with attitude. If you want sugar, go elsewhere.<br />
              CA : 2gCD8imDRAwhQ8RFAnideE2TvXBeKQZNgvzFXP3ypump
            </p>

            <div className="hero-ctas">
              <button className="cta big" onClick={enterChat}>Enter Chat</button>
              <button className="ghost" onClick={() => window.scrollTo({ top: 720, behavior: "smooth" })}>
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-right">
            <img src={hero} alt="grokkern-hero" className="hero-gif" />
          </div>
        </section>

        <section className="social-banner">
          <div className="social-icons">
<i className="bi bi-twitter-x social-icon" title="Twitter" onClick={() => open("https://x.com/gorkernn")} />



          
          </div>
          <div className="social-title">Gorkern NETWORK</div>
        </section>

        <section className="story-section">
          <div className="story-grid">
            <aside className="story-left">
              <div className="tag">project</div>
              <div className="tag">history</div>
              <div className="tag git">git:(main)</div>
              <div className="tag small">resources</div>
            </aside>

            <article className="story-right">
              <h3 className="story-title">Background & Community</h3>

              <p className="story-paragraph">
                Grokkern began as a dev experiment: not to placate, but to solve.
                Built by engineers who value speed, clarity, and blunt honesty,
                the community formed around an abrasive — but useful — persona.
              </p>

              <p className="story-paragraph">
                It’s intentionally gruff: the persona forces concise answers and fast follow-ups.
                If you need less bite, toggle Safe Mode inside chat.
              </p>

              <div className="story-meta">
                <span className="meta-key">X</span>
                <span className="meta-value">&nbsp;:@Gorkernn</span>
                <span className="meta-badge">&nbsp;&lt;follow&gt;</span>
              </div>
            </article>
          </div>
        </section>

        {/* Angry-persona features — 24 items (persona-focused, no code) */}
        <section className="features features-grid">
          {[
            ["bi-emoji-frown", "Rage Mode", "Turn up the hostility — responses get nastier."],
            ["bi-emoji-smile", "Safe Mode", "Tone it down: sarcasm stays, profanity reduced."],
            ["bi-chat-left-text", "Roast Replies", "Short, blunt answers with biting sarcasm."],
            ["bi-lightning-charge", "Instant Snapback", "Fast replies that cut to the core."],
            ["bi-thermometer-high", "Intensity Slider", "Choose mild → furious reply intensity."],
            ["bi-person-badge", "Persona Tuning", "Customize catchphrases and insult style."],
            ["bi-alarm", "24/7 Argue Mode", "Available anytime — will argue at 3AM."],
            ["bi-shield-lock", "Safety Guardrails", "Blocks threats and protected-group slurs."],
            ["bi-flag", "Alert Triggers", "Auto-flag rude replies for review (opt-in)."],
            ["bi-stars", "VIP Roast", "Exclusive brutal replies for paid tiers."],
            ["bi-people-fill", "Community Tone", "Community upvotes tune acceptable snark."],
            ["bi-bell-fill", "Priority Pings", "VIP users get faster, sharper answers."],
            ["bi-emoji-kiss", "Custom Insults", "Personalizable slurs-less insults (funny, not hateful)."],
            ["bi-chat-dots", "Session Memory", "Remembers recent conversation for follow-ups."],
            ["bi-person-lines-fill", "Persona Profiles", "Switch between ‘curmudgeon’, ‘snark’, ‘cold’."],
            ["bi-mic-fill", "Voice Commands", "Speak and get a grumpy voice reply (TTS optional)."],
            ["bi-clock-history", "Quick Recap", "Short angry summary of long threads."],
            ["bi-gear", "Admin Controls", "Control profanity list, escalation, and rate limits."],
            ["bi-shuffle", "Random Roast", "Occasional unpredictable zingers for spice."],
            ["bi-globe", "Localization", "Localize sarcasm/cultural style safely."],
            ["bi-star", "Limited Drops", "Timed persona skins & VIP seats (FOMO)."],
            ["bi-chat-left-quote", "Auto-Reply (Opt-in)", "Auto-post grumpy replies to social (opt-in only)."],
            ["bi-bar-chart-line-fill", "Analytics", "See which zingers perform best (engagement)."],
            ["bi-person-heart", "Safe Opt-Out", "Users can opt out of insults per session."]
          ].map(([icon, title, desc], i) => (
            <article key={i} className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
              </div>
              <div className="feature-body">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="landing-footer">
        <small>Gorkern — Angry Intelligence • © {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}
