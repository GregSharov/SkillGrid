// import { useEffect, useState } from "react";
import "./App.css";
import AddNewUser from "./addNewUser.js";

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import SignIn from ".//signIn.js";
import DisplayStudentsData from "./displayStudentsData.js";
import DisplayTeacherData from "./displayTeachersData.js";
import DisplaySubjectData from "./displaySubjectsData.js";
// import LessonCard from "./lessonCard.js";

import Layout from "./pages/Layout.js";
import NoPage from "./pages/NoPage.js";
import Home from "./pages/HomePage.js";
import SignIn from "./pages/SignInPage.js";
import SignUp from "./pages/SignUpPage.js";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
  // return (
  //   // <div>
  //   //   <AddNewUser />
  //   //   <SignIn />
  //   //   <LessonCard />
  //   //   <DisplayStudentsData />
  //   //   <DisplayTeachersData />
  //   //   <DisplaySubjectData />
  //   // </div>
  // );
}

export default App;
