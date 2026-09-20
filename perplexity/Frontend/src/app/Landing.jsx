import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import HomePage from "../features/home/pages/HomePage";
import Dashboard from "../features/chat/pages/Dashboard";
import { THEMES } from "../config/themes";

const Landing = () => {
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((state) => state.theme.theme);
  const t = THEMES[theme] || THEMES.teal;
  const navigate = useNavigate();

  const handleSubmitPrompt = (prompt, mode) => {
    if (!prompt) {
      navigate("/login");
      return;
    }

    sessionStorage.setItem("pending_prompt", prompt);
    sessionStorage.setItem("pending_mode", mode || "chat");

    if (user) {
      navigate("/dashboard");
      return;
    }

    navigate("/login");
  };

  if (user) {
    return <Dashboard />;
  }

  return (
    <HomePage
      t={t}
      onGetStarted={() => navigate("/login")}
      onSubmitPrompt={handleSubmitPrompt}
    />
  );
};

export default Landing;