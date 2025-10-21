import { useState, useEffect, useRef } from "react";
import makeAnimated from "react-select/animated";
import { useNavigate } from "react-router-dom";
import fetchData from "../services/fetchData";
import useUploadImage from "../services/uploadImage";
import API_URL from "../services/apiBase";
import SelectSubjectsForm from "./SelectSubjectsForm";
import { LogOut, Calendar, User, Phone, Edit, Save, X, Trash2, AlertTriangle } from "lucide-react";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const navigate = useNavigate();

  // Navigate to teacher info page
  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate(`/teacher-info/${teacherId}`);
  };

  // Open video manager
  const openVideoManager = async (roomId, slotId) => {
    try {
      if (authUser?.role === "teacher" || authUser?.role === "student")
        navigate(`/join/${roomId}/${slotId}`);
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
      
      // Populate edit form data
      setEditFormData({
        firstName: data.user?.firstName || "",
        lastName: data.user?.lastName || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
        dateOfBirth: data.user?.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : "",
      });
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
        toast.success("Changes are added 🎉");
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

  const handleDeleteLessonClick = (slot) => {
    setLessonToDelete(slot);
    setShowDeleteLessonModal(true);
  };

  const handleDeleteLesson = async (slotId, authUser) => {
    try {
      const response = await fetch(`${API_URL}/schedule/delete/${slotId}/${authUser?.role}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Failed to delete lesson");
        return;
      } else {
        toast.success("Lesson deleted successfully");
      }

      setScheduledLessons((prev) =>
        prev
          .map((doc) => ({
            ...doc,
            slots: (doc.slots || []).filter((s) => s?._id !== slotId),
          }))
          .filter((doc) => (doc.slots || []).length > 0)
      );
      
      setShowDeleteLessonModal(false);
      setLessonToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  const getSortedScheduledLessons = () => {
    const allSlots = [];
    scheduledLessons.forEach((lesson) => {
      lesson.slots.forEach((slot) => {
        allSlots.push({ ...slot, lessonData: lesson });
      });
    });

    // Sort by date and by time. Time is always ascending.
    return allSlots.sort((a, b) => {
      const dateA = new Date(`${a.date}`);
      const dateB = new Date(`${b.date}`);

      return sortOrder === "asc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditMode(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save profile changes
  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/${authUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(updatedUser);
        setIsEditMode(false);
        toast.success("Profile updated successfully! 🎉");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong.");
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form data to current profile values
    setEditFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
    });
    setIsEditMode(false);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/user/${authUser?.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        // Logout and redirect to sign-in
        await fetch(`${API_URL}/user/logout`, {
          method: "POST",
          credentials: "include",
        });
        navigate("/sign-in");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Something went wrong.");
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
            <div className="px-6 py-4 space-y-3">
              {!isEditMode ? (
                // View Mode
                <div className="space-y-2 text-center">
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
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editFormData.dateOfBirth}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
                const isPast = slotDate < new Date(Date.now() - 1 * 60 * 60 * 1000);
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
                          onClick={() => openVideoManager(slot.lessonData?._id, slot?._id)}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                          >
                            Join
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteLessonClick(slot)}
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

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Account</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  Are you sure you want to delete your account? This will permanently remove:
                </p>
                <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                  <li>Your profile and personal information</li>
                  <li>All scheduled lessons ({scheduledLessons.length} {scheduledLessons.length === 1 ? 'lesson' : 'lessons'})</li>
                  <li>Your subjects and preferences</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleDeleteAccount();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Lesson Confirmation Modal */}
        {showDeleteLessonModal && lessonToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Lesson</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 font-medium mb-2">
                  Are you sure you want to delete this lesson?
                </p>
                <div className="space-y-1.5 text-sm text-slate-700">
                  <p><span className="font-medium">Lesson:</span> {lessonToDelete.lesson.name}</p>
                  <p><span className="font-medium">Date:</span> {new Date(`${lessonToDelete.date} ${lessonToDelete.time}`).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}</p>
                  <p><span className="font-medium">Time:</span> {lessonToDelete.time}</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {authUser?.role === "teacher" 
                    ? `The student (${lessonToDelete.lessonData.student.firstName} ${lessonToDelete.lessonData.student.lastName}) will be notified about this cancellation.`
                    : `The teacher (${lessonToDelete.lessonData.teacher.firstName} ${lessonToDelete.lessonData.teacher.lastName}) will be notified about this cancellation.`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteLessonModal(false);
                    setLessonToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLesson(lessonToDelete._id, authUser)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
                >
                  Delete Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCard;
