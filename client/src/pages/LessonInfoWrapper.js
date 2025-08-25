import { useLocation } from "react-router-dom";
import DisplayLessonsInfo from "../displayLessonInfo";

export default function LessonInfoWrapper() {
  const location = useLocation();
  // Accept either a whole lesson object or a direct lessonId
  const lesson = location.state?.lesson;
  const lessonId = location.state?.lessonId || lesson?._id || null;

  return <DisplayLessonsInfo lessonId={lessonId} />;
}
