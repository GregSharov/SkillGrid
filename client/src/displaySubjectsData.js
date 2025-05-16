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
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <img src={item.image} alt="Maths subject view"></img>
          <ul>
            {item.lessons.map((lesson,lessonIndex) => (
              <li key={lessonIndex}>
                <h3>{lesson.name}</h3>
                <p>{lesson.description}</p>
                <img src={lesson.image} alt={`${lesson.name} subject view`}></img>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DisplaySubjectData;
