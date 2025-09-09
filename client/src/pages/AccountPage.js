import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../components/UserCard";
import API_URL from "../services/apiBase";

const AccountPage = () => {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  // Ensure that user is authenticated
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/user/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        console.error("Not logged in");
        navigate("/sign-in");
        return;
      }

      const data = await res.json();
      setAuthUser(data.user);
    })();
  }, [navigate]);

  return (
    <div className="p-4">
      <UserCard authUser={authUser} />
    </div>
  );
};
export default AccountPage;
