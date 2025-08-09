import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";
import { useNavigate } from "react-router-dom";
// import TeacherCard from "./components/TeacherCard.js";
import userPicrure from "./user.png";

const DisplayTeachersData = () => {
  const [teacherData, setTeacherData] = useState([]);

  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);

  const navigate = useNavigate();
  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate("/teacher-info", { state: { teacherId } });
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

  // Compute card width + gap for precise scrolling
  useEffect(() => {
    const updateWidth = () => {
      if (!carouselRef.current) return;
      const firstCard = carouselRef.current.querySelector("[data-card]");
      if (!firstCard) return;

      const styleContainer = window.getComputedStyle(carouselRef.current);
      const gap = parseFloat(styleContainer.columnGap || "0");
      const width = firstCard.offsetWidth + gap;
      setProductWidth(width);
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    if (carouselRef.current) ro.observe(carouselRef.current);
    window.addEventListener("resize", updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [teachers.length]);

  const clampIndex = (i) =>
    Math.max(0, Math.min(i, Math.max(0, teachers.length - 1)));

  const scrollToteachers = (index) => {
    if (!carouselRef.current || productWidth <= 0) return;
    const clamped = clampIndex(index);
    carouselRef.current.scrollTo({
      left: clamped * productWidth,
      behavior: "smooth",
    });
    setCurrentIndex(clamped);
  };

  const handlePrev = () => scrollToteachers(currentIndex - 1);
  const handleNext = () => scrollToteachers(currentIndex + 1);

  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      direction === "left" ? handlePrev() : handleNext();
    }
  };

  // Keep currentIndex in sync while user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current || productWidth <= 0) return;
      const scrollPosition = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / productWidth);
      setCurrentIndex((prev) => (prev !== newIndex ? newIndex : prev));
    };
    const el = carouselRef.current;
    el?.addEventListener("scroll", handleScroll, { passive: true });
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [productWidth]);

  return (
    <div className="w-full px-4 py-2 bg-gray-50">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          T e a c h e r s
        </h2>

        {teachers.length > 0 && (
          <>
            <div className="relative group">
              {/* Prev */}
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

              {/* Carousel */}
              <div
                ref={carouselRef}
                className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 scroll-smooth px-2"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {teachers.map((teacher) => {
                  const displayName =
                    [teacher?.firstName, teacher?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    teacher?.name ||
                    "Unnamed";

                  // normalize Assigned Subjects
                  const raw =
                    teacher?.assignedSubjects ??
                    teacher?.subjects ??
                    teacher?.subjectList ??
                    teacher?.assigned_subjects ??
                    null;

                  let assignedSubjects = "—";
                  if (Array.isArray(raw)) {
                    assignedSubjects =
                      raw
                        .map((s) =>
                          typeof s === "string"
                            ? s
                            : s?.name ?? s?.title ?? s?.subjectName ?? null
                        )
                        .filter(Boolean)
                        .join(", ") || "—";
                  } else if (raw && typeof raw === "object") {
                    // object map like { Math: true, Physics: false }
                    assignedSubjects =
                      Object.entries(raw)
                        .filter(([, v]) => !!v)
                        .map(([k]) => k)
                        .join(", ") || "—";
                  } else if (typeof raw === "string") {
                    assignedSubjects = raw || "—";
                  }

                  // normalize subjects + lessons into [{name: string, lessons: string[]}]
                  const getSubjectsWithLessons = (t) => {
                    const raw =
                      t?.assignedSubjects ??
                      t?.subjects ??
                      t?.subjectList ??
                      t?.assigned_subjects ??
                      [];

                    if (!Array.isArray(raw)) return [];

                    return raw
                      .map((s) => {
                        // subject name (string or object)
                        const name =
                          (typeof s === "string"
                            ? s
                            : s?.name || s?.title || s?.subjectName) || null;

                        // lessons can be array of strings or array of objects with name/title
                        const lessonsRaw = Array.isArray(s?.lessons)
                          ? s.lessons
                          : Array.isArray(s?.lessonList)
                          ? s.lessonList
                          : Array.isArray(s?.topics)
                          ? s.topics
                          : [];

                        const lessons = lessonsRaw
                          .map((l) =>
                            typeof l === "string"
                              ? l
                              : l?.name || l?.title || null
                          )
                          .filter(Boolean);

                        return name ? { name, lessons } : null;
                      })
                      .filter(Boolean);
                  };

                  return (
                    <div
                      key={teacher._id}
                      className="flex-none w-64"
                      style={{ scrollSnapAlign: "start" }}
                      data-card
                    >
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                        <div className="relative pb-[75%]">
                          <img
                            src={teacher.image || userPicrure}
                            alt={displayName}
                            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {displayName}
                          </h3>

                          {/* Assigned Subjects */}
                          <div className="text-sm text-gray-700 mt-1">
                            <span className="font-medium text-gray-600 block mb-1">
                              Assigned Subjects:
                            </span>

                            {(() => {
                              const subs = getSubjectsWithLessons(teacher);
                              if (!subs.length) return <span>—</span>;

                              return (
                                <ul className="list-disc list-inside space-y-1">
                                  {subs.map((s, i) => (
                                    <li key={`${s.name}-${i}`}>
                                      <span className="font-semibold">
                                        {s.name}
                                      </span>
                                      {s.lessons?.length ? (
                                        <>: {s.lessons.join(", ")}</>
                                      ) : null}
                                    </li>
                                  ))}
                                </ul>
                              );
                            })()}
                          </div>

                          <div className="mt-auto">
                            <button
                              onClick={() => teacherInfo(teacher._id)}
                              className="bg-blue-400 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 text-sm"
                            >
                              More information
                            </button>
                          </div>
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
                disabled={currentIndex >= Math.max(0, teachers.length - 1)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  currentIndex >= Math.max(0, teachers.length - 1)
                    ? "opacity-50 cursor-not-allowed"
                    : "opacity-90 hover:opacity-100"
                }`}
                aria-label="Next teacher"
              >
                <FaChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center mt-4 gap-2">
              {teachers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToteachers(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-blue-600 w-4" : "bg-gray-300"
                  }`}
                  aria-label={`Go to teacher ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DisplayTeachersData;
