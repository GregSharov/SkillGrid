import { useState } from "react";
import DisplaySubjectData from "../displaySubjectsData.js";
import DisplayLessonData from "../displayLessonsDada.js";
import DisplayTeacherData from "../displayTeachersData.js";

const Home = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  return (
    <div>
      {/* <DisplaySubjectData /> */}
      <DisplaySubjectData onSubjectClick={setSelectedSubjectId} />
      {/* <DisplayLessonData /> */}
      <DisplayLessonData id={selectedSubjectId} />
      <DisplayTeacherData />
    </div>
  );
};

export default Home;
