// import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing components for routing
import Layout from "./pages/Layout.js";
import NoPage from "./pages/NoPage.js";
import Home from "./pages/HomePage.js";
import SignIn from "./pages/SignInPage.js";
import SignUp from "./pages/SignUpPage.js";
import AddSubject from "./pages/AddSubject.js";
import Contact from "./pages/contact.js";
import About from "./pages/aboutUs.js";
import LessonInfoPage from "./pages/lessonInfoPage.js";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="*" element={<NoPage />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="lesson-info" element={<LessonInfoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
