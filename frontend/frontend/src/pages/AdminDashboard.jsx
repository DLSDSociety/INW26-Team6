// import { useState, useEffect, useCallback } from "react";

// // ─── API CONFIG ───────────────────────────────────────────────────────────────
// const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// function authHeaders() {
//   const token = localStorage.getItem("access");
//   return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
// }

// async function apiFetch(path, opts = {}) {
//   const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), ...opts });
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//   return res.status === 204 ? null : res.json();
// }

// // ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
// function StatCard({ icon, label, value, accent }) {
//   return (
//     <div className="stat-card" style={{ "--accent": accent }}>
//       <span className="stat-icon">{icon}</span>
//       <div>
//         <p className="stat-value">{value ?? "—"}</p>
//         <p className="stat-label">{label}</p>
//       </div>
//     </div>
//   );
// }

// function Badge({ role }) {
//   const colors = { admin: "#e74c3c", instructor: "#f39c12", student: "#27ae60" };
//   return (
//     <span className="badge" style={{ background: colors[role] || "#555" }}>
//       {role}
//     </span>
//   );
// }

// function Toast({ msg, type, onClose }) {
//   useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
//   return <div className={`toast toast-${type}`}>{msg}</div>;
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [stats, setStats] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [loading, setLoading] = useState({});
//   const [toast, setToast] = useState(null);
//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [search, setSearch] = useState("");

//   const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
//   const notify = (msg, type = "success") => setToast({ msg, type });

//   // ── Fetchers ──
//   const loadStats = useCallback(async () => {
//     setLoad("stats", true);
//     try { setStats(await apiFetch("/admin/stats/")); }
//     catch { notify("Failed to load stats", "error"); }
//     finally { setLoad("stats", false); }
//   }, []);

//   const loadUsers = useCallback(async () => {
//     setLoad("users", true);
//     try { setUsers(await apiFetch("/users/all/")); }
//     catch { notify("Failed to load users", "error"); }
//     finally { setLoad("users", false); }
//   }, []);

//   const loadCourses = useCallback(async () => {
//     setLoad("courses", true);
//     try { setCourses(await apiFetch("/courses/")); }
//     catch { notify("Failed to load courses", "error"); }
//     finally { setLoad("courses", false); }
//   }, []);

//   const loadEnrollments = useCallback(async () => {
//     setLoad("enrollments", true);
//     try { setEnrollments(await apiFetch("/enrollments/all/")); }
//     catch { notify("Failed to load enrollments", "error"); }
//     finally { setLoad("enrollments", false); }
//   }, []);

//   useEffect(() => { loadStats(); }, [loadStats]);
//   useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, loadUsers]);
//   useEffect(() => { if (activeTab === "courses") loadCourses(); }, [activeTab, loadCourses]);
//   useEffect(() => { if (activeTab === "enrollments") loadEnrollments(); }, [activeTab, loadEnrollments]);

//   // ── Actions ──
//   const changeRole = async (userId, newRole) => {
//     try {
//       const updated = await apiFetch(`/users/${userId}/role/`, {
//         method: "PATCH",
//         body: JSON.stringify({ role: newRole }),
//       });
//       setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
//       notify(`Role updated to ${newRole}`);
//     } catch { notify("Failed to update role", "error"); }
//   };

//   const deleteUser = async (userId) => {
//     try {
//       await apiFetch(`/users/${userId}/`, { method: "DELETE" });
//       setUsers((prev) => prev.filter((u) => u.id !== userId));
//       notify("User deleted");
//     } catch { notify("Failed to delete user", "error"); }
//     setConfirmDelete(null);
//   };

//   const deleteCourse = async (courseId) => {
//     try {
//       await apiFetch(`/courses/${courseId}/`, { method: "DELETE" });
//       setCourses((prev) => prev.filter((c) => c.id !== courseId));
//       notify("Course deleted");
//     } catch { notify("Failed to delete course", "error"); }
//     setConfirmDelete(null);
//   };

