import { useState } from "react";
import DisplaySubjectData from "../displaySubjectsData.js";
import DisplayLessonData from "../displayLessonsDada.js";
import LessonInfoPage from "../pages/lessonInfoPage.js";
import DisplayTeacherList from "../displayTeacherList";

const Home = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  return (
    <div>
      <DisplaySubjectData onSubjectClick={setSelectedSubjectId} />
      <DisplayLessonData
        id={selectedSubjectId}
        lessonInfo={setSelectedLessonId}
      />
      <LessonInfoPage id={selectedLessonId} />
      
      <DisplayTeacherList 
        id={selectedSubjectId}
        teacherInfo={setSelectedSubjectId} 
      />
    </div>
  );
};

export default Home;
