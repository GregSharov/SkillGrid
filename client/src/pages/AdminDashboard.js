// client/src/pages/AdminDashboard.js
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import useUploadImage from "../services/uploadImage";

const API =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3000";

/* --------------------- tiny fetch utils --------------------- */
async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}
async function apiSend(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

/* --------------------- generic field input --------------------- */
function FieldInput({ field, value, onChange }) {
  const base =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100";
  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {field.label} {field.required && <span className="text-rose-600">*</span>}
        </label>
        <textarea
          rows={field.rows || 4}
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {field.label} {field.required && <span className="text-rose-600">*</span>}
        </label>
        <select
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">{field.placeholder || "Select…"}</option>
          {(field.options || []).map((o) =>
            typeof o === "string" ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            )
          )}
        </select>
      </div>
    );
  }
  if (field.type === "json") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <textarea
          rows={field.rows || 8}
          className={base + " font-mono"}
          value={typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2)}
          onChange={(e) => onChange(e.target.value)}
          placeholder='JSON object (e.g. {"a":1})'
        />
      </div>
    );
  }
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {field.label} {field.required && <span className="text-rose-600">*</span>}
      </label>
      <input
        type={field.type || "text"}
        className={base}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        required={field.required}
      />
    </div>
  );
}

/* --------------------- generic CRUD panel --------------------- */
function CrudPanel({
  title,
  listPath,
  createPath,
  updatePath, // "/resource/:id"
  deletePath, // "/resource/:id"
  columns,
  fields,
  idKey = "_id",
  lookupTransform, // optional function to normalize list API result
  afterSave, // optional callback(row)
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  extraActions, // (row)=>JSX
  withImageUpload = false,
}) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const { uploadImage, loading: upLoading, error: upErr } = useUploadImage();

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((it) => JSON.stringify(it).toLowerCase().includes(s));
  }, [items, q]);

  const load = useCallback(
    async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiGet(listPath);
        const arr = lookupTransform
          ? lookupTransform(data)
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setItems(arr);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    },
    [listPath, lookupTransform]
  );

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setOpen(true);
    setEditing(null);
    setForm({});
  };
  const startEdit = (row) => {
    setOpen(true);
    setEditing(row);
    setForm(row);
  };
  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({});
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      if (editing) {
        await apiSend(updatePath.replace(":id", editing[idKey]), "PUT", form);
      } else {
        await apiSend(createPath, "POST", form);
      }
      if (afterSave) afterSave(form);
      close();
      await load();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      setErr("");
      await apiSend(deletePath.replace(":id", row[idKey]), "DELETE");
      await load();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  const handleImageUpload = async (userId, file) => {
    if (!file || !userId) return;
    try {
      await uploadImage(userId, file);
      await load();
    } catch {
      /* handled by hook */
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow">
      <header className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {err && <p className="mt-1 text-sm text-rose-600">{err}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56 rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
              placeholder="Search…"
            />
          </div>
          {allowCreate && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4" /> Add
            </button>
          )}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="p-3 text-left font-semibold text-slate-700">
                  {c.header}
                </th>
              ))}
              {(allowEdit || allowDelete || withImageUpload || extraActions) && (
                <th className="p-3 text-right font-semibold text-slate-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={columns.length + 1}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={columns.length + 1}>
                  No data
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row[columns[0]?.key] + row._id} className="border-t border-slate-200">
                  {columns.map((c) => (
                    <td key={c.key} className="p-3 align-top">
                      {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                  {(allowEdit || allowDelete || withImageUpload || extraActions) && (
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        {extraActions && extraActions(row)}
                        {withImageUpload && (
                          <label className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                            <PhotoIcon className="h-4 w-4" /> Upload
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(row._id, e.target.files?.[0])}
                            />
                          </label>
                        )}
                        {allowEdit && (
                          <button
                            onClick={() => startEdit(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
                          >
                            <PencilIcon className="h-4 w-4" /> Edit
                          </button>
                        )}
                        {allowDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            <TrashIcon className="h-4 w-4" /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold">{editing ? "Edit" : "Create"}</h4>
              <button className="rounded-full p-1.5 hover:bg-slate-100" onClick={close}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onSave} className="p-4 space-y-4">
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={form[f.key]}
                  onChange={(val) => setForm((s) => ({ ...s, [f.key]: val }))}
                />
              ))}
              {withImageUpload && editing && (
                <div className="text-xs text-slate-500 -mt-2">
                  Tip: use the <b>Upload</b> action on the list to update the profile image.
                  {upLoading && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" /> Uploading…
                    </span>
                  )}
                  {upErr && <span className="ml-2 text-rose-600">{upErr}</span>}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------- dashboard --------------------- */
export default function AdminDashboard() {
  const [tab, setTab] = useState("subjects");

  // lookups
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingLk, setLoadingLk] = useState(false);
  const [errLk, setErrLk] = useState("");

  const loadLookups = useCallback(async () => {
    try {
      setLoadingLk(true);
      setErrLk("");
      const t = await apiGet("/teachers");
      const s = await apiGet("/students");
      const subj = await apiGet("/subjects");
      setTeachers(Array.isArray(t?.data) ? t.data : t);
      setStudents(Array.isArray(s?.data) ? s.data : s);
      setSubjects(Array.isArray(subj?.data) ? subj.data : subj);
    } catch (e) {
      setErrLk(e.message || String(e));
    } finally {
      setLoadingLk(false);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  const teacherOptions = useMemo(
    () => teachers.map((x) => ({ value: x._id, label: `${x.firstName} ${x.lastName}` })),
    [teachers]
  );
  const studentOptions = useMemo(
    () => students.map((x) => ({ value: x._id, label: `${x.firstName} ${x.lastName}` })),
    [students]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">CRUD for Subjects, Lessons, Teachers, Students, Schedule, Reviews.</p>
            {errLk && <p className="mt-1 text-sm text-rose-600">{errLk}</p>}
          </div>
          <button
            onClick={loadLookups}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold shadow hover:bg-slate-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loadingLk ? "animate-spin" : ""}`} />
            Refresh lookups
          </button>
        </header>

        <nav className="flex flex-wrap gap-2">
          {[
            ["subjects", "Subjects"],
            ["lessons", "Lessons"],
            ["teachers", "Teachers"],
            ["students", "Students"],
            ["schedule", "Scheduled Lessons"],
            ["reviews", "Reviews"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition
                ${
                  tab === key
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {/* Subjects */}
          {tab === "subjects" && (
            <CrudPanel
              title="Subjects"
              listPath="/subjects"
              createPath="/subjects"
              updatePath="/subjects/:id"
              deletePath="/subjects/:id"
              columns={[
                { key: "name", header: "Name" },
                { key: "description", header: "Description" },
              ]}
              fields={[
                { key: "name", label: "Name", required: true },
                { key: "description", label: "Description", type: "textarea" },
                { key: "image", label: "Image URL" },
              ]}
            />
          )}

          {/* Lessons (embedded in Subject) */}
          {tab === "lessons" && (
            <LessonsEmbedded subjects={subjects} reloadSubjects={loadLookups} />
          )}

          {/* Teachers */}
          {tab === "teachers" && (
            <CrudPanel
              title="Teachers"
              listPath="/teachers"
              createPath="/teachers"
              updatePath="/teachers/:id"
              deletePath="/teachers/:id"
              columns={[
                { key: "firstName", header: "First Name" },
                { key: "lastName", header: "Last Name" },
                { key: "email", header: "Email" },
                { key: "phone", header: "Phone" },
                {
                  key: "ratingAverage",
                  header: "Avg",
                  render: (v) => (v ? Number(v).toFixed(1) : "—"),
                },
                { key: "ratingCount", header: "Count" },
              ]}
              fields={[
                { key: "firstName", label: "First Name", required: true },
                { key: "lastName", label: "Last Name", required: true },
                { key: "email", label: "Email", type: "email", required: true },
                { key: "phone", label: "Phone" },
                { key: "dateOfBirth", label: "DOB", type: "date" },
                { key: "image", label: "Image URL" },
              ]}
              withImageUpload
            />
          )}

          {/* Students */}
          {tab === "students" && (
            <CrudPanel
              title="Students"
              listPath="/students"
              createPath="/students"
              updatePath="/students/:id"
              deletePath="/students/:id"
              columns={[
                { key: "firstName", header: "First Name" },
                { key: "lastName", header: "Last Name" },
                { key: "email", header: "Email" },
                { key: "phone", header: "Phone" },
              ]}
              fields={[
                { key: "firstName", label: "First Name", required: true },
                { key: "lastName", label: "Last Name", required: true },
                { key: "email", label: "Email", type: "email", required: true },
                { key: "phone", label: "Phone" },
                { key: "dateOfBirth", label: "DOB", type: "date" },
                { key: "image", label: "Image URL" },
              ]}
              withImageUpload
            />
          )}

          {/* Scheduled Lessons (per-teacher) */}
          {tab === "schedule" && (
            <SchedulePanel
              teacherOptions={teacherOptions}
              studentOptions={studentOptions}
            />
          )}

          {/* Reviews (per-teacher) */}
          {tab === "reviews" && (
            <ReviewsPanel
              teacherOptions={teacherOptions}
              studentOptions={studentOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------- Lessons embedded in Subject --------------------- */
function LessonsEmbedded({ subjects, reloadSubjects }) {
  const [subjectId, setSubjectId] = useState("");
  const [err, setErr] = useState("");
  const subject = useMemo(
    () => subjects.find((s) => s._id === subjectId),
    [subjects, subjectId]
  );
  const lessons = subject?.lessons || [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", image: "" });

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", image: "" });
    setOpen(true);
  };
  const startEdit = (l) => {
    setEditing(l);
    setForm({
      name: l.name || "",
      description: l.description || "",
      image: l.image || "",
    });
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({ name: "", description: "", image: "" });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      setErr("Select a subject");
      return;
    }
    try {
      setErr("");
      const updated = [...lessons];
      if (editing) {
        const idx = updated.findIndex((x) => String(x._id) === String(editing._id));
        if (idx >= 0) updated[idx] = { ...editing, ...form };
      } else {
        updated.push({ ...form, _id: crypto.randomUUID() }); // temp id; server may replace
      }
      await apiSend(`/subjects/${subjectId}`, "PUT", { ...subject, lessons: updated });
      close();
      await reloadSubjects();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  const remove = async (l) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      setErr("");
      const updated = lessons.filter((x) => String(x._id) !== String(l._id));
      await apiSend(`/subjects/${subjectId}`, "PUT", { ...subject, lessons: updated });
      await reloadSubjects();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Lessons (by Subject)</h3>
          <p className="text-sm text-slate-600">Select a subject to manage its lessons.</p>
          {err && <p className="mt-1 text-sm text-rose-600">{err}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Choose subject…</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={startCreate}
            disabled={!subjectId}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow 
              ${subjectId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-not-allowed"}`}
          >
            <PlusIcon className="h-4 w-4" /> Add Lesson
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-700">Lesson</th>
              <th className="p-3 text-left font-semibold text-slate-700">Description</th>
              <th className="p-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
        <tbody>
            {!subjectId ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={3}>
                  Select a subject…
                </td>
              </tr>
            ) : lessons.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={3}>
                  No lessons
                </td>
              </tr>
            ) : (
              lessons.map((l) => (
                <tr key={l._id} className="border-t border-slate-200">
                  <td className="p-3">{l.name}</td>
                  <td className="p-3">{l.description || "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(l)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        <PencilIcon className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => remove(l)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold">{editing ? "Edit Lesson" : "Create Lesson"}</h4>
              <button className="rounded-full p-1.5 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-4 space-y-4">
              <FieldInput
                field={{ key: "name", label: "Lesson Name", required: true }}
                value={form.name}
                onChange={(v) => setForm((s) => ({ ...s, name: v }))}
              />
              <FieldInput
                field={{ key: "description", label: "Description", type: "textarea" }}
                value={form.description}
                onChange={(v) => setForm((s) => ({ ...s, description: v }))}
              />
              <FieldInput
                field={{ key: "image", label: "Image URL" }}
                value={form.image}
                onChange={(v) => setForm((s) => ({ ...s, image: v }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------- Schedule (per-teacher) --------------------- */
function SchedulePanel({ teacherOptions, studentOptions }) {
  const [teacherId, setTeacherId] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      setErr("");
      const data = await apiGet(`/schedule/user/${teacherId}`);
      const arr = Array.isArray(data?.data) ? data.data : [];
      setItems(arr);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  // Simple create form for schedule/add (uses your existing route)
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    teacherId: "",
    studentId: "",
    slots: [{ day: "Monday", date: new Date().toLocaleDateString("en-US"), time: "10:00" }],
  });

  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      const teacher = { _id: form.teacherId };
      const student = { _id: form.studentId };
      await apiSend("/schedule/add", "POST", { teacher, student, slots: form.slots });
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this scheduled entry?")) return;
    try {
      setErr("");
      await apiSend(`/schedule/${row._id}`, "DELETE");
      await load();
    } catch (e2) {
      setErr("Delete failed (endpoint missing?). " + (e2.message || e2));
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Scheduled Lessons</h3>
          <p className="text-sm text-slate-600">Pick a teacher to view their schedule.</p>
          {err && <p className="mt-1 text-sm text-rose-600">{err}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Choose teacher…</option>
            {teacherOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setOpen(true);
              setForm((s) => ({ ...s, teacherId }));
            }}
            disabled={!teacherId}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow 
              ${teacherId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-not-allowed"}`}
          >
            <PlusIcon className="h-4 w-4" /> Add Schedule
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-700">Student</th>
              <th className="p-3 text-left font-semibold text-slate-700">Slots</th>
              <th className="p-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!teacherId ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={3}>
                  Select a teacher…
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={3}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={3}>
                  No scheduled lessons
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row._id} className="border-t border-slate-200">
                  <td className="p-3">
                    {row?.student?.firstName} {row?.student?.lastName}
                  </td>
                  <td className="p-3">
                    {(row.slots || []).map((s, i) => (
                      <span
                        key={i}
                        className="mr-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200"
                      >
                        {s.day} • {s.date} • {s.time}
                      </span>
                    ))}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => remove(row)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold">Create Schedule</h4>
              <button className="rounded-full p-1.5 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createSchedule} className="p-4 space-y-4">
              <FieldInput
                field={{ key: "teacherId", label: "Teacher", type: "select", options: teacherOptions, required: true }}
                value={form.teacherId}
                onChange={(v) => setForm((s) => ({ ...s, teacherId: v }))}
              />
              <FieldInput
                field={{ key: "studentId", label: "Student", type: "select", options: studentOptions, required: true }}
                value={form.studentId}
                onChange={(v) => setForm((s) => ({ ...s, studentId: v }))}
              />
              <FieldInput
                field={{ key: "slots", label: "Slots (JSON array)", type: "json", rows: 8 }}
                value={form.slots}
                onChange={(v) => {
                  try {
                    const parsed = typeof v === "string" ? JSON.parse(v) : v;
                    setForm((s) => ({ ...s, slots: parsed }));
                  } catch {
                    setForm((s) => ({ ...s, slots: v }));
                  }
                }}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------- Reviews (per-teacher) --------------------- */
function ReviewsPanel({ teacherOptions, studentOptions }) {
  const [teacherId, setTeacherId] = useState("");
  const [items, setItems] = useState([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      setErr("");
      const data = await apiGet(`/reviews/teacher/${teacherId}`);
      setAvg(data?.avg || 0);
      setCount(data?.count || 0);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  // admin create review (optional)
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", rating: 5, comment: "" });

  const create = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      await apiSend("/reviews", "POST", {
        teacherId,
        rating: Number(form.rating),
        comment: form.comment,
      });
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      setErr("");
      await apiSend(`/reviews/${row._id}`, "DELETE");
      await load();
    } catch (e2) {
      setErr(e2.message || String(e2));
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Reviews</h3>
          <p className="text-sm text-slate-600">
            Pick a teacher to view all reviews (visible to everyone on profile).
          </p>
          {err && <p className="mt-1 text-sm text-rose-600">{err}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">Choose teacher…</option>
            {teacherOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOpen(true)}
            disabled={!teacherId}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow 
              ${teacherId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-not-allowed"}`}
          >
            <PlusIcon className="h-4 w-4" /> Add Review
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        {teacherId && (
          <p className="text-sm text-slate-700">
            Average: <b>{avg.toFixed(1)}</b> • Count: <b>{count}</b>
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-700">Student</th>
              <th className="p-3 text-left font-semibold text-slate-700">Rating</th>
              <th className="p-3 text-left font-semibold text-slate-700">Comment</th>
              <th className="p-3 text-left font-semibold text-slate-700">Date</th>
              <th className="p-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!teacherId ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  Select a teacher…
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  No reviews
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row._id} className="border-t border-slate-200">
                  <td className="p-3">
                    {row?.student ? `${row.student.firstName} ${row.student.lastName}` : "—"}
                  </td>
                  <td className="p-3">{row.rating}</td>
                  <td className="p-3">{row.comment || "—"}</td>
                  <td className="p-3">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => remove(row)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold">Create Review</h4>
              <button className="rounded-full p-1.5 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={create} className="p-4 space-y-4">
              <FieldInput
                field={{
                  key: "rating",
                  label: "Rating (1-5)",
                  type: "number",
                  min: 1,
                  max: 5,
                  step: 1,
                  required: true,
                }}
                value={form.rating}
                onChange={(v) => setForm((s) => ({ ...s, rating: v }))}
              />
              <FieldInput
                field={{ key: "comment", label: "Comment", type: "textarea" }}
                value={form.comment}
                onChange={(v) => setForm((s) => ({ ...s, comment: v }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-500">
                * Uses your <code>/reviews</code> POST (session auth). If you want admin to spoof a
                student, add a server-side admin endpoint.
              </p>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