//   // ── Filtered data ──
//   const q = search.toLowerCase();
//   const filteredUsers = users.filter(
//     (u) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q)
//   );
//   const filteredCourses = courses.filter(
//     (c) => c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
//   );

//   // ── Stat values from API ──
//   const statCards = [
//     { icon: "👥", label: "Total Users", value: stats?.total_users, accent: "#6c63ff" },
//     { icon: "📚", label: "Total Courses", value: stats?.total_courses, accent: "#f39c12" },
//     { icon: "📝", label: "Enrollments", value: stats?.total_enrollments, accent: "#27ae60" },
//     { icon: "🎓", label: "Students", value: stats?.total_students, accent: "#3498db" },
//     { icon: "🏫", label: "Instructors", value: stats?.total_instructors, accent: "#e74c3c" },
//     { icon: "✅", label: "Completions", value: stats?.total_completions, accent: "#1abc9c" },
//   ];

//   // ── Render ──
//   return (
//     <>
//       <style>{CSS}</style>
//       {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

//       {/* Confirm Dialog */}
//       {confirmDelete && (
//         <div className="overlay">
//           <div className="dialog">
//             <h3>Confirm Delete</h3>
//             <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
//             <div className="dialog-actions">
//               <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
//               <button className="btn btn-danger" onClick={confirmDelete.onConfirm}>Delete</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="admin-shell">
//         {/* Sidebar */}
//         <aside className="sidebar">
//           <div className="sidebar-brand">
//             <span className="brand-icon">⚡</span>
//             <span className="brand-name">LearningHub</span>
//             <span className="brand-role">Admin</span>
//           </div>
//           <nav className="sidebar-nav">
//             {[
//               { id: "overview", icon: "▦", label: "Overview" },
//               { id: "users", icon: "👥", label: "All Users" },
//               { id: "courses", icon: "📚", label: "All Courses" },
//               { id: "enrollments", icon: "📋", label: "Enrollments" },
//             ].map((item) => (
//               <button
//                 key={item.id}
//                 className={`nav-item ${activeTab === item.id ? "active" : ""}`}
//                 onClick={() => { setActiveTab(item.id); setSearch(""); }}
//               >
//                 <span className="nav-icon">{item.icon}</span>
//                 <span>{item.label}</span>
//               </button>
//             ))}
//           </nav>
//           <div className="sidebar-footer">
//             <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
//               ⎋ Sign out
//             </button>
//           </div>
//         </aside>

//         {/* Main */}
//         <main className="main-content">
//           <header className="top-bar">
//             <div>
//               <h1 className="page-title">
//                 {activeTab === "overview" && "Platform Overview"}
//                 {activeTab === "users" && "User Management"}
//                 {activeTab === "courses" && "Course Management"}
//                 {activeTab === "enrollments" && "All Enrollments"}
//               </h1>
//               <p className="page-sub">Welcome back, <strong>{localStorage.getItem("username") || "Admin"}</strong></p>
//             </div>
//             {(activeTab === "users" || activeTab === "courses") && (
//               <input
//                 className="search-input"
//                 placeholder={`Search ${activeTab}…`}
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             )}
//           </header>

//           {/* ── OVERVIEW ── */}
//           {activeTab === "overview" && (
//             <section className="section">
//               <div className="stats-grid">
//                 {statCards.map((s) => (
//                   <StatCard key={s.label} {...s} />
//                 ))}
//               </div>
//               {loading.stats && <p className="hint">Loading stats…</p>}
//             </section>
//           )}

