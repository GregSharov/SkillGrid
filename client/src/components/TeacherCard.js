function TeacherCard({ teacher }) {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white my-4">
      <h1 className="text-xl font-bold">
        Name: {teacher.firstName} {teacher.lastName}
      </h1>
      <p>Email: {teacher.email}</p>
      <p>Phone: {teacher.phone}</p>
      <p>
        Date of Birth:{" "}
        {new Date(teacher.dateOfBirth)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </p>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Subjects:</h2>
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
  );
}

export default TeacherCard;

// function TeacherCard({ teacher }) {
//   return (
//     <>
//       <h1>Name: {teacher.firstName}</h1>
//       <h1>Surname: {teacher.lastName}</h1>
//       {teacher.subjects.map((subject, index) => (
//         <div key={index}>
//           <h2>Subject: {subject.name}</h2>
//           {subject.lessons.map((lesson, lessonIndex) => (
//             <ul key={lessonIndex}>
//               <li>Lesson: {lesson.name}</li>
//             </ul>
//           ))}
//         </div>
//       ))}
//       {/* <p>
//         {new Date(teacher.dateOfBirth)
//           .toLocaleDateString("en-GB")
//           .replaceAll("/", "-")}
//       </p> */}
//     </>
//   );
// }

// export default TeacherCard;
