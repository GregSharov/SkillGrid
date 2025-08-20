import { useState, useEffect, useRef } from "react";
import makeAnimated from "react-select/animated";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";
import SelectSubjectsForm from "./SelectSubjectsForm";

const animatedComponents = makeAnimated();

function UserCard({ user }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});
  // const [userSubjects, setUserSubjects] = useState(user.subjects || []);
  const [userImage, setUserImage] = useState(user.image || "");
  const [scheduledLessons, setScheduledLessons] = useState([]);

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
      // const updatedUser = await response.json();
      // setUserSubjects(updatedUser.subjects);
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

  // Fetch subjects data
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

  // Fetch scheduled lessons
  useEffect(() => {
    const fetchScheduledLessons = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/schedule/user/${user._id}`
        );
        if (!response.ok) throw new Error("Failed to fetch scheduled lessons");
        const data = await response.json();
        console.log("Scheduled Lessons:", data);
        setScheduledLessons(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchScheduledLessons();
  }, [user._id]);

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

          {/* Select Subjects and Lessons Form */}
          {user.isTeacher && (
            <SelectSubjectsForm
              animatedComponents={animatedComponents}
              subjectSelectOptions={subjectSelectOptions}
              selectedSubjects={selectedSubjects}
              handleSubjectChange={handleSubjectChange}
              selectedLessonsBySubject={selectedLessonsBySubject}
              handleLessonChange={handleLessonChange}
              handleSave={handleSave}
              subjectData={subjectData}
            />
          )}
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
            {scheduledLessons.map((items) =>
              items.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800 text-lg">
                      {slot.lesson.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {slot.date} {slot.time}
                    </p>
                    {!user.isTeacher && (
                      <p className="text-gray-600 text-sm">
                        Teacher: {items.teacher.firstName}{" "}
                        {items.teacher.lastName}
                      </p>
                    )}
                    {user.isTeacher && (
                      <p className="text-gray-600 text-sm">
                        Student: {items.student.firstName}{" "}
                        {items.student.lastName}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={items.link}
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
              ))
            )}
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
