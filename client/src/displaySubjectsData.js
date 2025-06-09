import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";

// import DisplayLessonsData from "./displayLessonsDada";

const DisplaySubjectData = ({ onSubjectClick }) => {
  const [subjectData, setSubjectData] = useState([]);
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);

  const handleButtonClick = (id) => {
    onSubjectClick(id);
    console.log("Button clicked with ID:", id);
  };

  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        setSubjectData(data);
      })
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
    if (carouselRef.current) {
      resizeObserver.observe(carouselRef.current);
    }

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

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToLessons(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < subjects.length - 1) {
      scrollToLessons(currentIndex + 1);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          S u b j e c t s
        </h2>

        {/* Subject section */}
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
            aria-label="Previous lessons"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 scroll-smooth px-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {subjects.map((product, index) => (
              <button
                key={product._id}
                onClick={() => handleButtonClick(product._id)}
              >
                <div
                  key={product._id}
                  className="flex-none w-64"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <div className="relative pb-[75%]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto"></div>
                    </div>
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
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              currentIndex === subjects.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "opacity-90 hover:opacity-100"
            }`}
            aria-label="Next lesson"
          >
            <FaChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Navigation Indicators */}
        <div className="flex justify-center mt-4 gap-2">
          {subjects.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToLessons(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to lesson ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplaySubjectData;
