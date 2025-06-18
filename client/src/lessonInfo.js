import {  useState, useEffect } from "react";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";


const DisplayLessonsInfo = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState([]);
  console.log("Lesson ID:", lessonId);

  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        const filtered = filterData(data); // your logic here
        const allLessons = filtered.flatMap(item => item.lessons || []);
        const singleLesson = allLessons.find(lesson => lesson._id === lessonId);
        setLessonData(singleLesson);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  if (!lessonData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="lesson-info">
      <h1>{lessonData.name}</h1>
      <img src={lessonData.image} alt={lessonData.name} />
      <p>{lessonData.description}</p>
    </div>
  );
};



export default DisplayLessonsInfo;
