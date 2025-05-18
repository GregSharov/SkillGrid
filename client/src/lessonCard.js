import { useState, useEffect } from "react";
import DisplaySubjectData from "./displaySubjectsData.js";
import ShowTeacherData from "./displayTeachersData.js";

// Lessoncard using lessons from DisplaySubjectData and teachers from ShowTeacherData
function LessonCard() {
  return (
    <div>
      <h1>Lessons:</h1>
      <p>
        {typeof(DisplaySubjectData)}
      </p>
    </div>
  );
}

export default LessonCard;