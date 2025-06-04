import DisplaySubjectsData from "../displaySubjectsData.js";
import DisplayLessonsData from "../displayLessonsDada.js";
import DisplayTeachersData from "../displayTeachersData.js";

const Home = () => {
  return (
    <div>
      <DisplaySubjectsData />
      <DisplayLessonsData />
      <DisplayTeachersData />
    </div>
  );
};

export default Home;
