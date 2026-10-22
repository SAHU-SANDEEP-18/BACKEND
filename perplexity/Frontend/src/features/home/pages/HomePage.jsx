import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import IconEl from "../../chat/components/IconEl";
import ThemePicker from "../../chat/components/ThemePicker";
import PwaInstallButton from "../../../components/PwaInstallButton";
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

const STEPS = [
  { title: "Sign up free", desc: "No credit card, just an email." },
  { title: "Type your prompt", desc: "Chat, an image idea, or a topic." },
  { title: "Get results instantly", desc: "Ready to use or refine further." },
];

const TESTIMONIALS = [
  { initials: "AR", name: "Aisha R.", role: "Content creator", quote: "I made a full slide deck in under a minute. Didn't expect that." },
  { initials: "MK", name: "Marco K.", role: "Freelance designer", quote: "Installed it on my phone, works even when my connection drops." },
  { initials: "PS", name: "Priya S.", role: "Startup founder", quote: "Replaced three separate subscriptions with one tab. Genuinely useful." },
  { initials: "DT", name: "Daniel T.", role: "Student", quote: "The invite-link collaboration saved my group project — everyone edited the same chat live." },
  { initials: "NV", name: "Nina V.", role: "Marketing lead", quote: "Image generation is fast enough that I actually use it during meetings now." },
  { initials: "JC", name: "James C.", role: "Indie hacker", quote: "Clean UI, no clutter. Exactly what I needed to prototype ideas quickly." },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes, the free plan covers chat, image generation, and presentations." },
  { q: "Do I need to install anything?", a: "No, it works in your browser. Installing it just gives you an app-like experience." },
  { q: "Can others join my chat?", a: "Yes, share an invite link and collaborate together in real time." },
];

// Small reusable "eyebrow" label used above every section heading
const Eyebrow = ({ children }) => (
  <p
    style={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.35)",
      textAlign: "center",
      margin: "0 0 10px",
    }}
  >
    {children}
  </p>
);

