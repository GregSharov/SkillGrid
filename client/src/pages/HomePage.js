import DisplaySubjectData from "../displaySubjectsData.js";
import DisplayLessonData from "../displayLessonsDada.js";
import DisplayTeacherData from "../displayTeachersData.js";

const Home = () => {
  return (
    <div>
      <DisplaySubjectData />
      <DisplayLessonData />
      <DisplayTeacherData />
    </div>
  );
};

export default Home;
