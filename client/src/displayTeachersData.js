import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import CarouselLessons from "./carouselLessons.js";

// NEW: reviews UI
import RatingStars from "./components/RatingStars.js";
import ReviewsList from "./components/ReviewList.js";
import ReviewForm from "./components/ReviewForm.js";
import API_URL from "./services/apiBase.js";

function DisplayTeacherData() {
  // State for managing booking status
  const [isBooking, setIsBooking] = useState(false);
  const inFlightRef = useRef(false);

  // Get teacher ID from URL parameters
  const { teacherId } = useParams();

  // State for student data (id, role)
  const [student, setStudent] = useState();

  // convenience flag
  const isStudent = student?.role === "student";

  // State for student profile
  const [studentProfile, setStudentProfile] = useState();

  // State for teacher profile
  const [teacherProfile, setTeacherProfile] = useState();

  // State teacher's lessons
  const [lessonsArray, setLessonsArray] = useState([]);

  // State for teacher's scheduled lessons
  const [teacherScheduledLessons, setTeacherScheduledLessons] = useState([]);

  // State for Reviews refresh trigger
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  // Function to check if chosen slot's time and date match teacher's scheduled lessons
  const isSlotConflicting = (time, dateObj) => {
    const hour = Number(String(time).split(":")[0]);

    const chosen = new Date(dateObj);
    chosen.setHours(hour, 0, 0, 0);

    return teacherScheduledLessons.some((slot) => {
      const slotHour = Number(String(slot.time).split(":")[0]);
      const slotDate = new Date(slot.date);
      slotDate.setHours(slotHour, 0, 0, 0);
      return slotDate.getTime() === chosen.getTime();
    });
  };

  // State for managing selected week and slots
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [chosenLesson, setChosenLesson] = useState(null);

  // State for Response from Server
  const [responseData, setResponseData] = useState(null);
  // Response Style Color
  const [resStyleColor, setResStyleColor] = useState("");

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Generate time slots for the day
  const timeSlots = [];
  for (let hour = 7; hour < 20; hour++)
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);

  // Get the start and end dates of the week
  const getWeekDates = (offset) => {
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay + offset * 7);
    const friday = new Date(sunday);
    friday.setDate(sunday.getDate() + 5);
    return { start: sunday, end: friday };
  };

  const { start, end } = getWeekDates(selectedWeekOffset);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Cell click handler
  const handleCellClick = (day, time, date) => {
    const key = `${day}-${time}-${date}`;
    const exists = selectedSlots.find((slot) => slot.key === key);

    if (exists) {
      setSelectedSlots((s) => s.filter((slot) => slot.key !== key));
    } else {
      setSelectedSlots((s) => [
        ...s,
        { key, day, time, date, lesson: { ...chosenLesson } },
      ]);
    }
  };

  // Enroll in selected slots
  const handleEnroll = async () => {
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot.");
      return;
    }
    if (isBooking || inFlightRef.current) return;

    setIsBooking(true);
    inFlightRef.current = true;

    try {
      const response = await fetch(`${API_URL}/schedule/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          teacher: teacherProfile,
          student: studentProfile,
          slots: selectedSlots,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResponseData(data);
        setResStyleColor("text-red-600");
        throw new Error("Failed to schedule lessons");
      }

      setChosenLesson(lessonsArray[0] || null);
      setSelectedSlots([]);
      setResponseData(data);
      setResStyleColor("text-emerald-600");

      await fetchTeacherScheduledLessons();
    } catch (error) {
      console.error("Error scheduling lessons:", error);
    } finally {
      setIsBooking(false);
      inFlightRef.current = false;
    }
  };

  // Fetch teacher's scheduled lessons
  const fetchTeacherScheduledLessons = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await fetch(
        `${API_URL}/schedule/user/${teacherId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        const lessons = (data.data || []).flatMap((doc) => doc.slots || []);
        setTeacherScheduledLessons(lessons);
      } else {
        console.error("Error fetching teacher's scheduled lessons:", data);
      }
    } catch (error) {
      console.error("Error fetching teacher's scheduled lessons:", error);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacherScheduledLessons();
  }, [fetchTeacherScheduledLessons]);

  // Fetch student ID (session)
  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const response = await fetch(`${API_URL}/user/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setStudent(data.user);
        } else {
          console.error("Error fetching student data:", data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchStudentId();
  }, []);

  // Fetch student profile
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/user/${student?.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) setStudentProfile(data.user);
        else console.error("Error fetching student profile:", data);
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    };
    if (student) fetchStudentProfile();
  }, [student]);

  // Fetch teacher profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/user/${teacherId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) setTeacherProfile(data.user);
        else console.error("Error fetching teacher profile:");
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };
    if (teacherId) fetchTeacherProfile();
  }, [teacherId]);

  // Set lessons from teacher profile
  useEffect(() => {
    try {
      const la =
        teacherProfile?.subjects?.flatMap((subject) => subject.lessons || []) ||
        [];
      setLessonsArray(la);
      setChosenLesson(la[0] || null);
    } catch (error) {
      console.error("Error setting teacher lessons:", error);
    }
  }, [teacherProfile]);

  return (
    <>
      {teacherProfile ? (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_10px_35px_-10px_rgba(30,58,138,0.25)] ring-1 ring-indigo-100">
              {/* Decorative top border */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
              <div className="p-8 sm:p-10">
                {/* Teacher Info */}
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative shrink-0">
                    <img
                      src={`${API_URL}${teacherProfile.image}`}
                      alt={`${teacherProfile.firstName} ${teacherProfile.lastName}`}
                      className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                    />
                    <span className="absolute -bottom-1 -right-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                          {teacherProfile.firstName} {teacherProfile.lastName}
                        </h1>
                        <p className="mt-1 text-slate-600">
                          Experienced Teacher • Personalized 1-on-1 sessions
                        </p>
                      </div>

                      {/* NEW: rating summary (if saved on Teacher) */}
                      <div className="flex items-center gap-2">
                        <RatingStars
                          value={Number(teacherProfile.ratingAverage) || 0}
                          size="text-xl"
                        />
                        <span className="text-lg font-semibold text-slate-800">
                          {teacherProfile.ratingAverage
                            ? Number(teacherProfile.ratingAverage).toFixed(1)
                            : "0.0"}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({teacherProfile.ratingCount || 0})
                        </span>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-200">
                        Lessons: {lessonsArray.length}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-sky-200">
                        Week: {formatDate(start)} – {formatDate(end)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Lessons Carousel */}
                <section className="mt-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
                    Lessons Taught
                  </h2>
                  {lessonsArray.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
                      <CarouselLessons
                        subjectId={null}
                        lessonsArray={lessonsArray}
                        onLessonClick={(lesson) => setChosenLesson(lesson)}
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500">No lessons available.</p>
                  )}
                </section>

                {/* Select Lesson */}
                <section className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Lesson
                  </label>
                  <div className="relative w-full max-w-sm">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-4 focus:ring-sky-100"
                      value={chosenLesson?.name || ""}
                      onChange={(e) => {
                        const lesson = lessonsArray.find(
                          (l) => l.name === e.target.value
                        );
                        setChosenLesson(lesson);
                      }}
                    >
                      {lessonsArray.map((lesson) => (
                        <option key={lesson._id} value={lesson.name}>
                          {lesson.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ▾
                    </span>
                  </div>
                </section>

                {/* Week Selector */}
                <section className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    onClick={() => setSelectedWeekOffset((w) => w - 1)}
                  >
                    ← Previous Week
                  </button>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">
                    {formatDate(start)} – {formatDate(end)}
                  </span>
                  <button
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    onClick={() => setSelectedWeekOffset((w) => w + 1)}
                  >
                    Next Week →
                  </button>
                </section>

                {/* Schedule Table */}
                <section className="mt-8">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 to-sky-50">
                        <tr className="text-left text-slate-700">
                          <th className="border-b border-slate-200 p-3 font-semibold">
                            Time
                          </th>
                          {daysOfWeek.map((day, idx) => {
                            const date = new Date(start);
                            date.setDate(start.getDate() + idx);
                            return (
                              <th
                                key={day}
                                className="border-b border-slate-200 p-3 font-semibold"
                              >
                                <div>{day}</div>
                                <div className="text-xs text-slate-500">
                                  {formatDate(date)}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((time, rowIndex) => (
                          <tr
                            key={time}
                            className={
                              rowIndex % 2 === 0 ? "bg-slate-50/40" : "bg-white"
                            }
                          >
                            <td className="border-t border-slate-200 p-3 font-medium text-slate-800">
                              {time}
                            </td>
                            {daysOfWeek.map((day, idx) => {
                              const date = new Date(start);
                              date.setDate(start.getDate() + idx);
                              const formattedDate = formatDate(date);
                              const key = `${day}-${time}-${formattedDate}`;
                              const selected = selectedSlots.find(
                                (s) => s.key === key
                              );

                              const slotDate = new Date(date);
                              slotDate.setHours(
                                Number(time.split(":")[0]),
                                0,
                                0,
                                0
                              );
                              const isPast = slotDate < new Date();

                              if (isSlotConflicting(time, date)) {
                                return (
                                  <td
                                    key={key}
                                    className="border-t border-slate-200 p-3 text-center"
                                    title="Slot unavailable"
                                  >
                                    <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                                      Booked
                                    </span>
                                  </td>
                                );
                              }

                              return isPast ? (
                                <td
                                  key={key}
                                  className="border-t border-slate-200 p-3 text-center"
                                  title="Past time"
                                >
                                  <span className="inline-flex h-7 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                                    —
                                  </span>
                                </td>
                              ) : (
                                <td
                                  key={key}
                                  className="border-t border-slate-200 p-0 text-center"
                                >
                                  {/* if isStudent === false disable onClick function */}
                                  {isStudent ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCellClick(
                                          day,
                                          time,
                                          formattedDate
                                        )
                                      }
                                      className={`m-1 inline-flex h-9 w-[96%] items-center justify-center rounded-xl border text-xs font-semibold transition
                                      ${
                                        selected
                                          ? "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-700 active:scale-[0.98]"
                                          : "border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 active:scale-[0.98]"
                                      }`}
                                    >
                                      {selected
                                        ? selected.lesson.name
                                        : "Choose"}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="m-1 inline-flex h-9 w-[96%] items-center justify-center rounded-xl border text-xs font-semibold transition cursor-not-allowed text-slate-400"
                                    >
                                      "Choose"
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-col items-center gap-4">
                  {!isStudent ? (
                    <button
                      disabled={isBooking}
                      aria-busy={isBooking}
                      className={"inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition bg-indigo-600 text-white active:scale-[0.98]"}
                    >
                      Log in as student to book lessons
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={isBooking}
                      aria-busy={isBooking}
                      className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition
                      ${
                        isBooking
                          ? "bg-slate-300 text-white"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                      }`}
                    >
                      {isBooking ? "Booking..." : "Book Selected Lessons"}
                    </button>
                  )}

                  {responseData && (
                    <p className={`${resStyleColor} text-center text-sm`}>
                      {responseData.message}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* NEW: Reviews Section */}
                <section className="mt-8 space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                    Reviews
                  </h2>

                  {/* Public list (avg, count, comments) */}
                  <ReviewsList
                    teacherId={teacherId}
                    refreshKey={reviewsRefreshKey}
                  />

                  {/* Student-only form */}
                  {isStudent ? (
                    <ReviewForm
                      teacherId={teacherId}
                      onSaved={() => setReviewsRefreshKey((k) => k + 1)}
                    />
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                      Log in as a student to leave a review after your lesson.
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty state (no teacher loaded)
        <div className="min-h-[60vh] grid place-items-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 ring-1 ring-slate-200" />
            <h3 className="text-xl font-semibold text-slate-800">
              No teacher data found
            </h3>
            <p className="mt-1 text-slate-600">
              Please return to the teachers list and select a profile.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default DisplayTeacherData;