const HomePage = ({ t, theme, onGetStarted, onSubmitPrompt }) => {
  const dispatch = useDispatch();
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroMode, setHeroMode] = useState("chat");
  const [openFaq, setOpenFaq] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = () => {
    if (!heroPrompt.trim()) {
      onGetStarted();
      return;
    }
    onSubmitPrompt?.(heroPrompt.trim(), heroMode);
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#fff", overflowX: "hidden", overflowY: "visible" }}>
      {/* ── Navbar ── */}
      <div style={{ position: "relative", zIndex: 10, padding: isMobile ? "12px 14px" : "16px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            gap: isMobile ? 8 : 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexShrink: 0 }}>
            <div
              style={{
                width: isMobile ? 26 : 30,
                height: isMobile ? 26 : 30,
                borderRadius: 9,
                background: t.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconEl name="sparkles" size={isMobile ? 13 : 15} color={t.textOn} />
            </div>
            <span style={{ fontSize: isMobile ? 13 : 14.5, fontWeight: 600, whiteSpace: "nowrap" }}>Nexus AI</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 12 : 28, flex: 1, minWidth: 0 }}>
            {["Features", "Pricing", "FAQ"].map((link) => (
              <span
                key={link}
                onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                style={{ fontSize: isMobile ? 11.5 : 13.5, color: "rgba(255,255,255,0.6)", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {link}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, marginLeft: "auto", flexShrink: 0 }}>
            <ThemePicker theme={theme} dispatch={dispatch} setThemeAction={setTheme} t={t} />
            <PwaInstallButton t={t} compact={isMobile} />
            <button
              onClick={onGetStarted}
              style={{
                padding: isMobile ? "7px 12px" : "8px 18px",
                borderRadius: 8,
                border: "none",
                background: t.primary,
                color: t.textOn,
                fontWeight: 600,
                fontSize: isMobile ? 11.5 : 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Log in
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ position: "relative", padding: "48px 20px 88px", textAlign: "center" }}>
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
          <h1 style={{ fontSize: isMobile ? 27 : 34, fontWeight: 600, margin: "20px 0 12px", lineHeight: 1.3 }}>
            What shall we create today?
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 36px" }}>
            Chat, generate images, or build a presentation — just describe it.
          </p>

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

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 22, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            <IconEl name="download" size={13} color="rgba(255,255,255,0.35)" />
            Installable as an app · Free to use
          </div>
        </div>
      </div>

      {/* ── Feature grid ── */}
      <div id="features" style={{ padding: "64px 20px 72px", maxWidth: 980, margin: "0 auto" }}>
        <Eyebrow>Everything you need</Eyebrow>
        <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, textAlign: "center", margin: "0 0 40px" }}>
          One workspace, three AI tools
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: f.accent ? `${t.primary}0d` : "rgba(255,255,255,0.03)",
                border: f.accent ? `1.5px solid ${t.primary}66` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "24px 22px",
                transition: "border-color 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${t.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <IconEl name={f.icon} size={20} color={t.primary} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 15.5, margin: "0 0 6px" }}>{f.title}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: "72px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 760, margin: "0 auto" }}>
        <Eyebrow>Simple to start</Eyebrow>
        <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, textAlign: "center", margin: "0 0 44px" }}>How it works</h2>
        <div style={{ position: "relative", display: "flex", gap: 16, justifyContent: "center", textAlign: "center" }}>
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                top: 22,
                left: "16%",
                right: "16%",
                height: 1,
                background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 6px, transparent 6px 12px)",
                zIndex: 0,
              }}
            />
          )}
          {STEPS.map((step, i) => (
            <div key={i} style={{ flex: 1, maxWidth: 200, position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: t.primary,
                  color: t.textOn,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  margin: "0 auto 14px",
                  boxShadow: `0 8px 24px ${t.primary}44`,
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{step.title}</p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div id="pricing" style={{ padding: "72px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 760, margin: "0 auto" }}>
        <Eyebrow>Pricing</Eyebrow>
        <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, textAlign: "center", margin: "0 0 40px" }}>Simple, transparent pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 26 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 6px", color: "rgba(255,255,255,0.6)" }}>Free</p>
            <p style={{ fontSize: 32, fontWeight: 700, margin: "0 0 18px" }}>$0</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {["Unlimited chat", "AI image generation", "Presentation builder", "Real-time collaboration"].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconEl name="check" size={13} color={t.primary} />
                  {item}
                </span>
              ))}
            </div>
            <button
              onClick={onGetStarted}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: t.primary, color: t.textOn, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
            >
              Get started
            </button>
          </div>

          <div style={{ background: `${t.primary}0d`, border: `1.5px solid ${t.primary}66`, borderRadius: 16, padding: 26, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                top: -12,
                left: 24,
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
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 6px", color: "rgba(255,255,255,0.6)" }}>Pro</p>
            <p style={{ fontSize: 32, fontWeight: 700, margin: "0 0 18px", color: "rgba(255,255,255,0.4)" }}>TBD</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {["Everything in Free", "Higher generation limits", "Priority support", "Team workspaces"].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconEl name="check" size={13} color={t.primary} />
                  {item}
                </span>
              ))}
            </div>
            <button
              disabled
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 13.5, cursor: "not-allowed" }}
            >
              Notify me
            </button>
          </div>
        </div>
      </div>

      {/* ── Testimonials (auto-scrolling marquee) ── */}
      <div style={{ padding: "72px 0", borderTop: "0.5px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          <Eyebrow>Loved by early users</Eyebrow>
          <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, textAlign: "center", margin: "0 0 40px" }}>What people are saying</h2>
        </div>

        <div
          className="nexus-marquee-mask"
          style={{ position: "relative", width: "100%", overflow: "hidden" }}
        >
          <div className="nexus-marquee-track" style={{ display: "flex", gap: 16, width: "max-content" }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((tItem, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "22px 24px",
                  width: 320,
                  flexShrink: 0,
                }}
              >
                <p style={{ fontSize: 14, margin: "0 0 18px", lineHeight: 1.65, color: "rgba(255,255,255,0.8)" }}>"{tItem.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `${t.primary}25`,
                      color: t.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11.5,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {tItem.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 600 }}>{tItem.name}</p>
                    <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>{tItem.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .nexus-marquee-mask {
            -webkit-mask-image: linear-gradient(90deg, transparent 0, black 60px, black calc(100% - 60px), transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, black 60px, black calc(100% - 60px), transparent 100%);
          }
          .nexus-marquee-track {
            animation: nexus-marquee-scroll 32s linear infinite;
          }
          .nexus-marquee-mask:hover .nexus-marquee-track {
            animation-play-state: paused;
          }
          @keyframes nexus-marquee-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ padding: "72px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", maxWidth: 680, margin: "0 auto" }}>
        <Eyebrow>Questions</Eyebrow>
        <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, textAlign: "center", margin: "0 0 32px" }}>Frequently asked</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                border: `1px solid ${openFaq === i ? `${t.primary}55` : "rgba(255,255,255,0.08)"}`,
                background: openFaq === i ? `${t.primary}0a` : "transparent",
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <p style={{ fontSize: 14.5, fontWeight: 500, margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <IconEl name={openFaq === i ? "chevronDown" : "chevronRight"} size={13} color="rgba(255,255,255,0.4)" />
              </p>
              {openFaq === i && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "10px 0 0", lineHeight: 1.65 }}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ position: "relative", textAlign: "center", padding: "80px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 260,
            background: `radial-gradient(ellipse, ${t.primary}30 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 600, margin: "0 0 10px" }}>Ready to try it?</h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", margin: "0 0 22px" }}>Free to use, no hidden costs</p>
          <button
            onClick={onGetStarted}
            style={{ padding: "13px 30px", borderRadius: 10, border: "none", background: t.primary, color: t.textOn, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 12px 30px ${t.primary}33` }}
          >
            Get started free
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px",
          borderTop: "0.5px solid rgba(255,255,255,0.08)",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>© Nexus AI</p>
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