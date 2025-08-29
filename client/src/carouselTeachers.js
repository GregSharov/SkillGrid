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
        let initial = filterData(data, lessonId).filter(
          (t) => (t.subjects || []).length > 0
        );
        if (subjectId) {
          initial = filterData(data, subjectId);
        }
        setTeacherData(initial);
      })
      .catch((err) => console.error("Error fetching data", err));
  }, [lessonId, subjectId]);

  // Calculate product width including margin
  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current?.firstChild) {
        const el = carouselRef.current.firstChild;
        const style = window.getComputedStyle(el);
        const width = el.offsetWidth;
        const margin = parseFloat(style.marginRight);
        setProductWidth(width + margin);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (carouselRef.current) ro.observe(carouselRef.current);
    return () => ro.disconnect();
  }, [teacherData.length]);

  // Scroll helpers
  const scrollToTeachers = (index) => {
    if (carouselRef.current && productWidth > 0) {
      carouselRef.current.scrollTo({
        left: index * productWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };
  const handlePrev = () =>
    currentIndex > 0 && scrollToTeachers(currentIndex - 1);
  const handleNext = () =>
    currentIndex < teacherData.length - 1 && scrollToTeachers(currentIndex + 1);

  const handleKeyPress = (e, dir) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dir === "left" ? handlePrev() : handleNext();
    }
  };

  // Sync index on scroll
  useEffect(() => {
    const onScroll = () => {
      if (carouselRef.current && productWidth > 0) {
        const newIndex = Math.round(
          carouselRef.current.scrollLeft / productWidth
        );
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      }
    };
    const el = carouselRef.current;
    el?.addEventListener("scroll", onScroll);
    return () => el?.removeEventListener("scroll", onScroll);
  }, [currentIndex, productWidth]);

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        {/* <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Meet the <span className="text-indigo-600">Teachers</span>
          </h2>
          <p className="mt-1 text-slate-600 text-sm">
            Browse mentors and open profiles to learn more.
          </p>
        </div> */}

        {teacherData.length === 0 ? (
          <div className="grid place-items-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 ring-1 ring-slate-200" />
              <p className="text-slate-600 text-lg">
                No teachers available at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Prev */}
            <button
              onClick={handlePrev}
              onKeyDown={(e) => handleKeyPress(e, "left")}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow
                hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition
                ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Previous teachers"
            >
              <FaChevronLeft className="h-4 w-4 text-slate-700" />
            </button>

            {/* Track */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-2 scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {teacherData.map((teacher) => {
                const subjectsCount = (teacher.subjects || []).length;
                const rating =
                  typeof teacher.rating === "number" ? teacher.rating : null; // use if provided

                return (
                  <div
                    key={teacher._id}
                    className="flex-none w-64"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="h-[28rem] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl flex flex-col">
                      {/* Restored image dimensions */}
                      <div className="relative h-1/2 w-full">
                        <img
                          src={teacher.image}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          className="absolute h-full w-full object-cover object-[95%_5%]"
                          loading="lazy"
                        />
                        {/* gradient for legibility */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />

                        {/* Rating badge (top-left) */}
                        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3.5 w-3.5 text-amber-500"
                            aria-hidden="true"
                          >
                            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896l-7.336 3.868 1.402-8.167L.132 9.21l8.2-1.192L12 .587z" />
                          </svg>
                          {rating !== null ? `${rating.toFixed(1)}` : "New"}
                        </div>
                      </div>

                      {/* Content (restored proportions) */}
                      <div className="flex flex-col h-1/2 p-4 gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {teacher.firstName} {teacher.lastName}
                        </h3>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                            Teacher
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {subjectsCount}{" "}
                            {subjectsCount === 1 ? "Subject" : "Subjects"}
                          </span>
                        </div>

                        {/* Scrollable subjects/lessons */}
                        <div className="mt-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                          {subjectsCount === 0 ? (
                            <p className="text-slate-500 text-sm">
                              No subjects assigned
                            </p>
                          ) : (
                            teacher.subjects.map((subject, idx) => (
                              <div key={idx} className="mb-2">
                                <h4 className="font-medium text-slate-800 truncate">
                                  {subject.name}
                                </h4>
                                {Array.isArray(subject.lessons) &&
                                  subject.lessons.length > 0 && (
                                    <ul className="list-disc ml-5 text-slate-600 text-sm">
                                      {subject.lessons.map((lesson, lidx) => (
                                        <li key={lidx} className="truncate">
                                          {lesson.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                              </div>
                            ))
                          )}
                        </div>

                        <button
                          onClick={() => teacherInfo(teacher?._id)}
                          className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={handleNext}
              onKeyDown={(e) => handleKeyPress(e, "right")}
              disabled={currentIndex === teacherData.length - 1}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow
                hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition
                ${
                  currentIndex === teacherData.length - 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              aria-label="Next teachers"
            >
              <FaChevronRight className="h-4 w-4 text-slate-700" />
            </button>
          </div>
        )}

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {teacherData.map((_, index) => {
            const active = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => scrollToTeachers(index)}
                className={`h-2 rounded-full transition-all
                  ${
                    active
                      ? "w-6 bg-indigo-600"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                aria-label={`Go to teacher ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarouselTeachers;
