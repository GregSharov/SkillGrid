import { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import fetchData from "../services/fetchData";

const animatedComponents = makeAnimated();

function TeacherCard({ teacher }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});

  // Fetch subjects from backend once on component mount
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        setSubjectData(data);
      })
      .catch((err) => console.log("Error fetching data", err));
  }, []);

  // Prepare react-select options for subjects: {value, label}
  const subjectSelectOptions = subjectData.map((subject) => ({
    value: subject._id,
    label: subject.name,
    lessons: subject.lessons || [],
  }));

  // Called when selected subjects change
  const handleSubjectChange = (selected) => {
    setSelectedSubjects(selected || []);

    // Initialize lessons array for newly selected subjects if missing
    const updatedLessons = { ...selectedLessonsBySubject };
    selected?.forEach((subject) => {
      if (!updatedLessons[subject.value]) {
        updatedLessons[subject.value] = [];
      }
    });

    // Remove lessons for subjects that got unselected
    Object.keys(updatedLessons).forEach((key) => {
      if (!selected.find((subj) => subj.value === key)) {
        delete updatedLessons[key];
      }
    });

    setSelectedLessonsBySubject(updatedLessons);
  };

  // Called when lessons selected for a specific subject change
  const handleLessonChange = (subjectId, selectedLessons) => {
    setSelectedLessonsBySubject((prev) => ({
      ...prev,
      [subjectId]: selectedLessons || [],
    }));
  };

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

      {/* Subjects Multi-select */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Select Subjects:</h2>
        <Select
          closeMenuOnSelect={false}
          components={animatedComponents}
          isMulti
          options={subjectSelectOptions}
          value={selectedSubjects}
          onChange={handleSubjectChange}
          placeholder="Choose subjects..."
        />
      </div>

      {/* Lessons Multi-select dropdowns for each selected subject */}
      {selectedSubjects.map((subject) => {
        const fullSubject = subjectData.find((s) => s._id === subject.value);

        const lessonOptions = (fullSubject?.lessons || []).map((lesson) => ({
          value: lesson._id,
          label: lesson.name,
        }));

        return (
          <div key={subject.value} className="mt-4 ml-4">
            <h3 className="text-md font-medium">
              Lessons for: {subject.label}
            </h3>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={lessonOptions}
              value={selectedLessonsBySubject[subject.value] || []}
              onChange={(selected) =>
                handleLessonChange(subject.value, selected)
              }
              placeholder="Choose lessons..."
            />
          </div>
        );
      })}

      {/* Save button to commit selections to backend */}
      <button
        onClick={() => {
          console.log("Saving data...", teacher._id, selectedSubjects, selectedLessonsBySubject);
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save to Database
      </button>

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
  );
}

export default TeacherCard;
