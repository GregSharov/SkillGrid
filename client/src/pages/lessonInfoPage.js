import { useLocation } from "react-router-dom";
import DisplayLessonsInfo from "../lessonInfo.js";

const LessonInfoPage = () => {
  const location = useLocation();
  const lessonId = location.state?.lessonId;

  return (
    <div>
      {!lessonId ? (
        <></>
      ) : (
        <DisplayLessonsInfo lessonId={lessonId} />
      )}
    </div>
  );
};

export default LessonInfoPage;
