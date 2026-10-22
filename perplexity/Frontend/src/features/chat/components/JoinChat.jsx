import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { joinViaLink } from "../service/chat.api";
import { setcurrentChatId } from "../chat.slice";

const JoinChat = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
        dispatch(setcurrentChatId(data.chatId));
        navigate("/", { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired invite link");
      }
    })();
  }, [currentUser, dispatch, navigate, token]);

  if (error) {
    return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>{error}</div>;
  }
  return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>Joining chat…</div>;
};

export default JoinChat;