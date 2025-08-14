import { useState, useEffect } from "react";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";
import TeachersCarousel from "./teachersCarousel";

const DisplayLessonsInfo = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState(null);

  // Fetching data from Subjects database then filtering it to get the lesson data by lessonId
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        const filtered = filterData(data, lessonId); // returns Object of Subject contains needed lessonId
        const allLessons = filtered.flatMap((item) => item.lessons || []); // Flatten the lessons array from the subject
        const singleLesson = allLessons.find(
          (lesson) => lesson._id === lessonId
        ); // Find the specific lesson by ID

        setLessonData(singleLesson);
      })
      .catch((err) => console.error("Error fetching lesson:", err));
  }, [lessonId]);

  return (
    <div>
      <div>
        {lessonData ? (
          <div className="lesson-info">
            <h2 className="text-2xl font-bold text-red-900 mb-8 text-center">
              {lessonData.name}
            </h2>
            <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
              <img
                className="object-cover object-center w-full rounded-lg h-96"
                src={lessonData.image}
                alt={lessonData.name}
                loading="lazy"
              />
              <div className="block mt-2 font-sans text-sm antialiased font-normal leading-normal text-center text-inherit">
                <h3 className="text-lg font-semibold text-gray-900">
                  {lessonData.description}
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading lesson...</p>
        )}
      </div>

      {/* Display Teachers List Carousel */}
      <TeachersCarousel lessonId={lessonData?._id} />
    </div>
  );
};

export default DisplayLessonsInfo;
