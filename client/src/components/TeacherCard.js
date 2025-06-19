function TeacherCard({ teacher }) {
  if (teacher.length === 0) {
    return <p>Very soon a teacher will come...</p>;
  }

  return (
    <>
      <h1>Name: {teacher.firstName}</h1>
      <h1>Surname: {teacher.lastName}</h1>
      {teacher.subjects.map((subject, index) => (
        <div key={index}>
          <h2>Subject: {subject.name}</h2>
          {subject.lessons.map((lesson, lessonIndex) => (
            <ul key={lessonIndex}>
              <li>Lesson: {lesson.name}</li>
            </ul>
          ))}
        </div>
      ))}
      {/* <p>
        {new Date(teacher.dateOfBirth)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </p> */}
    </>
  );
}

export default TeacherCard;
