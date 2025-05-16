import { useState, useEffect } from "react";

// Show data to main page
function ShowStudentData() {
  const [studentData, setStudentData] = useState([]);
  const url = "http://localhost:3000/students";

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        setStudentData(sortedData);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  return (
    <div>
      <h1>Students:</h1>
      {studentData.map((item, index) => (
        <div key={index}>
          <p>
            {item.firstName} {item.lastName}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ShowStudentData;
