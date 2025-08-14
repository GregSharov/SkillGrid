import { useLocation } from "react-router-dom";
import CarouselLessons from "./carouselLessons";

function DisplayTeacherData() {
  const location = useLocation();
  const teacher = location.state?.teacher; // Get full object
  const lessonsArray = teacher.subjects.flatMap((subject) => subject.lessons || []);

  return (
    <>
      {teacher ? (
        <div>
          <p>
            {teacher.firstName} {teacher.lastName}
          </p>
          <img
            src={teacher.image}
            alt={`${teacher.firstName} ${teacher.lastName}`}
            className="mt-4 rounded-lg shadow-md"
          />
          {/* Display current assigned subjects and lessons */}
          <CarouselLessons subjectId={null} lessonsArray={lessonsArray} />
          {/* {console.log("From teacher info: ", lessonsArray)} */}
        </div>
      ) : (
        <p>No teacher data found.</p>
      )}
    </>
  );
}

export default DisplayTeacherData;
