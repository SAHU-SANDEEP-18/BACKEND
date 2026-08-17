import { useState, useEffect } from "react";
import IconEl from "../../chat/components/IconEl";
import {
  saveGeneratedImage,
  getMyImages,
  deleteImage,
} from "../service/image.api";
import ConfirmDialog from "../../chat/components/ConfirmDialog";

const CreateImagePage = ({ t }) => {
  const [prompt, setPrompt] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [error, setError] = useState("");
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(null); // { id, prompt } | null

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyImages();
        setGallery(data.images || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // ── Sirf preview generate karo (abhi save nahi hua) ──
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError("");
    const seed = Math.floor(Math.random() * 2147483647); // Valid 32-bit seed
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=576&model=flux&seed=${seed}`;
    setPreviewUrl(url);
  };

  // ── Preview ko permanently save karo (ImageKit + DB) ──
  const handleSave = async () => {
    if (!previewUrl || saving) return;
    setSaving(true);
    setError("");
    try {
      const data = await saveGeneratedImage(previewUrl, prompt.trim());
      setGallery((prev) => [data.image, ...prev]);
      setPreviewUrl(null);
      setPrompt("");
    } catch (err) {
      setError("It couldn’t be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteImage(imageId);
      setGallery((prev) => prev.filter((img) => img._id !== imageId));
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteImage(null);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Create Image
      </h2>

      {/* Prompt-input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Describe the image you want..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${t.primary}33`,
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          onClick={handleGenerate}
          style={{
            padding: "0 18px",
            borderRadius: 8,
            border: "none",
            background: t.primary,
            color: t.textOn,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Generate
        </button>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Preview (generate hone ke baad, save se pehle) */}
      {previewUrl && (
        <div style={{ marginBottom: 24 }}>
          {generating && (
            <div
              style={{
                width: 400,
                maxWidth: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${t.primary}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `2.5px solid ${t.primary}33`,
                  borderTopColor: t.primary,
                  animation: "nexus-spin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${t.primary}0d, transparent)`,
                  animation: "nexus-shimmer 1.4s ease-in-out infinite",
                }}
              />
            </div>
          )}

          <img
            src={previewUrl}
            alt={prompt}
            onLoad={() => setGenerating(false)}
            onError={() => setGenerating(false)}
            style={{
              maxWidth: 400,
              width: "100%",
              borderRadius: 10,
              display: generating ? "none" : "block",
              marginBottom: 10,
            }}
          />

          {!generating && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: t.primary,
                color: t.textOn,
                cursor: "pointer",
                fontSize: 12.5,
              }}
            >
              {saving ? "Saving..." : "Save Image"}
            </button>
          )}
        </div>
      )}

      {/* Gallery */}
      <h3
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          marginBottom: 10,
        }}
      >
        Your saved images
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {gallery.map((img) => (
          <div
            key={img._id}
            style={{
              position: "relative",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <img
              src={img.url}
              alt={img.prompt}
              style={{
                width: "100%",
                height: 140,
                // objectFit: "cover",
                display: "block",
              }}
            />
            <button
              onClick={() =>
                setConfirmDeleteImage({ id: img._id, prompt: img.prompt })
              }
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(0,0,0,0.6)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                padding: 4,
              }}
            >
              <IconEl name="trash" size={12} color="#fff" />
            </button>
          </div>
        ))}
      </div>

      {confirmDeleteImage && (
        <ConfirmDialog
          title="Delete image?"
          message={`This image ("${confirmDeleteImage.prompt?.slice(0, 50) || "untitled"}") will be permanently deleted. This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDeleteImage.id)}
          onCancel={() => setConfirmDeleteImage(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default CreateImagePage;

<style>{`
        @keyframes nexus-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nexus-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>;
