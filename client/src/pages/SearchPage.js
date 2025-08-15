// src/pages/SearchPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import fetchData from "../services/fetchData";
import { useNavigate } from "react-router-dom";


export default function SearchPage() {
  const { search } = useLocation();
  const q = (new URLSearchParams(search).get("q") || "").toLowerCase().trim();

  const [teachers, setTeachers] = useState([]);

    const navigate = useNavigate();
    // Navigate to teacher info page
  const teacherInfo = (teacher) => {
    if (!teacher) return;
    navigate("/teacher-info", { state: { teacher } });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchData("teachers");
        if (!alive) return;
        setTeachers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Search load failed", e);
        setTeachers([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const flatTeachers = useMemo(() => {
    if (!teachers?.length) return [];
    const first = teachers[0] || {};
    return "teachers" in first
      ? teachers.flatMap((x) => x?.teachers || [])
      : teachers;
  }, [teachers]);

  const results = useMemo(() => {
    if (!q) return flatTeachers;

    return flatTeachers.filter((t) => {
      const name = `${t.firstName ?? ""} ${t.lastName ?? ""} ${t.name ?? ""}`.toLowerCase();

      // subjects could be strings or objects with .name
      const subjectsArr = (t.assignedSubjects || t.subjects || []);
      const subjectsText = Array.isArray(subjectsArr)
        ? subjectsArr.map((s) => (typeof s === "string" ? s : s?.name || s?.title || ""))
            .join(" ")
            .toLowerCase()
        : "";

      // lessons may live under each subject
      const lessonsText = Array.isArray(subjectsArr)
        ? subjectsArr
            .flatMap((s) => (Array.isArray(s?.lessons) ? s.lessons : []))
            .map((l) => (typeof l === "string" ? l : l?.name || l?.title || ""))
            .join(" ")
            .toLowerCase()
        : "";

      return (
        name.includes(q) ||
        subjectsText.includes(q) ||
        lessonsText.includes(q)
      );
    });
  }, [flatTeachers, q]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        Search results{q ? ` for “${q}”` : ""}
      </h1>

      {!results.length ? (
        <p>No matches.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((t, i) => {
            const displayName = `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.name || "Unnamed";
            return (
              <li key={t._id ?? t.id ?? i} className="border rounded bg-white p-3">
                <img
                  src={t.image || "/images/user.png"}
                  alt={displayName}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <div className="font-medium">{displayName}</div>
                <div className="text-sm text-gray-600">
                  {(t.assignedSubjects || t.subjects || [])
                    .map((s) => (typeof s === "string" ? s : s?.name))
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
                <div className="text-sm text-gray-500">
                  {t.lessons?.length
                    ? t.lessons.map((l) => (typeof l === "string" ? l : l?.name || l?.title || ""))
                        .filter(Boolean)
                        .join(", ")
                    : ""}
                </div>
                <div>
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => teacherInfo(t)}
                    >
                      View Profile
                    </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
