import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import fetchData from "../services/fetchData";
import filterData from "../services/filterData"; // Import the filter function

export default function SearchPage({ subjectId, lessonsArray = null }) {
    const [teacherData, setTeacherData] = useState([]);
    const [lessonData, setLessonsData] = useState([]);


    const navigate = useNavigate();
    // Navigate to teacher info page
    const teacherInfo = (teacher) => {
        if (!teacher) return;
        navigate("/teacher-info", { state: { teacher } });
    }
    const lessonInfo = (lessonID) => {
        if (!lessonID) return;
        navigate("/lesson-info", { state: { lessonID } });
    }
    // Fetching data from Subjects database then filtering it to get the lessons data by id
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        // Filter data to get lessons for the specific subject id
        setLessonsData(filterData(data, subjectId));
      })
      .catch((err) => console.error("Error fetching data", err));
  }, [subjectId]);
    const lessons = lessonsArray ? lessonsArray : lessonData.flatMap((lesson) => lesson.lessons || []);


    useEffect(() => {
    fetchData("teachers")
      .then((data) => setTeacherData(filterData(data)))
      .catch((err) => console.error("Error fetching data", err));
  }, []);

  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherData.map((teacher) => (
            <div key={teacher._id} className="border p-4 rounded-lg">
                <img src={teacher.image || "/images/user.png"} alt={teacher.name} className="w-full h-40 object-cover rounded mb-2" />
                <h2 className="text-xl font-semibold">{teacher.name}</h2>
                <p>{teacher.description}</p>
                <button onClick={() => teacherInfo(teacher)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">View Profile</button>
            </div>
            ))}
            {lessons.map((lesson) => (
            <div key={lesson._id} className="border p-4 rounded-lg">
                <img src={lesson.image || "/images/lesson.png"} alt={lesson.name} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="text-lg font-semibold">{lesson.name}</h3>
                <button onClick={() => lessonInfo(lesson._id)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">View Lesson</button>
            </div>
            ))}
        </div>
    </div>
    );
}








