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
        setLessonData(singleLesson);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {lessonData ? (
        <>
          {/* Hero Section */}
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              className="w-full h-96 object-cover object-center"
              src={lessonData.image}
              alt={lessonData.name}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 flex items-end p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {lessonData.name}
              </h1>
            </div>
          </div>

          {/* Lesson Description */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              About This Lesson
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              {lessonData.description}
            </p>
          </div>

          {/* Teachers Carousel */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              Teachers for This Lesson
            </h2>
            <CarouselTeachers lessonId={lessonData._id} />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Loading lesson...</p>
        </div>
      )}
    </div>
  );
};

export default DisplayLessonsInfo;
