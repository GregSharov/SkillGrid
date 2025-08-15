import { useState } from "react";
import CarouselSubjects from "../carouselSubjects.js";
import CarouselLessons from "../carouselLessons.js";
import LessonInfoPage from "../pages/lessonInfoPage.js";
import CarouselTeachers from "../carouselTeachers.js";

const Home = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  return (
    <div>
      <CarouselSubjects onSubjectClick={setSelectedSubjectId} />
      <CarouselLessons
        subjectId={selectedSubjectId}
        lessonInfo={setSelectedLessonId}
      />
      <LessonInfoPage id={selectedLessonId} />

      <CarouselTeachers
        subjectId={selectedSubjectId}
        teacherInfo={setSelectedSubjectId}
      />
    </div>
  );
};

export default Home;
