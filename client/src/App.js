// import { useEffect, useState } from "react";
import "./App.css";
import AddNewUser from "./addNewUser.js";
import SignIn from ".//signIn.js";
import DisplayStudentsData from "./displayStudentsData.js";
import DisplayTeacherData from "./displayTeachersData.js";
import DisplaySubjectData from "./displaySubjectsData.js";
import LessonCard from "./components/LessonCard.js";

function App() {
  return (
    <div>
      <AddNewUser />
      <SignIn />
      {/* <LessonCard /> */}
      {/* <DisplayStudentsData /> */}
      <DisplayTeacherData />
      <DisplaySubjectData />
    </div>
  );
}

export default App;
