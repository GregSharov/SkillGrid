import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaPen, FaSearch, FaSync } from "react-icons/fa";
import { NavLink } from "react-router-dom";

/**
 * AdminDashboard
 * - Sidebar navigation across resources
 * - Subjects: full CRUD implemented (example)
 * - Other tabs: styled list + stub actions to fill quickly
 *
 * Tailwind required. No extra libs.
 */

const TABS = [
  { key: "subjects", label: "Subjects" },
  { key: "lessons", label: "Lessons" },
  { key: "teachers", label: "Teachers" },
  { key: "students", label: "Students" },
  { key: "videos", label: "Video Lessons" },
  { key: "scheduled", label: "Scheduled Lessons" },
  { key: "reviews", label: "Ratings & Comments" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("subjects");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 grid place-items-center text-white font-bold">
              SG
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                SkillGrid — manage content & users
              </p>
            </div>
          </div>

          <nav className="hidden md:flex rounded-xl border border-slate-200 bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  activeTab === t.key
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="text-sm text-slate-500 hidden sm:block">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
            >
              ← Back to site
            </NavLink>
          </div>
        </div>
      </header>

      {/* Content shell */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem,1fr] gap-6">
          {/* Side rail (mobile-friendly below md) */}
          <aside className="lg:sticky lg:top-24 h-max rounded-2xl border border-slate-200 bg-white p-3">
            <h2 className="px-2 py-1 text-xs font-semibold tracking-wider uppercase text-slate-400">
              Manage
            </h2>
            <ul className="mt-1 space-y-1">
              {TABS.map((t) => (
                <li key={t.key}>
                  <button
                    onClick={() => setActiveTab(t.key)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeTab === t.key
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="space-y-6">
            {/* Tab outlet */}
            {activeTab === "subjects" && <SubjectsAdmin />}
            {activeTab === "lessons" && <LessonsAdmin />}
            {activeTab === "teachers" && <TeachersAdmin />}
            {activeTab === "students" && <StudentsAdmin />}
            {activeTab === "videos" && <VideosAdmin />}
            {activeTab === "scheduled" && <ScheduledAdmin />}
            {activeTab === "reviews" && <ReviewsAdmin />}
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------
 * Subjects — FULL CRUD (example)
 * -----------------------------------------*/
function SubjectsAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    _id: null,
    name: "",
    description: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const k = q.toLowerCase();
    return items.filter(
      (s) =>
        s.name?.toLowerCase().includes(k) ||
        s.description?.toLowerCase().includes(k)
    );
  }, [items, q]);

  async function fetchSubjects() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/subjects", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setItems(data);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  function openCreate() {
    setDraft({ _id: null, name: "", description: "", image: "" });
    setModalOpen(true);
  }
  function openEdit(s) {
    setDraft({
      _id: s._id,
      name: s.name || "",
      description: s.description || "",
      image: s.image || "",
    });
    setModalOpen(true);
  }
  async function saveDraft() {
    try {
      setSaving(true);
      const payload = {
        name: draft.name,
        description: draft.description,
        image: draft.image,
      };
      let res;
      if (draft._id) {
        res = await fetch(`http://localhost:3000/subjects/${draft._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:3000/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Save failed");
        return;
      }
      setModalOpen(false);
      await fetchSubjects();
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function deleteSubject(id) {
    if (!window.confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`http://localhost:3000/subjects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }
      await fetchSubjects();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Subjects</h3>
          <p className="text-sm text-slate-600">
            Create, edit, and remove subjects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subjects..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={fetchSubjects}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            title="Refresh"
          >
            <FaSync className="opacity-70" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaPlus />
            New
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left font-semibold p-3">Name</th>
              <th className="text-left font-semibold p-3">Description</th>
              <th className="text-left font-semibold p-3">Image</th>
              <th className="text-right font-semibold p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={4}>
                  No subjects found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="border-t border-slate-200">
                  <td className="p-3 font-medium text-slate-900">{s.name}</td>
                  <td className="p-3 text-slate-700">{s.description}</td>
                  <td className="p-3">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FaPen /> Edit
                      </button>
                      <button
                        onClick={() => deleteSubject(s._id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-slate-900">
                {draft._id ? "Edit Subject" : "New Subject"}
              </h4>
            </div>
            <div className="p-4 space-y-3">
              <TextField
                label="Name"
                value={draft.name}
                onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              />
              <TextArea
                label="Description"
                value={draft.description}
                onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              />
              <TextField
                label="Image URL"
                value={draft.image}
                onChange={(v) => setDraft((d) => ({ ...d, image: v }))}
                placeholder="http://..."
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveDraft}
                disabled={saving || !draft.name.trim()}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  saving || !draft.name.trim()
                    ? "bg-slate-300"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------
 * Lessons — list + stub actions
 * -----------------------------------------*/
function LessonsAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return items.filter(
      (l) =>
        l.name?.toLowerCase().includes(k) ||
        l.description?.toLowerCase().includes(k)
    );
  }, [items, q]);

  async function fetchLessons() {
    try {
      setLoading(true);
      // If lessons live inside subjects, you can fetch subjects and flatten lessons client-side.
      const res = await fetch("http://localhost:3000/subjects", {
        credentials: "include",
      });
      const subjects = await res.json();
      if (!res.ok) return console.error(subjects);
      const flat = subjects.flatMap((s) =>
        (s.lessons || []).map((lsn) => ({
          ...lsn,
          _subjectId: s._id,
          _subjectName: s.name,
        }))
      );
      setItems(flat);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <AdminCard
      title="Lessons"
      subtitle="Browse lessons (edit within Subjects or implement direct endpoints)."
      actions={
        <ToolbarSearch value={q} onChange={setQ} onRefresh={fetchLessons} />
      }
    >
      <SimpleTable
        loading={loading}
        emptyText="No lessons found."
        columns={["Lesson", "Subject", "Description"]}
        rows={filtered.map((l) => [
          l.name,
          l._subjectName || "—",
          <span className="text-slate-700" key="d">
            {l.description}
          </span>,
        ])}
      />
    </AdminCard>
  );
}

/* -------------------------------------------
 * Teachers — list + rating columns
 * -----------------------------------------*/
function TeachersAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return items.filter(
      (t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(k) ||
        t.email?.toLowerCase().includes(k)
    );
  }, [items, q]);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/teachers", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setItems(data);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <AdminCard
      title="Teachers"
      subtitle="Manage teacher accounts (edit in user tools; ratings aggregate shown here)."
      actions={
        <ToolbarSearch value={q} onChange={setQ} onRefresh={fetchTeachers} />
      }
    >
      <SimpleTable
        loading={loading}
        emptyText="No teachers found."
        columns={["Name", "Email", "Rating (avg)", "Reviews"]}
        rows={filtered.map((t) => [
          `${t.firstName} ${t.lastName}`,
          t.email || "—",
          typeof t.ratingAverage === "number"
            ? t.ratingAverage.toFixed(1)
            : "—",
          typeof t.ratingCount === "number" ? t.ratingCount : 0,
        ])}
      />
    </AdminCard>
  );
}

/* -------------------------------------------
 * Students — list
 * -----------------------------------------*/
function StudentsAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return items.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(k) ||
        s.email?.toLowerCase().includes(k)
    );
  }, [items, q]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/students", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setItems(data);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <AdminCard
      title="Students"
      subtitle="Browse student accounts."
      actions={
        <ToolbarSearch value={q} onChange={setQ} onRefresh={fetchStudents} />
      }
    >
      <SimpleTable
        loading={loading}
        emptyText="No students found."
        columns={["Name", "Email", "Phone"]}
        rows={filtered.map((s) => [
          `${s.firstName} ${s.lastName}`,
          s.email || "—",
          s.phone || "—",
        ])}
      />
    </AdminCard>
  );
}

