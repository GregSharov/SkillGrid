import { useState, useEffect } from "react";

// Show data to main page
function DisplaySubjectData() {
  const [subjectData, setSubjectData] = useState([]);
  const url = "http://localhost:3000/subjects";

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSubjectData(sortedData);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  return (
    <div>
      <h1>Subjects:</h1>
      {subjectData.map((item, index) => (
        <div key={index}>
          <p>
            {item.name} {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default DisplaySubjectData;
