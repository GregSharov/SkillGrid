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
      {/* <h1>Subjects:</h1> */}
      {subjectData.map((item, index) => (
        <div key={index}>

          <a class="p-8 max-w-lg border border-indigo-300 rounded-2xl hover:shadow-xl hover:shadow-indigo-50 flex flex-col items-center" href="#">
          <img src={item.image} alt="Maths subject view"/>
          <div class="mt-8">
            <h4 class="font-bold text-xl">{item.name}</h4>
            <p class="mt-2 text-gray-600">{item.description}</p>
            {/* <div class="mt-5">
                <button id="signUpTolesson" type="button" class="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Sign up for a lesson</button>
            </div> */}
            <ul>
              {item.lessons.map((lesson,lessonIndex) => (
                <li key={lessonIndex}>
                  <a class="p-8 max-w-lg border border-indigo-300 rounded-2xl hover:shadow-xl hover:shadow-indigo-50 flex flex-col items-center" href="#">
                  <img src={lesson.image} alt={`${lesson.name} subject view`}/>
                    <div class="mt-8">
                    <h4 class="font-bold text-xl">{lesson.name}</h4>
                    <p class="mt-2 text-gray-600">{lesson.description}</p>
                    <div class="mt-5">
                        <button id="signUpTolesson" type="button" class="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900">Sign up for a lesson</button>
                    </div>
                    </div>
                 </a>

                </li>
              ))}
            </ul>
          </div>
          </a>




          {/* <h2>{item.name}</h2>
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
          </ul> */}
        </div>
      ))}
    </div>
  );
}

export default DisplaySubjectData;
