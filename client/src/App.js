// import { useEffect, useState } from "react";
import "./App.css";
import AddNewUser from "./addNewUser.js";
import SignIn from ".//signIn.js";
import DisplayStudentsData from "./displayStudentsData.js";
import DisplaySubjectData from "./displaySubjectsData.js";

function App() {
  return (
    <div>
      <AddNewUser />
      <SignIn />
      <DisplayStudentsData />
      <DisplaySubjectData />
    </div>
  );
}

export default App;
