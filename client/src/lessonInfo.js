import { useState, useEffect } from "react";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";
import TeacherCard from "./components/TeacherCard";

const DisplayLessonsInfo = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState(null);
  const [teachersData, setTeachersData] = useState([]);

  // Fetching data from Subjects database then filtering it to get the lesson data by lessonId
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        const filtered = filterData(data, lessonId); // returns Object of Subject contains needed lessonId
        const allLessons = filtered.flatMap((item) => item.lessons || []); // Flatten the lessons array from the subject
        const singleLesson = allLessons.find(
          (lesson) => lesson._id === lessonId
        ); // Find the specific lesson by ID

        setLessonData(singleLesson);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  // Fetching data from Teachers database then filtering it to get the teachers data by lesson name
  useEffect(() => {
    if (!lessonData || !lessonData.name) return;

    fetchData("teachers")
      .then((data) => {
        const filteredTeachers = filterData(data, lessonData.name);
        setTeachersData(filteredTeachers);
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  }, [lessonData]);

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
        {/* Display list of teachers teaching this lesson */}
        {teachersData.length === 0 ? (
          <p>No teachers found for this lesson.</p>
        ) : (
          teachersData.map((teacher, index) => (
            <TeacherCard key={index} teacher={teacher} />
          ))
        )}
      </div>
    </div>
  );
};

export default DisplayLessonsInfo;
