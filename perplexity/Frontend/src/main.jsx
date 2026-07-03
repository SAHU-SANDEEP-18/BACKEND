import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/index.css";
import App from "./app/App.jsx";
import { store } from "./app/app.store.js";
import { Provider } from "react-redux";
import { setTheme } from "./features/theme/theme.slice";

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'app-theme' && event.newValue) {
      store.dispatch(setTheme(event.newValue));
    }
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
