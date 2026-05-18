import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function DashboardPage() {
  const { username, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/api/enrollments/my-courses/");
      setEnrollments(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const completedList = enrollments.filter((e) => e.is_completed);
  const inProgressList = enrollments.filter((e) => !e.is_completed);
  
  // Feature the course with the highest progress that isn't completed
  const topCourse = inProgressList.length > 0 
    ? [...inProgressList].sort((a, b) => b.progress_percent - a.progress_percent)[0] 
    : enrollments.length > 0 ? enrollments[0] : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="s-shell">
        
        {/* Sidebar */}
        <aside className="s-sidebar">
          <div className="s-brand">
            <div className="s-brand-icon">🎓</div>
            <div>
              <div className="s-brand-name">LearningHub</div>
              <div className="s-brand-role">Student Portal</div>
            </div>
          </div>
          
          <nav className="s-nav">
            <button className="s-nav-item" onClick={() => navigate("/")}>
              <span className="s-nav-icon">🏠</span> Home
            </button>
            <button className="s-nav-item" onClick={() => navigate("/courses")}>
              <span className="s-nav-icon">🔍</span> Browse Courses
            </button>
            <div className="s-nav-divider"></div>
            <button className="s-nav-item active">
              <span className="s-nav-icon">📚</span> My Dashboard
            </button>
            <button className="s-nav-item" onClick={() => navigate("/quizzes")}>
              <span className="s-nav-icon">🧠</span> Knowledge Quizzes
            </button>
          </nav>
          
          <div className="s-sidebar-footer">
            <div className="s-user-info">
              <div className="s-avatar">{(username || "S")[0].toUpperCase()}</div>
              <div>
                <div className="s-username">{username || "Student"}</div>
                <div className="s-role-tag">Active Learner</div>
              </div>
            </div>
            <button className="s-btn-ghost s-logout-btn" onClick={handleLogout}>
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="s-main">
          
          <header className="s-topbar">
            <div>
              <h1 className="s-page-title">Welcome back, {username}!</h1>
              <p className="s-page-sub">Ready to continue your learning journey?</p>
            </div>
            <div className="s-header-actions">
              <button className="s-btn-primary" onClick={() => navigate("/courses")}>
                Find New Courses
              </button>
            </div>
          </header>

          <div className="s-fade-in">
            {/* Quick Stats */}
            <div className="s-stats-row">
              <div className="s-stat-card">
                <div className="s-stat-icon-wrap" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>📚</div>
                <div>
                  <div className="s-stat-val">{enrollments.length}</div>
                  <div className="s-stat-lbl">Total Enrolled</div>
                </div>
              </div>
              <div className="s-stat-card">
                <div className="s-stat-icon-wrap" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>🔥</div>
                <div>
                  <div className="s-stat-val">{inProgressList.length}</div>
                  <div className="s-stat-lbl">In Progress</div>
                </div>
              </div>
              <div className="s-stat-card">
                <div className="s-stat-icon-wrap" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>🏆</div>
                <div>
                  <div className="s-stat-val">{completedList.length}</div>
                  <div className="s-stat-lbl">Completed</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="s-loader"></div>
            ) : enrollments.length === 0 ? (
              <div className="s-empty-state">
                <div className="s-empty-icon">🎒</div>
                <h3>Your backpack is empty!</h3>
                <p>You haven't enrolled in any courses yet. Start your journey today.</p>
                <button className="s-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/courses")}>
                  Browse Courses Library
                </button>
              </div>
            ) : (
              <>
                {/* Pick up where you left off */}
                {topCourse && !topCourse.is_completed && (
                  <div className="s-continue-widget">
                    <div className="s-cw-content">
                      <div className="s-cw-badge">Resume Learning</div>
                      <h2 className="s-cw-title">{topCourse.course_title}</h2>
                      <div className="s-cw-progress-wrap">
                        <div className="s-cw-progress-stats">
                          <span>Current Progress</span>
                          <span style={{ fontWeight: 700, color: "#fff" }}>{topCourse.progress_percent}%</span>
                        </div>
                        <div className="s-prog-bar">
                          <div className="s-prog-fill" style={{ width: `${topCourse.progress_percent}%` }} />
                        </div>
                      </div>
                      <button className="s-btn-primary s-btn-lg" onClick={() => navigate(`/courses/${topCourse.course}`)}>
                        Jump Back In 🚀
                      </button>
                    </div>
                    {topCourse.course_thumbnail ? (
                      <div className="s-cw-image">
                        <img src={`http://127.0.0.1:8000${topCourse.course_thumbnail}`} alt="Course Cover" />
                      </div>
                    ) : (
                      <div className="s-cw-image-placeholder">📚</div>
                    )}
                  </div>
                )}

                {/* Course Grid */}
                <h2 className="s-section-title" style={{ marginTop: topCourse && !topCourse.is_completed ? 40 : 0 }}>
                  My Learning Path
                </h2>
                
                <div className="s-course-grid">
                  {enrollments.map((e) => (
                    <div key={e.id} className="s-course-card" onClick={() => navigate(`/courses/${e.course}`)}>
                      <div className="s-course-thumb">
                        {e.course_thumbnail ? (
                          <img src={`http://127.0.0.1:8000${e.course_thumbnail}`} alt={e.course_title} />
                        ) : (
                          <div className="s-course-thumb-placeholder">📚</div>
                        )}
                        <div className={`s-status-badge ${e.is_completed ? "done" : "active"}`}>
                          {e.is_completed ? "✓ Completed" : "In Progress"}
                        </div>
                      </div>
                      
                      <div className="s-course-body">
                        <h3 className="s-course-title" title={e.course_title}>{e.course_title}</h3>
                        <div className="s-course-date">Enrolled: {new Date(e.enrolled_at).toLocaleDateString()}</div>
                        
                        <div className="s-course-progress">
                          <div className="s-prog-stats">
                            <span>Progress</span>
                            <span style={{ color: e.is_completed ? "#10b981" : "#6366f1" }}>{e.progress_percent}%</span>
                          </div>
                          <div className="s-prog-bar">
                            <div className="s-prog-fill" style={{ width: `${e.progress_percent}%`, background: e.is_completed ? "linear-gradient(90deg, #10b981, #34d399)" : "" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Quizzes Promo */}
            <div className="s-quiz-promo">
              <div className="s-qp-icon">🧠</div>
              <div className="s-qp-content">
                <h3>Test Your Knowledge</h3>
                <p>Ready for a challenge? Take our interactive quizzes to cement your understanding of databases, programming, and AI.</p>
              </div>
              <button className="s-btn-accent" onClick={() => navigate("/quizzes")}>
                Start Quizzes →
              </button>
            </div>

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
    --s-bg: #09090b;
    --s-surface: #121217;
    --s-surface2: #1c1c24;
    --s-border: #272730;
    --s-border-hover: #3f3f4e;
    --s-text: #ededf0;
    --s-muted: #8a8a98;
    --s-accent: #6366f1;
    --s-accent-hover: #4f46e5;
    --s-success: #10b981;
    --s-warning: #f59e0b;
    --s-danger: #ef4444;
    --s-radius: 16px;
    --s-sidebar: 260px;
    --s-font-h: 'Outfit', sans-serif;
    --s-font-b: 'Inter', sans-serif;
    
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
  }

  body { background: var(--s-bg); color: var(--s-text); font-family: var(--s-font-b); -webkit-font-smoothing: antialiased; }

  .s-fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .s-shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .s-sidebar {
    width: var(--s-sidebar); background: var(--s-surface);
    border-right: 1px solid var(--s-border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; padding: 24px 20px;
  }
  .s-brand { display: flex; align-items: center; gap: 12px; padding-bottom: 24px; }
  .s-brand-icon { font-size: 24px; background: linear-gradient(135deg, var(--s-accent), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .s-brand-name { font-family: var(--s-font-h); font-weight: 800; font-size: 20px; color: #fff; letter-spacing: -0.5px; }
  .s-brand-role { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--s-muted); font-weight: 600; margin-top: 2px; }
  
  .s-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; margin-top: 10px; }
  .s-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 8px; border: none;
    background: transparent; color: var(--s-muted);
    cursor: pointer; font-family: var(--s-font-b); font-size: 14px; font-weight: 500;
    text-align: left; transition: all 0.2s;
  }
  .s-nav-icon { font-size: 16px; opacity: 0.8; transition: opacity 0.2s; }
  .s-nav-item:hover { background: var(--s-surface2); color: var(--s-text); }
  .s-nav-item:hover .s-nav-icon { opacity: 1; }
  .s-nav-item.active { background: rgba(99,102,241,0.1); color: var(--s-accent); font-weight: 600; }
  .s-nav-item.active .s-nav-icon { opacity: 1; }
  .s-nav-divider { height: 1px; background: var(--s-border); margin: 10px 0; }

  .s-sidebar-footer { border-top: 1px solid var(--s-border); padding-top: 20px; }
  .s-user-info { display: flex; align-items: center; gap: 12px; background: var(--s-surface2); padding: 12px; border-radius: 10px; }
  .s-avatar {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--s-accent), #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: #fff; font-size: 15px; font-family: var(--s-font-h);
  }
  .s-username { font-size: 13px; font-weight: 600; color: var(--s-text); }
  .s-role-tag { font-size: 10px; color: var(--s-success); font-weight: 500; margin-top: 2px; }

  .s-logout-btn { width: 100%; margin-top: 16px; text-align: center; justify-content: center; }

  /* ── Main Content ── */
  .s-main { flex: 1; padding: 40px 48px; overflow-y: auto; background: radial-gradient(circle at top right, rgba(99,102,241,0.03), transparent 400px); }
  .s-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
  .s-page-title { font-family: var(--s-font-h); font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
  .s-page-sub { color: var(--s-muted); font-size: 15px; }

  /* Stats */
  .s-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .s-stat-card {
    background: var(--s-surface); border: 1px solid var(--s-border);
    border-radius: var(--s-radius); padding: 24px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: var(--shadow-md); transition: transform 0.2s, border-color 0.2s;
  }
  .s-stat-card:hover { transform: translateY(-2px); border-color: var(--s-border-hover); }
  .s-stat-icon-wrap { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .s-stat-val { font-family: var(--s-font-h); font-size: 32px; font-weight: 800; color: #fff; line-height: 1.1; }
  .s-stat-lbl { font-size: 13px; color: var(--s-muted); font-weight: 500; margin-top: 4px; }

  /* Continue Widget */
  .s-continue-widget {
    background: linear-gradient(145deg, #1e1b4b, var(--s-surface));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px; display: flex; overflow: hidden;
    margin-bottom: 40px; box-shadow: var(--shadow-lg);
  }
  .s-cw-content { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
  .s-cw-badge { display: inline-block; background: rgba(99,102,241,0.2); color: #a5b4fc; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; align-self: flex-start; }
  .s-cw-title { font-family: var(--s-font-h); font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 24px; line-height: 1.3; }
  .s-cw-progress-wrap { margin-bottom: 32px; max-width: 400px; }
  .s-cw-progress-stats { display: flex; justify-content: space-between; font-size: 13px; color: var(--s-muted); margin-bottom: 10px; }
  .s-prog-bar { background: var(--s-surface2); border: 1px solid var(--s-border); border-radius: 10px; height: 8px; overflow: hidden; width: 100%; }
  .s-prog-fill { height: 100%; background: linear-gradient(90deg, var(--s-accent), #a855f7); border-radius: 10px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  .s-cw-image { width: 340px; position: relative; overflow: hidden; }
  .s-cw-image img { width: 100%; height: 100%; object-fit: cover; mask-image: linear-gradient(to right, transparent, black 15%); -webkit-mask-image: linear-gradient(to right, transparent, black 15%); }
  .s-cw-image-placeholder { width: 340px; background: var(--s-surface2); display: flex; align-items: center; justify-content: center; font-size: 80px; opacity: 0.5; }

  /* Section Titles */
  .s-section-title { font-family: var(--s-font-h); font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 20px; }

  /* Course Grid */
  .s-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-bottom: 40px; }
  .s-course-card {
    background: var(--s-surface); border: 1px solid var(--s-border);
    border-radius: var(--s-radius); overflow: hidden; display: flex; flex-direction: column;
    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .s-course-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--s-border-hover); }
  .s-course-thumb { height: 150px; position: relative; background: var(--s-surface2); display: flex; align-items: center; justify-content: center; }
  .s-course-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .s-course-thumb-placeholder { font-size: 48px; }
  .s-status-badge { position: absolute; top: 12px; left: 12px; backdrop-filter: blur(4px); font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 6px 12px; border-radius: 8px; letter-spacing: 1px; }
  .s-status-badge.done { background: rgba(16,185,129,0.8); color: #fff; }
  .s-status-badge.active { background: rgba(99,102,241,0.8); color: #fff; }
  
  .s-course-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
  .s-course-title { font-family: var(--s-font-h); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .s-course-date { font-size: 12px; color: var(--s-muted); margin-bottom: 20px; }
  .s-course-progress { margin-top: auto; }
  .s-prog-stats { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--s-muted); margin-bottom: 8px; }

  /* Quiz Promo */
  .s-quiz-promo {
    background: linear-gradient(135deg, var(--s-surface2), var(--s-surface));
    border: 1px solid var(--s-border); border-radius: 20px;
    padding: 32px 40px; display: flex; align-items: center; gap: 32px;
    margin-bottom: 40px;
  }
  .s-qp-icon { font-size: 48px; }
  .s-qp-content { flex: 1; }
  .s-qp-content h3 { font-family: var(--s-font-h); font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .s-qp-content p { color: var(--s-muted); font-size: 14px; line-height: 1.5; max-width: 500px; }

  /* Empty State */
  .s-empty-state { text-align: center; padding: 80px 20px; border: 1px dashed var(--s-border); border-radius: 20px; }
  .s-empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
  .s-empty-state h3 { font-family: var(--s-font-h); font-size: 24px; color: #fff; margin-bottom: 8px; }
  .s-empty-state p { color: var(--s-muted); font-size: 15px; }

  /* Buttons */
  .s-btn-primary, .s-btn-ghost, .s-btn-accent {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; border: 1px solid transparent;
    font-family: var(--s-font-b); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
  }
  .s-btn-primary { background: var(--s-accent); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
  .s-btn-primary:hover { background: var(--s-accent-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.3); }
  .s-btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 12px; }
  .s-btn-accent { background: rgba(99,102,241,0.1); color: var(--s-accent); border-color: rgba(99,102,241,0.2); }
  .s-btn-accent:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }
  .s-btn-ghost { background: transparent; border-color: var(--s-border); color: var(--s-text); }
  .s-btn-ghost:hover { background: var(--s-surface2); border-color: var(--s-border-hover); }

  /* Loader */
  .s-loader { border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--s-accent); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 100px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .s-shell { flex-direction: column; }
    .s-sidebar { width: 100%; height: auto; position: static; padding: 20px; border-right: none; border-bottom: 1px solid var(--s-border); }
    .s-nav { flex-direction: row; flex-wrap: wrap; margin-bottom: 20px; }
    .s-main { padding: 24px 20px; }
    .s-continue-widget { flex-direction: column; }
    .s-cw-image { width: 100%; height: 200px; }
    .s-cw-image img { mask-image: linear-gradient(to top, transparent, black 15%); -webkit-mask-image: linear-gradient(to top, transparent, black 15%); }
    .s-quiz-promo { flex-direction: column; text-align: center; }
  }
`;