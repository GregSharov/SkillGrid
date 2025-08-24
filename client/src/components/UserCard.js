import { useState, useEffect, useRef } from "react";
import makeAnimated from "react-select/animated";
import { useNavigate } from "react-router-dom";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";
import SelectSubjectsForm from "./SelectSubjectsForm";

const animatedComponents = makeAnimated();

function UserCard({ authUser }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [profile, setProfile] = useState(null);
  const [userImage, setUserImage] = useState();

  const navigate = useNavigate();
  // // When the user logs in
  // localStorage.setItem("role", "teacher"); // or "student"
  // const role = localStorage.getItem("role"); // or get it from context

  const generateLessonCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a random 6-character code

  const openVideoManager = () => {
    const code = generateLessonCode();

    //   if (role === "teacher") {
    //     navigate(`/call/${code}`);
    //   } else if (role === "student") {
    //     navigate(`/join/${code}`);
    //   } else {
    //     alert("Unknown role. Please sign in again.");
    //   }
    // };

    if (authUser?.role === "teacher") {
      navigate(`/call/${code}`);
    } else if (authUser?.role === "student") {
      navigate(`/join/${code}`);
    } else {
      alert("Unregistered user. Please sign in again.");
    }
  };

  // Fetch full profile by id
  useEffect(() => {
    if (!authUser?.id) return;
    // console.log("Auth User:", authUser);
    (async () => {
      const res = await fetch(`http://localhost:3000/user/${authUser?.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch user profile");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setUserImage(data.user?.image || "");
    })();
  }, [authUser]);

  // Image input reference
  const fileInputRef = useRef(null);
  const { uploadImage, loading } = useUploadImage();

  // Save user data
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
        `http://localhost:3000/user/${authUser?.id}/subjects`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            subjects: cleanSubjects,
            lessons: cleanLessons,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save data:", response.statusText);
        // return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await uploadImage(authUser?.id, file);
    if (result?.imageUrl) setUserImage(result.imageUrl);
  };

  // Fetch subjects data
  useEffect(() => {
    fetchData("subjects")
      .then((data) => {
        setSubjectData(data);
        if (profile?.subjects?.length) {
          const preSelectedSubjects = profile.subjects.map((s) => ({
            value: s._id,
            label: s.name,
          }));
          setSelectedSubjects(preSelectedSubjects);
          const preSelectedLessonsBySubject = {};
          profile.subjects.forEach((s) => {
            preSelectedLessonsBySubject[s._id] = (s.lessons || []).map((l) => ({
              value: l._id,
              label: l.name,
            }));
          });
          setSelectedLessonsBySubject(preSelectedLessonsBySubject);
        }
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
      });
  }, [profile]);

  // Fetch scheduled lessons
  useEffect(() => {
    const fetchScheduledLessons = async () => {
      try {
        if (!authUser?.id) return;

        const response = await fetch(
          `http://localhost:3000/schedule/user/${authUser.id}`,
          {
            credentials: "include",
          }
        );

        if (response.status === 401) {
          console.error("Session expired. Not logged in.");
          return navigate("/sign-in");
        }

        if (!response.ok) {
          console.error(
            "Failed to fetch scheduled lessons:",
            response.statusText
          );
          return;
        }

        const data = await response.json();
        setScheduledLessons(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchScheduledLessons();
  }, [authUser, navigate]);

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

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      // Redirect to login page
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Delete lesson slot
  const handleDeleteLesson = async (slotId) => {
    console.log("Deleting slot with ID:", slotId);
    try {
      const response = await fetch(
        `http://localhost:3000/schedule/delete/${slotId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      // Remove the deleted lesson from the state
      setScheduledLessons((prev) =>
        prev
          .map((doc) => ({
            ...doc,
            slots: (doc.slots || []).filter((s) => s?._id !== slotId),
          }))
          .filter((doc) => (doc.slots || []).length > 0)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Welcome {profile?.firstName}!</h1>
        <button
          className="text-blue-500 hover:underline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="bg-gray-100 min-h-screen p-6 flex justify-center">
        <div className="w-full max-w-7xl grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg cursor-pointer">
              <img
                src={userImage}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                className="w-full h-full object-cover object-center transition-transform duration-300 transform hover:scale-105"
                onClick={handleImageClick}
              />
              <div className="absolute bottom-0 left-0 w-full h-12 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-semibold text-sm">
                Change Image
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 text-center">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-gray-600 text-center">{profile?.email}</p>
            <p className="text-gray-600 text-center">{profile?.phone}</p>
            <p className="text-gray-600 text-center">
              DOB:{" "}
              {new Date(profile?.dateOfBirth)
                .toLocaleDateString("en-GB")
                .replaceAll("/", "-")}
            </p>

            {/* Select Subjects and Lessons Form */}
            {authUser?.role === "teacher" && (
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

          {/* Display Scheduled Lessons */}
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
                    key={slot?._id}
                    className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-gray-800 text-lg">
                        {slot.lesson.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {slot.date} {slot.time}
                      </p>
                      {!profile?.isTeacher && (
                        <p className="text-gray-600 text-sm">
                          Teacher: {items.teacher.firstName}{" "}
                          {items.teacher.lastName}
                        </p>
                      )}
                      {profile?.isTeacher && (
                        <p className="text-gray-600 text-sm">
                          Student: {items.student.firstName}{" "}
                          {items.student.lastName}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        type="button" // important if inside a form
                        onClick={openVideoManager} // open the video call page
                      >
                        Join Lesson
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                        onClick={() => handleDeleteLesson(slot?._id)}
                      >
                        Delete
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
    </div>
  );
}

export default UserCard;
