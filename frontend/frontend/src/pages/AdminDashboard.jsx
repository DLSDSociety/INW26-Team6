import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function authHeaders() {
  const token = localStorage.getItem("access");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bgGlow, iconColor }) {
  return (
    <div className="a-stat-card">
      <div className="a-stat-icon-wrap" style={{ background: bgGlow, color: iconColor }}>
        {icon}
      </div>
      <div>
        <p className="a-stat-val">{value ?? "—"}</p>
        <p className="a-stat-lbl">{label}</p>
      </div>
    </div>
  );
}

function Badge({ role }) {
  const colors = { admin: "#ef4444", instructor: "#f59e0b", student: "#10b981" };
  return (
    <span className="a-chip" style={{ background: `${colors[role]}20`, color: colors[role], border: `1px solid ${colors[role]}30` }}>
      {role}
    </span>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`a-toast a-toast-${type}`}>{msg}</div>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const notify = (msg, type = "success") => setToast({ msg, type });

  // ── Fetchers ──
  const loadStats = useCallback(async () => {
    setLoad("stats", true);
    try { setStats(await apiFetch("/admin/stats/")); }
    catch { notify("Failed to load stats", "error"); }
    finally { setLoad("stats", false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoad("users", true);
    try { setUsers(await apiFetch("/users/all/")); }
    catch { notify("Failed to load users", "error"); }
    finally { setLoad("users", false); }
  }, []);

  const loadCourses = useCallback(async () => {
    setLoad("courses", true);
    try { setCourses(await apiFetch("/courses/")); }
    catch { notify("Failed to load courses", "error"); }
    finally { setLoad("courses", false); }
  }, []);

  const loadEnrollments = useCallback(async () => {
    setLoad("enrollments", true);
    try { setEnrollments(await apiFetch("/enrollments/all/")); }
    catch { notify("Failed to load enrollments", "error"); }
    finally { setLoad("enrollments", false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, loadUsers]);
  useEffect(() => { if (activeTab === "courses") loadCourses(); }, [activeTab, loadCourses]);
  useEffect(() => { if (activeTab === "enrollments") loadEnrollments(); }, [activeTab, loadEnrollments]);

  // ── Actions ──
  const changeRole = async (userId, newRole) => {
    try {
      const updated = await apiFetch(`/users/${userId}/role/`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      notify(`Role updated to ${newRole}`);
      loadStats(); // keep stats counts accurate
    } catch { notify("Failed to update role", "error"); }
  };

  const deleteUser = async (userId) => {
    try {
      await apiFetch(`/users/${userId}/`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      notify("User deleted");
      loadStats();
    } catch { notify("Failed to delete user", "error"); }
    setConfirmDelete(null);
  };

  const deleteCourse = async (courseId) => {
    try {
      await apiFetch(`/courses/${courseId}/`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      notify("Course deleted");
      loadStats();
    } catch { notify("Failed to delete course", "error"); }
    setConfirmDelete(null);
  };

  // ── Filtered data ──
  const q = search.toLowerCase();
  const filteredUsers = users.filter(
    (u) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q)
  );
  const filteredCourses = courses.filter(
    (c) => c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
  );

  // ── Stat values from API ──
  const statCards = [
    { icon: "👥", label: "Total Users", value: stats?.total_users, bgGlow: "rgba(99,102,241,0.1)", iconColor: "#6366f1" },
    { icon: "📚", label: "Total Courses", value: stats?.total_courses, bgGlow: "rgba(245,158,11,0.1)", iconColor: "#f59e0b" },
    { icon: "📝", label: "Enrollments", value: stats?.total_enrollments, bgGlow: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
    { icon: "🎓", label: "Students", value: stats?.total_students, bgGlow: "rgba(6,182,212,0.1)", iconColor: "#06b6d4" },
    { icon: "🏫", label: "Instructors", value: stats?.total_instructors, bgGlow: "rgba(239,68,68,0.1)", iconColor: "#ef4444" },
    { icon: "✅", label: "Completions", value: stats?.total_completions, bgGlow: "rgba(34,197,94,0.1)", iconColor: "#22c55e" },
  ];

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Dialog */}
      {confirmDelete && (
        <div className="a-overlay">
          <div className="a-modal" style={{ maxWidth: 380 }}>
            <div className="a-modal-head">
              <h3>Confirm Delete</h3>
            </div>
            <div className="a-modal-body">
              <p className="a-muted" style={{ marginBottom: 20 }}>
                Are you sure you want to delete <strong style={{ color: "#fff" }}>{confirmDelete.name}</strong>? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="a-btn a-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="a-btn a-btn-danger" onClick={confirmDelete.onConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="a-shell">
        {/* Sidebar */}
        <aside className="a-sidebar">
          <div className="a-brand">
            <span className="a-brand-icon">⚡</span>
            <div>
              <span className="a-brand-name">LearningHub</span>
              <span className="a-brand-role">Admin Portal</span>
            </div>
          </div>
          
          <nav className="a-nav">
            <button className="a-nav-item" onClick={() => navigate("/")}>
              <span className="a-nav-icon">🏠</span>
              <span>Home</span>
            </button>
            
            <div className="a-nav-divider" />

            {[
              { id: "overview", icon: "▦", label: "Overview" },
              { id: "users", icon: "👥", label: "All Users" },
              { id: "courses", icon: "📚", label: "All Courses" },
              { id: "enrollments", icon: "📋", label: "Enrollments" },
            ].map((item) => (
              <button
                key={item.id}
                className={`a-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => { setActiveTab(item.id); setSearch(""); }}
              >
                <span className="a-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="a-sidebar-footer">
            <div className="a-user-info">
              <div className="a-avatar">A</div>
              <div>
                <div className="a-username">{localStorage.getItem("username") || "Administrator"}</div>
                <div className="a-role-tag">Super Admin</div>
              </div>
            </div>
            <button className="a-btn-ghost a-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="a-main">
          <header className="a-topbar">
            <div>
              <h1 className="a-page-title">
                {activeTab === "overview" && "Platform Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "courses" && "Course Management"}
                {activeTab === "enrollments" && "All Enrollments"}
              </h1>
              <p className="a-page-sub">Welcome back, <strong>{localStorage.getItem("username") || "Admin"}</strong></p>
            </div>
            {(activeTab === "users" || activeTab === "courses") && (
              <input
                className="a-search-input"
                placeholder={`Search ${activeTab === "users" ? "users" : "courses"}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </header>

          <div className="a-fade-in">
            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <section className="a-section">
                <div className="a-stats-row">
                  {statCards.map((s) => (
                    <StatCard key={s.label} {...s} />
                  ))}
                </div>
                {loading.stats && <div className="a-loader" />}
              </section>
            )}

            {/* ── USERS ── */}
            {activeTab === "users" && (
              <section className="a-section">
                {loading.users ? (
                  <div className="a-loader" />
                ) : (
                  <div className="a-table-wrap">
                    <table className="a-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Current Role</th>
                          <th>Modify Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--a-muted)" }}>No users found</td></tr>
                        )}
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td style={{ color: "var(--a-muted)" }}>#{u.id}</td>
                            <td className="a-bold">{u.username}</td>
                            <td style={{ color: "var(--a-muted)" }}>{u.email}</td>
                            <td><Badge role={u.role} /></td>
                            <td>
                              <select
                                className="a-role-select"
                                value={u.role}
                                onChange={(e) => changeRole(u.id, e.target.value)}
                              >
                                <option value="student">student</option>
                                <option value="instructor">instructor</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td>
                              <button
                                className="a-btn a-btn-danger a-btn-sm"
                                onClick={() => setConfirmDelete({
                                  name: u.username,
                                  onConfirm: () => deleteUser(u.id),
                                })}
                              >
                                Delete User
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* ── COURSES ── */}
            {activeTab === "courses" && (
              <section className="a-section">
                {loading.courses ? (
                  <div className="a-loader" />
                ) : (
                  <div className="a-table-wrap">
                    <table className="a-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Course Title</th>
                          <th>Category</th>
                          <th>Instructor</th>
                          <th>Date Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--a-muted)" }}>No courses found</td></tr>
                        )}
                        {filteredCourses.map((c) => (
                          <tr key={c.id}>
                            <td style={{ color: "var(--a-muted)" }}>#{c.id}</td>
                            <td className="a-bold">{c.title}</td>
                            <td>
                              <span className="a-chip" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid var(--a-border)" }}>
                                {c.category || "General"}
                              </span>
                            </td>
                            <td>{c.instructor_name || c.instructor || "—"}</td>
                            <td style={{ color: "var(--a-muted)" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                            <td>
                              <button
                                className="a-btn a-btn-danger a-btn-sm"
                                onClick={() => setConfirmDelete({
                                  name: c.title,
                                  onConfirm: () => deleteCourse(c.id),
                                })}
                              >
                                Delete Course
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* ── ENROLLMENTS ── */}
            {activeTab === "enrollments" && (
              <section className="a-section">
                {loading.enrollments ? (
                  <div className="a-loader" />
                ) : (
                  <div className="a-table-wrap">
                    <table className="a-table">
                      <thead>
                        <tr>
                          <th>Enrollment ID</th>
                          <th>Student Name</th>
                          <th>Course Title</th>
                          <th>Enrolled Date</th>
                          <th>Course Progress</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--a-muted)" }}>No enrollments found</td></tr>
                        )}
                        {enrollments.map((e) => (
                          <tr key={e.id}>
                            <td style={{ color: "var(--a-muted)" }}>#{e.id}</td>
                            <td className="a-bold">{e.student_name || e.student}</td>
                            <td>{e.course_title || e.course}</td>
                            <td style={{ color: "var(--a-muted)" }}>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="a-prog-bar">
                                  <div className="a-prog-fill" style={{ width: `${e.progress_percent || 0}%`, background: e.is_completed ? "linear-gradient(90deg, #10b981, #34d399)" : "" }} />
                                </div>
                                <span style={{ fontSize: "12px", color: "var(--a-muted)", fontWeight: 600 }}>{e.progress_percent || 0}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`a-chip ${e.is_completed ? "done" : "progress"}`} style={{
                                background: e.is_completed ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                                color: e.is_completed ? "#10b981" : "#6366f1",
                                border: e.is_completed ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(99,102,241,0.2)"
                              }}>
                                {e.is_completed ? "Completed" : "Active"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
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
    --a-bg: #09090b;
    --a-surface: #141416;
    --a-surface2: #1e1e22;
    --a-border: #27272a;
    --a-border-hover: #3f3f46;
    --a-text: #f4f4f5;
    --a-muted: #8a8a98;
    --a-accent: #6366f1;
    --a-accent-hover: #4f46e5;
    --a-danger: #ef4444;
    --a-radius: 12px;
    --a-sidebar: 260px;
    --a-font-h: 'Outfit', sans-serif;
    --a-font-b: 'Inter', sans-serif;
    
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
  }

  body { background: var(--a-bg); color: var(--a-text); font-family: var(--a-font-b); -webkit-font-smoothing: antialiased; }

  .a-fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .a-shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .a-sidebar {
    width: var(--a-sidebar); background: var(--a-surface);
    border-right: 1px solid var(--a-border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; padding: 24px 20px;
  }
  .a-brand {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 24px;
  }
  .a-brand-icon { 
    font-size: 24px; background: linear-gradient(135deg, var(--a-accent), #8b5cf6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .a-brand-name { font-family: var(--a-font-h); font-weight: 800; font-size: 20px; color: #fff; letter-spacing: -0.5px; }
  .a-brand-role { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--a-muted); font-weight: 600; margin-top: 2px; }
  
  .a-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; margin-top: 10px; }
  .a-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 8px; border: none;
    background: transparent; color: var(--a-muted);
    cursor: pointer; font-family: var(--a-font-b); font-size: 14px; font-weight: 500;
    text-align: left; transition: all 0.2s;
  }
  .a-nav-icon { font-size: 16px; opacity: 0.8; transition: opacity 0.2s; }
  .a-nav-item:hover { background: var(--a-surface2); color: var(--a-text); }
  .a-nav-item:hover .a-nav-icon { opacity: 1; }
  .a-nav-item.active { background: rgba(99,102,241,0.1); color: var(--a-accent); font-weight: 600; }
  .a-nav-item.active .a-nav-icon { opacity: 1; }
  .a-nav-divider { height: 1px; background: var(--a-border); margin: 10px 0; }

  .a-sidebar-footer { border-top: 1px solid var(--a-border); padding-top: 20px; }
  .a-user-info { display: flex; align-items: center; gap: 12px; background: var(--a-surface2); padding: 12px; border-radius: 10px; }
  .a-avatar {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--a-accent), #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 15px; font-family: var(--a-font-h);
  }
  .a-username { font-size: 13px; font-weight: 600; color: var(--a-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
  .a-role-tag { font-size: 10px; color: #ef4444; font-weight: 500; margin-top: 2px; }
  .a-logout-btn { width: 100%; margin-top: 16px; text-align: center; justify-content: center; }

  /* ── Main Area ── */
  .a-main { flex: 1; padding: 40px 48px; overflow-y: auto; background: radial-gradient(circle at top right, rgba(99,102,241,0.03), transparent 400px); }
  .a-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
  .a-page-title { font-family: var(--a-font-h); font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
  .a-page-sub { color: var(--a-muted); font-size: 15px; }

  .a-search-input {
    background: var(--a-surface); border: 1px solid var(--a-border);
    color: var(--a-text); border-radius: var(--a-radius);
    padding: 12px 18px; font-size: 14px; font-family: var(--a-font-b);
    outline: none; width: 260px; transition: all 0.2s;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
  }
  .a-search-input:focus { border-color: var(--a-accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

  /* Stats Grid */
  .a-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .a-stat-card {
    background: var(--a-surface); border: 1px solid var(--a-border);
    border-radius: 16px; padding: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: var(--shadow-md); transition: transform 0.2s, border-color 0.2s;
  }
  .a-stat-card:hover { transform: translateY(-2px); border-color: var(--a-border-hover); }
  .a-stat-icon-wrap {
    width: 56px; height: 56px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; font-size: 26px;
  }
  .a-stat-val { font-family: var(--a-font-h); font-size: 32px; font-weight: 800; color: #fff; line-height: 1.1; }
  .a-stat-lbl { font-size: 13px; color: var(--a-muted); font-weight: 500; margin-top: 4px; }

  /* ── Tables ── */
  .a-table-wrap { background: var(--a-surface); border: 1px solid var(--a-border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); }
  .a-table { width: 100%; border-collapse: collapse; }
  .a-table th { padding: 16px 20px; text-align: left; font-family: var(--a-font-h); font-size: 12px; font-weight: 600; color: var(--a-muted); border-bottom: 1px solid var(--a-border); background: var(--a-surface2); letter-spacing: 0.5px; text-transform: uppercase; }
  .a-table td { padding: 16px 20px; border-bottom: 1px solid var(--a-border); vertical-align: middle; }
  .a-table tr:last-child td { border-bottom: none; }
  .a-table tr:hover td { background: rgba(99,102,241,0.02); }
  
  .a-bold { font-weight: 600; color: var(--a-text); }
  .a-prog-bar { flex: 1; background: var(--a-bg); border-radius: 10px; height: 8px; overflow: hidden; min-width: 100px; border: 1px solid var(--a-border); }
  .a-prog-fill { height: 100%; background: linear-gradient(90deg, var(--a-accent), #a855f7); border-radius: 10px; }

  /* Role selector dropdown */
  .a-role-select {
    background: var(--a-surface2); border: 1px solid var(--a-border);
    color: var(--a-text); border-radius: 8px; padding: 6px 12px;
    font-size: 13px; font-family: var(--a-font-b); cursor: pointer;
    outline: none; transition: border-color 0.2s;
  }
  .a-role-select:focus { border-color: var(--a-accent); }

  /* ── Shared UI Elements ── */
  .a-chip { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .a-chip.done { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
  .a-chip.progress { background: rgba(99,102,241,0.1); color: var(--a-accent); border: 1px solid rgba(99,102,241,0.2); }

  .a-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; border: 1px solid transparent;
    font-family: var(--a-font-b); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
  }
  .a-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 6px; }
  .a-btn-ghost { background: transparent; border-color: var(--a-border); color: var(--a-text); }
  .a-btn-ghost:hover { background: var(--a-surface2); border-color: var(--a-border-hover); }
  .a-btn-danger { background: rgba(239,68,68,0.1); color: var(--a-danger); border-color: rgba(239,68,68,0.2); }
  .a-btn-danger:hover { background: rgba(239,68,68,0.2); }

  /* Modals */
  .a-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; animation: fadeIn 0.2s; }
  .a-modal { background: var(--a-surface); border: 1px solid var(--a-border); border-radius: 20px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
  .a-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid var(--a-border); }
  .a-modal-head h3 { font-family: var(--a-font-h); font-size: 20px; font-weight: 700; color: #fff; }
  .a-modal-body { padding: 32px; }

  /* Toasts */
  .a-toast { position: fixed; bottom: 32px; right: 32px; z-index: 1000; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; animation: a-slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: var(--shadow-lg); }
  .a-toast-success { background: #10b981; color: #fff; }
  .a-toast-error { background: var(--a-danger); color: #fff; }
  @keyframes a-slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: none; opacity: 1; } }

  .a-loader { border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--a-accent); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 100px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .a-shell { flex-direction: column; }
    .a-sidebar { width: 100%; height: auto; position: static; padding: 20px; border-right: none; border-bottom: 1px solid var(--a-border); }
    .a-nav { flex-direction: row; flex-wrap: wrap; margin-bottom: 20px; }
    .a-main { padding: 24px 20px; }
  }
`;
