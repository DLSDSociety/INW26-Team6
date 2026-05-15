import { useState, useEffect, useCallback } from "react";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function authHeaders(isForm = false) {
  const token = localStorage.getItem("access");
  const h = { Authorization: `Bearer ${token}` };
  if (!isForm) h["Content-Type"] = "application/json";
  return h;
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(opts._form), ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`i-toast i-toast-${type}`}>{msg}</div>;
}

function ProgressRing({ pct }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#2a3045" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none" stroke="#6c63ff" strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
        strokeLinecap="round" transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">{pct}%</text>
    </svg>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="i-overlay" onClick={(e) => e.target.classList.contains("i-overlay") && onClose()}>
      <div className="i-modal">
        <div className="i-modal-head">
          <h3>{title}</h3>
          <button className="i-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="i-modal-body">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="i-field">
      <label className="i-label">{label}</label>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);

  // Modals
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(null);
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [showStudents, setShowStudents] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddMaterial, setShowAddMaterial] = useState(null); // course object

  // Forms
  const [courseForm, setCourseForm] = useState({ title: "", description: "", category: "", thumbnail: null });
  const [lessonForm, setLessonForm] = useState({ title: "", order_number: "", duration: "", video_file: null });
  const [materialForm, setMaterialForm] = useState({ lesson_id: "", file: null, material_type: "pdf" });
  const [formError, setFormError] = useState("");

  const setLoad = (k, v) => setLoading((p) => ({ ...p, [k]: v }));
  const notify = (msg, type = "success") => setToast({ msg, type });

  // ── Fetchers ──
  const loadCourses = useCallback(async () => {
    setLoad("courses", true);
    try {
      const data = await apiFetch("/courses/my-courses/");
      setCourses(data);
    } catch { notify("Failed to load courses", "error"); }
    finally { setLoad("courses", false); }
  }, []);

  const loadStudents = useCallback(async (courseId) => {
    setLoad("students", true);
    try {
      const data = await apiFetch(`/courses/${courseId}/students/`);
      setStudents(data);
    } catch { notify("Failed to load students", "error"); }
    finally { setLoad("students", false); }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // ── Create Course ──
  const handleCreateCourse = async () => {
    setFormError("");
    if (!courseForm.title.trim()) { setFormError("Title is required"); return; }
    const fd = new FormData();
    Object.entries(courseForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      const created = await apiFetch("/courses/", { method: "POST", body: fd, _form: true });
      setCourses((p) => [created, ...p]);
      setShowCreateCourse(false);
      setCourseForm({ title: "", description: "", category: "", thumbnail: null });
      notify("Course created!");
    } catch (e) { setFormError(e.message); }
  };

  // ── Edit Course ──
  const handleEditCourse = async () => {
    setFormError("");
    if (!courseForm.title.trim()) { setFormError("Title is required"); return; }
    const fd = new FormData();
    Object.entries(courseForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      const updated = await apiFetch(`/courses/${showEditCourse.id}/`, { method: "PUT", body: fd, _form: true });
      setCourses((p) => p.map((c) => (c.id === updated.id ? updated : c)));
      setShowEditCourse(null);
      notify("Course updated!");
    } catch (e) { setFormError(e.message); }
  };

  // ── Delete Course ──
  const handleDeleteCourse = async (id) => {
    try {
      await apiFetch(`/courses/${id}/`, { method: "DELETE" });
      setCourses((p) => p.filter((c) => c.id !== id));
      notify("Course deleted");
    } catch { notify("Failed to delete", "error"); }
    setConfirmDelete(null);
  };

  // ── Add Lesson ──
  const handleAddLesson = async () => {
    setFormError("");
    if (!lessonForm.title.trim()) { setFormError("Lesson title is required"); return; }
    const fd = new FormData();
    fd.append("course", showAddLesson.id);
    Object.entries(lessonForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      await apiFetch("/courses/lessons/create/", { method: "POST", body: fd, _form: true });
      setShowAddLesson(null);
      setLessonForm({ title: "", order_number: "", duration: "", video_file: null });
      notify("Lesson added!");
      loadCourses(); // refresh lesson counts
    } catch (e) { setFormError(e.message); }
  };

  // ── Add Material ──
  const handleAddMaterial = async () => {
    setFormError("");
    if (!materialForm.lesson_id) { setFormError("Please select a lesson"); return; }
    if (!materialForm.file) { setFormError("Please select a file"); return; }
    const fd = new FormData();
    fd.append("file", materialForm.file);
    fd.append("material_type", materialForm.material_type);
    try {
      await apiFetch(`/courses/lessons/${materialForm.lesson_id}/materials/`, { method: "POST", body: fd, _form: true });
      setShowAddMaterial(null);
      setMaterialForm({ lesson_id: "", file: null, material_type: "pdf" });
      notify("Material uploaded!");
    } catch (e) { setFormError(e.message); }
  };

  // ── Derived stats ──
  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="i-overlay">
          <div className="i-modal" style={{ maxWidth: 380 }}>
            <div className="i-modal-head"><h3>Confirm Delete</h3></div>
            <div className="i-modal-body">
              <p className="i-muted" style={{ marginBottom: 20 }}>
                Delete <strong style={{ color: "#fff" }}>{confirmDelete.name}</strong>? This is permanent.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="i-btn i-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="i-btn i-btn-danger" onClick={confirmDelete.onConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourse && (
        <Modal title="Create New Course" onClose={() => { setShowCreateCourse(false); setFormError(""); }}>
          <Field label="Title *">
            <input className="i-input" value={courseForm.title}
              onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} placeholder="Course title" />
          </Field>
          <Field label="Description">
            <textarea className="i-input i-textarea" value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} placeholder="What will students learn?" />
          </Field>
          <Field label="Category">
            <input className="i-input" value={courseForm.category}
              onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Web Development" />
          </Field>
          <Field label="Thumbnail">
            <input className="i-input" type="file" accept="image/*"
              onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowCreateCourse(false)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleCreateCourse}>Create Course</button>
          </div>
        </Modal>
      )}

      {/* Edit Course Modal */}
      {showEditCourse && (
        <Modal title="Edit Course" onClose={() => { setShowEditCourse(null); setFormError(""); }}>
          <Field label="Title *">
            <input className="i-input" value={courseForm.title}
              onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className="i-input i-textarea" value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
          </Field>
          <Field label="Category">
            <input className="i-input" value={courseForm.category}
              onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} />
          </Field>
          <Field label="New Thumbnail (optional)">
            <input className="i-input" type="file" accept="image/*"
              onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowEditCourse(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleEditCourse}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <Modal title={`Add Lesson — ${showAddLesson.title}`} onClose={() => { setShowAddLesson(null); setFormError(""); }}>
          <Field label="Lesson Title *">
            <input className="i-input" value={lessonForm.title}
              onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to React" />
          </Field>
          <Field label="Order Number">
            <input className="i-input" type="number" min="1" value={lessonForm.order_number}
              onChange={(e) => setLessonForm((p) => ({ ...p, order_number: e.target.value }))} placeholder="1" />
          </Field>
          <Field label="Duration (mins)">
            <input className="i-input" type="number" min="1" value={lessonForm.duration}
              onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} placeholder="15" />
          </Field>
          <Field label="Video File">
            <input className="i-input" type="file" accept="video/*"
              onChange={(e) => setLessonForm((p) => ({ ...p, video_file: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowAddLesson(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleAddLesson}>Add Lesson</button>
          </div>
        </Modal>
      )}

      {/* Students Modal */}
      {showStudents && (
        <Modal title={`Students — ${showStudents.title}`} onClose={() => setShowStudents(null)}>
          {loading.students ? (
            <p className="i-muted" style={{ padding: "20px 0" }}>Loading…</p>
          ) : students.length === 0 ? (
            <p className="i-muted" style={{ padding: "20px 0" }}>No students enrolled yet.</p>
          ) : (
            <table className="i-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="i-bold">{s.student_name || s.username}</td>
                    <td className="i-muted">{s.email || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="i-prog-bar">
                          <div className="i-prog-fill" style={{ width: `${s.progress_percent || 0}%` }} />
                        </div>
                        <span className="i-muted" style={{ fontSize: 12 }}>{s.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`i-chip ${s.is_completed ? "done" : "progress"}`}>
                        {s.is_completed ? "Done" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/* Add Material Modal */}
      {showAddMaterial && (
        <Modal title={`Upload Material — ${showAddMaterial.title}`} onClose={() => { setShowAddMaterial(null); setFormError(""); }}>
          <Field label="Select Lesson *">
            <select className="i-input" value={materialForm.lesson_id}
              onChange={(e) => setMaterialForm((p) => ({ ...p, lesson_id: e.target.value }))}>
              <option value="">— Choose a lesson —</option>
              {(showAddMaterial.lessons || []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.order_number}. {l.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Material Type">
            <select className="i-input" value={materialForm.material_type}
              onChange={(e) => setMaterialForm((p) => ({ ...p, material_type: e.target.value }))}>
              <option value="pdf">PDF</option>
              <option value="doc">Document</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <Field label="File *">
            <input className="i-input" type="file"
              onChange={(e) => setMaterialForm((p) => ({ ...p, file: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowAddMaterial(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleAddMaterial}>Upload Material</button>
          </div>
        </Modal>
      )}

      {/* Shell */}
      <div className="i-shell">
        {/* Sidebar */}
        <aside className="i-sidebar">
          <div className="i-brand">
            <span className="i-brand-icon">🎓</span>
            <div>
              <div className="i-brand-name">LearningHub</div>
              <div className="i-brand-role">Instructor</div>
            </div>
          </div>
          <nav className="i-nav">
            <button
              className="i-nav-item"
              onClick={() => window.location.href = "/"}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>
            {[
              { id: "courses", icon: "📚", label: "My Courses" },
              { id: "overview", icon: "▦", label: "Overview" },
            ].map((item) => (
              <button
                key={item.id}
                className={`i-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="i-sidebar-footer">
            <div className="i-user-info">
              <div className="i-avatar">{(localStorage.getItem("username") || "I")[0].toUpperCase()}</div>
              <div>
                <div className="i-username">{localStorage.getItem("username") || "Instructor"}</div>
                <div className="i-role-tag">instructor</div>
              </div>
            </div>
            <button className="i-btn i-btn-ghost i-btn-sm" style={{ width: "100%", marginTop: 10 }}
              onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
              ⎋ Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="i-main">
          <header className="i-topbar">
            <div>
              <h1 className="i-page-title">
                {activeTab === "overview" ? "Overview" : "My Courses"}
              </h1>
              <p className="i-page-sub">Manage your content and track student progress</p>
            </div>
            {activeTab === "courses" && (
              <button className="i-btn i-btn-primary" onClick={() => {
                setCourseForm({ title: "", description: "", category: "", thumbnail: null });
                setFormError("");
                setShowCreateCourse(true);
              }}>
                + Create Course
              </button>
            )}
          </header>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <section className="i-section">
              <div className="i-stats-row">
                {[
                  { icon: "📚", label: "Courses", value: courses.length, color: "#6c63ff" },
                  { icon: "🎬", label: "Total Lessons", value: totalLessons, color: "#f39c12" },
                  { icon: "👥", label: "Total Students", value: courses.reduce((s, c) => s + (c.student_count || 0), 0), color: "#27ae60" },
                ].map((s) => (
                  <div key={s.label} className="i-stat-card" style={{ borderColor: s.color }}>
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                    <div>
                      <div className="i-stat-val">{s.value}</div>
                      <div className="i-stat-lbl">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="i-section-title">Course Breakdown</h2>
              <div className="i-overview-grid">
                {courses.map((c) => (
                  <div key={c.id} className="i-overview-card">
                    <div className="i-ov-head">
                      <span className="i-ov-title">{c.title}</span>
                      <span className="i-chip progress">{c.category || "General"}</span>
                    </div>
                    <div className="i-ov-meta">
                      <span>{c.lessons?.length || 0} lessons</span>
                      <span>{c.student_count || 0} students</span>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <p className="i-muted">No courses yet. Create your first one!</p>}
              </div>
            </section>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === "courses" && (
            <section className="i-section">
              {loading.courses ? (
                <p className="i-muted" style={{ padding: 20 }}>Loading courses…</p>
              ) : courses.length === 0 ? (
                <div className="i-empty-state">
                  <div className="i-empty-icon">📚</div>
                  <h3>No courses yet</h3>
                  <p>Create your first course to get started</p>
                  <button className="i-btn i-btn-primary" style={{ marginTop: 16 }}
                    onClick={() => { setCourseForm({ title: "", description: "", category: "", thumbnail: null }); setShowCreateCourse(true); }}>
                    + Create Course
                  </button>
                </div>
              ) : (
                <div className="i-course-grid">
                  {courses.map((c) => (
                    <div key={c.id} className="i-course-card">
                      {c.thumbnail && (
                        <div className="i-course-thumb">
                          <img src={c.thumbnail} alt={c.title} />
                        </div>
                      )}
                      {!c.thumbnail && (
                        <div className="i-course-thumb-placeholder">
                          <span>📚</span>
                        </div>
                      )}
                      <div className="i-course-body">
                        <div className="i-course-cat">{c.category || "General"}</div>
                        <h3 className="i-course-title">{c.title}</h3>
                        <p className="i-course-desc">{c.description || "No description provided."}</p>
                        <div className="i-course-meta">
                          <span>🎬 {c.lessons?.length || 0} lessons</span>
                          <span>👥 {c.student_count ?? "—"} students</span>
                        </div>
                      </div>
                      <div className="i-course-actions">
                        <button className="i-btn i-btn-ghost i-btn-sm" onClick={() => {
                          setShowStudents(c);
                          loadStudents(c.id);
                        }}>
                          👥 Students
                        </button>
                        <button className="i-btn i-btn-accent i-btn-sm" onClick={() => {
                          setLessonForm({ title: "", order_number: "", duration: "", video_file: null });
                          setFormError("");
                          setShowAddLesson(c);
                        }}>
                          + Lesson
                        </button>
                        <button className="i-btn i-btn-accent i-btn-sm" onClick={() => {
                          setMaterialForm({ lesson_id: "", file: null, material_type: "pdf" });
                          setFormError("");
                          setShowAddMaterial(c);
                        }}>
                          📎 Material
                        </button>
                        <button className="i-btn i-btn-ghost i-btn-sm" onClick={() => {
                          setCourseForm({ title: c.title, description: c.description || "", category: c.category || "", thumbnail: null });
                          setFormError("");
                          setShowEditCourse(c);
                        }}>
                          ✏️ Edit
                        </button>
                        <button className="i-btn i-btn-danger i-btn-sm" onClick={() => setConfirmDelete({
                          name: c.title,
                          onConfirm: () => handleDeleteCourse(c.id),
                        })}>
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --i-bg: #0b0e16;
    --i-surface: #141720;
    --i-surface2: #1c2030;
    --i-border: #252c40;
    --i-text: #e4e8f0;
    --i-muted: #667080;
    --i-accent: #6c63ff;
    --i-green: #2ecc71;
    --i-orange: #f39c12;
    --i-danger: #e74c3c;
    --i-radius: 12px;
    --i-sidebar: 230px;
    --i-font-h: 'Syne', sans-serif;
    --i-font-b: 'DM Sans', sans-serif;
  }

  body { background: var(--i-bg); color: var(--i-text); font-family: var(--i-font-b); }

  .i-shell { display: flex; min-height: 100vh; }

  /* Sidebar */
  .i-sidebar {
    width: var(--i-sidebar); background: var(--i-surface);
    border-right: 1px solid var(--i-border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; padding: 20px 14px;
  }
  .i-brand {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 20px; border-bottom: 1px solid var(--i-border);
    margin-bottom: 18px;
  }
  .i-brand-icon { font-size: 26px; }
  .i-brand-name { font-family: var(--i-font-h); font-weight: 800; font-size: 16px; color: #fff; }
  .i-brand-role { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--i-orange); font-weight: 600; }
  .i-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .i-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; border: none;
    background: transparent; color: var(--i-muted);
    cursor: pointer; font-family: var(--i-font-b); font-size: 14px;
    text-align: left; transition: all 0.15s;
  }
  .i-nav-item:hover { background: var(--i-surface2); color: var(--i-text); }
  .i-nav-item.active { background: rgba(108,99,255,0.15); color: var(--i-accent); font-weight: 600; border-left: 3px solid var(--i-accent); }
  .i-sidebar-footer { border-top: 1px solid var(--i-border); padding-top: 14px; }
  .i-user-info { display: flex; align-items: center; gap: 10px; }
  .i-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, var(--i-accent), #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 14px; flex-shrink: 0;
  }
  .i-username { font-size: 13px; font-weight: 600; color: var(--i-text); }
  .i-role-tag { font-size: 10px; color: var(--i-orange); text-transform: uppercase; letter-spacing: 1px; }

  /* Main */
  .i-main { flex: 1; padding: 28px 32px; overflow-y: auto; }
  .i-topbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .i-page-title { font-family: var(--i-font-h); font-size: 24px; font-weight: 800; color: #fff; }
  .i-page-sub { color: var(--i-muted); font-size: 13px; margin-top: 3px; }
  .i-section { animation: i-fadeUp 0.2s ease; }
  @keyframes i-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .i-section-title { font-family: var(--i-font-h); font-size: 17px; font-weight: 700; margin: 24px 0 14px; }

  /* Overview stats */
  .i-stats-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px; }
  .i-stat-card {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-top: 3px solid;
    border-radius: var(--i-radius); padding: 18px 22px;
    display: flex; align-items: center; gap: 14px; flex: 1; min-width: 160px;
    transition: transform 0.15s;
  }
  .i-stat-card:hover { transform: translateY(-2px); }
  .i-stat-val { font-family: var(--i-font-h); font-size: 26px; font-weight: 800; color: #fff; }
  .i-stat-lbl { font-size: 12px; color: var(--i-muted); margin-top: 2px; }

  /* Overview grid */
  .i-overview-grid { display: flex; flex-direction: column; gap: 10px; }
  .i-overview-card {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-radius: var(--i-radius); padding: 14px 18px;
  }
  .i-ov-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .i-ov-title { font-size: 14px; font-weight: 600; color: var(--i-text); }
  .i-ov-meta { display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: var(--i-muted); }

  /* Course grid */
  .i-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
  .i-course-card {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-radius: var(--i-radius); overflow: hidden;
    display: flex; flex-direction: column;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .i-course-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  .i-course-thumb { height: 140px; overflow: hidden; }
  .i-course-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .i-course-thumb-placeholder {
    height: 140px; background: var(--i-surface2);
    display: flex; align-items: center; justify-content: center; font-size: 40px;
  }
  .i-course-body { padding: 16px; flex: 1; }
  .i-course-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--i-accent); font-weight: 700; margin-bottom: 6px; }
  .i-course-title { font-family: var(--i-font-h); font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .i-course-desc { font-size: 13px; color: var(--i-muted); line-height: 1.6; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .i-course-meta { display: flex; gap: 14px; font-size: 12px; color: var(--i-muted); }
  .i-course-actions {
    padding: 12px 16px; border-top: 1px solid var(--i-border);
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  /* Chips */
  .i-chip {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .i-chip.done { background: rgba(46,204,113,0.15); color: var(--i-green); }
  .i-chip.progress { background: rgba(108,99,255,0.15); color: var(--i-accent); }

  /* Buttons */
  .i-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 8px; border: none;
    font-family: var(--i-font-b); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .i-btn-sm { padding: 5px 11px; font-size: 12px; }
  .i-btn-primary { background: var(--i-accent); color: #fff; }
  .i-btn-primary:hover { background: #5a52e0; }
  .i-btn-accent { background: rgba(108,99,255,0.15); color: var(--i-accent); border: 1px solid rgba(108,99,255,0.3); }
  .i-btn-accent:hover { background: var(--i-accent); color: #fff; }
  .i-btn-ghost { background: transparent; border: 1px solid var(--i-border); color: var(--i-muted); }
  .i-btn-ghost:hover { border-color: var(--i-text); color: var(--i-text); }
  .i-btn-danger { background: var(--i-danger); color: #fff; }
  .i-btn-danger:hover { background: #c0392b; }

  /* Form */
  .i-field { margin-bottom: 14px; }
  .i-label { display: block; font-size: 12px; font-weight: 600; color: var(--i-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .i-input {
    width: 100%; background: var(--i-surface2); border: 1px solid var(--i-border);
    color: var(--i-text); border-radius: 8px; padding: 10px 14px;
    font-family: var(--i-font-b); font-size: 14px; outline: none;
    transition: border 0.15s;
  }
  .i-input:focus { border-color: var(--i-accent); }
  .i-textarea { resize: vertical; min-height: 90px; }
  .i-form-error { color: var(--i-danger); font-size: 13px; margin: 8px 0; }
  .i-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

  /* Modal */
  .i-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center; z-index: 999;
  }
  .i-modal {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-radius: 16px; width: 90%; max-width: 520px; max-height: 90vh;
    overflow-y: auto;
  }
  .i-modal-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px; border-bottom: 1px solid var(--i-border);
  }
  .i-modal-head h3 { font-family: var(--i-font-h); font-size: 18px; font-weight: 700; }
  .i-close-btn { background: none; border: none; color: var(--i-muted); font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
  .i-close-btn:hover { background: var(--i-surface2); color: var(--i-text); }
  .i-modal-body { padding: 20px 24px; }

  /* Table */
  .i-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .i-table th {
    padding: 10px 12px; text-align: left;
    font-family: var(--i-font-h); font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px; color: var(--i-muted);
    border-bottom: 1px solid var(--i-border);
  }
  .i-table td { padding: 10px 12px; border-bottom: 1px solid var(--i-border); vertical-align: middle; }
  .i-table tr:last-child td { border-bottom: none; }
  .i-bold { font-weight: 500; color: var(--i-text); }
  .i-muted { color: var(--i-muted); }

  /* Progress */
  .i-prog-bar { flex: 1; background: var(--i-border); border-radius: 4px; height: 5px; overflow: hidden; min-width: 70px; }
  .i-prog-fill { height: 100%; background: var(--i-accent); border-radius: 4px; }

  /* Empty */
  .i-empty-state {
    text-align: center; padding: 60px 20px;
    color: var(--i-muted);
  }
  .i-empty-icon { font-size: 48px; margin-bottom: 12px; }
  .i-empty-state h3 { font-family: var(--i-font-h); color: var(--i-text); margin-bottom: 6px; font-size: 18px; }
  .i-empty-state p { font-size: 14px; }

  /* Toast */
  .i-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    padding: 12px 20px; border-radius: 10px;
    font-size: 14px; font-weight: 500; font-family: var(--i-font-b);
    animation: i-slideIn 0.2s ease;
  }
  .i-toast-success { background: #27ae60; color: #fff; }
  .i-toast-error { background: var(--i-danger); color: #fff; }
  @keyframes i-slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
`;
