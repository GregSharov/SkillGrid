import { useState, useEffect } from "react";

// Show data to main page
function ShowTeacherData() {
  const [teacherData, setTeacherData] = useState([]);
  const url = "http://localhost:3000/teachers";

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        setTeacherData(sortedData);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  return (
    <div>
      <h1>Teachers:</h1>
      {teacherData.map((item, index) => (
        <div key={index}>
          <p>
            {item.firstName} {item.lastName}
          </p>
          {/* Turn ISO date 2021-11-18T00:00:00.000Z to usual format dd-mm-yyyy */}
          <p>{new Date (item.dateOfBirth).toLocaleDateString('en-GB').replaceAll("/", "-")}</p>
          <p>{item.email}</p>
          <p>{item.phone}</p>
          {/* <p>{item.password}</p> */}
          <h2>Subjects:</h2>
          <ul>
            {item.subjects.map((subject, subjectIndex) => (
              <li key={subjectIndex}>
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
                <img src={subject.image} alt={`${subject.name} view`}></img>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ShowTeacherData;
