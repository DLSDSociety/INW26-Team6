import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { token, username, role, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const isStudent = role === "student";

  useEffect(() => {
    // Fetch top 6 courses for the homepage grid
    api.get("/api/courses/").then((res) => setCourses(res.data.slice(0, 6)));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gla-page">

        {/* ── NAVBAR ── */}
        <nav className="gla-nav">
          <div className="gla-nav-left">
            <div className="gla-brand" onClick={() => navigate("/")}>
              <span className="gla-brand-text">Learning Hub</span>
            </div>
            
            <div className="gla-nav-links desktop-only">
              <Link to="/courses" className="gla-nav-link active">Explore Courses</Link>
              {isStudent && <Link to="/quizzes" className="gla-nav-link">Quizzes</Link>}
            </div>
          </div>

          <div className="gla-nav-right">
            {token ? (
              <>
                <Link to="/dashboard" className="gla-nav-link">
                  {role === "student" ? "My Learning" : "Dashboard"}
                </Link>
                <div className="gla-user-greet">
                  <div className="gla-avatar">{(username || "U")[0].toUpperCase()}</div>
                  <span className="desktop-only">Hi, {username}</span>
                </div>
                <button className="gla-btn-outline" onClick={() => { logout(); navigate("/login"); }}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button className="gla-btn-outline" onClick={() => navigate("/login")}>Log in</button>
                <button className="gla-btn-solid" onClick={() => navigate("/register")}>Join for Free</button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO SECTION ── */}
        <section className="gla-hero">
          <div className="gla-hero-content">
            <h1 className="gla-hero-title">
              Start, switch, or advance your career.
            </h1>
            <p className="gla-hero-subtitle">
              Grow with expert-led courses in technology, programming, and more — all for free at Learning Hub.
            </p>

            <form className="gla-search-form" onSubmit={handleSearch}>
              <div className="gla-search-input-wrap">
                <span className="gla-search-icon">🔍</span>
                <input 
                  type="text" 
                  className="gla-search-input" 
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="gla-search-btn">Search</button>
              </div>
            </form>

            <div className="gla-popular-searches">
              <span className="gla-ps-label">Popular topics:</span>
              <div className="gla-ps-tags">
                {["Java", "Python", "Database", "AI", "Finance", "Operations"].map(tag => (
                  <span key={tag} className="gla-ps-tag" onClick={() => navigate(`/courses?search=${tag}`)}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PILLARS ── */}
        <section className="gla-pillars">
          <div className="gla-pillars-container">
            <div className="gla-pillar-card">
              <div className="gla-pillar-icon">🏆</div>
              <h3>Launch a new career with job-ready hands-on skills</h3>
            </div>
            <div className="gla-pillar-card">
              <div className="gla-pillar-icon">📈</div>
              <h3>Advance your skills and stay ahead with the latest knowledge</h3>
            </div>
            <div className="gla-pillar-card">
              <div className="gla-pillar-icon">🎯</div>
              <h3>Earn certificates to showcase your achievements</h3>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="gla-section gla-categories-section">
          <div className="gla-container">
            <h2 className="gla-section-title">Browse Courses by Category</h2>
            <div className="gla-categories-grid">
              {[
                { name: "IT & Software", icon: "💻" },
                { name: "Data Science", icon: "📊" },
                { name: "Artificial Intelligence", icon: "🤖" },
                { name: "Digital Marketing", icon: "📱" },
                { name: "Cloud Computing", icon: "☁️" },
                { name: "Cyber Security", icon: "🛡️" },
                { name: "UI/UX Design", icon: "🎨" },
                { name: "Business & Management", icon: "💼" }
              ].map((cat) => (
                <div key={cat.name} className="gla-cat-card" onClick={() => navigate(`/courses?category=${encodeURIComponent(cat.name)}`)}>
                  <div className="gla-cat-icon">{cat.icon}</div>
                  <div className="gla-cat-info">
                    <h4>{cat.name}</h4>
                  </div>
                  <div className="gla-cat-arrow">→</div>
                </div>
              ))}
            </div>
            <div className="gla-center-actions">
              <button className="gla-btn-outline-primary" onClick={() => navigate("/courses")}>
                Discover All Courses
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURED COURSES ── */}
        <section className="gla-section gla-bg-gray">
          <div className="gla-container">
            <h2 className="gla-section-title">New and Popular Courses</h2>
            <p className="gla-section-subtitle">Handpicked by our team to get you started.</p>
            
            <div className="gla-courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="gla-course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="gla-cc-thumb">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="gla-cc-placeholder">📚</div>
                    )}
                    <div className="gla-cc-badge">{course.category || "COURSE"}</div>
                  </div>
                  <div className="gla-cc-body">
                    <div className="gla-cc-stats">
                      <span className="gla-cc-rating">★ 4.8</span>
                      <span className="gla-cc-learners">New</span>
                    </div>
                    <h3 className="gla-cc-title">{course.title}</h3>
                    <div className="gla-cc-duration" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "40px" }}>
                      {course.description}
                    </div>
                    <div className="gla-cc-footer">
                      <button className="gla-btn-text">View Course →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {courses.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                Loading courses...
              </div>
            )}
          </div>
        </section>

        {/* ── QUIZ SECTION (Students only) ── */}
        {isStudent && (
          <section className="gla-section">
            <div className="gla-container">
              <div style={{
                padding: "48px 40px",
                background: "linear-gradient(135deg, #1e1e3a 0%, #2a1f5e 100%)",
                borderRadius: "16px", border: "1px solid #333",
                display: "grid", gridTemplateColumns: "1fr auto",
                alignItems: "center", gap: "32px",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "rgba(108, 99, 255, 0.15)", border: "1px solid rgba(108, 99, 255, 0.3)",
                    padding: "4px 12px", borderRadius: "20px", marginBottom: "14px",
                    fontSize: "12px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.5px"
                  }}>
                    🎯 For Students
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#fff", margin: "0 0 10px", lineHeight: 1.3 }}>
                    Test Your Knowledge
                  </h2>
                  <p style={{ color: "#aaa", fontSize: "14px", margin: "0", lineHeight: 1.7, maxWidth: "480px" }}>
                    Challenge yourself with AI-generated quizzes on Database Management, AI, Java, Python, Finance, Business Analytics, and more. 10 fresh questions every attempt.
                  </p>
                </div>
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>🧠</div>
                  <button
                    onClick={() => navigate("/quizzes")}
                    style={{
                      background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                      color: "white", border: "none",
                      padding: "14px 32px", borderRadius: "12px",
                      fontSize: "15px", fontWeight: "700",
                      cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "0 4px 20px rgba(108, 99, 255, 0.4)",
                      whiteSpace: "nowrap"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(108,99,255,0.55)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,99,255,0.4)"; }}
                  >
                    Start a Quiz →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA BANNER ── */}
        {!token && (
          <section className="gla-cta-banner">
            <div className="gla-container">
              <h2>Start learning today</h2>
              <p>Join hundreds of students already growing their skills on Learning Hub.</p>
              <button className="gla-btn-solid-large" onClick={() => navigate("/register")}>
                Join for Free
              </button>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="gla-footer">
          <div className="gla-container">
            <div className="gla-footer-grid">
              
              <div className="gla-footer-col brand-col">
                <div className="gla-brand">
                  <span className="gla-brand-text" style={{ color: "#fff" }}>Learning Hub</span>
                </div>
                <p>A free, open platform for learners at every stage — from first-time coders to seasoned professionals levelling up.</p>
                <div className="gla-social-links">
                  <a href="#">𝕏</a>
                  <a href="#">in</a>
                  <a href="#">gh</a>
                </div>
              </div>

              <div className="gla-footer-col">
                <h4>Learn</h4>
                <a href="#">Browse Courses</a>
                <a href="#">My Dashboard</a>
                <a href="#">Take a Quiz</a>
                <a href="#">Track Progress</a>
              </div>

              <div className="gla-footer-col">
                <h4>Platform</h4>
                <a href="#">About Us</a>
                <a href="#">Become an Instructor</a>
                <a href="#">Join for Free</a>
                <a href="#">Log In</a>
              </div>

              <div className="gla-footer-col">
                <h4>Topics</h4>
                <a href="#">Python</a>
                <a href="#">Java</a>
                <a href="#">Database</a>
                <a href="#">Artificial Intelligence</a>
                <a href="#">Finance</a>
              </div>

            </div>
            <div className="gla-footer-bottom">
              <p>© 2026 Learning Hub. Built with Django REST Framework + React.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .gla-page {
    font-family: 'Inter', system-ui, sans-serif;
    color: #333333;
    background-color: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a { text-decoration: none; color: inherit; }

  /* Utilities */
  .gla-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .gla-section { padding: 80px 0; }
  .gla-bg-gray { background-color: #f8f9fa; }
  .desktop-only { display: flex; }
  @media (max-width: 768px) { .desktop-only { display: none !important; } }

  /* Navbar */
  .gla-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 40px; background: #fff; border-bottom: 1px solid #e5e7eb;
    position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .gla-nav-left, .gla-nav-right { display: flex; align-items: center; gap: 32px; }
  
  .gla-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .gla-brand-text { font-size: 22px; font-weight: 800; color: #0056d2; letter-spacing: -0.5px; }

  .gla-nav-links { display: flex; gap: 24px; align-items: center; }
  .gla-nav-link { font-size: 15px; font-weight: 600; color: #4b5563; transition: color 0.2s; }
  .gla-nav-link:hover, .gla-nav-link.active { color: #0056d2; }

  .gla-user-greet { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #4b5563; }
  .gla-avatar { width: 32px; height: 32px; border-radius: 50%; background: #0056d2; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }

  /* Buttons */
  .gla-btn-outline {
    background: transparent; color: #0056d2; border: 1px solid #0056d2;
    padding: 8px 20px; border-radius: 6px; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .gla-btn-outline:hover { background: #eff6ff; }
  
  .gla-btn-solid {
    background: #0056d2; color: #fff; border: 1px solid #0056d2;
    padding: 8px 20px; border-radius: 6px; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .gla-btn-solid:hover { background: #0044a8; }

  .gla-btn-solid-large {
    background: #0056d2; color: #fff; border: none;
    padding: 16px 36px; border-radius: 8px; font-size: 18px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(0,86,210,0.3);
  }
  .gla-btn-solid-large:hover { background: #0044a8; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,86,210,0.4); }

  .gla-btn-outline-primary {
    background: transparent; color: #0056d2; border: 2px solid #0056d2;
    padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .gla-btn-outline-primary:hover { background: #0056d2; color: #fff; }

  .gla-btn-text { background: transparent; border: none; color: #0056d2; font-size: 14px; font-weight: 700; cursor: pointer; padding: 0; }
  .gla-btn-text:hover { color: #0044a8; text-decoration: underline; }

  /* Hero Section */
  .gla-hero {
    background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
    padding: 80px 24px 60px; text-align: center;
  }
  .gla-hero-content { max-width: 900px; margin: 0 auto; }
  .gla-hero-title { font-size: 48px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 20px; letter-spacing: -1px; }
  .gla-hero-subtitle { font-size: 18px; color: #4b5563; line-height: 1.6; margin-bottom: 40px; max-width: 760px; margin-left: auto; margin-right: auto; }
  
  .gla-search-form { max-width: 640px; margin: 0 auto 24px; }
  .gla-search-input-wrap {
    display: flex; align-items: center; background: #fff; border: 1px solid #d1d5db;
    border-radius: 12px; padding: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: box-shadow 0.2s;
  }
  .gla-search-input-wrap:focus-within { border-color: #0056d2; box-shadow: 0 4px 25px rgba(0,86,210,0.15); }
  .gla-search-icon { font-size: 20px; margin: 0 16px; opacity: 0.5; }
  .gla-search-input { flex: 1; border: none; outline: none; font-size: 16px; color: #111827; padding: 12px 0; }
  .gla-search-input::placeholder { color: #9ca3af; }
  .gla-search-btn { background: #0056d2; color: #fff; border: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
  .gla-search-btn:hover { background: #0044a8; }

  .gla-popular-searches { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px; }
  .gla-ps-label { font-size: 14px; font-weight: 600; color: #6b7280; }
  .gla-ps-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .gla-ps-tag { background: #f3f4f6; color: #374151; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 20px; cursor: pointer; transition: background 0.2s; }
  .gla-ps-tag:hover { background: #e5e7eb; color: #111827; }

  /* Pillars */
  .gla-pillars { padding: 40px 24px; border-bottom: 1px solid #e5e7eb; }
  .gla-pillars-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
  .gla-pillar-card { display: flex; align-items: flex-start; gap: 16px; }
  .gla-pillar-icon { font-size: 32px; flex-shrink: 0; background: #eff6ff; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .gla-pillar-card h3 { font-size: 16px; font-weight: 600; color: #374151; line-height: 1.5; margin: 0; padding-top: 4px; }

  /* Section Titles */
  .gla-section-title { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 12px; text-align: center; }
  .gla-section-subtitle { font-size: 16px; color: #6b7280; text-align: center; margin-bottom: 48px; }

  /* Categories Grid */
  .gla-categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
  .gla-cat-card {
    display: flex; align-items: center; background: #fff; border: 1px solid #e5e7eb;
    border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .gla-cat-card:hover { border-color: #0056d2; box-shadow: 0 10px 25px rgba(0,86,210,0.1); transform: translateY(-2px); }
  .gla-cat-icon { font-size: 28px; margin-right: 16px; width: 48px; height: 48px; border-radius: 8px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
  .gla-cat-info { flex: 1; }
  .gla-cat-info h4 { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .gla-cat-arrow { color: #d1d5db; font-size: 20px; font-weight: 700; transition: color 0.2s, transform 0.2s; }
  .gla-cat-card:hover .gla-cat-arrow { color: #0056d2; transform: translateX(4px); }
  .gla-center-actions { text-align: center; }

  /* Courses Grid */
  .gla-courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
  .gla-course-card {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;
    display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s;
  }
  .gla-course-card:hover { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); transform: translateY(-4px); border-color: #d1d5db; }
  .gla-cc-thumb { height: 180px; position: relative; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
  .gla-cc-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .gla-cc-placeholder { font-size: 56px; opacity: 0.5; }
  .gla-cc-badge { position: absolute; top: 16px; left: 16px; background: #111827; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; }
  
  .gla-cc-body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
  .gla-cc-stats { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
  .gla-cc-rating { color: #f59e0b; }
  .gla-cc-learners { color: #6b7280; }
  .gla-cc-title { font-size: 18px; font-weight: 800; color: #111827; margin: 0 0 16px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gla-cc-duration { font-size: 13px; color: #4b5563; font-weight: 500; margin-bottom: 24px; }
  .gla-cc-footer { margin-top: auto; border-top: 1px solid #f3f4f6; padding-top: 16px; }

  /* CTA Banner */
  .gla-cta-banner { background: #0056d2; color: #fff; text-align: center; padding: 80px 24px; }
  .gla-cta-banner h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
  .gla-cta-banner p { font-size: 18px; color: #bfdbfe; margin-bottom: 32px; }

  /* Footer */
  .gla-footer { background: #111827; color: #9ca3af; padding: 80px 0 20px; font-size: 14px; }
  .gla-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px; }
  .gla-footer-col h4 { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 24px; }
  .gla-footer-col a { display: block; margin-bottom: 12px; transition: color 0.2s; }
  .gla-footer-col a:hover { color: #fff; }
  .gla-social-links { display: flex; gap: 12px; margin-top: 24px; }
  .gla-social-links a { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: background 0.2s; }
  .gla-social-links a:hover { background: #0056d2; color: #fff; }
  .gla-footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center; font-size: 13px; }

  @media (max-width: 900px) {
    .gla-hero-title { font-size: 32px; }
    .gla-search-input-wrap { flex-direction: column; padding: 12px; gap: 12px; }
    .gla-search-icon { display: none; }
    .gla-search-input { width: 100%; text-align: center; }
    .gla-search-btn { width: 100%; }
    .gla-footer-grid { grid-template-columns: 1fr; gap: 32px; }
  }
`;