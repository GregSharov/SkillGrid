import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fetchData from "../services/fetchData";
import filterData from "../services/filterData";
import TeacherCard from "../components/TeacherCard";
import StudentCard from "../components/StudentCard";

const AccountPage = () => {
  const location = useLocation();
  const { userId, isTeacher } = location.state || {};
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userType = isTeacher ? "teachers" : "students";

    fetchData(userType)
      .then((data) => {
        const filteredData = filterData(data, userId);
        setUserData(filteredData[0]);
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [userId, isTeacher]);

  if (isTeacher) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome {userData?.firstName}!</h1>
        {userData ? (
          <TeacherCard teacher={userData} />
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    );
  } else {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Welcome {userData?.firstName}!</h1>
        {userData ? (
          <StudentCard student={userData} />
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    );
  }
};
export default AccountPage;
