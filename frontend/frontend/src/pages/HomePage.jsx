import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { token, username, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/api/courses/").then((res) => setCourses(res.data.slice(0, 3)));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#ffffff", color: "#1a1a1a", minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 48px", background: "#ffffff",
        borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#0056d2" }}>
            Learning Hub
          </div>
          <Link to="/courses" style={{ color: "#333", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
            Explore
          </Link>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {token ? (
            <>
              <Link to="/dashboard" style={{ color: "#333", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                My Learning
              </Link>
              <span style={{ color: "#555", fontSize: "14px" }}>Hi, {username}</span>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{ background: "transparent", color: "#0056d2", border: "none", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  Log In
                </button>
              </Link>
              <Link to="/register">
                <button style={{ background: "#0056d2", color: "white", border: "2px solid #0056d2", padding: "8px 18px", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  Join for Free
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "0", minHeight: "420px", overflow: "hidden"
      }}>
        {/* Left */}
        <div style={{
          background: "#f5f5f5", padding: "60px 48px",
          display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <h1 style={{ fontSize: "42px", fontWeight: "800", lineHeight: 1.2, margin: "0 0 16px", color: "#1a1a1a" }}>
            Start, switch, or advance<br />your career.
          </h1>
          <p style={{ fontSize: "16px", color: "#555", margin: "0 0 28px", lineHeight: 1.6 }}>
            Grow with expert-led courses in technology, programming, and more — all for free.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/courses")}
              style={{ background: "#0056d2", color: "white", border: "none", padding: "14px 28px", borderRadius: "4px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
            >
              Join for Free →
            </button>
            <button
              onClick={() => navigate("/courses")}
              style={{ background: "transparent", color: "#0056d2", border: "2px solid #0056d2", padding: "14px 28px", borderRadius: "4px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
            >
              Browse Courses
            </button>
          </div>
        </div>

        {/* Right */}
        <div style={{
          background: "linear-gradient(135deg, #cce5ff 0%, #e8f4ff 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "40px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "80px", marginBottom: "16px" }}>🎓</div>
            <div style={{ background: "white", borderRadius: "12px", padding: "20px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0056d2" }}>500+</div>
              <div style={{ fontSize: "14px", color: "#555" }}>Students Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOAL CARDS ── */}
      <section style={{ padding: "32px 48px", background: "#ffffff", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            { icon: "🏆", title: "Launch a new career", desc: "Get job-ready with hands-on skills" },
            { icon: "📈", title: "Advance your skills", desc: "Stay ahead with the latest knowledge" },
            { icon: "🎯", title: "Earn certificates", desc: "Showcase your achievements" },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => navigate("/courses")}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: "#f9f9f9", border: "1px solid #e0e0e0",
                borderRadius: "8px", padding: "20px 24px", cursor: "pointer",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <span style={{ fontSize: "32px" }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "#777", marginTop: "2px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section style={{ padding: "60px 48px", background: "#ffffff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px", color: "#1a1a1a" }}>
            New and popular courses
          </h2>
          <p style={{ color: "#777", marginBottom: "32px", fontSize: "15px" }}>
            Handpicked by our team to get you started
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                style={{
                  background: "#ffffff", border: "1px solid #e0e0e0",
                  borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                  transition: "box-shadow 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: "100%", height: "160px", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "160px", background: "#e8f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                    📚
                  </div>
                )}
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#0056d2", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                    {course.category}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 8px", color: "#1a1a1a", lineHeight: 1.4 }}>
                    {course.title}
                  </h3>
                  <p style={{
                    color: "#777", fontSize: "13px", lineHeight: 1.5, margin: "0 0 12px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {course.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} style={{ color: "#f59e0b", fontSize: "12px" }}>★</span>
                    ))}
                    <span style={{ fontSize: "12px", color: "#777", marginLeft: "4px" }}>New</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button
              onClick={() => navigate("/courses")}
              style={{ background: "transparent", color: "#0056d2", border: "2px solid #0056d2", padding: "12px 32px", borderRadius: "4px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
            >
              See all courses →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "60px 48px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px", color: "#1a1a1a" }}>
            Why Learning Hub?
          </h2>
          <p style={{ color: "#777", marginBottom: "40px", fontSize: "15px" }}>
            Everything you need to grow your skills
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {[
              { icon: "🎬", title: "Video Lessons", desc: "Watch high-quality video lectures at your own pace" },
              { icon: "📝", title: "Quizzes", desc: "Test your knowledge with auto-graded assessments" },
              { icon: "📊", title: "Track Progress", desc: "See exactly how far you've come in each course" },
              { icon: "🏅", title: "Certificates", desc: "Earn certificates upon course completion" },
            ].map((item) => (
              <div key={item.title} style={{ background: "white", borderRadius: "8px", padding: "28px 20px", textAlign: "center", border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 8px", color: "#1a1a1a" }}>{item.title}</h3>
                <p style={{ color: "#777", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!token && (
        <section style={{ padding: "60px 48px", background: "#0056d2", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "white", marginBottom: "12px" }}>
            Start learning today
          </h2>
          <p style={{ color: "#cce5ff", fontSize: "16px", marginBottom: "28px" }}>
            Join hundreds of students already growing their skills on Learning Hub.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{ background: "white", color: "#0056d2", border: "none", padding: "14px 40px", borderRadius: "4px", fontSize: "16px", fontWeight: "800", cursor: "pointer" }}
          >
            Join for Free →
          </button>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1a1a", padding: "28px 48px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", fontWeight: "800", color: "#0056d2", marginBottom: "8px" }}>
          Learning Hub
        </div>
        <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
          © 2026 Learning Hub. Built with Django REST Framework + React.
        </p>
      </footer>

    </div>
  );
}

export default HomePage;