/* -------------------------------------------
 * Video Lessons — placeholder (connect your endpoints)
 * -----------------------------------------*/
function VideosAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return items.filter(
      (v) =>
        v.title?.toLowerCase().includes(k) ||
        v.description?.toLowerCase().includes(k)
    );
  }, [items, q]);

  async function fetchVideos() {
    try {
      setLoading(true);
      // TODO: swap to your actual videos endpoint
      const res = await fetch("http://localhost:3000/videos", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setItems(data);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // keep disabled if you don't have endpoint yet
    // fetchVideos();
  }, []);

  return (
    <AdminCard
      title="Video Lessons"
      subtitle="Connect your videos endpoint or hide this tab."
      actions={
        <ToolbarSearch value={q} onChange={setQ} onRefresh={fetchVideos} />
      }
    >
      <SimpleTable
        loading={loading}
        emptyText="No videos found."
        columns={["Title", "Description"]}
        rows={filtered.map((v) => [v.title, v.description])}
      />
    </AdminCard>
  );
}

/* -------------------------------------------
 * Scheduled Lessons — list (read-only)
 * -----------------------------------------*/
function ScheduledAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const flat = useMemo(() => {
    const flatRows = [];
    items.forEach((doc) => {
      (doc.slots || []).forEach((slot) => {
        flatRows.push({
          _id: doc._id,
          teacher: `${doc.teacher?.firstName || ""} ${
            doc.teacher?.lastName || ""
          }`.trim(),
          student: `${doc.student?.firstName || ""} ${
            doc.student?.lastName || ""
          }`.trim(),
          lesson: slot?.lesson?.name || "—",
          date: slot?.date || "—",
          time: slot?.time || "—",
        });
      });
    });
    return flatRows;
  }, [items]);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return flat.filter(
      (r) =>
        r.teacher.toLowerCase().includes(k) ||
        r.student.toLowerCase().includes(k) ||
        r.lesson.toLowerCase().includes(k)
    );
  }, [flat, q]);

  async function fetchScheduled() {
    try {
      setLoading(true);
      // If you don’t have this endpoint, create a list-all in your schedule router.
      const res = await fetch("http://localhost:3000/schedule/all", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // if not available yet, keep commented
    // fetchScheduled();
  }, []);

  return (
    <AdminCard
      title="Scheduled Lessons"
      subtitle="Read-only overview of all scheduled lessons."
      actions={
        <ToolbarSearch value={q} onChange={setQ} onRefresh={fetchScheduled} />
      }
    >
      <SimpleTable
        loading={loading}
        emptyText="No scheduled lessons found."
        columns={["Teacher", "Student", "Lesson", "Date", "Time"]}
        rows={filtered.map((r, i) => [
          r.teacher,
          r.student,
          r.lesson,
          r.date,
          r.time,
        ])}
      />
    </AdminCard>
  );
}

