import { useState, useEffect } from "react";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";
import CarouselTeachers from "./carouselTeachers";

const DisplayLessonsInfo = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        const filtered = filterData(data, lessonId);
        const allLessons = filtered.flatMap((item) => item.lessons || []);
        const singleLesson = allLessons.find(
          (lesson) => lesson._id === lessonId
        );
        setLessonData(singleLesson || null);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {lessonData ? (
          <>
            {/* Hero Card */}
            <section className="relative overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
              {/* decorative hairline */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
              <div className="relative">
                <img
                  className="w-full h-80 sm:h-96 object-cover"
                  src={lessonData.image}
                  alt={lessonData.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow">
                    {lessonData.name}
                  </h1>
                  <div className="mt-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
                    Lesson Overview
                  </div>
                </div>
              </div>
            </section>

            {/* Description Card */}
            <section className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                About This Lesson
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {lessonData.description}
              </p>
            </section>

            {/* Teachers */}
            <section className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Teachers for This Lesson
                </h2>
                <p className="mt-1 text-slate-600 text-sm">
                  Explore available mentors and book a 1-on-1 session.
                </p>
              </div>
              <CarouselTeachers lessonId={lessonData._id} />
            </section>
          </>
        ) : (
          <section className="grid place-items-center h-72">
            <div className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 ring-1 ring-slate-200" />
              <p className="text-slate-600 text-lg">Loading lesson…</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DisplayLessonsInfo;
