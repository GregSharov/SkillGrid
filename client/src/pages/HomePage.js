import DisplaySubjectData from "../displaySubjectsData.js";
import DisplayLessonsData from "../displayLessonsDada.js";

const Home = () => {
    return (
        <div>
            <DisplaySubjectData />
            <DisplayLessonsData />
        </div>
    )




//   return (
//     <div>
//       <AddNewUser />
//       <SignIn />
//       <LessonCard />
//       <DisplayStudentsData />
//       <DisplayTeachersData />
//       <DisplaySubjectData />
//     </div>
//   );
};

export default Home;