//           {/* ── USERS ── */}
//           {activeTab === "users" && (
//             <section className="section">
//               <div className="table-wrap">
//                 {loading.users ? (
//                   <p className="hint">Loading users…</p>
//                 ) : (
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Username</th>
//                         <th>Email</th>
//                         <th>Role</th>
//                         <th>Change Role</th>
//                         <th>Delete</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredUsers.length === 0 && (
//                         <tr><td colSpan={6} className="empty">No users found</td></tr>
//                       )}
//                       {filteredUsers.map((u) => (
//                         <tr key={u.id}>
//                           <td className="muted">{u.id}</td>
//                           <td className="bold">{u.username}</td>
//                           <td className="muted">{u.email}</td>
//                           <td><Badge role={u.role} /></td>
//                           <td>
//                             <select
//                               className="role-select"
//                               value={u.role}
//                               onChange={(e) => changeRole(u.id, e.target.value)}
//                             >
//                               <option value="student">student</option>
//                               <option value="instructor">instructor</option>
//                               <option value="admin">admin</option>
//                             </select>
//                           </td>
//                           <td>
//                             <button
//                               className="btn btn-danger btn-sm"
//                               onClick={() => setConfirmDelete({
//                                 name: u.username,
//                                 onConfirm: () => deleteUser(u.id),
//                               })}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </section>
//           )}

//           {/* ── COURSES ── */}
//           {activeTab === "courses" && (
//             <section className="section">
//               <div className="table-wrap">
//                 {loading.courses ? (
//                   <p className="hint">Loading courses…</p>
//                 ) : (
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Title</th>
//                         <th>Category</th>
//                         <th>Instructor</th>
//                         <th>Created</th>
//                         <th>Delete</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredCourses.length === 0 && (
//                         <tr><td colSpan={6} className="empty">No courses found</td></tr>
//                       )}
//                       {filteredCourses.map((c) => (
//                         <tr key={c.id}>
//                           <td className="muted">{c.id}</td>
//                           <td className="bold">{c.title}</td>
//                           <td>{c.category || "—"}</td>
//                           <td>{c.instructor_name || c.instructor || "—"}</td>
//                           <td className="muted">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
//                           <td>
//                             <button
//                               className="btn btn-danger btn-sm"
//                               onClick={() => setConfirmDelete({
//                                 name: c.title,
//                                 onConfirm: () => deleteCourse(c.id),
//                               })}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </section>
//           )}

//           {/* ── ENROLLMENTS ── */}
//           {activeTab === "enrollments" && (
//             <section className="section">
//               <div className="table-wrap">
//                 {loading.enrollments ? (
//                   <p className="hint">Loading enrollments…</p>
//                 ) : (
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Student</th>
//                         <th>Course</th>
//                         <th>Enrolled At</th>
//                         <th>Progress</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {enrollments.length === 0 && (
//                         <tr><td colSpan={6} className="empty">No enrollments found</td></tr>
//                       )}
//                       {enrollments.map((e) => (
//                         <tr key={e.id}>
//                           <td className="muted">{e.id}</td>
//                           <td className="bold">{e.student_name || e.student}</td>
//                           <td>{e.course_title || e.course}</td>
//                           <td className="muted">{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}</td>
//                           <td>
//                             <div className="prog-wrap">
//                               <div className="prog-bar">
//                                 <div className="prog-fill" style={{ width: `${e.progress_percent || 0}%` }} />
//                               </div>
//                               <span className="prog-label">{e.progress_percent || 0}%</span>
//                             </div>
//                           </td>
//                           <td>
//                             <span className={`status-badge ${e.is_completed ? "done" : "active"}`}>
//                               {e.is_completed ? "Completed" : "In Progress"}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </section>
//           )}
//         </main>
//       </div>
//     </>
//   );
// }

// // ─── STYLES ───────────────────────────────────────────────────────────────────
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --bg: #0d0f14;
//     --surface: #161922;
//     --surface2: #1e2330;
//     --border: #2a3045;
//     --text: #e8eaf0;
//     --muted: #6b7280;
//     --accent: #6c63ff;
//     --danger: #e74c3c;
//     --success: #27ae60;
//     --warn: #f39c12;
//     --font-head: 'Syne', sans-serif;
//     --font-body: 'DM Sans', sans-serif;
//     --radius: 10px;
//     --sidebar-w: 220px;
//   }

//   body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

//   .admin-shell { display: flex; min-height: 100vh; }

