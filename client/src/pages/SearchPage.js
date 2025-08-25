
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
  const openTeacher = (teacher) => {
    if (!teacher) return;
    navigate("/teacher-info", { state: { teacher } });
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
        setTeachers(Array.isArray(tData) ? tData : []);
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((t, i) => {
              const displayName =
                `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() ||
                t.name ||
                "Unnamed";

              const subjectsText =
                (t.assignedSubjects || t.subjects || [])
                  .map((s) => (typeof s === "string" ? s : s?.name))
                  .filter(Boolean)
                  .join(", ") || "—";

              return (
                <li
                  key={t._id ?? t.id ?? i}
                  className="border rounded bg-white p-3 flex flex-col"
                >
                  <img
                    src={t.image || "/images/user.png"}
                    alt={displayName}
                    className="w-full h-40 object-cover rounded mb-2"
                    loading="lazy"
                  />
                  <div className="font-medium">{displayName}</div>
                  <div className="text-sm text-gray-600">{subjectsText}</div>

                  {/* optional: show root-level lessons if exist */}
                  {Array.isArray(t.lessons) && t.lessons.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-gray-500">
                        Lessons
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {t.lessons
                          .map((l) =>
                            typeof l === "string" ? l : l?.name || l?.title || ""
                          )
                          .filter(Boolean)
                          .map((nm, idx2) => (
                            <span
                              key={`${nm}-${idx2}`}
                              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                            >
                              {nm}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => openTeacher(t)}
                    aria-label={`View profile of ${displayName}`}
                  >
                    View Profile
                  </button>
                </li>
              );
            })}
          </ul>
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
                    src={l.image || "/images/lesson.png"}
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


