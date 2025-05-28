function TeacherCard({ teacher }) {
  return (
    <>
      <h1>{teacher.firstName}</h1>
      <h1>{teacher.lastName}</h1>
      <p>
        {new Date(teacher.dateOfBirth)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </p>
    </>
  );
}

export default TeacherCard;
