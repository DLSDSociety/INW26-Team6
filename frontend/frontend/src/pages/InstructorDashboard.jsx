import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "courses"
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [managingCourse, setManagingCourse] = useState(null); // The course object being managed
  
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);

  // Modals
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(null);
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [showStudents, setShowStudents] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddMaterial, setShowAddMaterial] = useState(null); 

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
      // Update managingCourse if it's currently open
      setManagingCourse((prev) => prev ? data.find((c) => c.id === prev.id) || null : null);
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
      await apiFetch("/courses/", { method: "POST", body: fd, _form: true });
      setShowCreateCourse(false);
      setCourseForm({ title: "", description: "", category: "", thumbnail: null });
      notify("Course created successfully!");
      loadCourses();
      setActiveTab("courses");
    } catch (e) { setFormError(e.message); }
  };

  // ── Edit Course ──
  const handleEditCourse = async () => {
    setFormError("");
    if (!courseForm.title.trim()) { setFormError("Title is required"); return; }
    const fd = new FormData();
    Object.entries(courseForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      await apiFetch(`/courses/${showEditCourse.id}/`, { method: "PUT", body: fd, _form: true });
      setShowEditCourse(null);
      notify("Course updated!");
      loadCourses();
    } catch (e) { setFormError(e.message); }
  };

  // ── Delete Course ──
  const handleDeleteCourse = async (id) => {
    try {
      await apiFetch(`/courses/${id}/`, { method: "DELETE" });
      setCourses((p) => p.filter((c) => c.id !== id));
      if (managingCourse?.id === id) setManagingCourse(null);
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
      notify("Lesson added successfully!");
      loadCourses(); 
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
      notify("Material uploaded successfully!");
      loadCourses(); // Refresh materials
    } catch (e) { setFormError(e.message); }
  };

  // ── Derived stats ──
  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);
  const totalStudents = courses.reduce((s, c) => s + (c.student_count || 0), 0);

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── MODALS ── */}
      {confirmDelete && (
        <div className="i-overlay">
          <div className="i-modal" style={{ maxWidth: 380 }}>
            <div className="i-modal-head"><h3>Confirm Delete</h3></div>
            <div className="i-modal-body">
              <p className="i-muted" style={{ marginBottom: 20 }}>
                Delete <strong style={{ color: "var(--i-text)" }}>{confirmDelete.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="i-btn i-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="i-btn i-btn-danger" onClick={confirmDelete.onConfirm}>Delete Course</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateCourse && (
        <Modal title="Create New Course" onClose={() => { setShowCreateCourse(false); setFormError(""); }}>
          <Field label="Course Title *">
            <input className="i-input" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Master React in 30 Days" />
          </Field>
          <Field label="Category">
            <input className="i-input" value={courseForm.category} onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Web Development" />
          </Field>
          <Field label="Description">
            <textarea className="i-input i-textarea" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} placeholder="What will students learn?" />
          </Field>
          <Field label="Cover Image">
            <input className="i-input" type="file" accept="image/*" onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowCreateCourse(false)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleCreateCourse}>Create Course</button>
          </div>
        </Modal>
      )}

      {showEditCourse && (
        <Modal title="Edit Course Details" onClose={() => { setShowEditCourse(null); setFormError(""); }}>
          <Field label="Course Title *">
            <input className="i-input" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Category">
            <input className="i-input" value={courseForm.category} onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className="i-input i-textarea" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
          </Field>
          <Field label="Update Cover Image (optional)">
            <input className="i-input" type="file" accept="image/*" onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowEditCourse(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleEditCourse}>Save Changes</button>
          </div>
        </Modal>
      )}

      {showAddLesson && (
        <Modal title={`Add Lesson to ${showAddLesson.title}`} onClose={() => { setShowAddLesson(null); setFormError(""); }}>
          <Field label="Lesson Title *">
            <input className="i-input" value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Variables" />
          </Field>
          <div style={{ display: "flex", gap: "12px" }}>
            <Field label="Order / Sequence">
              <input className="i-input" type="number" min="1" value={lessonForm.order_number} onChange={(e) => setLessonForm((p) => ({ ...p, order_number: e.target.value }))} placeholder="1" />
            </Field>
            <Field label="Duration (mins)">
              <input className="i-input" type="number" min="1" value={lessonForm.duration} onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} placeholder="15" />
            </Field>
          </div>
          <Field label="Lesson Video (optional)">
            <input className="i-input" type="file" accept="video/*" onChange={(e) => setLessonForm((p) => ({ ...p, video_file: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowAddLesson(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleAddLesson}>Add Lesson</button>
          </div>
        </Modal>
      )}

      {showAddMaterial && (
        <Modal title={`Upload Material to ${showAddMaterial.title}`} onClose={() => { setShowAddMaterial(null); setFormError(""); }}>
          <Field label="Select Lesson *">
            <select className="i-input" value={materialForm.lesson_id} onChange={(e) => setMaterialForm((p) => ({ ...p, lesson_id: e.target.value }))}>
              <option value="">— Select a lesson module —</option>
              {(showAddMaterial.lessons || []).map((l) => (
                <option key={l.id} value={l.id}>Module {l.order_number}: {l.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Material Type">
            <select className="i-input" value={materialForm.material_type} onChange={(e) => setMaterialForm((p) => ({ ...p, material_type: e.target.value }))}>
              <option value="pdf">PDF Document</option>
              <option value="doc">Word Document</option>
              <option value="video">Additional Video</option>
              <option value="other">Other Asset</option>
            </select>
          </Field>
          <Field label="Select File *">
            <input className="i-input" type="file" onChange={(e) => setMaterialForm((p) => ({ ...p, file: e.target.files[0] }))} />
          </Field>
          {formError && <p className="i-form-error">{formError}</p>}
          <div className="i-modal-actions">
            <button className="i-btn i-btn-ghost" onClick={() => setShowAddMaterial(null)}>Cancel</button>
            <button className="i-btn i-btn-primary" onClick={handleAddMaterial}>Upload Asset</button>
          </div>
        </Modal>
      )}

      {showStudents && (
        <Modal title={`Enrolled Students — ${showStudents.title}`} onClose={() => setShowStudents(null)}>
          {loading.students ? (
            <div className="i-empty-state"><p>Loading student data...</p></div>
          ) : students.length === 0 ? (
            <div className="i-empty-state">
              <span style={{ fontSize: 40, marginBottom: 10, display: 'block' }}>👥</span>
              <p>No students enrolled yet.</p>
            </div>
          ) : (
            <table className="i-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="i-bold">{s.student_name || s.username}</div>
                      <div className="i-muted" style={{ fontSize: 11 }}>{s.email || "No email"}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="i-prog-bar">
                          <div className="i-prog-fill" style={{ width: `${s.progress_percent || 0}%` }} />
                        </div>
                        <span className="i-bold" style={{ fontSize: 12 }}>{s.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`i-chip ${s.is_completed ? "done" : "progress"}`}>
                        {s.is_completed ? "Completed" : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/* ── SHELL ── */}
      <div className="i-shell">
        {/* Sidebar */}
        <aside className="i-sidebar">
          <div className="i-brand">
            <div className="i-brand-icon">🎓</div>
            <div>
              <div className="i-brand-name">LearningHub</div>
              <div className="i-brand-role">Instructor Portal</div>
            </div>
          </div>
          <nav className="i-nav">
            <button className="i-nav-item" onClick={() => navigate("/")}>
              <span className="i-nav-icon">🌐</span> Go to Website
            </button>
            <div className="i-nav-divider"></div>
            {[
              { id: "overview", icon: "📊", label: "Dashboard Overview" },
              { id: "courses", icon: "📚", label: "My Courses" },
            ].map((item) => (
              <button
                key={item.id}
                className={`i-nav-item ${(activeTab === item.id && !managingCourse) ? "active" : ""}`}
                onClick={() => { setActiveTab(item.id); setManagingCourse(null); }}
              >
                <span className="i-nav-icon">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
          
          <div className="i-sidebar-footer">
            <div className="i-user-info">
              <div className="i-avatar">{(localStorage.getItem("username") || "I")[0].toUpperCase()}</div>
              <div>
                <div className="i-username">{localStorage.getItem("username") || "Instructor"}</div>
                <div className="i-role-tag">Session Active</div>
              </div>
            </div>
            <button className="i-btn i-btn-ghost i-btn-sm" style={{ width: "100%", marginTop: 16 }}
              onClick={() => { localStorage.clear(); navigate("/login"); }}>
              Sign Out 🚪
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="i-main">
          
          {/* ── MANAGE COURSE VIEW ── */}
          {managingCourse ? (
            <div className="i-fade-in">
              <button className="i-btn-back" onClick={() => setManagingCourse(null)}>
                ← Back to Courses
              </button>
              
              <header className="i-topbar" style={{ marginTop: 12 }}>
                <div>
                  <div className="i-chip progress" style={{ marginBottom: 8 }}>{managingCourse.category}</div>
                  <h1 className="i-page-title">{managingCourse.title}</h1>
                  <p className="i-page-sub">Manage curriculum, upload assets, and track students.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="i-btn i-btn-ghost" onClick={() => navigate(`/courses/${managingCourse.id}`)}>
                    👁️ Preview Course
                  </button>
                  <button className="i-btn i-btn-primary" onClick={() => {
                    setLessonForm({ title: "", order_number: managingCourse.lessons?.length + 1 || 1, duration: "", video_file: null });
                    setFormError("");
                    setShowAddLesson(managingCourse);
                  }}>
                    + Add New Lesson
                  </button>
                </div>
              </header>

              <div className="i-manage-grid">
                {/* Left Column: Curriculum */}
                <div className="i-manage-col">
                  <h2 className="i-section-title">Course Curriculum</h2>
                  <div className="i-curriculum-list">
                    {managingCourse.lessons && managingCourse.lessons.length > 0 ? (
                      managingCourse.lessons.sort((a, b) => a.order_number - b.order_number).map((l, idx) => (
                        <div key={l.id} className="i-lesson-row">
                          <div className="i-lesson-handle">::</div>
                          <div className="i-lesson-info">
                            <div className="i-lesson-title">Module {l.order_number}: {l.title}</div>
                            <div className="i-lesson-meta">
                              <span>⏱ {l.duration ? `${l.duration} mins` : "No duration"}</span>
                              {l.video_file && <span>🎬 Video Attached</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="i-empty-state" style={{ padding: "40px 20px" }}>
                        <div style={{ fontSize: 30, marginBottom: 10 }}>📖</div>
                        <h4 style={{ color: "var(--i-text)", marginBottom: 4 }}>Curriculum is empty</h4>
                        <p style={{ fontSize: 13 }}>Start building your course by adding the first lesson.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Actions & Stats */}
                <div className="i-manage-col">
                  <h2 className="i-section-title">Quick Actions</h2>
                  <div className="i-action-card">
                    <button className="i-action-btn" onClick={() => {
                      setMaterialForm({ lesson_id: "", file: null, material_type: "pdf" });
                      setFormError("");
                      setShowAddMaterial(managingCourse);
                    }}>
                      <span className="i-action-icon">📎</span>
                      <div className="i-action-text">
                        <strong>Upload Material</strong>
                        <span>Attach PDFs or Docs to lessons</span>
                      </div>
                    </button>
                    <button className="i-action-btn" onClick={() => {
                      setShowStudents(managingCourse);
                      loadStudents(managingCourse.id);
                    }}>
                      <span className="i-action-icon">👥</span>
                      <div className="i-action-text">
                        <strong>View Students</strong>
                        <span>Track enrollment and progress</span>
                      </div>
                    </button>
                    <button className="i-action-btn" onClick={() => {
                      setCourseForm({ title: managingCourse.title, description: managingCourse.description || "", category: managingCourse.category || "", thumbnail: null });
                      setFormError("");
                      setShowEditCourse(managingCourse);
                    }}>
                      <span className="i-action-icon">✏️</span>
                      <div className="i-action-text">
                        <strong>Edit Details</strong>
                        <span>Update title, description, or cover</span>
                      </div>
                    </button>
                    <div style={{ padding: "16px", borderTop: "1px solid var(--i-border)", marginTop: 8 }}>
                      <button className="i-btn i-btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => setConfirmDelete({
                        name: managingCourse.title,
                        onConfirm: () => handleDeleteCourse(managingCourse.id),
                      })}>
                        Delete Course
                      </button>
                    </div>
                  </div>

                  <h2 className="i-section-title" style={{ marginTop: 24 }}>At a Glance</h2>
                  <div className="i-glance-grid">
                    <div className="i-glance-stat">
                      <div className="i-glance-val">{managingCourse.lessons?.length || 0}</div>
                      <div className="i-glance-lbl">Lessons</div>
                    </div>
                    <div className="i-glance-stat">
                      <div className="i-glance-val">{managingCourse.student_count || 0}</div>
                      <div className="i-glance-lbl">Students</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "overview" ? (
            /* ── OVERVIEW TAB ── */
            <div className="i-fade-in">
              <header className="i-topbar">
                <div>
                  <h1 className="i-page-title">Welcome back, Instructor!</h1>
                  <p className="i-page-sub">Here is what's happening with your courses today.</p>
                </div>
                <button className="i-btn i-btn-primary" onClick={() => {
                  setCourseForm({ title: "", description: "", category: "", thumbnail: null });
                  setFormError("");
                  setShowCreateCourse(true);
                }}>
                  + Create New Course
                </button>
              </header>

              <section className="i-section">
                <div className="i-stats-row">
                  {[
                    { icon: "🚀", label: "Active Courses", value: courses.length, color: "var(--i-accent)", bg: "rgba(99,102,241,0.1)" },
                    { icon: "👥", label: "Total Students", value: totalStudents, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                    { icon: "📚", label: "Total Lessons", value: totalLessons, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                  ].map((s) => (
                    <div key={s.label} className="i-stat-card">
                      <div className="i-stat-icon-wrap" style={{ color: s.color, background: s.bg }}>{s.icon}</div>
                      <div>
                        <div className="i-stat-val">{s.value}</div>
                        <div className="i-stat-lbl">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="i-dashboard-split">
                  <div className="i-split-col">
                    <h2 className="i-section-title">Top Performing Courses</h2>
                    <div className="i-perf-list">
                      {courses.length > 0 ? courses.sort((a,b) => (b.student_count || 0) - (a.student_count || 0)).slice(0, 4).map(c => (
                        <div key={c.id} className="i-perf-item" onClick={() => { setActiveTab("courses"); setManagingCourse(c); }}>
                          <div className="i-perf-thumb">{c.thumbnail ? <img src={c.thumbnail} alt="" /> : "📚"}</div>
                          <div className="i-perf-info">
                            <div className="i-perf-title">{c.title}</div>
                            <div className="i-perf-meta">{c.student_count || 0} enrolled</div>
                          </div>
                          <div className="i-perf-arrow">→</div>
                        </div>
                      )) : (
                        <div className="i-empty-state" style={{ padding: 20 }}>No courses available to track.</div>
                      )}
                    </div>
                  </div>
                  <div className="i-split-col">
                    <div className="i-getting-started">
                      <h3>🚀 Instructor Tips</h3>
                      <ul>
                        <li>Keep lessons under 15 minutes for maximum retention.</li>
                        <li>Upload PDF materials to complement your video lectures.</li>
                        <li>Engage with your students to boost completion rates.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* ── COURSES TAB ── */
            <div className="i-fade-in">
              <header className="i-topbar">
                <div>
                  <h1 className="i-page-title">My Courses</h1>
                  <p className="i-page-sub">Manage and organize your published content.</p>
                </div>
                <button className="i-btn i-btn-primary" onClick={() => {
                  setCourseForm({ title: "", description: "", category: "", thumbnail: null });
                  setFormError("");
                  setShowCreateCourse(true);
                }}>
                  + Create New Course
                </button>
              </header>

              <section className="i-section">
                {loading.courses ? (
                  <div className="i-loader"></div>
                ) : courses.length === 0 ? (
                  <div className="i-empty-state" style={{ padding: "80px 20px" }}>
                    <div className="i-empty-icon" style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
                    <h3 style={{ fontSize: 20, color: "#fff", marginBottom: 8 }}>Your workspace is empty</h3>
                    <p style={{ fontSize: 14, marginBottom: 20 }}>Start sharing your knowledge by creating your first course.</p>
                    <button className="i-btn i-btn-primary" onClick={() => setShowCreateCourse(true)}>
                      + Create Course
                    </button>
                  </div>
                ) : (
                  <div className="i-course-grid">
                    {courses.map((c) => (
                      <div key={c.id} className="i-course-card">
                        <div className="i-course-thumb">
                          {c.thumbnail ? <img src={c.thumbnail} alt={c.title} /> : <div className="i-course-thumb-placeholder">📚</div>}
                          <div className="i-course-cat-badge">{c.category || "General"}</div>
                        </div>
                        <div className="i-course-body">
                          <h3 className="i-course-title" title={c.title}>{c.title}</h3>
                          <div className="i-course-meta">
                            <span><span style={{ color: "var(--i-accent)" }}>🎬</span> {c.lessons?.length || 0} modules</span>
                            <span><span style={{ color: "#10b981" }}>👥</span> {c.student_count || 0} students</span>
                          </div>
                        </div>
                        <div className="i-course-footer">
                          <button className="i-btn i-btn-accent" style={{ width: "100%", justifyContent: "center" }} onClick={() => setManagingCourse(c)}>
                            Manage Course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --i-bg: #f8fafc;
    --i-surface: #ffffff;
    --i-surface2: #f1f5f9;
    --i-border: #e2e8f0;
    --i-border-hover: #cbd5e1;
    --i-text: #0f172a;
    --i-muted: #64748b;
    --i-accent: #6366f1;
    --i-accent-hover: #4f46e5;
    --i-danger: #ef4444;
    --i-radius: 12px;
    --i-sidebar: 260px;
    --i-font-h: 'Outfit', sans-serif;
    --i-font-b: 'Inter', sans-serif;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  }

  body { background: var(--i-bg); color: var(--i-text); font-family: var(--i-font-b); -webkit-font-smoothing: antialiased; }

  .i-fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .i-shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .i-sidebar {
    width: var(--i-sidebar); background: var(--i-surface);
    border-right: 1px solid var(--i-border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; padding: 24px 20px;
  }
  .i-brand {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 24px;
  }
  .i-brand-icon { 
    font-size: 24px; background: linear-gradient(135deg, var(--i-accent), #8b5cf6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .i-brand-name { font-family: var(--i-font-h); font-weight: 800; font-size: 20px; color: var(--i-text); letter-spacing: -0.5px; }
  .i-brand-role { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--i-muted); font-weight: 600; margin-top: 2px; }
  
  .i-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; margin-top: 10px; }
  .i-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 8px; border: none;
    background: transparent; color: var(--i-muted);
    cursor: pointer; font-family: var(--i-font-b); font-size: 14px; font-weight: 500;
    text-align: left; transition: all 0.2s;
  }
  .i-nav-icon { font-size: 16px; opacity: 0.8; transition: opacity 0.2s; }
  .i-nav-item:hover { background: var(--i-surface2); color: var(--i-text); }
  .i-nav-item:hover .i-nav-icon { opacity: 1; }
  .i-nav-item.active { background: rgba(99,102,241,0.08); color: var(--i-accent); font-weight: 600; }
  .i-nav-item.active .i-nav-icon { opacity: 1; }
  .i-nav-divider { height: 1px; background: var(--i-border); margin: 10px 0; }

  .i-sidebar-footer { border-top: 1px solid var(--i-border); padding-top: 20px; }
  .i-user-info { display: flex; align-items: center; gap: 12px; background: var(--i-surface2); padding: 12px; border-radius: 10px; }
  .i-avatar {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--i-accent), #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 15px; font-family: var(--i-font-h);
  }
  .i-username { font-size: 13px; font-weight: 600; color: var(--i-text); }
  .i-role-tag { font-size: 10px; color: #10b981; font-weight: 500; margin-top: 2px; }

  /* ── Main Area ── */
  .i-main { flex: 1; padding: 40px 48px; overflow-y: auto; background: radial-gradient(circle at top right, rgba(99,102,241,0.02), transparent 400px); }
  .i-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
  .i-page-title { font-family: var(--i-font-h); font-size: 32px; font-weight: 800; color: var(--i-text); letter-spacing: -0.5px; margin-bottom: 6px; }
  .i-page-sub { color: var(--i-muted); font-size: 15px; }
  
  .i-btn-back { background: transparent; border: none; color: var(--i-muted); font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 0; transition: color 0.2s; }
  .i-btn-back:hover { color: var(--i-text); }

  /* ── Overview Dashboard ── */
  .i-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .i-stat-card {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-radius: 16px; padding: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: var(--shadow-md); transition: transform 0.2s, border-color 0.2s;
  }
  .i-stat-card:hover { transform: translateY(-2px); border-color: var(--i-border-hover); }
  .i-stat-icon-wrap {
    width: 56px; height: 56px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .i-stat-val { font-family: var(--i-font-h); font-size: 32px; font-weight: 800; color: var(--i-text); line-height: 1.1; }
  .i-stat-lbl { font-size: 13px; color: var(--i-muted); font-weight: 500; margin-top: 4px; }

  .i-dashboard-split { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
  .i-split-col { display: flex; flex-direction: column; gap: 24px; }
  .i-section-title { font-family: var(--i-font-h); font-size: 18px; font-weight: 700; color: var(--i-text); margin-bottom: 16px; }

  /* Perf List */
  .i-perf-list { background: var(--i-surface); border: 1px solid var(--i-border); border-radius: 16px; overflow: hidden; }
  .i-perf-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--i-border); cursor: pointer; transition: background 0.2s; }
  .i-perf-item:hover { background: var(--i-surface2); }
  .i-perf-item:last-child { border-bottom: none; }
  .i-perf-thumb { width: 48px; height: 48px; border-radius: 8px; background: var(--i-surface2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .i-perf-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .i-perf-info { flex: 1; }
  .i-perf-title { font-weight: 600; font-size: 14px; color: var(--i-text); margin-bottom: 4px; }
  .i-perf-meta { font-size: 12px; color: #10b981; font-weight: 500; }
  .i-perf-arrow { color: var(--i-muted); font-size: 18px; transition: transform 0.2s; }
  .i-perf-item:hover .i-perf-arrow { transform: translateX(4px); color: var(--i-text); }

  /* Getting Started */
  .i-getting-started { background: linear-gradient(135deg, var(--i-accent) 0%, #8b5cf6 100%); border: 1px solid rgba(99,102,241,0.1); border-radius: 16px; padding: 24px; }
  .i-getting-started h3 { font-family: var(--i-font-h); color: #fff; font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .i-getting-started ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .i-getting-started li { font-size: 13px; color: rgba(255, 255, 255, 0.9); line-height: 1.5; padding-left: 20px; position: relative; }
  .i-getting-started li::before { content: "✦"; position: absolute; left: 0; color: #fff; }

  /* ── Course Grid ── */
  .i-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
  .i-course-card {
    background: var(--i-surface); border: 1px solid var(--i-border);
    border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .i-course-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--i-border-hover); }
  .i-course-thumb { height: 160px; overflow: hidden; position: relative; background: var(--i-surface2); display: flex; align-items: center; justify-content: center; }
  .i-course-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .i-course-thumb-placeholder { font-size: 48px; }
  .i-course-cat-badge { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; }
  .i-course-body { padding: 20px; flex: 1; }
  .i-course-title { font-family: var(--i-font-h); font-size: 18px; font-weight: 700; color: var(--i-text); margin-bottom: 12px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .i-course-meta { display: flex; gap: 16px; font-size: 13px; color: var(--i-muted); font-weight: 500; }
  .i-course-footer { padding: 16px 20px; border-top: 1px solid var(--i-border); background: rgba(0,0,0,0.01); }

  /* ── Manage Course View ── */
  .i-manage-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; margin-top: 24px; }
  
  .i-curriculum-list { background: var(--i-surface); border: 1px solid var(--i-border); border-radius: 12px; overflow: hidden; }
  .i-lesson-row { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--i-border); background: var(--i-surface); transition: background 0.2s; }
  .i-lesson-row:hover { background: var(--i-surface2); }
  .i-lesson-row:last-child { border-bottom: none; }
  .i-lesson-handle { color: var(--i-muted); cursor: grab; padding-right: 16px; font-size: 20px; opacity: 0.5; }
  .i-lesson-info { flex: 1; }
  .i-lesson-title { font-size: 15px; font-weight: 600; color: var(--i-text); margin-bottom: 4px; }
  .i-lesson-meta { display: flex; gap: 12px; font-size: 12px; color: var(--i-muted); }

  .i-action-card { background: var(--i-surface); border: 1px solid var(--i-border); border-radius: 12px; overflow: hidden; }
  .i-action-btn { display: flex; align-items: center; gap: 16px; width: 100%; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--i-border); padding: 16px; cursor: pointer; transition: background 0.2s; }
  .i-action-btn:hover { background: var(--i-surface2); }
  .i-action-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .i-action-text strong { display: block; font-size: 14px; font-weight: 600; color: var(--i-text); margin-bottom: 2px; }
  .i-action-text span { font-size: 12px; color: var(--i-muted); }

  .i-glance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .i-glance-stat { background: var(--i-surface); border: 1px solid var(--i-border); border-radius: 12px; padding: 16px; text-align: center; }
  .i-glance-val { font-family: var(--i-font-h); font-size: 28px; font-weight: 800; color: var(--i-accent); }
  .i-glance-lbl { font-size: 12px; color: var(--i-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-top: 4px; }

  /* ── Shared UI Elements ── */
  .i-chip { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .i-chip.done { background: rgba(16,185,129,0.08); color: #10b981; border: 1px solid rgba(16,185,129,0.15); }
  .i-chip.progress { background: rgba(99,102,241,0.08); color: var(--i-accent); border: 1px solid rgba(99,102,241,0.15); }

  .i-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; border: 1px solid transparent;
    font-family: var(--i-font-b); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
  }
  .i-btn-sm { padding: 6px 14px; font-size: 13px; }
  .i-btn-primary { background: var(--i-accent); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
  .i-btn-primary:hover { background: var(--i-accent-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.3); }
  .i-btn-accent { background: rgba(99,102,241,0.05); color: var(--i-accent); border-color: rgba(99,102,241,0.15); }
  .i-btn-accent:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); }
  .i-btn-ghost { background: transparent; border-color: var(--i-border); color: var(--i-text); }
  .i-btn-ghost:hover { background: var(--i-surface2); border-color: var(--i-border-hover); }
  .i-btn-danger { background: rgba(239,68,68,0.08); color: var(--i-danger); border-color: rgba(239,68,68,0.15); }
  .i-btn-danger:hover { background: rgba(239,68,68,0.15); }

  /* Form Elements */
  .i-field { margin-bottom: 20px; }
  .i-label { display: block; font-size: 12px; font-weight: 600; color: var(--i-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .i-input {
    width: 100%; background: var(--i-bg); border: 1px solid var(--i-border);
    color: var(--i-text); border-radius: 8px; padding: 12px 16px;
    font-family: var(--i-font-b); font-size: 14px; outline: none;
    transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  }
  .i-input:focus { border-color: var(--i-accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .i-textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
  .i-form-error { color: var(--i-danger); font-size: 13px; margin: 10px 0; font-weight: 500; }
  .i-modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--i-border); }

  /* Modals */
  .i-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; animation: fadeIn 0.2s; }
  .i-modal { background: var(--i-surface); border: 1px solid var(--i-border); border-radius: 20px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
  .i-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid var(--i-border); }
  .i-modal-head h3 { font-family: var(--i-font-h); font-size: 20px; font-weight: 700; color: var(--i-text); }
  .i-close-btn { background: var(--i-surface2); border: none; color: var(--i-muted); font-size: 16px; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .i-close-btn:hover { background: var(--i-border); color: var(--i-text); transform: rotate(90deg); }
  .i-modal-body { padding: 32px; }

  /* Table */
  .i-table { width: 100%; border-collapse: collapse; }
  .i-table th { padding: 12px 16px; text-align: left; font-family: var(--i-font-h); font-size: 12px; font-weight: 600; color: var(--i-muted); border-bottom: 1px solid var(--i-border); background: var(--i-bg); }
  .i-table td { padding: 16px; border-bottom: 1px solid var(--i-border); vertical-align: middle; }
  .i-table tr:last-child td { border-bottom: none; }
  .i-bold { font-weight: 600; color: var(--i-text); }
  .i-prog-bar { flex: 1; background: var(--i-bg); border-radius: 10px; height: 6px; overflow: hidden; min-width: 80px; border: 1px solid var(--i-border); }
  .i-prog-fill { height: 100%; background: linear-gradient(90deg, var(--i-accent), #a855f7); border-radius: 10px; }

  /* Toasts */
  .i-toast { position: fixed; bottom: 32px; right: 32px; z-index: 1000; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; animation: i-slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: var(--shadow-lg); }
  .i-toast-success { background: #10b981; color: #fff; }
  .i-toast-error { background: var(--i-danger); color: #fff; }
  @keyframes i-slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: none; opacity: 1; } }

  .i-empty-state { text-align: center; color: var(--i-muted); }
  .i-loader { border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--i-accent); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 100px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