//   /* Sidebar */
//   .sidebar {
//     width: var(--sidebar-w); background: var(--surface);
//     border-right: 1px solid var(--border);
//     display: flex; flex-direction: column;
//     position: sticky; top: 0; height: 100vh;
//     padding: 24px 16px;
//   }
//   .sidebar-brand {
//     display: flex; flex-direction: column; gap: 2px;
//     padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom: 20px;
//   }
//   .brand-icon { font-size: 28px; }
//   .brand-name { font-family: var(--font-head); font-weight: 800; font-size: 18px; color: #fff; }
//   .brand-role {
//     font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
//     color: var(--accent); font-weight: 600;
//   }
//   .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
//   .nav-item {
//     display: flex; align-items: center; gap: 10px;
//     padding: 10px 14px; border-radius: var(--radius);
//     border: none; background: transparent; color: var(--muted);
//     cursor: pointer; font-family: var(--font-body); font-size: 14px;
//     text-align: left; transition: all 0.15s;
//   }
//   .nav-item:hover { background: var(--surface2); color: var(--text); }
//   .nav-item.active { background: var(--accent); color: #fff; font-weight: 500; }
//   .nav-icon { font-size: 16px; width: 20px; }
//   .sidebar-footer { padding-top: 16px; border-top: 1px solid var(--border); }

//   /* Main */
//   .main-content { flex: 1; padding: 32px; overflow-y: auto; }
//   .top-bar {
//     display: flex; justify-content: space-between; align-items: flex-start;
//     margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
//   }
//   .page-title { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: #fff; }
//   .page-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
//   .page-sub strong { color: var(--text); }

//   .search-input {
//     background: var(--surface); border: 1px solid var(--border);
//     color: var(--text); border-radius: var(--radius);
//     padding: 9px 16px; font-size: 14px; font-family: var(--font-body);
//     outline: none; width: 240px; transition: border 0.15s;
//   }
//   .search-input:focus { border-color: var(--accent); }

//   .section { animation: fadeUp 0.25s ease; }
//   @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

//   /* Stats */
//   .stats-grid {
//     display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
//   }
//   .stat-card {
//     background: var(--surface); border: 1px solid var(--border);
//     border-left: 4px solid var(--accent); border-radius: var(--radius);
//     padding: 20px; display: flex; gap: 14px; align-items: center;
//     transition: transform 0.15s;
//   }
//   .stat-card:hover { transform: translateY(-2px); }
//   .stat-icon { font-size: 28px; }
//   .stat-value { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: #fff; }
//   .stat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

//   /* Table */
//   .table-wrap {
//     background: var(--surface); border: 1px solid var(--border);
//     border-radius: var(--radius); overflow: hidden;
//   }
//   .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
//   .data-table thead { background: var(--surface2); }
//   .data-table th {
//     padding: 12px 16px; text-align: left;
//     font-family: var(--font-head); font-size: 12px; font-weight: 700;
//     text-transform: uppercase; letter-spacing: 1px; color: var(--muted);
//     border-bottom: 1px solid var(--border);
//   }
//   .data-table td {
//     padding: 12px 16px; border-bottom: 1px solid var(--border);
//     vertical-align: middle;
//   }
//   .data-table tr:last-child td { border-bottom: none; }
//   .data-table tr:hover td { background: rgba(108,99,255,0.04); }
//   .bold { font-weight: 500; color: var(--text); }
//   .muted { color: var(--muted); }
//   .empty { text-align: center; padding: 40px; color: var(--muted); }

//   /* Badge */
//   .badge {
//     padding: 3px 10px; border-radius: 20px; font-size: 11px;
//     font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
//     color: #fff;
//   }

//   /* Role select */
//   .role-select {
//     background: var(--surface2); border: 1px solid var(--border);
//     color: var(--text); border-radius: 6px; padding: 5px 8px;
//     font-size: 13px; font-family: var(--font-body); cursor: pointer;
//     outline: none;
//   }
//   .role-select:focus { border-color: var(--accent); }

