import { useState, useRef } from "react";
import CarouselSubjects from "../carouselSubjects.js";
import CarouselLessons from "../carouselLessons.js";
import LessonInfoPage from "../pages/lessonInfoPage.js";
import CarouselTeachers from "../carouselTeachers.js";

const Home = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const targetRefToLessons = useRef(null);
  const targetRefToTeachers = useRef(null);

  const scrollToTeachers = () => {
    targetRefToTeachers.current?.scrollIntoView({ behavior: "smooth" }); // 'smooth' for animated scroll
  };

  const scrollToLessons = () => {
    targetRefToLessons.current?.scrollIntoView({ behavior: "smooth" }); // 'smooth' for animated scroll
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40">
      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Learn 1-on-1 with{" "}
            <span className="text-indigo-600">Skill Grid</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Pick a subject, explore lessons, and book a session with expert
            teachers—fast.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* Subjects */}
          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Browse <span className="text-indigo-600">Subjects</span>
              </h2>
              <p className="mt-1 text-slate-600 text-sm">
                Pick a subject to explore lessons and teachers.
              </p>
            </div>
            <span className="" onClick={scrollToLessons}>
              <CarouselSubjects onSubjectClick={setSelectedSubjectId} />
            </span>
          </section>

          {/* Lessons */}
          <section
            className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-6 sm:p-8"
            ref={targetRefToLessons}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Featured <span className="text-indigo-600">Lessons</span>
              </h2>
              <p className="mt-1 text-slate-600 text-sm">
                Explore lessons and open details to book your session.
              </p>
            </div>
            <span className="" onClick={scrollToTeachers}>
              <CarouselLessons
                subjectId={selectedSubjectId}
                lessonInfo={setSelectedLessonId}
              />
            </span>
            {/* Lesson Info card */}
            {selectedLessonId && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
                <LessonInfoPage id={selectedLessonId} />
              </div>
            )}
          </section>

          {/* Teachers */}
          <section
            className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-6 sm:p-8"
            ref={targetRefToTeachers}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Meet the <span className="text-indigo-600">Teachers</span>
              </h2>
              <p className="mt-1 text-slate-600 text-sm">
                Browse mentors and open profiles to learn more.
              </p>
            </div>
            <CarouselTeachers
              subjectId={selectedSubjectId}
              teacherInfo={setSelectedSubjectId}
            />
          </section>

          {/* CTA Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
            <div className="p-8 sm:p-10 text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Ready to start learning?
              </h3>
              <p className="mt-2 text-slate-600">
                Choose a subject above, pick a lesson, and book your session in
                seconds.
              </p>
              <div className="mt-6">
                <a
                  href="#top"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition active:scale-[0.98]"
                >
                  Explore Subjects
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
