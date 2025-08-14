import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";

const animatedComponents = makeAnimated();
// const defaultUserImage = "http://localhost:3000/images/user.png";

function UserCard({ user }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});
  const [userSubjects, setUserSubjects] = useState(user.subjects || []);
  const [userImage, setUserImage] = useState(user.image || "");

  const fileInputRef = useRef(null);
  const { uploadImage, loading } = useUploadImage();

  // Send to DB selected subjects and lessons
  const handleSave = async () => {
    if (!selectedSubjects.length) {
      console.log("No subjects selected. Nothing to save.");
      return;
    }

    const cleanSubjects = selectedSubjects.map((s) => ({
      value: s.value,
      label: s.label,
    }));

    const cleanLessons = {};
    for (const [subjectId, lessonsArr] of Object.entries(
      selectedLessonsBySubject
    )) {
      cleanLessons[subjectId] = lessonsArr.map((l) => ({
        value: l.value,
        label: l.label,
      }));
    }

    try {
      const response = await fetch(
        `http://localhost:3000/user/${user._id}/subjects`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjects: cleanSubjects,
            lessons: cleanLessons,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save data");

      const updatedUser = await response.json();
      setUserSubjects(updatedUser.subjects);
      console.log("Data saved successfully:", updatedUser);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click(); // Open file dialog
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await uploadImage(user._id, file);
    if (result?.imageUrl) {
      setUserImage(result.imageUrl);
    }
  };

  // Fetch subjects from backend once on component mount
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        setSubjectData(data);

        // Pre-fill dropdowns from current user subjects in DB
        if (user.subjects && user.subjects.length > 0) {
          const preSelectedSubjects = user.subjects.map((s) => ({
            value: s._id,
            label: s.name,
          }));
          setSelectedSubjects(preSelectedSubjects);

          const preSelectedLessonsBySubject = {};
          user.subjects.forEach((s) => {
            preSelectedLessonsBySubject[s._id] = (s.lessons || []).map((l) => ({
              value: l._id,
              label: l.name,
            }));
          });
          setSelectedLessonsBySubject(preSelectedLessonsBySubject);
        }
      })
      .catch((err) => console.log("Error fetching data", err));
  }, [user]);

  // useEffect(() => {
  //   fetchData("subjects")
  //     .then((data) => {
  //       setSubjectData(data);
  //     })
  //     .catch((err) => console.log("Error fetching data", err));
  // }, []);

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
    <div className="flex">
      <div className="p-4 border w-2/3 rounded-lg shadow-md bg-white m-4">
        <h1 className="text-xl font-bold">
          Name: {user.firstName} {user.lastName}
        </h1>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
        <p>
          Date of Birth:{" "}
          {new Date(user.dateOfBirth)
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
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save to Database
        </button>

        {/* Display current assigned subjects and lessons */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Assigned Subjects:</h2>
          {userSubjects.length === 0 && <p>No subjects assigned.</p>}
          {userSubjects.map((subject, index) => (
            <div key={index} className="ml-4 mt-2">
              <h3 className="font-medium">{subject.name}</h3>
              {subject.lessons && subject.lessons.length > 0 ? (
                <ul className="list-disc ml-6">
                  {subject.lessons.map((lesson, lessonIndex) => (
                    <li key={lessonIndex}>{lesson.name}</li>
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
      <div className="p-4 border w-1/4 rounded-lg shadow-md bg-white m-4">
        <img
          src={userImage}
          alt={`${user.firstName} ${user.lastName}`}
          className="mt-2 rounded-md w-full h-96 object-cover cursor-pointer hover:opacity-80"
          onClick={handleImageClick}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        {loading && <p>Uploading...</p>}
      </div>
    </div>
  );
}

export default UserCard;
