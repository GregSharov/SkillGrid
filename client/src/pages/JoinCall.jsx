
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AutoJoin() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      console.log("this is a join call page", roomId);
      navigate(`/call/${encodeURIComponent(roomId)}`, { replace: true });
    }
  }, [roomId, navigate]);

  return null; // or a tiny "connecting..." message/spinner
}
