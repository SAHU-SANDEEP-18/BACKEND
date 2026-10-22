import { useEffect, useState } from "react";
import IconEl from "../features/chat/components/IconEl";
import { useToast } from "./CustomToast";

let deferredInstallPrompt = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    listeners.forEach((listener) => listener());
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    listeners.forEach((listener) => listener());
  });
}

const PwaInstallButton = ({ t, compact = false }) => {
  const toast = useToast();
  const [isInstalled, setIsInstalled] = useState(
    typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true),
  );

  useEffect(() => {
    const updateInstallState = () => {
      setIsInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true,
      );
    };

    listeners.add(updateInstallState);
    window.matchMedia("(display-mode: standalone)").addEventListener?.("change", updateInstallState);
    return () => {
      listeners.delete(updateInstallState);
      window.matchMedia("(display-mode: standalone)").removeEventListener?.("change", updateInstallState);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredInstallPrompt) {
      toast.info(
        "Install from your browser menu. InPrivate/Incognito windows do not support app installation.",
      );
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error("App installation prompt failed:", error);
      toast.error("Could not open the installation prompt. Try your browser menu.");
    }
  };

  if (isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Install Nexus AI"
      title="Install app"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 0 : 6,
        width: compact ? 40 : "auto",
        height: 36,
        padding: compact ? 0 : "0 10px",
        borderRadius: 8,
        border: `1px solid ${t.primary}55`,
        background: "transparent",
        color: t.textOn,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <IconEl name="download" size={15} color={t.primary} />
      {!compact && <span style={{ fontSize: 12 }}>Install app</span>}
    </button>
  );
};

export default PwaInstallButton;
