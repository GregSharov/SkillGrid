
// import LessonInfo from "../lessonInfo.js";

// const LessonInfoPage = () => {
  

//   return (
//     <div>
//       <LessonInfo />
//     </div>
//   );
// }
// export default LessonInfoPage;




import { useLocation } from "react-router-dom";
import DisplayLessonsInfo from "../lessonInfo.js";

const LessonInfoPage = () => {
  const location = useLocation();
  const lessonId = location.state?.lessonId;

  if (!lessonId) {
    return <p>Error: No lesson selected</p>;
  }

  return (
    <div>
      <DisplayLessonsInfo lessonId={lessonId} />
    </div>
  );
};

export default LessonInfoPage;