//   /* Progress */
//   .prog-wrap { display: flex; align-items: center; gap: 8px; }
//   .prog-bar { flex: 1; background: var(--border); border-radius: 4px; height: 6px; overflow: hidden; min-width: 80px; }
//   .prog-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.4s; }
//   .prog-label { font-size: 12px; color: var(--muted); white-space: nowrap; }

//   /* Status */
//   .status-badge {
//     padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
//   }
//   .status-badge.done { background: rgba(39,174,96,0.15); color: var(--success); }
//   .status-badge.active { background: rgba(243,156,18,0.15); color: var(--warn); }

//   /* Buttons */
//   .btn {
//     display: inline-flex; align-items: center; justify-content: center; gap: 6px;
//     padding: 9px 18px; border-radius: var(--radius); border: none;
//     font-family: var(--font-body); font-size: 14px; font-weight: 500;
//     cursor: pointer; transition: all 0.15s; text-decoration: none;
//   }
//   .btn-sm { padding: 5px 12px; font-size: 12px; }
//   .btn-ghost {
//     background: transparent; border: 1px solid var(--border); color: var(--muted);
//   }
//   .btn-ghost:hover { border-color: var(--text); color: var(--text); }
//   .btn-danger { background: var(--danger); color: #fff; }
//   .btn-danger:hover { background: #c0392b; }

//   /* Overlay / Dialog */
//   .overlay {
//     position: fixed; inset: 0; background: rgba(0,0,0,0.7);
//     display: flex; align-items: center; justify-content: center; z-index: 999;
//   }
//   .dialog {
//     background: var(--surface); border: 1px solid var(--border);
//     border-radius: 14px; padding: 28px; max-width: 400px; width: 90%;
//   }
//   .dialog h3 { font-family: var(--font-head); font-size: 20px; margin-bottom: 10px; }
//   .dialog p { color: var(--muted); font-size: 14px; line-height: 1.6; }
//   .dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

//   /* Toast */
//   .toast {
//     position: fixed; bottom: 24px; right: 24px; z-index: 1000;
//     padding: 12px 20px; border-radius: var(--radius);
//     font-size: 14px; font-weight: 500; font-family: var(--font-body);
//     animation: slideIn 0.2s ease;
//   }
//   .toast-success { background: var(--success); color: #fff; }
//   .toast-error { background: var(--danger); color: #fff; }
//   @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }

//   .hint { color: var(--muted); padding: 20px; text-align: center; font-size: 14px; }
// `;




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



