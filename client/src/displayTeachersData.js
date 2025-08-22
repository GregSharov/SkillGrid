import { useLocation } from "react-router-dom";
import { useState } from "react";
import CarouselLessons from "./carouselLessons.js";

function DisplayTeacherData() {
  // Get teacher data from location state
  const location = useLocation();
  const teacher = location.state?.teacher; // Get full object
  // const student = location.state?.student; // Get full object
  const lessonsArray =
    teacher?.subjects.flatMap((subject) => subject.lessons || []) || [];

  // State for managing selected week and slots
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [chosenLesson, setChosenLesson] = useState(lessonsArray[0] || null);

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
    const exists = selectedSlots.find((slot) => slot.key === key);
    if (exists) {
      setSelectedSlots(selectedSlots.filter((slot) => slot.key !== key));
    } else {
      setSelectedSlots([
        ...selectedSlots,
        { key, day, time, date, lesson: { ...chosenLesson } }, // copy of lesson
      ]);
    }
  };

  const handleEnroll = async () => {
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot.");
      return;
    }

    // Post data to server
    try {
      const response = await fetch("http://localhost:3000/schedule/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher: teacher,
          student: {_id: "68a2344739259fc06d0c7f26", firstName: "Gregory", lastName: "Sharov"}, // Mock student data
          lesson: chosenLesson,
          slots: selectedSlots,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResponseData(data);
        setResStyleColor("text-red-500");
        throw new Error("Failed to schedule lessons");
      }

      console.log("Successfully scheduled lessons:", data);
      setResponseData(data);
      setResStyleColor("text-green-500");
    } catch (error) {
      console.error("Error scheduling lessons:", error);
    }
  };

  return (
    <>
      {teacher ? (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
            {/* Teacher Info */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow-inner">
              <img
                src={teacher.image}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="w-44 h-44 object-cover rounded-full shadow-xl border-4 border-white"
              />
              <div className="text-center md:text-left">
                <p className="text-4xl font-bold text-gray-800">
                  {teacher.firstName} {teacher.lastName}
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
              <div className="bg-white rounded-xl shadow-lg p-4">
                <CarouselLessons
                  subjectId={null}
                  lessonsArray={lessonsArray}
                  onLessonClick={(lesson) => setChosenLesson(lesson)}
                />
              </div>
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
                      {daysOfWeek.map((day, idx) => {
                        const date = new Date(start);
                        date.setDate(start.getDate() + idx);
                        const formattedDate = formatDate(date);
                        const key = `${day}-${time}-${formattedDate}`;
                        const selected = selectedSlots.find(
                          (s) => s.key === key
                        );
                        return (
                          <td
                            key={day}
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
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Enroll in Selected Lessons
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
