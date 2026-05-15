// import { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import "../styles/Dashboard.css";

// function DashboardPage() {
//   const navigate = useNavigate();
//   const { role, username, logout } = useContext(AuthContext);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="dashboard-container">
//       <h1>Dashboard</h1>
//       <h2>Welcome, {username || "User"}</h2>
//       <p>Role: {role}</p>

//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }

// export default DashboardPage;
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function DashboardPage() {
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

  const completed = enrollments.filter((e) => e.is_completed).length;
  const inProgress = enrollments.filter((e) => !e.is_completed).length;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1>Welcome, {username}!</h1>
          <p style={{ color: "#aaa" }}>Role: {role}</p>
        </div>
        <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "30px" }}>
        <div style={{ background: "#1e1e3a", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
          <h2 style={{ color: "#646cff" }}>{enrollments.length}</h2>
          <p style={{ color: "#aaa" }}>Total Enrolled</p>
        </div>
        <div style={{ background: "#1e1e3a", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
          <h2 style={{ color: "#f59e0b" }}>{inProgress}</h2>
          <p style={{ color: "#aaa" }}>In Progress</p>
        </div>
        <div style={{ background: "#1e1e3a", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
          <h2 style={{ color: "#22c55e" }}>{completed}</h2>
          <p style={{ color: "#aaa" }}>Completed</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <h2 style={{ marginBottom: "16px" }}>My Courses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : enrollments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#1e1e3a", borderRadius: "10px" }}>
          <p style={{ color: "#aaa", marginBottom: "16px" }}>You haven't enrolled in any courses yet.</p>
          <button
            onClick={() => navigate("/courses")}
            style={{ background: "#646cff", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              style={{ background: "#1e1e3a", borderRadius: "10px", padding: "16px", border: "1px solid #333" }}
            >
              {/* Thumbnail */}
              {enrollment.course_thumbnail ? (
                <img
                  src={`http://127.0.0.1:8000${enrollment.course_thumbnail}`}
                  alt={enrollment.course_title}
                  style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }}
                />
              ) : (
                <div style={{ width: "100%", height: "140px", background: "#2a2a4a", borderRadius: "8px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
                  No Thumbnail
                </div>
              )}

              {/* Course Title */}
              <h3 style={{ marginBottom: "8px" }}>{enrollment.course_title}</h3>

              {/* Enrolled date */}
              <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "12px" }}>
                Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#aaa" }}>Progress</span>
                  <span style={{ fontSize: "13px", color: "#646cff" }}>{enrollment.progress_percent}%</span>
                </div>
                <div style={{ background: "#333", borderRadius: "999px", height: "8px" }}>
                  <div style={{
                    background: enrollment.is_completed ? "#22c55e" : "#646cff",
                    width: `${enrollment.progress_percent}%`,
                    height: "8px",
                    borderRadius: "999px",
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>

              {/* Status Badge */}
              {enrollment.is_completed ? (
                <span style={{ background: "#14532d", color: "#22c55e", padding: "4px 10px", borderRadius: "999px", fontSize: "12px" }}>
                  ✓ Completed
                </span>
              ) : (
                <span style={{ background: "#1e3a5f", color: "#60a5fa", padding: "4px 10px", borderRadius: "999px", fontSize: "12px" }}>
                  In Progress
                </span>
              )}

              {/* Continue Button */}
              <button
                onClick={() => navigate(`/courses/${enrollment.course}`)}
                style={{ width: "100%", marginTop: "12px", background: "#2a2a4a", color: "white", border: "1px solid #444", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
              >
                {enrollment.is_completed ? "Review Course" : "Continue Learning →"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Browse more */}
      {enrollments.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/courses")}
            style={{ background: "transparent", color: "#646cff", border: "1px solid #646cff", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}
          >
            Browse More Courses
          </button>
        </div>
      )}

      {/* Quiz Section */}
      <div style={{
        marginTop: "40px", padding: "32px",
        background: "linear-gradient(135deg, #1e1e3a 0%, #2a1f5e 100%)",
        borderRadius: "16px", border: "1px solid #333",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧠</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
            Test Your Knowledge
          </h2>
          <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
            Take quizzes on Database, AI, Java, Python and more. Challenge yourself with 10 questions per topic!
          </p>
          <button
            onClick={() => navigate("/quizzes")}
            style={{
              background: "linear-gradient(135deg, #6c63ff, #a855f7)",
              color: "white", border: "none",
              padding: "14px 36px", borderRadius: "12px",
              fontSize: "16px", fontWeight: "700",
              cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(108, 99, 255, 0.4)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(108,99,255,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,99,255,0.4)"; }}
          >
            🎯 Start Quizzes →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;