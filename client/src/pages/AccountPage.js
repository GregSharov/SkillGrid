import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fetchData from "../services/fetchData";
import filterData from "../services/filterData";

const AcountPage = () => {
  const location = useLocation();
  const { userId } = location.state || {};
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchData("teachers")
        .then((data) => {
            const filteredData = filterData(data, userId);
            setUserData(filteredData[0]);
        })
        .catch((err) => console.error("Error fetching user data:", err));
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">This is Acount page</h1>
      <div>
        {userData ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h2>
            <p>Email: {userData.email}</p>
            <p>Phone: {userData.phone}</p>
            <p>Date of Birth: {new Date(userData.dateOfBirth).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default AcountPage;
