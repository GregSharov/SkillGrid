import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import CarouselLessons from "./carouselLessons.js";

function DisplayTeacherData() {
  // State for managing booking status
  const [isBooking, setIsBooking] = useState(false);
  const inFlightRef = useRef(false);

  // Get teacher ID from URL parameters
  const { teacherId } = useParams();

  // State for student data (id, role)
  const [student, setStudent] = useState();

  // State for student profile
  const [studentProfile, setStudentProfile] = useState();

  // State for teacher profile
  const [teacherProfile, setTeacherProfile] = useState();

  // State teacher's lessons
  const [lessonsArray, setLessonsArray] = useState([]);

  // State for teacher's scheduled lessons
  const [teacherScheduledLessons, setTeacherScheduledLessons] = useState([]);

  // Function to check if chosen slot's time and date match teacher's scheduled lessons
  const isSlotConflicting = (time, dateObj) => {
    const hour = Number(String(time).split(":")[0]);

    // clone and normalize the chosen date to the selected hour, zeroing minutes/seconds/ms
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
  for (let hour = 7; hour < 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

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

    // Check if the slot is already selected
    const exists = selectedSlots.find((slot) => slot.key === key);

    // If the slot is already selected, unselect it
    if (exists) {
      setSelectedSlots(selectedSlots.filter((slot) => slot.key !== key));
    } else {
      // Add new slot with lesson details
      setSelectedSlots([
        ...selectedSlots,
        { key, day, time, date, lesson: { ...chosenLesson } }, // copy of lesson
      ]);
    }
  };

  // Enroll in selected slots
  const handleEnroll = async () => {
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot.");
      return;
    }

    // guard against double-clicks
    if (isBooking || inFlightRef.current) return;

    setIsBooking(true);
    inFlightRef.current = true;

    try {
      const response = await fetch("http://localhost:3000/schedule/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: teacherProfile,
          student: studentProfile,
          slots: selectedSlots,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResponseData(data);
        setResStyleColor("text-red-500");
        throw new Error("Failed to schedule lessons");
      }

      // Reset UI
      setChosenLesson(lessonsArray[0] || null);
      setSelectedSlots([]);
      setResponseData(data);
      setResStyleColor("text-green-500");

      // Refetch booked slots so the table updates immediately
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
        `http://localhost:3000/schedule/user/${teacherId}`,
        { method: "GET", credentials: "include" }
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

  // Call fetchTeacherScheduledLessons when teacherId changes
  useEffect(() => {
    fetchTeacherScheduledLessons();
  }, [fetchTeacherScheduledLessons]);

  // Fetch student ID
  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const response = await fetch("http://localhost:3000/user/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        // console.log("Fetched student data:", data);
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
          `http://localhost:3000/user/${student?.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        // console.log("Fetched student profile:", data);
        if (response.ok) {
          setStudentProfile(data.user);
        } else {
          console.error("Error fetching student profile:", data);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    };

    if (student) {
      fetchStudentProfile();
    }
  }, [student]);

  // Fetch teacher profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/user/${teacherId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          setTeacherProfile(data.user);
        } else {
          console.error("Error fetching teacher profile:");
        }
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };

    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);

  // Set lessons from teacher profile
  useEffect(() => {
    try {
      const lessonsArray =
        teacherProfile?.subjects.flatMap((subject) => subject.lessons || []) ||
        [];
      setLessonsArray(lessonsArray);

      // Set choosen lesson as first from teacher's lesson array
      setChosenLesson(lessonsArray[0] || null);
    } catch (error) {
      console.error("Error setting teacher lessons:", error);
    }
  }, [teacherProfile]);

  return (
    <>
      {teacherProfile ? (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
            {/* Teacher Info */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow-inner">
              <img
                src={teacherProfile.image}
                alt={`${teacherProfile.firstName} ${teacherProfile.lastName}`}
                className="w-44 h-44 object-cover rounded-full shadow-xl border-4 border-white"
              />
              <div className="text-center md:text-left">
                <p className="text-4xl font-bold text-gray-800">
                  {teacherProfile.firstName} {teacherProfile.lastName}
                </p>
                <p className="text-gray-600 text-lg mt-2">
                  Experienced Teacher
                </p>
              </div>
            </div>

            <div className="my-8 border-t border-gray-200" />

            {/* Lessons Carousel */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Lessons Taught
              </h2>
              {lessonsArray.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <CarouselLessons
                    subjectId={null}
                    lessonsArray={lessonsArray}
                    onLessonClick={(lesson) => setChosenLesson(lesson)}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No lessons available</p>
              )}
            </div>

            {/* Choose Lesson */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <label className="font-medium text-gray-700">
                Select Lesson:
              </label>
              <select
                className="px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
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
            </div>

            {/* Week Selector */}
            <div className="mb-6 flex items-center gap-4 justify-center flex-wrap">
              <button
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setSelectedWeekOffset((w) => w - 1)}
              >
                ← Previous Week
              </button>
              <span className="text-lg font-semibold text-gray-700">
                {formatDate(start)} – {formatDate(end)}
              </span>
              <button
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setSelectedWeekOffset((w) => w + 1)}
              >
                Next Week →
              </button>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto rounded-xl shadow-inner">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <th className="border border-gray-200 p-2">Time</th>
                    {daysOfWeek.map((day, idx) => {
                      const date = new Date(start);
                      date.setDate(start.getDate() + idx);
                      return (
                        <th key={day} className="border border-gray-200 p-2">
                          {day}
                          <div className="text-xs text-gray-500">
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
                      className={`${
                        rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="border border-gray-200 p-2 font-medium">
                        {time}
                      </td>

                      {/* Day Cells */}
                      {daysOfWeek.map((day, idx) => {
                        const date = new Date(start);
                        date.setDate(start.getDate() + idx);
                        const formattedDate = formatDate(date);
                        const key = `${day}-${time}-${formattedDate}`;
                        const selected = selectedSlots.find(
                          (s) => s.key === key
                        );

                        const slotDate = new Date(date);
                        slotDate.setHours(Number(time.split(":")[0]), 0, 0, 0);

                        const isPast = slotDate < new Date();

                        if (isSlotConflicting(time, date)) {
                          return (
                            <td
                              key={key}
                              className="border border-gray-300 p-2 text-center rounded-lg bg-red-100 text-gray-500 cursor-not-allowed"
                              title="Slot unavailable"
                            >
                              Booked
                            </td>
                          );
                        }

                        return isPast ? (
                          <td
                            key={key}
                            className="border border-gray-300 p-2 text-center rounded-lg bg-gray-100 cursor-not-allowed"
                          />
                        ) : (
                          <td
                            key={key}
                            className={`border border-gray-200 p-2 text-center cursor-pointer transition-colors rounded-lg ${
                              selected
                                ? "bg-blue-500 text-white font-semibold"
                                : "hover:bg-blue-100"
                            }`}
                            onClick={() =>
                              handleCellClick(day, time, formattedDate)
                            }
                          >
                            {selected ? selected.lesson.name : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enroll Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleEnroll}
                disabled={isBooking}
                aria-busy={isBooking}
                className={`px-8 py-3 font-semibold rounded-2xl shadow-lg transition transform
    ${
      isBooking
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
    }`}
              >
                {isBooking ? "Booking..." : "Book Selected Lessons"}
              </button>

              {responseData && (
                <p className={`${resStyleColor} text-center mt-4`}>
                  {responseData.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-20 text-lg">
          No teacher data found.
        </p>
      )}
    </>
  );
}

export default DisplayTeacherData;
