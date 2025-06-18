import { useState } from "react";
import DisplaySubjectData from "../displaySubjectsData.js";
import DisplayLessonData from "../displayLessonsDada.js";
import DisplayTeacherData from "../displayTeachersData.js";
import LessonInfoPage from "../pages/lessonInfoPage.js";

const Home = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  return (
    <div>
      {/* <DisplaySubjectData /> */}
      <DisplaySubjectData onSubjectClick={setSelectedSubjectId} />
      {/* <DisplayLessonData /> */}
      <DisplayLessonData
        id={selectedSubjectId}
        lessonInfo={setSelectedLessonId}
      />
      <LessonInfoPage id={selectedLessonId} />
      <DisplayTeacherData />
    </div>
  );
};

export default Home;
