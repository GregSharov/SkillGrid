import { useState, useEffect } from "react";
import fetchData from "./services/fetchData.js";
import TeacherCard from "./components/TeacherCard.js";

function DisplayTeacherData() {
  const [teacherData, setTeacherData] = useState([]);

  useEffect(() => {
    fetchData("teachers")
      .then((data) => {
        setTeacherData(data);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  return (
    <>
      <h1>Teacher:</h1>
      <div>
        {teacherData.map((teacher, index) => (
          <TeacherCard key={index} teacher={teacher} />
        ))}
      </div>
    </>
  );
}

export default DisplayTeacherData;
