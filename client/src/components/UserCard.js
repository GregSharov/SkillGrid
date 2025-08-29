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

  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate(`/teacher-info/${teacherId}`);
  };

  const openVideoManager = async (roomId) => {
    try {
      if (authUser?.role === "teacher") navigate(`/call/${roomId}`);
      else if (authUser?.role === "student") navigate(`/join/${roomId}`);
      else alert("Unregistered user. Please sign in again.");
    } catch (error) {
      console.error("Error opening video manager:", error);
    }
  };

  useEffect(() => {
    if (!authUser?.id) return;
    (async () => {
      const res = await fetch(`http://localhost:3000/user/${authUser?.id}`, {
        credentials: "include",
      });
      if (!res.ok) return console.error("Failed to fetch user profile");
      const data = await res.json();
      setProfile(data.user);
      setUserImage(data.user?.image || "");
    })();
  }, [authUser]);

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
      await fetch(`http://localhost:3000/user/${authUser?.id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subjects: cleanSubjects,
          lessons: cleanLessons,
        }),
      });
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
      .catch(console.error);
  }, [profile]);

  useEffect(() => {
    const fetchScheduledLessons = async () => {
      try {
        if (!authUser?.id) return;
        const response = await fetch(
          `http://localhost:3000/schedule/user/${authUser.id}`,
          { credentials: "include" }
        );
        if (response.status === 401) return navigate("/sign-in");
        if (!response.ok)
          return console.error("Failed to fetch scheduled lessons");
        const data = await response.json();
        setScheduledLessons(data.data);
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

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLesson = async (slotId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/schedule/delete/${slotId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to delete lesson");

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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow px-6 py-4 ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome {profile?.firstName}!
          </h1>
          <button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-6 flex flex-col items-center">
            <div
              className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-slate-100 shadow cursor-pointer group"
              onClick={handleImageClick}
            >
              <img
                src={userImage}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                className="w-full h-full object-cover object-[80%_20%] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full h-12 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-medium text-sm">
                Change Image
              </div>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900 text-center">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-slate-600 text-center">{profile?.email}</p>
            <p className="text-slate-600 text-center">{profile?.phone}</p>
            <p className="text-slate-600 text-center">
              DOB:{" "}
              {new Date(profile?.dateOfBirth)
                .toLocaleDateString("en-GB")
                .replaceAll("/", "-")}
            </p>

            {authUser?.role === "teacher" && (
              <div className="mt-6 w-full">
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
              </div>
            )}
          </div>

          {/* Scheduled Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Scheduled Lessons
            </h2>

            {scheduledLessons.length === 0 && (
              <p className="text-slate-500">No lessons scheduled.</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {scheduledLessons.map((items) =>
                items.slots.map((slot) => (
                  <div
                    key={slot?._id}
                    className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-lg text-slate-900">
                        {slot.lesson.name}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {slot.date} {slot.time}
                      </p>

                      {!profile?.isTeacher ? (
                        <button
                          className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                          onClick={() => teacherInfo(items.teacher._id)}
                        >
                          Teacher: {items.teacher.firstName} {items.teacher.lastName}
                        </button>
                      ) : (
                        <p className="text-slate-600 text-sm">
                          Student: {items.student.firstName} {items.student.lastName}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      {new Date(slot.date).setHours(
                        slot.time.split(":")[0],
                        0,
                        0,
                        0
                      ) < new Date().setHours(new Date().getHours() + 1) ? (
                        <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-sm font-medium">
                          Completed
                        </span>
                      ) : (
                        <button
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                          onClick={() => openVideoManager(slot?._id)}
                        >
                          Join Lesson
                        </button>
                      )}

                      <button
                        className="px-3 py-1 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
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
          <p className="mt-2 text-slate-500 font-medium">Uploading...</p>
        )}
      </div>
    </div>
  );
}

export default UserCard;
