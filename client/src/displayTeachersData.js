import { useState, useEffect } from "react";
import fetchData from "./services/fetchData.js";
import TeacherCard from "./components/TeacherCard.js";

function DisplayTeacherData() {
  const [teacherData, setTeacherData] = useState([]);

  useEffect(() => {
    fetchData("teachers")
      .then((data) => {
        console.log("Data fetched successfully", data);

        const sortedData = data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        setTeacherData(sortedData);
        // console.log("Teacher data fetched successfully", sortedData);
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
