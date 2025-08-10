import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";
import { useNavigate } from "react-router-dom";
import userPicture from "./user.png";

const DisplayTeachersData = () => {
  const [teacherData, setTeacherData] = useState([]);

  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);

  const navigate = useNavigate();
  const teacherInfo = (teacher) => {
    if (!teacher) return;
    navigate("/teacher-info", { state: { teacher } });
  };

  // Fetch (with proper loading/error handling)
  useEffect(() => {
    fetchData("teachers")
      .then((data) => {
        setTeacherData(Array.isArray(data) ? data : []);
        console.log("one teacher:", (Array.isArray(data) ? data : [])[0]);
      })
      .catch(console.error);
  }, []);

  // Robust teachers extraction: supports both shapes
  const teachers = (() => {
    if (!Array.isArray(teacherData)) return [];
    if (teacherData.length === 0) return [];

    const first = teacherData[0];

    // Case A: [{ name, image, ... }, ...]  (flat array of teachers)
    if (first && typeof first === "object" && !("teachers" in first)) {
      return teacherData;
    }

    // Case B: [{ teachers: [...] }, ...]
    return teacherData.flatMap((item) => item?.teachers || []);
  })();

  // Calculate product width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current?.firstChild) {
        const productElement = carouselRef.current.firstChild;
        const style = window.getComputedStyle(productElement);
        const width = productElement.offsetWidth;
        const margin = parseFloat(style.marginRight);
        setProductWidth(width + margin);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (carouselRef.current) {
      resizeObserver.observe(carouselRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [teachers.length]);

  const scrollToTeachers = (index) => {
    if (carouselRef.current && productWidth > 0) {
      carouselRef.current.scrollTo({
        left: index * productWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToTeachers(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < teachers.length - 1) {
      scrollToTeachers(currentIndex + 1);
    }
  };

  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      direction === "left" ? handlePrev() : handleNext();
    }
  };

  // Update current index during scroll
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current && productWidth > 0) {
        const scrollPosition = carouselRef.current.scrollLeft;
        const newIndex = Math.round(scrollPosition / productWidth);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }
    };

    const carousel = carouselRef.current;
    carousel?.addEventListener("scroll", handleScroll);
    return () => carousel?.removeEventListener("scroll", handleScroll);
  }, [currentIndex, productWidth]);

  return (
    <div className="w-full px-4 py-2 bg-gray-50">
      <div className="max-w-7xl mx-auto relative">
        {/* Teacher section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          T e a c h e r s
        </h2>

        <div className="relative group">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            onKeyDown={(e) => handleKeyPress(e, "left")}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "opacity-90 hover:opacity-100"
            }`}
            aria-label="Previous teachers"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 scroll-smooth px-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="flex-none w-64"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative pb-[75%]">
                    <img
                      src={teacher.image || userPicture}
                      alt={teacher.firstName}
                      className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    {/* Display current assigned subjects and lessons */}
                    <div className="mt-6 flex-1 overflow-y-auto max-h-40 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                      <h2 className="text-lg font-semibold">Subjects:</h2>
                      {teacher.subjects.length === 0 && (
                        <p>No subjects assigned.</p>
                      )}
                      {teacher.subjects.map((subject, index) => (
                        <div key={index} className="ml-4 mt-2">
                          <h3 className="font-medium">{subject.name}</h3>
                          {subject.lessons && subject.lessons.length > 0 ? (
                            <ul className="list-disc ml-6">
                              {subject.lessons.map((lesson, lessonIndex) => (
                                <li key={lessonIndex}>{lesson.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="ml-2 text-sm text-gray-500">
                              No lessons available.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <button
                        // more information about the teacher
                        onClick={() => {
                          teacherInfo(teacher);
                        }}
                        className="flex items-center gap-1 bg-blue-400 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 text-sm"
                      >
                        {/* <BsCart3 className="w-4 h-4" /> */}
                        <span>More information</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            onKeyDown={(e) => handleKeyPress(e, "right")}
            disabled={currentIndex === teachers.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentIndex === teachers.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "opacity-90 hover:opacity-100"
            }`}
            aria-label="Next teacher"
          >
            <FaChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Navigation Indicators */}
        <div className="flex justify-center mt-4 gap-2">
          {teachers.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToTeachers(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to teacher ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayTeachersData;
