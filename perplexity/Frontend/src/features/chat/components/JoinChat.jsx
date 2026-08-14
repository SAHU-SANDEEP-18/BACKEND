import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { joinViaLink } from "../service/chat.api";

const JoinChat = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      // Login karके wapas isी link pe lौटाओ
      navigate(`/login?redirect=/join/${token}`);
      return;
    }
    (async () => {
      try {
        const data = await joinViaLink(token);
        navigate(`/dashboard?chatId=${data.chatId}`); // apne dashboard-route ke hisaab se adjust karna
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired invite link");
      }
    })();
  }, [currentUser, token]);

  if (error) {
    return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>{error}</div>;
  }
  return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>Joining chat…</div>;
};

export default JoinChat;