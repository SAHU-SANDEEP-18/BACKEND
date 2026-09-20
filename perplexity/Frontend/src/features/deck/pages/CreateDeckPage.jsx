import { useState, useEffect } from "react";
import { generateOutline, createDeck, getMyDecks, deleteDeck } from "../service/deck.api";
import IconEl from "../../chat/components/IconEl";
import ConfirmDialog from "../../chat/components/ConfirmDialog";

const getPollinationsUrl = (prompt, seed) => {
  const cleanPrompt = (prompt || "modern presentation visual").trim();
  const enhancedPrompt = `${cleanPrompt}, highly detailed presentation illustration, 8k resolution, minimalist aesthetic`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=576&model=flux&seed=${seed}`;
};

const CreateDeckPage = ({ t }) => {
  const [activeTab, setActiveTab] = useState("create"); // "create" | "saved"
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outlineTitle, setOutlineTitle] = useState("");
  const [slides, setSlides] = useState(null); // Array of slide objects
  const [imageLoadingMap, setImageLoadingMap] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Saved Decks state ──
  const [savedDecks, setSavedDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState(null);

  // ── Fullscreen Presentation Mode ──
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(null); // null when not presenting
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(4); // Duration in seconds per slide

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedDecks();
    }
  }, [activeTab]);

  const fetchSavedDecks = async () => {
    setLoadingDecks(true);
    try {
      const data = await getMyDecks();
      setSavedDecks(data.decks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDecks(false);
    }
  };

  // ── Nexus AI outline generate + slide images map ──
  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setOutlineTitle("");
    setSlides(null);
    setImageLoadingMap({});

    try {
      const data = await generateOutline(topic.trim(), slideCount);
      setOutlineTitle(data.title || topic.trim());

      const initialLoadingMap = {};
      const generatedSlides = data.slides.map((s, idx) => {
        const seed = Math.floor(Math.random() * 2147483647);
        const imageUrl = getPollinationsUrl(s.imagePrompt, seed);
        initialLoadingMap[idx] = true;

        return {
          id: `slide-${idx}-${Date.now()}`,
          title: s.title,
          bullets: s.bullets || [],
          imagePrompt: s.imagePrompt || s.title,
          imageUrl: imageUrl,
          imageSeed: seed,
        };
      });

      setImageLoadingMap(initialLoadingMap);
      setSlides(generatedSlides);
    } catch (err) {
      setError(err.message || "Failed to generate presentation outline");
    } finally {
      setLoading(false);
    }
  };

  // ── Specific slide image regenerate karo (Nexus AI) ──
  const handleRegenerateSlideImage = (index) => {
    if (!slides || !slides[index]) return;
    const newSeed = Math.floor(Math.random() * 2147483647);
    const newUrl = getPollinationsUrl(slides[index].imagePrompt, newSeed);

    setImageLoadingMap((prev) => ({ ...prev, [index]: true }));
    setSlides((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, imageUrl: newUrl, imageSeed: newSeed } : s
      )
    );
  };

  // ── Deck save karo database mein ──
  const handleSaveDeck = async () => {
    if (!slides || saving) return;
    setSaving(true);
    setError("");

    try {
      const formattedSlidesForDb = slides.map((s, i) => ({
        id: s.id,
        elements: [
          {
            id: `title-${i}`,
            type: "text",
            content: s.title,
            x: 40,
            y: 30,
            width: 720,
            fontSize: 24,
          },
          {
            id: `bullets-${i}`,
            type: "text",
            content: s.bullets.map((b) => `• ${b}`).join("\n"),
            x: 40,
            y: 90,
            width: 420,
            fontSize: 15,
          },
          {
            id: `image-${i}`,
            type: "image",
            src: s.imageUrl,
            x: 480,
            y: 90,
            width: 280,
            height: 200,
          },
        ],
      }));

      await createDeck(outlineTitle, topic.trim(), formattedSlidesForDb);
      setActiveTab("saved");
    } catch (err) {
      console.error(err);
      setError("Failed to save presentation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Saved Deck delete handler ──
  const handleDeleteDeck = async (deckId) => {
    try {
      await deleteDeck(deckId);
      setSavedDecks((prev) => prev.filter((d) => d._id !== deckId));
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteDeck(null);
    }
  };

  // ── Keyboard shortcuts for Slideshow ──
  useEffect(() => {
    if (presentationSlideIndex === null || !slides) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        setPresentationSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setPresentationSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setPresentationSlideIndex(null);
        setIsPlayingSlideshow(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationSlideIndex, slides]);

  // ── Auto-play slideshow timer ──
  useEffect(() => {
    if (!isPlayingSlideshow || presentationSlideIndex === null || !slides) return;
    const timer = setInterval(() => {
      setPresentationSlideIndex((prev) => {
        if (prev >= slides.length - 1) {
          setIsPlayingSlideshow(false);
          return prev;
        }
        return prev + 1;
      });
    }, autoplaySpeed * 1000);

    return () => clearInterval(timer);
  }, [isPlayingSlideshow, presentationSlideIndex, slides, autoplaySpeed]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, color: "#fff", background: t.bg }}>
      {/* Header & Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>
            Presentation Generator
          </h2>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>
            Powered by Nexus AI Presentation Engine
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.06)", padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "create" ? t.primary : "transparent",
              color: activeTab === "create" ? t.textOn : "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "saved" ? t.primary : "transparent",
              color: activeTab === "saved" ? t.textOn : "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            Saved Presentations
          </button>
        </div>
      </div>

      {/* Tab 1: Create Presentation */}
      {activeTab === "create" && (
        <>
          {/* Topic & Slide Count Input bar */}
          <div
            style={{
              background: t.sidebar || "rgba(255,255,255,0.04)",
              border: `1px solid ${t.primary}33`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Enter presentation topic (e.g. 'Future of Renewable Energy')..."
                style={{
                  flex: 1,
                  minWidth: 260,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1px solid ${t.primary}33`,
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  outline: "none",
                  fontSize: 13.5,
                }}
              />
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                style={{
                  padding: "0 12px",
                  borderRadius: 8,
                  border: `1px solid ${t.primary}33`,
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                }}
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n} style={{ background: t.sidebar || "#1e150a", color: "#fff" }}>
                    {n} Slides
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                style={{
                  padding: "0 22px",
                  height: 42,
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "rgba(255,255,255,0.1)" : t.primary,
                  color: loading ? "rgba(255,255,255,0.4)" : t.textOn,
                  cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "nexus-spin 0.8s linear infinite",
                      }}
                    />
                    Nexus AI Generating...
                  </>
                ) : (
                  <>
                    <IconEl name="wand" size={16} color={t.textOn} />
                    Generate Presentation
                  </>
                )}
              </button>
            </div>

            {/* Quick Topic Ideas */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>Try ideas:</span>
              {[
                "AI in Healthcare",
                "Electric Vehicle Trends 2026",
                "Startup Pitch Deck",
                "Space Exploration History",
              ].map((idea) => (
                <button
                  key={idea}
                  onClick={() => setTopic(idea)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${t.primary}22`,
                    borderRadius: 20,
                    padding: "4px 10px",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${t.primary}33`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Generated Slides View */}
          {slides && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#fff" }}>
                    {outlineTitle}
                  </h3>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {slides.length} slides generated by Nexus AI
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setPresentationSlideIndex(0);
                      setIsPlayingSlideshow(false);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: `1px solid ${t.primary}44`,
                      background: `${t.primary}18`,
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <IconEl name="presentation" size={14} color={t.primary} />
                    Start Slideshow
                  </button>

                  <button
                    onClick={handleSaveDeck}
                    disabled={saving}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 8,
                      border: "none",
                      background: t.primary,
                      color: t.textOn,
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    {saving ? "Saving..." : "Save Presentation"}
                  </button>
                </div>
              </div>

              {/* Slides Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    style={{
                      background: t.sidebar || "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      border: `1px solid ${t.primary}33`,
                      padding: 24,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                        borderBottom: `1px solid ${t.primary}22`,
                        paddingBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: t.primary,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        Slide {i + 1} of {slides.length}
                      </span>

                      <button
                        onClick={() => handleRegenerateSlideImage(i)}
                        title="Regenerate Image with Nexus AI"
                        style={{
                          background: `${t.primary}18`,
                          border: `1px solid ${t.primary}33`,
                          borderRadius: 6,
                          padding: "4px 10px",
                          color: "rgba(255,255,255,0.85)",
                          fontSize: 11.5,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${t.primary}33`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = `${t.primary}18`)}
                      >
                        <IconEl name="reload" size={11} color={t.primary} />
                        Regenerate Image
                      </button>
                    </div>

                    {/* Slide Content: Left Text, Right Nexus Image */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {/* Left: Text Content */}
                      <div style={{ flex: "1 1 340px", minWidth: 280 }}>
                        <h4
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#fff",
                            margin: "0 0 12px 0",
                            lineHeight: 1.3,
                          }}
                        >
                          {slide.title}
                        </h4>

                        <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
                          {slide.bullets.map((b, bIdx) => (
                            <li
                              key={bIdx}
                              style={{
                                display: "flex",
                                gap: 10,
                                marginBottom: 10,
                                fontSize: 13.5,
                                color: "rgba(255,255,255,0.85)",
                                lineHeight: 1.5,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: t.primary,
                                  marginTop: 7,
                                  flexShrink: 0,
                                }}
                              />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Nexus AI Image Container */}
                      <div
                        style={{
                          width: 280,
                          maxWidth: "100%",
                          aspectRatio: "16 / 9",
                          borderRadius: 10,
                          background: "rgba(0,0,0,0.3)",
                          border: `1px solid ${t.primary}22`,
                          overflow: "hidden",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        {/* Shimmer loading state */}
                        {imageLoadingMap[i] && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255,255,255,0.03)",
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: `2px solid ${t.primary}33`,
                                borderTopColor: t.primary,
                                animation: "nexus-spin 0.8s linear infinite",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: `linear-gradient(90deg, transparent, ${t.primary}0a, transparent)`,
                                animation: "nexus-shimmer 1.4s ease-in-out infinite",
                              }}
                            />
                          </div>
                        )}

                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          onLoad={() => setImageLoadingMap((prev) => ({ ...prev, [i]: false }))}
                          onError={() => setImageLoadingMap((prev) => ({ ...prev, [i]: false }))}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: imageLoadingMap[i] ? "none" : "block",
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            bottom: 6,
                            right: 6,
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "blur(4px)",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 9.5,
                            color: "rgba(255,255,255,0.8)",
                            pointerEvents: "none",
                            border: `1px solid ${t.primary}33`,
                          }}
                        >
                          Nexus AI
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Saved Presentations */}
      {activeTab === "saved" && (
        <div>
          {loadingDecks ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.5)" }}>
              Loading saved presentations...
            </div>
          ) : savedDecks.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: t.sidebar || "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${t.primary}22` }}>
              <IconEl name="presentation" size={32} color={t.primary} />
              <p style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                No saved presentations yet.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: t.primary,
                  color: t.textOn,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  marginTop: 8,
                }}
              >
                Create your first presentation
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {savedDecks.map((deck) => (
                <div
                  key={deck._id}
                  style={{
                    background: t.sidebar || "rgba(255,255,255,0.03)",
                    border: `1px solid ${t.primary}33`,
                    borderRadius: 12,
                    padding: 16,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0, flex: 1, paddingRight: 8 }}>
                      {deck.title}
                    </h4>
                    <button
                      onClick={() => setConfirmDeleteDeck(deck)}
                      title="Delete deck"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <IconEl name="trash" size={14} color="rgba(255,120,120,0.8)" />
                    </button>
                  </div>

                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px 0" }}>
                    Topic: {deck.prompt || "Custom presentation"} • {deck.slides?.length || 0} slides
                  </p>

                  <button
                    onClick={() => {
                      const loadedSlides = deck.slides.map((s, idx) => {
                        const titleEl = s.elements.find((e) => e.type === "text" && e.id.startsWith("title"));
                        const bulletsEl = s.elements.find((e) => e.type === "text" && e.id.startsWith("bullets"));
                        const imageEl = s.elements.find((e) => e.type === "image");

                        const bulletsArray = bulletsEl?.content
                          ? bulletsEl.content.split("\n").map((b) => b.replace(/^•\s*/, ""))
                          : [];

                        return {
                          id: s.id || `slide-${idx}`,
                          title: titleEl?.content || `Slide ${idx + 1}`,
                          bullets: bulletsArray,
                          imagePrompt: titleEl?.content || "",
                          imageUrl: imageEl?.src || getPollinationsUrl(titleEl?.content || "visual", idx + 100),
                        };
                      });

                      setOutlineTitle(deck.title);
                      setSlides(loadedSlides);
                      setActiveTab("create");
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 0",
                      borderRadius: 6,
                      border: `1px solid ${t.primary}44`,
                      background: `${t.primary}18`,
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${t.primary}18`)}
                  >
                    Open & Present
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ultra-Redesigned Premium Fullscreen Presentation Modal */}
      {presentationSlideIndex !== null && slides && slides[presentationSlideIndex] && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: t.bg ? `${t.bg}f2` : "rgba(5, 5, 8, 0.96)",
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 36px",
            boxSizing: "border-box",
          }}
        >
          {/* Top Progress Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((presentationSlideIndex + 1) / slides.length) * 100}%`,
                background: `linear-gradient(90deg, ${t.primary}, #ffffff)`,
                transition: "width 0.4s ease-out",
                boxShadow: `0 0 10px ${t.primary}`,
              }}
            />
          </div>

          {/* Top Header Bar */}
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  background: `${t.primary}22`,
                  border: `1px solid ${t.primary}44`,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.primary,
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconEl name="sparkles" size={12} color={t.primary} />
                NEXUS AI PRESENTATION
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                {outlineTitle}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.08)",
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: `1px solid ${t.primary}33`,
                }}
              >
                Slide {presentationSlideIndex + 1} of {slides.length}
              </span>

              <button
                onClick={() => {
                  setPresentationSlideIndex(null);
                  setIsPlayingSlideshow(false);
                }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <IconEl name="close" size={16} color="#fff" />
              </button>
            </div>
          </div>

          {/* Center Immersive 16:9 Presentation Frame */}
          <div
            style={{
              width: "100%",
              maxWidth: 1100,
              aspectRatio: "16 / 9",
              maxHeight: "calc(100vh - 160px)",
              background: t.sidebar || "#101018",
              border: `1px solid ${t.primary}44`,
              borderRadius: 20,
              padding: "44px 52px",
              boxSizing: "border-box",
              display: "flex",
              gap: 40,
              alignItems: "center",
              boxShadow: `0 30px 90px rgba(0,0,0,0.9), 0 0 50px ${t.primary}18`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Left Content Column */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.primary,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                SLIDE {String(presentationSlideIndex + 1).padStart(2, "0")}
              </div>

              <h2
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 24px 0",
                  lineHeight: 1.25,
                }}
              >
                {slides[presentationSlideIndex].title}
              </h2>

              <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
                {slides[presentationSlideIndex].bullets.map((b, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 14,
                      marginBottom: 16,
                      fontSize: 16.5,
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: t.primary,
                        marginTop: 9,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${t.primary}`,
                      }}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Nexus Image Frame */}
            <div
              style={{
                width: "42%",
                maxWidth: 440,
                aspectRatio: "16 / 9",
                borderRadius: 14,
                overflow: "hidden",
                border: `1px solid ${t.primary}33`,
                boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <img
                src={slides[presentationSlideIndex].imageUrl}
                alt={slides[presentationSlideIndex].title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(6px)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  border: `1px solid ${t.primary}33`,
                }}
              >
                Nexus AI Visual
              </div>
            </div>
          </div>

          {/* Bottom Dock Control Panel */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: t.sidebar || "rgba(18, 18, 26, 0.8)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${t.primary}33`,
              borderRadius: 30,
              padding: "8px 24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* Previous Button */}
            <button
              onClick={() => setPresentationSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={presentationSlideIndex === 0}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                background: presentationSlideIndex === 0 ? "transparent" : "rgba(255,255,255,0.08)",
                color: presentationSlideIndex === 0 ? "rgba(255,255,255,0.2)" : "#fff",
                cursor: presentationSlideIndex === 0 ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              Previous
            </button>

            {/* Clickable Slide Dots */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPresentationSlideIndex(idx)}
                  title={`Go to slide ${idx + 1}`}
                  style={{
                    width: presentationSlideIndex === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: presentationSlideIndex === idx ? t.primary : "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Auto-Play Slideshow Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => setIsPlayingSlideshow((prev) => !prev)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1px solid ${t.primary}44`,
                  background: isPlayingSlideshow ? `${t.primary}33` : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconEl name={isPlayingSlideshow ? "close" : "play"} size={13} color={t.primary} />
                {isPlayingSlideshow ? "Pause" : "Auto-Play"}
              </button>

              <select
                value={autoplaySpeed}
                onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                title="Auto-play duration per slide"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: `1px solid ${t.primary}44`,
                  borderRadius: 14,
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {[2, 3, 4, 5, 7, 10, 15].map((sec) => (
                  <option key={sec} value={sec} style={{ background: t.sidebar || "#1C1917", color: "#fff" }}>
                    {sec}s / slide
                  </option>
                ))}
              </select>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setPresentationSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={presentationSlideIndex === slides.length - 1}
              style={{
                padding: "8px 22px",
                borderRadius: 20,
                border: "none",
                background: presentationSlideIndex === slides.length - 1 ? "rgba(255,255,255,0.1)" : t.primary,
                color: presentationSlideIndex === slides.length - 1 ? "rgba(255,255,255,0.3)" : t.textOn,
                cursor: presentationSlideIndex === slides.length - 1 ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              Next
            </button>

            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>
              Press ← / → or Space
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteDeck && (
        <ConfirmDialog
          title="Delete Presentation?"
          message={`"${confirmDeleteDeck.title}" will be deleted. This cannot be undone.`}
          onConfirm={() => handleDeleteDeck(confirmDeleteDeck._id)}
          onCancel={() => setConfirmDeleteDeck(null)}
          t={t}
        />
      )}

      <style>{`
        @keyframes nexus-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nexus-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default CreateDeckPage;