import { useState, useEffect, useCallback } from "react";

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
function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-value">{value ?? "—"}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function Badge({ role }) {
  const colors = { admin: "#e74c3c", instructor: "#f39c12", student: "#27ae60" };
  return (
    <span className="badge" style={{ background: colors[role] || "#555" }}>
      {role}
    </span>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
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
      loadStats(); // ← keeps Students/Instructors counts accurate
    } catch { notify("Failed to update role", "error"); }
  };

  const deleteUser = async (userId) => {
    try {
      await apiFetch(`/users/${userId}/`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      notify("User deleted");
      loadStats(); // ← re-fetch overview numbers
    } catch { notify("Failed to delete user", "error"); }
    setConfirmDelete(null);
  };

  const deleteCourse = async (courseId) => {
    try {
      await apiFetch(`/courses/${courseId}/`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      notify("Course deleted");
      loadStats(); // ← re-fetch overview numbers
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
    { icon: "👥", label: "Total Users", value: stats?.total_users, accent: "#6c63ff" },
    { icon: "📚", label: "Total Courses", value: stats?.total_courses, accent: "#f39c12" },
    { icon: "📝", label: "Enrollments", value: stats?.total_enrollments, accent: "#27ae60" },
    { icon: "🎓", label: "Students", value: stats?.total_students, accent: "#3498db" },
    { icon: "🏫", label: "Instructors", value: stats?.total_instructors, accent: "#e74c3c" },
    { icon: "✅", label: "Completions", value: stats?.total_completions, accent: "#1abc9c" },
  ];

  // ── Render ──
  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Dialog */}
      {confirmDelete && (
        <div className="overlay">
          <div className="dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete.onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">LearningHub</span>
            <span className="brand-role">Admin</span>
          </div>
          <nav className="sidebar-nav">
            {[
              { id: "overview", icon: "▦", label: "Overview" },
              { id: "users", icon: "👥", label: "All Users" },
              { id: "courses", icon: "📚", label: "All Courses" },
              { id: "enrollments", icon: "📋", label: "Enrollments" },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => { setActiveTab(item.id); setSearch(""); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
              ⎋ Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <header className="top-bar">
            <div>
              <h1 className="page-title">
                {activeTab === "overview" && "Platform Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "courses" && "Course Management"}
                {activeTab === "enrollments" && "All Enrollments"}
              </h1>
              <p className="page-sub">Welcome back, <strong>{localStorage.getItem("username") || "Admin"}</strong></p>
            </div>
            {(activeTab === "users" || activeTab === "courses") && (
              <input
                className="search-input"
                placeholder={`Search ${activeTab}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </header>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <section className="section">
              <div className="stats-grid">
                {statCards.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>
              {loading.stats && <p className="hint">Loading stats…</p>}
            </section>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <section className="section">
              <div className="table-wrap">
                {loading.users ? (
                  <p className="hint">Loading users…</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Change Role</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={6} className="empty">No users found</td></tr>
                      )}
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="muted">{u.id}</td>
                          <td className="bold">{u.username}</td>
                          <td className="muted">{u.email}</td>
                          <td><Badge role={u.role} /></td>
                          <td>
                            <select
                              className="role-select"
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
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirmDelete({
                                name: u.username,
                                onConfirm: () => deleteUser(u.id),
                              })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ── COURSES ── */}
          {activeTab === "courses" && (
            <section className="section">
              <div className="table-wrap">
                {loading.courses ? (
                  <p className="hint">Loading courses…</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Instructor</th>
                        <th>Created</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.length === 0 && (
                        <tr><td colSpan={6} className="empty">No courses found</td></tr>
                      )}
                      {filteredCourses.map((c) => (
                        <tr key={c.id}>
                          <td className="muted">{c.id}</td>
                          <td className="bold">{c.title}</td>
                          <td>{c.category || "—"}</td>
                          <td>{c.instructor_name || c.instructor || "—"}</td>
                          <td className="muted">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirmDelete({
                                name: c.title,
                                onConfirm: () => deleteCourse(c.id),
                              })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* ── ENROLLMENTS ── */}
          {activeTab === "enrollments" && (
            <section className="section">
              <div className="table-wrap">
                {loading.enrollments ? (
                  <p className="hint">Loading enrollments…</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Enrolled At</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.length === 0 && (
                        <tr><td colSpan={6} className="empty">No enrollments found</td></tr>
                      )}
                      {enrollments.map((e) => (
                        <tr key={e.id}>
                          <td className="muted">{e.id}</td>
                          <td className="bold">{e.student_name || e.student}</td>
                          <td>{e.course_title || e.course}</td>
                          <td className="muted">{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}</td>
                          <td>
                            <div className="prog-wrap">
                              <div className="prog-bar">
                                <div className="prog-fill" style={{ width: `${e.progress_percent || 0}%` }} />
                              </div>
                              <span className="prog-label">{e.progress_percent || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${e.is_completed ? "done" : "active"}`}>
                              {e.is_completed ? "Completed" : "In Progress"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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
    --bg: #0d0f14;
    --surface: #161922;
    --surface2: #1e2330;
    --border: #2a3045;
    --text: #e8eaf0;
    --muted: #6b7280;
    --accent: #6c63ff;
    --danger: #e74c3c;
    --success: #27ae60;
    --warn: #f39c12;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 10px;
    --sidebar-w: 220px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .admin-shell { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: var(--sidebar-w); background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh;
    padding: 24px 16px;
  }
  .sidebar-brand {
    display: flex; flex-direction: column; gap: 2px;
    padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom: 20px;
  }
  .brand-icon { font-size: 28px; }
  .brand-name { font-family: var(--font-head); font-weight: 800; font-size: 18px; color: #fff; }
  .brand-role {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); font-weight: 600;
  }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: var(--radius);
    border: none; background: transparent; color: var(--muted);
    cursor: pointer; font-family: var(--font-body); font-size: 14px;
    text-align: left; transition: all 0.15s;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--accent); color: #fff; font-weight: 500; }
  .nav-icon { font-size: 16px; width: 20px; }
  .sidebar-footer { padding-top: 16px; border-top: 1px solid var(--border); }

  /* Main */
  .main-content { flex: 1; padding: 32px; overflow-y: auto; }
  .top-bar {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
  }
  .page-title { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: #fff; }
  .page-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
  .page-sub strong { color: var(--text); }

  .search-input {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text); border-radius: var(--radius);
    padding: 9px 16px; font-size: 14px; font-family: var(--font-body);
    outline: none; width: 240px; transition: border 0.15s;
  }
  .search-input:focus { border-color: var(--accent); }

  .section { animation: fadeUp 0.25s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  /* Stats */
  .stats-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-left: 4px solid var(--accent); border-radius: var(--radius);
    padding: 20px; display: flex; gap: 14px; align-items: center;
    transition: transform 0.15s;
  }
  .stat-card:hover { transform: translateY(-2px); }
  .stat-icon { font-size: 28px; }
  .stat-value { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: #fff; }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* Table */
  .table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
  }
  .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .data-table thead { background: var(--surface2); }
  .data-table th {
    padding: 12px 16px; text-align: left;
    font-family: var(--font-head); font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .data-table td {
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: rgba(108,99,255,0.04); }
  .bold { font-weight: 500; color: var(--text); }
  .muted { color: var(--muted); }
  .empty { text-align: center; padding: 40px; color: var(--muted); }

  /* Badge */
  .badge {
    padding: 3px 10px; border-radius: 20px; font-size: 11px;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    color: #fff;
  }

  /* Role select */
  .role-select {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); border-radius: 6px; padding: 5px 8px;
    font-size: 13px; font-family: var(--font-body); cursor: pointer;
    outline: none;
  }
  .role-select:focus { border-color: var(--accent); }

  /* Progress */
  .prog-wrap { display: flex; align-items: center; gap: 8px; }
  .prog-bar { flex: 1; background: var(--border); border-radius: 4px; height: 6px; overflow: hidden; min-width: 80px; }
  .prog-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.4s; }
  .prog-label { font-size: 12px; color: var(--muted); white-space: nowrap; }

  /* Status */
  .status-badge {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }
  .status-badge.done { background: rgba(39,174,96,0.15); color: var(--success); }
  .status-badge.active { background: rgba(243,156,18,0.15); color: var(--warn); }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 18px; border-radius: var(--radius); border: none;
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; text-decoration: none;
  }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn-ghost {
    background: transparent; border: 1px solid var(--border); color: var(--muted);
  }
  .btn-ghost:hover { border-color: var(--text); color: var(--text); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-danger:hover { background: #c0392b; }

  /* Overlay / Dialog */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 999;
  }
  .dialog {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 28px; max-width: 400px; width: 90%;
  }
  .dialog h3 { font-family: var(--font-head); font-size: 20px; margin-bottom: 10px; }
  .dialog p { color: var(--muted); font-size: 14px; line-height: 1.6; }
  .dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    padding: 12px 20px; border-radius: var(--radius);
    font-size: 14px; font-weight: 500; font-family: var(--font-body);
    animation: slideIn 0.2s ease;
  }
  .toast-success { background: var(--success); color: #fff; }
  .toast-error { background: var(--danger); color: #fff; }
  @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }

  .hint { color: var(--muted); padding: 20px; text-align: center; font-size: 14px; }
`;
