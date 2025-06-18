import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import fetchData from "./services/fetchData";

const DisplayLessonsInfo = ({ id }) => {
  console.log("Fetching lessons for subject ID:", id);
  const [lessonData, setLessonsInfo] = useState([]);
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productWidth, setProductWidth] = useState(0);
  

  useEffect(() => {

    fetchData("subjects", id)
      .then((data) => {
        setLessonsInfo(data);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, [id]);

  const lessons = lessonData.flatMap((lesson) => lesson.lessons || []);

  


  return (
    <div>
      
    </div>
  );
};

export default DisplayLessonsInfo;
