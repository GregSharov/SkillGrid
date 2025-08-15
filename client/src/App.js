// import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing components for routing
import Header from "./pages/Header.js";
import NoPage from "./pages/NoPage.js";
import Home from "./pages/HomePage.js";
import SignIn from "./pages/SignInPage.js";
import SignUp from "./pages/SignUpPage.js";
import AddSubject from "./pages/AddSubject.js";
import Contact from "./pages/contact.js";
import About from "./pages/aboutUs.js";
import LessonInfoPage from "./pages/lessonInfoPage.js";
import AcountPage from "./pages/AccountPage.js";
import DisplayTeachersData from "./displayTeachersData.js";
import Footer from "./components/footer.js";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Header />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="*" element={<NoPage />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="lesson-info" element={<LessonInfoPage />} />
          <Route path="account" element={<AcountPage />} />
          <Route path="teacher-info" element={<DisplayTeachersData />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
