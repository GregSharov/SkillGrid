import {  useState, useEffect } from "react";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";
import TeacherCard from "./components/TeacherCard";


const DisplayLessonsInfo = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  console.log("Lesson ID:", lessonId);

  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        console.log("Fetched subjects data:", data);
        const filtered = filterData(data, lessonId); // returns Object of Subject contains needed lessonId
        console.log("Filtered subjects data:", filtered);
        const allLessons = filtered.flatMap(item => item.lessons || []);
        const singleLesson = allLessons.find(lesson => lesson._id === lessonId);
        console.log("Single lesson data:", singleLesson);
        setLessonData(singleLesson);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  useEffect(() => {
    fetchData("teachers")
      .then((data) => {
        console.log("Fetched teachers data:", data);
        const filteredTeachers = filterData(data, lessonData.name);
        console.log("Filtered teachers data:", filteredTeachers);
        setTeachersData(filteredTeachers);
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  }, [lessonData.name]);

  if (!lessonData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="lesson-info">
      <h1>{lessonData.name}</h1>
      <img src={lessonData.image} alt={lessonData.name} />
      <p>{lessonData.description}</p>
    </div>
    <div>
      {teachersData.map((teacher, index) => (
        <TeacherCard key={index} teacher={teacher} />
      ))}
    </div>
    </div>
  );
};



export default DisplayLessonsInfo;
