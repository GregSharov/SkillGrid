
import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsCart3 } from "react-icons/bs";


  const DisplayLessonsData = () => {
    const [subjectData, setLessonsData] = useState([]);
    const url = "http://localhost:3000/subjects";


    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [productWidth, setProductWidth] = useState(0);
    useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setLessonsData(sortedData);
      })
      .catch((err) => console.log("Error fetching data", err));
    }, []);
    
    
    const Lessons = subjectData.map((subject) => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      image: subject.image 
    }));
    const lessons = subjectData.flatMap((subject) => subject.lessons || []);
    

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
          behavior: "smooth"
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
      if (currentIndex < lessons.length - 1) {
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
      carousel?.addEventListener('scroll', handleScroll);
      return () => carousel?.removeEventListener('scroll', handleScroll);
    }, [currentIndex, productWidth]);

    return (
      <div className="w-full px-4 py-2 bg-gray-50">
        <div className="max-w-7xl mx-auto relative">

          {/* Lesson section */}

          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">L e s s o n s</h2>

          <div className="relative group">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              onKeyDown={(e) => handleKeyPress(e, "left")}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
              }`}
              aria-label="Previous lessons"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-700" />
            </button>

            
            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 scroll-smooth px-2"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {lessons.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-none w-64"
                  style={{ scrollSnapAlign: 'start' }}
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
                      <div className="flex items-center justify-between mt-auto">
                        
                        <button className="flex items-center gap-1 bg-blue-400 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 text-sm" aria-label={`Sign up for ${product.name}`}>
                          {/* <BsCart3 className="w-4 h-4" /> */}
                          <span>Sign up for a lesson</span>
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
              disabled={currentIndex === lessons.length - 1}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentIndex === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
              }`}
              aria-label="Next lesson"
            >
              <FaChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Navigation Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {lessons.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToLessons(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'
                }`}
                aria-label={`Go to lesson ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

export default DisplayLessonsData;









// // Show data to main page
// function DisplaySubjectData() {
//   const [subjectData, setSubjectData] = useState([]);
//   const url = "http://localhost:3000/subjects";

//   useEffect(() => {
//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         const sortedData = data.sort((a, b) =>
//           a.name.localeCompare(b.name)
//         );
//         setSubjectData(sortedData);
//       })
//       .catch((err) => console.log("Error fetching data", err));
//   }, []);

//   return (
//     <div>
//       {subjectData.map((item, index) => (
//         <div key={index}>

//           <a className="p-8 max-w-lg border border-indigo-300 rounded-2xl hover:shadow-xl hover:shadow-indigo-50 flex flex-col items-center" href="#">
//           <img src={item.image} alt="Maths subject view"/>
//           <div className="mt-8">
//             <h4 className="font-bold text-xl">{item.name}</h4>
//             <p className="mt-2 text-gray-600">{item.description}</p>
//             <ul>
//               {item.lessons.map((lesson,lessonIndex) => (
//                 <li key={lessonIndex}>
//                   <a className="p-8 max-w-lg border border-indigo-300 rounded-2xl hover:shadow-xl hover:shadow-indigo-50 flex flex-col items-center" href="#">
//                   <img src={lesson.image} alt={`${lesson.name} subject view`}/>
//                     <div className="mt-8">
//                     <h4 className="font-bold text-xl">{lesson.name}</h4>
//                     <p className="mt-2 text-gray-600">{lesson.description}</p>
//                     <div className="mt-5">
//                         <button id="signUpTolesson" type="button" className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Sign up for a lesson</button>
//                     </div>
//                     </div>
//                  </a>

//                 </li>
//               ))}
//             </ul>
//           </div>
//           </a>




//           {/* <h2>{item.name}</h2>
//           <p>{item.description}</p>
//           <img src={item.image} alt="Maths subject view"></img>
//           <ul>
//             {item.lessons.map((lesson,lessonIndex) => (
//               <li key={lessonIndex}>
//                 <h3>{lesson.name}</h3>
//                 <p>{lesson.description}</p>
//                 <img src={lesson.image} alt={`${lesson.name} subject view`}></img>
//               </li>
//             ))}
//           </ul> */}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default DisplaySubjectData;
