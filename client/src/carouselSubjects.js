import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";
import API_URL from "./services/apiBase.js";

const CarouselSubjects = ({ onSubjectClick }) => {
  const [subjectData, setSubjectData] = useState([]);
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);

  const handleButtonClick = (subjectId) => {
    onSubjectClick(subjectId);
  };

  useEffect(() => {
    fetchData("subjects")
      .then((data) => setSubjectData(data))
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  const subjects = subjectData.flatMap((subject) => subject || []);

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
    if (carouselRef.current) resizeObserver.observe(carouselRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const scrollToLessons = (index) => {
    if (carouselRef.current && productWidth > 0) {
      carouselRef.current.scrollTo({
        left: index * productWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () =>
    currentIndex > 0 && scrollToLessons(currentIndex - 1);
  const handleNext = () =>
    currentIndex < subjects.length - 1 && scrollToLessons(currentIndex + 1);

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
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      }
    };
    const carousel = carouselRef.current;
    carousel?.addEventListener("scroll", handleScroll);
    return () => carousel?.removeEventListener("scroll", handleScroll);
  }, [currentIndex, productWidth]);

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        {/* <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Browse <span className="text-indigo-600">Subjects</span>
          </h2>
          <p className="mt-1 text-slate-600 text-sm">
            Pick a subject to explore lessons and teachers.
          </p>
        </div> */}

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            onKeyDown={(e) => handleKeyPress(e, "left")}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
              inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow
              hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition
              ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Previous subjects"
          >
            <FaChevronLeft className="h-4 w-4 text-slate-700" />
          </button>

          {/* Track */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-2 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {subjects.map((subject) => (
              <button
                key={subject._id}
                onClick={() => handleButtonClick(subject._id)}
                className="flex-none w-64 focus:outline-none"
                style={{ scrollSnapAlign: "start" }}
                aria-label={`Open ${subject.name}`}
              >
                <div className="h-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl">
                  {/* Image */}
                  <div className="relative pb-[66%]">
                    <img
                      src={`${API_URL}${subject.image}`}
                      alt={subject.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    {/* subtle gradient at bottom for title legibility if needed */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                      {subject.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            onKeyDown={(e) => handleKeyPress(e, "right")}
            disabled={currentIndex === subjects.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
              inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow
              hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition
              ${
                currentIndex === subjects.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            aria-label="Next subjects"
          >
            <FaChevronRight className="h-4 w-4 text-slate-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {subjects.map((_, index) => {
            const active = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => scrollToLessons(index)}
                className={`h-2 rounded-full transition-all
                  ${
                    active
                      ? "w-6 bg-indigo-600"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                aria-label={`Go to subject ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarouselSubjects;
