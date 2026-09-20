import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import IconEl from "../../chat/components/IconEl";
import ThemePicker from "../../chat/components/ThemePicker";
import { setTheme } from "../../theme/theme.slice";

const MODES = [
  { key: "chat", label: "Chat", icon: "message" },
  { key: "image", label: "Image", icon: "image" },
  { key: "slides", label: "Slides", icon: "layout" },
];

const FEATURES = [
  { icon: "message", title: "Smart chat", desc: "AI conversations with real-time collaboration" },
  { icon: "image", title: "Image generation", desc: "Turn prompts into images instantly" },
  { icon: "layout", title: "Presentation builder", desc: "AI-generated slide decks in seconds" },
  { icon: "download", title: "Install as app", desc: "Works offline, installable on any device", accent: true },
  { icon: "share", title: "Invite links", desc: "Share a chat and edit it together live" },
  { icon: "folder", title: "Folders and export", desc: "Organize chats, export as PDF or Markdown" },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes, the free plan covers chat, image generation, and presentations." },
  { q: "Do I need to install anything?", a: "No, it works in your browser. Installing it just gives you an app-like experience." },
  { q: "Can others join my chat?", a: "Yes, share an invite link and collaborate together in real time." },
];

const HomePage = ({ t, theme, onGetStarted, onSubmitPrompt }) => {
  const dispatch = useDispatch();
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroMode, setHeroMode] = useState("chat");
  const [openFaq, setOpenFaq] = useState(null);

  const handleSend = () => {
    if (!heroPrompt.trim()) {
      onGetStarted();
      return;
    }
    onSubmitPrompt?.(heroPrompt.trim(), heroMode);
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#fff", overflow: "hidden" }}>
      {/* ── Navbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: t.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconEl name="sparkles" size={15} color={t.textOn} />
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>Nexus AI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Features", "Pricing", "FAQ"].map((link) => (
            <span
              key={link}
              onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
              style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
            >
              {link}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemePicker theme={theme} dispatch={dispatch} setThemeAction={setTheme} t={t} />
          <button
            onClick={onGetStarted}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: t.primary,
              color: t.textOn,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </div>
      </div>

      {/* ── Hero (glow + dots background) ── */}
      <div
        style={{
          position: "relative",
          padding: "48px 20px 80px",
          textAlign: "center",
        }}
      >
        {/* Dotted starfield */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 40%, transparent 90%)",
            pointerEvents: "none",
          }}
        />
        {/* Purple/theme glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            background: `radial-gradient(ellipse, ${t.primary}55 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, margin: "20px 0 12px", lineHeight: 1.3 }}>
            What shall we create today?
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 36px" }}>
            Chat, generate images, or build a presentation — just describe it.
          </p>

          {/* Glassy chat-input card */}
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "20px 22px 14px",
              boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${t.primary}22`,
            }}
          >
            <textarea
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                heroMode === "image"
                  ? "Describe the image you want..."
                  : heroMode === "slides"
                  ? "What's your presentation about?"
                  : "Ask me anything..."
              }
              rows={2}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "#fff",
                fontSize: 16,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setHeroMode(m.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 13px",
                      borderRadius: 20,
                      border: "none",
                      background: heroMode === m.key ? "rgba(255,255,255,0.12)" : "transparent",
                      color: heroMode === m.key ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <IconEl name={m.icon} size={13} color={heroMode === m.key ? "#fff" : "rgba(255,255,255,0.5)"} />
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSend}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: heroPrompt.trim() ? t.primary : "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <IconEl name="arrowUp" size={15} color={heroPrompt.trim() ? t.textOn : "rgba(255,255,255,0.4)"} />
              </button>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            <IconEl name="download" size={13} color="rgba(255,255,255,0.35)" />
            Installable as an app · Free to use
          </div>
        </div>
      </div>

      {/* ── Feature grid ── */}
      <div id="features" style={{ padding: "40px 20px 56px", maxWidth: 900, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "0 0 24px" }}>Everything you need</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: f.accent ? `2px solid ${t.primary}` : "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <IconEl name={f.icon} size={22} color={t.primary} />
              <p style={{ fontWeight: 600, fontSize: 15, margin: "12px 0 4px" }}>{f.title}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: "48px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 700, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "0 0 28px" }}>How it works</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", textAlign: "center" }}>
          {["Sign up free", "Type your prompt", "Get results instantly"].map((step, i) => (
            <div key={i} style={{ flex: 1, maxWidth: 160 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${t.primary}22`,
                  color: t.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: "0 auto 10px",
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: 0 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div id="pricing" style={{ padding: "48px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 700, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "0 0 28px" }}>Simple pricing</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Free</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 16px" }}>$0</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {["Unlimited chat", "AI image generation", "Presentation builder", "Real-time collaboration"].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                  <IconEl name="check" size={13} color={t.primary} />
                  {item}
                </span>
              ))}
            </div>
            <button
              onClick={onGetStarted}
              style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: t.primary, color: t.textOn, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Get started
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: `2px solid ${t.primary}`, borderRadius: 14, padding: 24, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                top: -11,
                left: 20,
                background: t.primary,
                color: t.textOn,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 6,
              }}
            >
              Coming soon
            </span>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Pro</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 16px", color: "rgba(255,255,255,0.4)" }}>TBD</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {["Everything in Free", "Higher generation limits", "Priority support", "Team workspaces"].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                  <IconEl name="check" size={13} color={t.primary} />
                  {item}
                </span>
              ))}
            </div>
            <button disabled style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 13, cursor: "not-allowed" }}>
              Notify me
            </button>
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div style={{ padding: "48px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 700, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "0 0 24px" }}>What early users say</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {["I made a full slide deck in under a minute. Didn't expect that.", "Installed it on my phone, works even when my connection drops."].map((quote, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 13.5, margin: "0 0 10px", lineHeight: 1.6, color: "rgba(255,255,255,0.75)" }}>{quote}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>— Early user</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ padding: "48px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", margin: "0 0 20px" }}>Frequently asked</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}
            >
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <IconEl name={openFaq === i ? "chevronDown" : "chevronRight"} size={13} color="rgba(255,255,255,0.4)" />
              </p>
              {openFaq === i && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "8px 0 0", lineHeight: 1.6 }}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ textAlign: "center", padding: "56px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>Ready to try it?</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 18px" }}>Free to use, no hidden costs</p>
        <button
          onClick={onGetStarted}
          style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: t.primary, color: t.textOn, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Get started free
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 900, margin: "0 auto" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>Nexus AI</p>
        <div style={{ display: "flex", gap: 18 }}>
          {["About", "Privacy", "Terms"].map((link) => (
            <span key={link} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              {link}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;