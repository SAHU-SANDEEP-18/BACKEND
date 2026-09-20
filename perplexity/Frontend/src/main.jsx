import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./app/index.css";
import App from "./app/App.jsx";
import { store } from "./app/app.store.js";
import { Provider } from "react-redux";
import { setTheme } from "./features/theme/theme.slice";
import { registerSW } from "virtual:pwa-register";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'app-theme' && event.newValue) {
      store.dispatch(setTheme(event.newValue));
    }
  });
}

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      if (confirm("A new version is available. Update now?")) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log("App is ready to work offline");
    },
  });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
