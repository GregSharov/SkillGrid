import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import fetchData from "../services/fetchData";
import filterData from "../services/filterData";

export default function SearchPage() {
  //  do NOT lowercase the query, since filterData is case-sensitive
  const { search } = useLocation();
  const q = (new URLSearchParams(search).get("q") || "").trim();

  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]); // lessons live under subjects

  //  navigation helpers
  const teacherInfo = (teacherId) => {
    if (!teacherId) return;
    navigate(`/teacher-info/${teacherId}`);
  };
  // const openLesson = (lesson) => {
  //   if (!lesson) return;
  //   navigate("/lesson-info", { state: { lesson } });
  // };
  const openLesson = (lesson) => {
    if (!lesson?._id) return;
    navigate("/lesson-info-search", { state: { lessonId: lesson._id } });
  };

  //  fetch teachers + subjects once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [tData, sData] = await Promise.all([
          fetchData("teachers"),
          fetchData("subjects"),
        ]);
        if (!alive) return;
        const verifiedTeachers = tData.filter((teacher) => teacher.subjects.length > 0);
        setTeachers(verifiedTeachers);
        setSubjects(Array.isArray(sData) ? sData : []);
      } catch (e) {
        console.error("Search load failed", e);
        if (!alive) return;
        setTeachers([]);
        setSubjects([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  //  normalize teachers: support [{teachers:[...]}] or flat array
  const flatTeachers = useMemo(() => {
    if (!teachers?.length) return [];
    const first = teachers[0] || {};
    return "teachers" in first
      ? teachers.flatMap((x) => x?.teachers || [])
      : teachers;
  }, [teachers]);

  //  flatten lessons out of subjects for easy listing/search
  // each lesson gets subject context so we can show it in the UI
  const flatLessons = useMemo(() => {
    if (!subjects?.length) return [];
    return subjects.flatMap((subj) =>
      (subj.lessons || []).map((les) => ({
        ...les,
        subjectId: subj._id,
        subjectName: subj.name,
      }))
    );
  }, [subjects]);

  //  filter with YOUR filterData (unchanged)
  // Note: filterData returns original array if q is empty
  const filteredTeachers = useMemo(
    () => filterData(flatTeachers, q),
    [flatTeachers, q]
  );

  const filteredLessons = useMemo(
    () => filterData(flatLessons, q),
    [flatLessons, q]
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">
          Search results{q ? ` for “${q}”` : ""}
        </h1>
      </header>

      {/* Teachers */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Teachers</h2>
        {!filteredTeachers.length ? (
          <p className="text-gray-500">No matching teachers.</p>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-thin scrollbar-thumb-slate-300" style={{ scrollSnapType: "x mandatory" }}>
            {filteredTeachers.map((teacher) => {
              const subjectsCount = (teacher.subjects || []).length;

              // --- NEW: robust rating detection ---
              // Prefer ratingAverage/ratingCount from backend aggregation,
              // fallback to teacher.rating when present, otherwise "New".
              const ratingAvg =
                typeof teacher.ratingAverage === "number"
                  ? teacher.ratingAverage
                  : typeof teacher.rating === "number"
                  ? teacher.rating
                  : null;
              const ratingCount =
                typeof teacher.ratingCount === "number"
                  ? teacher.ratingCount
                  : 0;
              const badgeText =
                ratingCount > 0 && ratingAvg !== null
                  ? ratingAvg.toFixed(1)
                  : "New";
              // ------------------------------------

              return (
                <div
                  key={teacher._id}
                  className="flex-none w-64"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="h-[28rem] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl flex flex-col">
                    {/* Restored image dimensions */}
                    <div className="relative h-1/2 w-full">
                      <img
                        src={teacher.image}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="absolute h-full w-full object-cover object-[95%_5%]"
                        loading="lazy"
                      />
                      {/* gradient for legibility */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />

                      {/* Rating badge (top-left) */}
                      <div
                        className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow"
                        title={
                          ratingCount > 0 && ratingAvg !== null
                            ? `${badgeText} average from ${ratingCount} review${
                                ratingCount === 1 ? "" : "s"
                              }`
                            : "New teacher — no reviews yet"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-amber-500"
                          aria-hidden="true"
                        >
                          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896l-7.336 3.868 1.402-8.167L.132 9.21l8.2-1.192L12 .587z" />
                        </svg>
                        {badgeText}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col h-1/2 p-4 gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                          Teacher
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {subjectsCount}{" "}
                          {subjectsCount === 1 ? "Subject" : "Subjects"}
                        </span>
                      </div>

                      {/* Scrollable subjects/lessons */}
                      <div className="mt-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                        {subjectsCount === 0 ? (
                          <p className="text-slate-500 text-sm">
                            No subjects assigned
                          </p>
                        ) : (
                          teacher.subjects.map((subject, idx) => (
                            <div key={idx} className="mb-2">
                              <h4 className="font-medium text-slate-800 truncate">
                                {subject.name}
                              </h4>
                              {Array.isArray(subject.lessons) &&
                                subject.lessons.length > 0 && (
                                  <ul className="list-disc ml-5 text-slate-600 text-sm">
                                    {subject.lessons.map((lesson, lidx) => (
                                      <li key={lidx} className="truncate">
                                        {lesson.name}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => teacherInfo(teacher?._id)}
                        className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lessons */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>
        {!filteredLessons.length ? (
          <p className="text-gray-500">No matching lessons.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((l, i) => {
              const name =
                l.name || l.title || l.lessonName || l._id || "Untitled Lesson";
              return (
                <li
                  key={l._id ?? l.id ?? `${name}-${i}`}
                  className="border rounded bg-white p-3 flex flex-col"
                >
                  <img
                    src={l.image}
                    alt={name}
                    className="w-full h-40 object-cover rounded mb-2"
                    loading="lazy"
                  />
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-gray-600">
                    {l.subjectName ? `Subject: ${l.subjectName}` : ""}
                  </div>

                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => openLesson(l)}
                  >
                    View Lesson
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
