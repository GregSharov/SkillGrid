import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";
import filterData from "./services/filterData";
import { useNavigate } from "react-router-dom";

const CarouselTeachers = ({ lessonId, subjectId = null }) => {
  const [teacherData, setTeacherData] = useState([]);
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);

  const navigate = useNavigate();
  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate(`/teacher-info/${teacherId}`);
  };

  // Fetch teacher data
  useEffect(() => {
    fetchData("teachers")
      .then((data) => {
        // Filter data to get teachers for the specific lesson id (only teachers where subjects.length > 0)
        setTeacherData(
          filterData(data, lessonId).filter(
            (teacher) => teacher.subjects.length > 0
          )
        );

        // If subjectId is provided, filter teachers by subject as well
        if (subjectId) {
          const selectedTeachers = filterData(data, subjectId);
          setTeacherData(selectedTeachers);
        }
      })
      .catch((err) => console.error("Error fetching data", err));
  }, [lessonId, subjectId]);

  // Calculate product width including margin
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

    // Observe changes to the carousel container
    const resizeObserver = new ResizeObserver(updateWidth);
    if (carouselRef.current) resizeObserver.observe(carouselRef.current);
    return () => resizeObserver.disconnect();
  }, [teacherData.length]);

  // Scroll to the selected teacher
  const scrollToTeachers = (index) => {
    if (carouselRef.current && productWidth > 0) {
      carouselRef.current.scrollTo({
        left: index * productWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  // Handle previous and next buttons
  const handlePrev = () => {
    if (currentIndex > 0) scrollToTeachers(currentIndex - 1);
  };
  const handleNext = () => {
    if (currentIndex < teacherData.length - 1)
      scrollToTeachers(currentIndex + 1);
  };

  // Handle keyboard navigation
  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      direction === "left" ? handlePrev() : handleNext();
    }
  };

  // Update current index on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current && productWidth > 0) {
        const scrollPosition = carouselRef.current.scrollLeft;
        const newIndex = Math.round(scrollPosition / productWidth);
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      }
    };
    const carousel = carouselRef.current;
    carousel?.addEventListener("scroll", handleScroll);
    return () => carousel?.removeEventListener("scroll", handleScroll);
  }, [currentIndex, productWidth]);

  return (
    <div className="w-full px-4 py-2 bg-gray-50">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center tracking-wide">
          T e a c h e r s
        </h2>

        {teacherData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No teachers available at the moment.
            </p>
          </div>
        ) : (
          <div className="relative group">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              onKeyDown={(e) => handleKeyPress(e, "left")}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-90 hover:opacity-100"
              }`}
              aria-label="Previous teachers"
            >
              <FaChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-6 scroll-smooth px-2"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {/* Teacher's Card */}
              {/* Filter and hide teachers with empty subjects */}
              {teacherData.map((teacher) => (
                <div
                  key={teacher._id}
                  className="flex-none w-64"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-[28rem] flex flex-col">
                    {/* Larger Image */}
                    <div className="relative h-1/2 w-full">
                      <img
                        src={teacher.image}
                        alt={teacher.firstName}
                        className="absolute h-full w-full object-[95%_5%] object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Smaller scrollable subjects/lessons */}
                    <div className="flex flex-col h-1/3 flex-grow p-4 gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {teacher.firstName} {teacher.lastName}
                      </h3>

                      <div className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                        {teacher.subjects.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No subjects assigned
                          </p>
                        ) : (
                          teacher.subjects.map((subject, idx) => (
                            <div key={idx}>
                              <h4 className="font-medium text-gray-800 truncate">
                                {subject.name}
                              </h4>
                              {subject.lessons &&
                                subject.lessons.length > 0 && (
                                  <ul className="list-disc ml-5 text-gray-600 text-sm truncate">
                                    {subject.lessons.map((lesson, lidx) => (
                                      <li key={lidx}>{lesson.name}</li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => teacherInfo(teacher?._id)}
                        className="mt-2 bg-blue-500 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                      >
                        More Information
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              onKeyDown={(e) => handleKeyPress(e, "right")}
              disabled={currentIndex === teacherData.length - 1}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentIndex === teacherData.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-90 hover:opacity-100"
              }`}
              aria-label="Next teacher"
            >
              <FaChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-6 gap-2">
          {teacherData.map((_, index) => (
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

export default CarouselTeachers;
