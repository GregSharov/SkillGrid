import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";

const animatedComponents = makeAnimated();

function UserCard({ user }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});
  const [userSubjects, setUserSubjects] = useState(user.subjects || []);
  const [userImage, setUserImage] = useState(user.image || "");
  const [scheduledLessons, setScheduledLessons] = useState([
    {
      id: 1,
      title: "Calculus",
      date: "2025-08-20 10:00",
      student: "John Doe",
      link: "#",
    },
    {
      id: 2,
      title: "Organic Chemistry",
      date: "2025-08-21 14:00",
      student: "Jane Smith",
      link: "#",
    },
  ]);

  const fileInputRef = useRef(null);
  const { uploadImage, loading } = useUploadImage();

  const handleSave = async () => {
    if (!selectedSubjects.length) return;
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
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await uploadImage(user._id, file);
    if (result?.imageUrl) setUserImage(result.imageUrl);
  };

  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        setSubjectData(data);
        if (user.subjects?.length) {
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
      .catch(console.error);
  }, [user]);

  const subjectSelectOptions = subjectData.map((subject) => ({
    value: subject._id,
    label: subject.name,
    lessons: subject.lessons || [],
  }));

  const handleSubjectChange = (selected) => {
    setSelectedSubjects(selected || []);
    const updatedLessons = { ...selectedLessonsBySubject };
    selected?.forEach((subject) => {
      if (!updatedLessons[subject.value]) updatedLessons[subject.value] = [];
    });
    Object.keys(updatedLessons).forEach((key) => {
      if (!selected.find((subj) => subj.value === key))
        delete updatedLessons[key];
    });
    setSelectedLessonsBySubject(updatedLessons);
  };

  const handleLessonChange = (subjectId, selectedLessons) => {
    setSelectedLessonsBySubject((prev) => ({
      ...prev,
      [subjectId]: selectedLessons || [],
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-7xl grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg cursor-pointer">
            <img
              src={userImage}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover object-center transition-transform duration-300 transform hover:scale-105"
              onClick={handleImageClick}
            />
            <div className="absolute bottom-0 left-0 w-full h-12 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-semibold text-sm">
              Change Image
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 text-center">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600 text-center">{user.email}</p>
          <p className="text-gray-600 text-center">{user.phone}</p>
          <p className="text-gray-600 text-center">
            DOB:{" "}
            {new Date(user.dateOfBirth)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")}
          </p>

          <div className="mt-6 w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Subjects
            </h3>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={subjectSelectOptions}
              value={selectedSubjects}
              onChange={handleSubjectChange}
              placeholder="Choose subjects..."
              className="rounded-xl shadow-sm"
              classNamePrefix="select"
            />
            {selectedSubjects.map((subject) => {
              const fullSubject = subjectData.find(
                (s) => s._id === subject.value
              );
              const lessonOptions = (fullSubject?.lessons || []).map(
                (lesson) => ({
                  value: lesson._id,
                  label: lesson.name,
                })
              );
              return (
                <div key={subject.value} className="mt-3">
                  <h4 className="text-gray-700 font-medium mb-1">
                    {subject.label} Lessons
                  </h4>
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
                    className="rounded-xl shadow-sm"
                    classNamePrefix="select"
                  />
                </div>
              );
            })}
            <button
              onClick={handleSave}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow hover:bg-blue-700 hover:scale-105 transition transform"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Scheduled Lessons */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Scheduled Lessons
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {scheduledLessons.length === 0 && (
              <p className="text-gray-500">No lessons scheduled.</p>
            )}
            {scheduledLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-lg">
                    {lesson.title}
                  </p>
                  <p className="text-gray-600 text-sm">{lesson.date}</p>
                  <p className="text-gray-600 text-sm">
                    Student: {lesson.student}
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Join Lesson
                  </a>
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                    onClick={() => alert("Edit functionality TBD")}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      {loading && (
        <p className="mt-2 text-gray-500 font-medium">Uploading...</p>
      )}
    </div>
  );
}

export default UserCard;
