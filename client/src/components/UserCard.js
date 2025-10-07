import { useState, useEffect, useRef } from "react";
import makeAnimated from "react-select/animated";
import { useNavigate } from "react-router-dom";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";
import API_URL from "../services/apiBase";
import SelectSubjectsForm from "./SelectSubjectsForm";
import { LogOut, Calendar, User, Phone } from "lucide-react";

import { toast } from 'react-toastify';


const animatedComponents = makeAnimated();
const defaultUserImage = `https://res.cloudinary.com/de3jgizbm/image/upload/v1759523927/user_mtgtft.png`;

function UserCard({ authUser }) {
  const [subjectData, setSubjectData] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLessonsBySubject, setSelectedLessonsBySubject] = useState({});
  const [scheduledLessons, setScheduledLessons] = useState([]);
  const [profile, setProfile] = useState(null);
  const [userImage, setUserImage] = useState(defaultUserImage);
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();

  // Navigate to teacher info page
  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate(`/teacher-info/${teacherId}`);
  };

  // Open video manager
  const openVideoManager = async (roomId) => {
    try {
      if (authUser?.role === "teacher" || authUser?.role === "student")
        navigate(`/join/${roomId}`);
      else alert("Unregistered user. Please sign in again.");
    } catch (error) {
      console.error("Error opening video manager:", error);
    }
  };

  // Fetch user profile
  useEffect(() => {
    if (!authUser?.id) return;
    (async () => {
      const res = await fetch(`${API_URL}/user/${authUser?.id}`, {
        credentials: "include",
      });
      if (!res.ok) return console.error("Failed to fetch user profile");
      const data = await res.json();
      setProfile(data.user);
      setUserImage(`${data.user?.image || ""}`);
    })();
  }, [authUser]);

  // File input reference
  const fileInputRef = useRef(null);
  const { uploadImage, loading } = useUploadImage();

  // Handle save
  const handleSave = async () => {
    if (!selectedSubjects.length){
      toast.warn("Please select at least one subject.");
      return;
    }
    const cleanSubjects = selectedSubjects.map((s) => ({
      value: s.value,
      label: s.label,
    }));
    const cleanLessons = {};
    for (const [subjectId, lessonsArr] of Object.entries(selectedLessonsBySubject)) {
      cleanLessons[subjectId] = lessonsArr.map((l) => ({
        value: l.value,
        label: l.label,
      }));
    }

    try {
      const response = await fetch(`${API_URL}/user/${authUser?.id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subjects: cleanSubjects,
          lessons: cleanLessons,
        }),
      });
      if (response.ok) {
        toast.success("Cganges is added 🎉");
      } else {
        toast.error("Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Error while saving:", error);
      toast.error("Something went wrong.");
    }
  };

  // Handle image upload
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
      .catch(console.error);
  }, [profile]);

  // Fetch scheduled lessons
  useEffect(() => {
    const fetchScheduledLessons = async () => {
      try {
        if (!authUser?.id) return;
        const response = await fetch(
          `${API_URL}/schedule/user/${authUser.id}`,
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

  // Subject select options
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
      const response = await fetch(`${API_URL}/user/logout`, {
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
      const response = await fetch(`${API_URL}/schedule/delete/${slotId}`, {
        method: "DELETE",
        credentials: "include",
      });
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

  const getSortedScheduledLessons = () => {
    const allSlots = [];
    scheduledLessons.forEach((lesson) => {
      lesson.slots.forEach((slot) => {
        allSlots.push({ ...slot, lessonData: lesson });
      });
    });
    return allSlots.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "asc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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
            className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 hover:shadow-lg transition">
            {/* Header with image */}
            <div
              className="relative w-full flex justify-center p-6 border-b border-slate-100 cursor-pointer group"
              onClick={handleImageClick}
            >
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-slate-100 shadow">
                <img
                  src={userImage}
                  alt={`${profile?.firstName} ${profile?.lastName}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-6 w-40 text-center text-xs bg-slate-900/70 text-white py-1 rounded opacity-0 group-hover:opacity-100 transition">
                Change Image
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-2 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-sm text-slate-600 flex justify-center gap-1">
                <User className="w-4 h-4 text-indigo-500" /> {profile?.email}
              </p>
              <p className="text-sm text-slate-600 flex justify-center gap-1">
                <Phone className="w-4 h-4 text-indigo-500" /> {profile?.phone}
              </p>
              <p className="text-sm text-slate-600 flex justify-center gap-1">
                <Calendar className="w-4 h-4 text-indigo-500" /> DOB:{" "}
                {new Date(profile?.dateOfBirth)
                  .toLocaleDateString("en-GB")
                  .replaceAll("/", "-")}
              </p>
            </div>

            {/* Footer → Subject Selection (teachers only) */}
            {authUser?.role === "teacher" && (
              <div className="px-6 py-4 border-t border-slate-100">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Scheduled Lessons
              </h2>
              <button
                onClick={toggleSortOrder}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition"
              >
                {sortOrder === "asc" ? "Earliest First" : "Latest First"}
              </button>
            </div>

            {scheduledLessons.length === 0 && (
              <p className="text-slate-500">No lessons scheduled.</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {getSortedScheduledLessons().map((slot) => {
                const slotDate = new Date(`${slot.date} ${slot.time}`);
                const isPast = slotDate < new Date();
                const isSoon =
                  slotDate > new Date() &&
                  slotDate < new Date(Date.now() + 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={slot?._id}
                    className="flex flex-col justify-between rounded-2xl bg-white shadow-md ring-1 ring-slate-200 hover:shadow-xl transition-transform hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {slot.lesson.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {slotDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {slot.time}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-3">
                      {!profile?.isTeacher ? (
                        <button
                          onClick={() =>
                            teacherInfo(slot.lessonData.teacher._id)
                          }
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Teacher: {slot.lessonData.teacher.firstName}{" "}
                          {slot.lessonData.teacher.lastName}
                        </button>
                      ) : (
                        <p className="text-sm text-slate-600">
                          Student: {slot.lessonData.student.firstName}{" "}
                          {slot.lessonData.student.lastName}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                      {isPast ? (
                        <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                          Completed
                        </span>
                      ) : isSoon ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Upcoming Soon
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          Scheduled
                        </span>
                      )}

                      <div className="flex gap-2">
                        {!isPast && (
                          <button
                            onClick={() => openVideoManager(slot?._id)}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                          >
                            Join
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteLesson(slot?._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 text-sm font-medium hover:bg-rose-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
