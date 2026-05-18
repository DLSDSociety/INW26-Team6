import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function DashboardPage() {
  const { username: authUsername, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCertEnrollment, setActiveCertEnrollment] = useState(null);

  // Tab State: "dashboard" or "profile"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile States
  const [profile, setProfile] = useState({ username: "", email: "", bio: "", profile_picture: "" });
  const [profileForm, setProfileForm] = useState({ username: "", email: "", bio: "", password: "" });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  useEffect(() => {
    fetchEnrollments();
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/users/profile/");
      setProfile(res.data);
      setProfileForm({
        username: res.data.username || "",
        email: res.data.email || "",
        bio: res.data.bio || "",
        password: ""
      });
      setProfilePreview(res.data.profile_picture || "");
    } catch (err) {
      console.error("Failed to fetch profile details", err);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileMsg("");
    setProfileErr("");

    const formData = new FormData();
    formData.append("username", profileForm.username);
    formData.append("email", profileForm.email);
    formData.append("bio", profileForm.bio);
    if (profileForm.password) {
      formData.append("password", profileForm.password);
    }
    if (profileFile) {
      formData.append("profile_picture", profileFile);
    }

    try {
      await api.patch("/api/users/profile/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileMsg("Profile updated successfully!");
      if (profileForm.username !== authUsername) {
        localStorage.setItem("username", profileForm.username);
        window.location.reload();
      } else {
        fetchProfile();
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      setProfileErr(err.response?.data?.error || "Failed to update profile. Please try again.");
    } finally {
      setProfileSubmitting(false);
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

  const getThumbnailUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const displayUsername = profile.username || authUsername || "Student";

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
            <button className={`s-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              <span className="s-nav-icon">📚</span> My Dashboard
            </button>
            <button className={`s-nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              <span className="s-nav-icon">👤</span> My Profile
            </button>
            <button className="s-nav-item" onClick={() => navigate("/quizzes")}>
              <span className="s-nav-icon">🧠</span> Knowledge Quizzes
            </button>
          </nav>
          
          <div className="s-sidebar-footer">
            <div className="s-user-info">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Avatar" className="s-avatar-img" />
              ) : (
                <div className="s-avatar">{(displayUsername || "S")[0].toUpperCase()}</div>
              )}
              <div>
                <div className="s-username">{displayUsername}</div>
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
          
          {activeTab === "dashboard" ? (
            <>
              <header className="s-topbar">
                <div>
                  <h1 className="s-page-title">Welcome back, {displayUsername}!</h1>
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
                            <img src={getThumbnailUrl(topCourse.course_thumbnail)} alt="Course Cover" />
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
                              <img src={getThumbnailUrl(e.course_thumbnail)} alt={e.course_title} />
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

                            {e.is_completed && (
                              <button
                                className="s-btn-accent"
                                style={{
                                  width: "100%",
                                  marginTop: "16px",
                                  background: "rgba(16,185,129,0.1)",
                                  color: "#10b981",
                                  borderColor: "rgba(16,185,129,0.2)",
                                  justifyContent: "center"
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setActiveCertEnrollment(e);
                                }}
                              >
                                🏆 View Certificate
                              </button>
                            )}
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
            </>
          ) : (
            /* New Profile Tab Content */
            <>
              <header className="s-topbar">
                <div>
                  <h1 className="s-page-title">Personal Profile</h1>
                  <p className="s-page-sub">Manage your account information, bio, avatar, and security credentials.</p>
                </div>
              </header>

              <div className="s-fade-in profile-container">
                <div className="profile-grid">
                  
                  {/* Left Column: Avatar & Meta Card */}
                  <div className="profile-sidebar-card">
                    <div className="profile-avatar-wrap">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Avatar Preview" className="profile-avatar-preview" />
                      ) : (
                        <div className="profile-avatar-placeholder">
                          {(profileForm.username || "S")[0].toUpperCase()}
                        </div>
                      )}
                      <label className="profile-upload-label">
                        📸 Change Photo
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                      </label>
                    </div>

                    <h2 className="profile-meta-username">{profile.username}</h2>
                    <span className="profile-meta-role">🔑 {profile.role?.toUpperCase()}</span>

                    <div className="profile-meta-details">
                      <div className="profile-meta-item">
                        <span className="profile-meta-lbl">Joined:</span>
                        <span className="profile-meta-val">Active Student</span>
                      </div>
                      <div className="profile-meta-item">
                        <span className="profile-meta-lbl">Courses Taken:</span>
                        <span className="profile-meta-val">{enrollments.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Profile Form Card */}
                  <div className="profile-form-card">
                    <h3 className="profile-form-title">Account Details</h3>

                    {profileMsg && <div className="profile-alert success">{profileMsg}</div>}
                    {profileErr && <div className="profile-alert danger">{profileErr}</div>}

                    <form onSubmit={handleProfileSubmit}>
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={profileForm.username}
                            onChange={handleProfileChange}
                            className="profile-form-input"
                            required
                          />
                        </div>

                        <div className="profile-form-group">
                          <label className="profile-form-label">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            className="profile-form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Short Biography</label>
                        <textarea
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          rows="4"
                          placeholder="Tell us a little bit about your learning goals and interests..."
                          className="profile-form-textarea"
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Update Password (Leave blank to keep current)</label>
                        <input
                          type="password"
                          name="password"
                          value={profileForm.password}
                          onChange={handleProfileChange}
                          placeholder="Enter a new password"
                          className="profile-form-input"
                        />
                      </div>

                      <button type="submit" className="s-btn-primary s-btn-lg profile-submit-btn" disabled={profileSubmitting}>
                        {profileSubmitting ? "Saving Changes..." : "💾 Save Profile Changes"}
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Certificate Modal Overlay */}
      {activeCertEnrollment && (
        <div className="cert-modal-backdrop" onClick={() => setActiveCertEnrollment(null)}>
          <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cert-close-btn" onClick={() => setActiveCertEnrollment(null)}>✕</button>
            
            {/* Printable Certificate Sheet */}
            <div id="printable-certificate" className="cert-sheet">
              <div className="cert-border-outer">
                <div className="cert-border-inner">
                  
                  {/* Corner accents */}
                  <div className="cert-corner tl"></div>
                  <div className="cert-corner tr"></div>
                  <div className="cert-corner bl"></div>
                  <div className="cert-corner br"></div>

                  <div className="cert-header">
                    <div className="cert-logo">🎓 LEARNINGHUB ACADEMY</div>
                    <div className="cert-title-primary">CERTIFICATE OF COMPLETION</div>
                    <div className="cert-title-sub">THIS CREDENTIAL IS PROUDLY PRESENTED TO</div>
                  </div>

                  <div className="cert-recipient">
                    {displayUsername ? displayUsername.toUpperCase() : "STUDENT"}
                  </div>

                  <div className="cert-message">
                    for successfully meeting all academic requirements and masterfully completing the professional curriculum for
                  </div>

                  <div className="cert-course-title">
                    {activeCertEnrollment.course_title}
                  </div>

                  <div className="cert-footer">
                    <div className="cert-date-block">
                      <div className="cert-value">
                        {new Date(activeCertEnrollment.enrolled_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="cert-label">ISSUED ON</div>
                    </div>

                    <div className="cert-seal-block">
                      <div className="cert-seal">
                        <div className="cert-seal-inner">★ SEAL ★</div>
                      </div>
                    </div>

                    <div className="cert-signature-block">
                      <div className="cert-sig-line">LearningHub Team</div>
                      <div className="cert-label">AUTHORIZED SIGNATURE</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="cert-modal-actions">
              <button className="s-btn-primary s-btn-lg" onClick={() => window.print()}>
                🖨️ Print & Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --s-bg: #f8fafc;
    --s-surface: #ffffff;
    --s-surface2: #f1f5f9;
    --s-border: #e2e8f0;
    --s-border-hover: #cbd5e1;
    --s-text: #0f172a;
    --s-muted: #64748b;
    --s-accent: #6366f1;
    --s-accent-hover: #4f46e5;
    --s-success: #10b981;
    --s-warning: #f59e0b;
    --s-danger: #ef4444;
    --s-radius: 16px;
    --s-sidebar: 260px;
    --s-font-h: 'Outfit', sans-serif;
    --s-font-b: 'Inter', sans-serif;
    
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
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
  .s-brand-name { font-family: var(--s-font-h); font-weight: 800; font-size: 20px; color: var(--s-text); letter-spacing: -0.5px; }
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
  .s-nav-item.active { background: rgba(99,102,241,0.08); color: var(--s-accent); font-weight: 600; }
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
  .s-main { flex: 1; padding: 40px 48px; overflow-y: auto; background: radial-gradient(circle at top right, rgba(99,102,241,0.02), transparent 400px); }
  .s-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
  .s-page-title { font-family: var(--s-font-h); font-size: 32px; font-weight: 800; color: var(--s-text); letter-spacing: -0.5px; margin-bottom: 6px; }
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
  .s-stat-val { font-family: var(--s-font-h); font-size: 32px; font-weight: 800; color: var(--s-text); line-height: 1.1; }
  .s-stat-lbl { font-size: 13px; color: var(--s-muted); font-weight: 500; margin-top: 4px; }

  /* Continue Widget */
  .s-continue-widget {
    background: linear-gradient(135deg, var(--s-accent) 0%, #8b5cf6 100%);
    border: 1px solid rgba(99,102,241,0.1);
    border-radius: 20px; display: flex; overflow: hidden;
    margin-bottom: 40px; box-shadow: var(--shadow-lg);
  }
  .s-cw-content { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
  .s-cw-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; align-self: flex-start; }
  .s-cw-title { font-family: var(--s-font-h); font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 24px; line-height: 1.3; }
  .s-cw-progress-wrap { margin-bottom: 32px; max-width: 400px; }
  .s-cw-progress-stats { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 10px; }
  
  .s-continue-widget .s-prog-bar { background: rgba(255, 255, 255, 0.2); border: none; border-radius: 10px; height: 8px; overflow: hidden; width: 100%; }
  .s-continue-widget .s-prog-fill { height: 100%; background: #ffffff; border-radius: 10px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  
  .s-prog-bar { background: var(--s-surface2); border: 1px solid var(--s-border); border-radius: 10px; height: 8px; overflow: hidden; width: 100%; }
  .s-prog-fill { height: 100%; background: linear-gradient(90deg, var(--s-accent), #a855f7); border-radius: 10px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  .s-cw-image { width: 340px; position: relative; overflow: hidden; }
  .s-cw-image img { width: 100%; height: 100%; object-fit: cover; mask-image: linear-gradient(to right, transparent, black 15%); -webkit-mask-image: linear-gradient(to right, transparent, black 15%); }
  .s-cw-image-placeholder { width: 340px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 80px; opacity: 0.5; color: #fff; }

  /* Section Titles */
  .s-section-title { font-family: var(--s-font-h); font-size: 22px; font-weight: 700; color: var(--s-text); margin-bottom: 20px; }

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
  .s-status-badge.done { background: rgba(16,185,129,0.9); color: #fff; }
  .s-status-badge.active { background: rgba(99,102,241,0.9); color: #fff; }
  
  .s-course-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
  .s-course-title { font-family: var(--s-font-h); font-size: 18px; font-weight: 700; color: var(--s-text); margin-bottom: 8px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .s-course-date { font-size: 12px; color: var(--s-muted); margin-bottom: 20px; }
  .s-course-progress { margin-top: auto; }
  .s-prog-stats { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--s-muted); margin-bottom: 8px; }

  /* Quiz Promo */
  .s-quiz-promo {
    background: linear-gradient(135deg, var(--s-surface), var(--s-surface2));
    border: 1px solid var(--s-border); border-radius: 20px;
    padding: 32px 40px; display: flex; align-items: center; gap: 32px;
    margin-bottom: 40px; box-shadow: var(--shadow-md);
  }
  .s-qp-icon { font-size: 48px; }
  .s-qp-content { flex: 1; }
  .s-qp-content h3 { font-family: var(--s-font-h); font-size: 22px; font-weight: 700; color: var(--s-text); margin-bottom: 8px; }
  .s-qp-content p { color: var(--s-muted); font-size: 14px; line-height: 1.5; max-width: 500px; }

  /* Empty State */
  .s-empty-state { text-align: center; padding: 80px 20px; border: 1px dashed var(--s-border); border-radius: 20px; }
  .s-empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
  .s-empty-state h3 { font-family: var(--s-font-h); font-size: 24px; color: var(--s-text); margin-bottom: 8px; }
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
  .s-btn-accent { background: rgba(99,102,241,0.05); color: var(--s-accent); border-color: rgba(99,102,241,0.15); }
  .s-btn-accent:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); }
  .s-btn-ghost { background: transparent; border-color: var(--s-border); color: var(--s-text); }
  .s-btn-ghost:hover { background: var(--s-surface2); border-color: var(--s-border-hover); }

  /* Loader */
  .s-loader { border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--s-accent); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 100px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Certificate Modal Styles */
  .cert-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    animation: certFadeIn 0.3s ease;
  }

  @keyframes certFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cert-modal {
    background: var(--s-surface);
    border: 1px solid var(--s-border);
    border-radius: var(--s-radius);
    max-width: 900px;
    width: 100%;
    position: relative;
    padding: 32px;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: certSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes certSlideUp {
    from { transform: translateY(30px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  .cert-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: var(--s-muted);
    font-size: 20px;
    cursor: pointer;
    transition: color 0.2s;
  }
  .cert-close-btn:hover {
    color: var(--s-text);
  }

  .cert-sheet {
    width: 100%;
    aspect-ratio: 1.414 / 1;
    background: #0d1117;
    color: #f0f6fc;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    overflow: hidden;
    position: relative;
  }

  .cert-border-outer {
    border: 8px solid #c99e32;
    height: 100%;
    padding: 12px;
    border-radius: 4px;
    position: relative;
  }

  .cert-border-inner {
    border: 2px solid #58a6ff;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
    position: relative;
  }

  .cert-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 4px solid #c99e32;
  }
  .cert-corner.tl { top: -6px; left: -6px; border-right: none; border-bottom: none; }
  .cert-corner.tr { top: -6px; right: -6px; border-left: none; border-bottom: none; }
  .cert-corner.bl { bottom: -6px; left: -6px; border-right: none; border-top: none; }
  .cert-corner.br { bottom: -6px; right: -6px; border-left: none; border-top: none; }

  .cert-logo {
    font-family: var(--s-font-h);
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #8b949e;
    margin-bottom: 24px;
  }

  .cert-title-primary {
    font-family: var(--s-font-h);
    font-size: 32px;
    font-weight: 800;
    color: #ffdf7a;
    letter-spacing: 4px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffe082 0%, #c99e32 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cert-title-sub {
    font-size: 11px;
    letter-spacing: 2px;
    color: #8b949e;
    font-weight: 600;
  }

  .cert-recipient {
    font-family: var(--s-font-h);
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    margin: 20px 0;
    border-bottom: 2px solid #58a6ff;
    padding-bottom: 6px;
    min-width: 280px;
  }

  .cert-message {
    font-size: 13px;
    color: #8b949e;
    max-width: 500px;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .cert-course-title {
    font-family: var(--s-font-h);
    font-size: 24px;
    font-weight: 800;
    color: #58a6ff;
    margin-bottom: 32px;
  }

  .cert-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    margin-top: auto;
    padding: 0 12px;
  }

  .cert-date-block, .cert-signature-block {
    width: 150px;
  }

  .cert-label {
    font-size: 10px;
    color: #8b949e;
    border-top: 1px solid #30363d;
    padding-top: 6px;
    margin-top: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .cert-value {
    font-size: 12px;
    color: #f0f6fc;
    font-weight: 600;
  }

  .cert-sig-line {
    font-family: 'Outfit', cursive;
    font-size: 16px;
    color: #ffe082;
    font-style: italic;
  }

  .cert-seal-block {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cert-seal {
    width: 72px;
    height: 72px;
    background: radial-gradient(circle, #ffdf7a 0%, #c99e32 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .cert-seal-inner {
    font-family: var(--s-font-h);
    font-size: 9px;
    font-weight: 800;
    color: #0d1117;
  }

  .cert-modal-actions {
    margin-top: 24px;
  }

  /* Print Styles */
  @media print {
    /* Completely hide the rest of the application so no extra pages print */
    .s-shell, #root > *:not(.cert-modal-backdrop) {
      display: none !important;
    }

    body {
      background: #0d1117 !important;
      color: #f0f6fc !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Target the backdrop to cover the entire page */
    .cert-modal-backdrop {
      position: fixed !important;
      inset: 0 !important;
      background: #0d1117 !important;
      padding: 0 !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 99999 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-modal {
      background: #0d1117 !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      box-shadow: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-close-btn, .cert-modal-actions {
      display: none !important;
    }

    .cert-sheet {
      width: 297mm !important; /* A4 Landscape width */
      height: 210mm !important; /* A4 Landscape height */
      max-width: 100% !important;
      max-height: 100% !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 30px !important;
      background: #0d1117 !important;
      box-sizing: border-box !important;
      display: block !important;
      position: relative !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-border-outer {
      border: 8px solid #c99e32 !important;
      height: 100% !important;
      padding: 12px !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-border-inner {
      border: 2px solid #58a6ff !important;
      height: 100% !important;
      padding: 24px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-title-primary {
      color: #ffdf7a !important;
      background: none !important;
      -webkit-text-fill-color: initial !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cert-seal {
      background: radial-gradient(circle, #ffdf7a 0%, #c99e32 100%) !important;
      border: 3px dashed #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: landscape;
      margin: 0;
    }
  }

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

  /* 👤 Profile Styles */
  .s-avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--s-accent); }
  .profile-container { max-width: 1100px; margin: 0 auto; padding-bottom: 50px; }
  .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }
  
  .profile-sidebar-card {
    background: var(--s-surface); border: 1px solid var(--s-border);
    border-radius: var(--s-radius); padding: 40px 24px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    box-shadow: var(--shadow-md);
  }
  
  .profile-avatar-wrap { position: relative; margin-bottom: 24px; }
  .profile-avatar-preview { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid var(--s-accent); box-shadow: var(--shadow-lg); }
  .profile-avatar-placeholder {
    width: 140px; height: 140px; border-radius: 50%; background: var(--s-surface2); border: 4px solid var(--s-border);
    display: flex; align-items: center; justify-content: center; font-size: 64px; font-weight: 800; color: var(--s-accent);
    box-shadow: var(--shadow-lg);
  }
  
  .profile-upload-label {
    position: absolute; bottom: 0; right: 0; background: var(--s-accent); color: #fff;
    padding: 8px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer;
    box-shadow: var(--shadow-md); transition: background 0.2s, transform 0.2s;
  }
  .profile-upload-label:hover { background: var(--s-accent-hover); transform: scale(1.05); }
  
  .profile-meta-username { font-family: var(--s-font-h); font-size: 24px; font-weight: 700; color: var(--s-text); margin-bottom: 6px; }
  .profile-meta-role { display: inline-block; background: rgba(99,102,241,0.08); color: var(--s-accent); padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 24px; }
  
  .profile-meta-details { width: 100%; border-top: 1px solid var(--s-border); padding-top: 20px; display: flex; flex-direction: column; gap: 12px; }
  .profile-meta-item { display: flex; justify-content: space-between; font-size: 13px; }
  .profile-meta-lbl { color: var(--s-muted); font-weight: 500; }
  .profile-meta-val { color: var(--s-text); font-weight: 600; }
  
  .profile-form-card {
    background: var(--s-surface); border: 1px solid var(--s-border);
    border-radius: var(--s-radius); padding: 40px;
    box-shadow: var(--shadow-md);
  }
  .profile-form-title { font-family: var(--s-font-h); font-size: 24px; font-weight: 700; color: var(--s-text); margin-bottom: 30px; border-bottom: 1px solid var(--s-border); padding-bottom: 16px; }
  
  .profile-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .profile-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .profile-form-label { font-size: 13px; font-weight: 600; color: var(--s-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .profile-form-input, .profile-form-textarea {
    background: var(--s-surface2); border: 1px solid var(--s-border); color: var(--s-text);
    border-radius: 10px; padding: 12px 16px; font-family: var(--s-font-b); font-size: 14px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .profile-form-input:focus, .profile-form-textarea:focus { border-color: var(--s-accent); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
  .profile-form-textarea { resize: vertical; }
  
  .profile-alert { padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-bottom: 24px; display: flex; align-items: center; }
  .profile-alert.success { background: rgba(16,185,129,0.08); color: #10b981; border: 1px solid rgba(16,185,129,0.15); }
  .profile-alert.danger { background: rgba(239,68,68,0.08); color: #ef4444; border: 1px solid rgba(239,68,68,0.15); }
  .profile-submit-btn { width: 100%; justify-content: center; margin-top: 10px; }
  
  @media (max-width: 768px) {
    .profile-grid { grid-template-columns: 1fr; }
    .profile-form-row { grid-template-columns: 1fr; gap: 0; }
  }
`;