/* -------------------------------------------
 * Reviews (Ratings & Comments) — browse by teacher
 * -----------------------------------------*/
function ReviewsAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchTeachers() {
    try {
      const res = await fetch("http://localhost:3000/teachers", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setTeachers(data);
    } catch (e) {
      console.error(e);
    }
  }
  async function fetchReviews(tid) {
    if (!tid) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/reviews/teacher/${tid}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setReviews(data);
      else console.error(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);
  useEffect(() => {
    fetchReviews(selectedTeacher);
  }, [selectedTeacher]);

  return (
    <AdminCard
      title="Ratings & Comments"
      subtitle="Pick a teacher to see average rating, count, and latest comments."
      actions={
        <div className="flex items-center gap-2">
          <select
            className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
            value={selectedTeacher || ""}
            onChange={(e) => setSelectedTeacher(e.target.value || null)}
          >
            <option value="">Select a teacher…</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchReviews(selectedTeacher)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FaSync className="opacity-70" />
            Refresh
          </button>
        </div>
      }
    >
      {!selectedTeacher ? (
        <div className="p-8 text-center text-slate-500">
          Choose a teacher to load reviews.
        </div>
      ) : loading ? (
        <div className="p-8 text-center text-slate-500">Loading…</div>
      ) : !reviews ? (
        <div className="p-8 text-center text-slate-500">No data.</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
            <div className="text-slate-700">
              <div className="text-sm">Average Rating</div>
              <div className="text-2xl font-extrabold">
                {typeof reviews.avg === "number"
                  ? reviews.avg.toFixed(1)
                  : "0.0"}
              </div>
            </div>
            <div className="text-slate-700">
              <div className="text-sm">Total Reviews</div>
              <div className="text-2xl font-extrabold">
                {reviews.count || 0}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold p-3">Student</th>
                  <th className="text-left font-semibold p-3">Rating</th>
                  <th className="text-left font-semibold p-3">Comment</th>
                  <th className="text-left font-semibold p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {(reviews.items || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-slate-500">
                      No comments yet.
                    </td>
                  </tr>
                ) : (
                  reviews.items.map((r) => (
                    <tr key={r._id} className="border-t border-slate-200">
                      <td className="p-3">
                        {r.student
                          ? `${r.student.firstName} ${r.student.lastName}`
                          : "—"}
                      </td>
                      <td className="p-3">{r.rating}</td>
                      <td className="p-3 text-slate-700">{r.comment || "—"}</td>
                      <td className="p-3">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminCard>
  );
}

/* ======= Small UI helpers ======= */

function AdminCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ToolbarSearch({ value, onChange, onRefresh }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search…"
          className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
        />
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        title="Refresh"
      >
        <FaSync className="opacity-70" />
        Refresh
      </button>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}

function SimpleTable({ loading, emptyText, columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={`text-left font-semibold p-3 ${
                  i === columns.length - 1 ? "text-right" : ""
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="p-4 text-slate-500" colSpan={columns.length}>
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="p-4 text-slate-500" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-200">
                {r.map((cell, i) => (
                  <td
                    key={i}
                    className={`p-3 ${i === r.length - 1 ? "text-right" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
