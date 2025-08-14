import { useLocation } from "react-router-dom";

function DisplayTeacherData() {
  const location = useLocation();
  const teacher = location.state?.teacher; // Get full object

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
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Assigned Subjects:</h2>
            {teacher.subjects.length === 0 && <p>No subjects assigned.</p>}
            {teacher.subjects.map((subject, index) => (
              <div key={index} className="ml-4 mt-2">
                <h3 className="font-medium">Subject: {subject.name}</h3>
                {subject.lessons && subject.lessons.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {subject.lessons.map((lesson, lessonIndex) => (
                      <li key={lessonIndex}>Lesson: {lesson.name}</li>
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
        </div>
      ) : (
        <p>No teacher data found.</p>
      )}
    </>
  );
}

export default DisplayTeacherData;
