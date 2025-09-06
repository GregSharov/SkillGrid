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
import SearchPage from "./pages/SearchPage";
import CallPage from "./pages/CallPage";
import JoinCall from "./pages/JoinCall";
import LessonInfoWrapper from "./pages/LessonInfoWrapper";
import Admin from "./pages/AdminDashboard.js";




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
          <Route path="teacher-info/:teacherId" element={<DisplayTeachersData />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="join/:roomId" element={<JoinCall />} />
          <Route path="call/:roomId" element={<CallPage />} />
          <Route path="lesson-info-search" element={<LessonInfoWrapper />} />
          <Route path="admin" element={<Admin />} />

        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
