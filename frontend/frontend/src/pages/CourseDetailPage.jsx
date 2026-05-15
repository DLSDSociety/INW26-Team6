import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useContext(AuthContext);
  const isInstructor = role === "instructor" || role === "admin";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (token) checkEnrollment();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/api/courses/${id}/`);
      setCourse(res.data);
    } catch (err) {
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get("/api/enrollments/my-courses/");
      const enrolled = res.data.some((e) => e.course === parseInt(id));
      setIsEnrolled(enrolled);
    } catch (err) {
      console.error("Could not check enrollment", err);
    }
  };

  const handleEnroll = async () => {
    if (!token) { navigate("/login"); return; }
    setEnrolling(true);
    try {
      await api.post("/api/enrollments/enroll/", { course_id: id });
      setIsEnrolled(true);
      setEnrollMessage("Successfully enrolled!");
    } catch (err) {
      const msg = err.response?.data?.error || "Enrollment failed";
      setEnrollMessage(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555", fontSize: "16px" }}>Loading course...</p>
    </div>
  );

  if (error) return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "red", fontSize: "16px" }}>{error}</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 48px", background: "#ffffff",
        borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100
      }}>
        <div
          onClick={() => navigate("/")}
          style={{ fontSize: "22px", fontWeight: "800", color: "#0056d2", cursor: "pointer" }}
        >
          Learning Hub
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => navigate("/courses")}
            style={{ background: "transparent", border: "none", color: "#333", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
          >
            ← Back to Courses
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "#0056d2", color: "white", border: "none", padding: "8px 18px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
          >
            My Dashboard
          </button>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div style={{ background: "#1a1a2e", padding: "48px", color: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: "40px", alignItems: "center" }}>

          {/* Left — course info */}
          <div>
            <span style={{
              background: "#0056d2", color: "white", padding: "4px 12px",
              borderRadius: "4px", fontSize: "12px", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "1px"
            }}>
              {course.category}
            </span>
            <h1 style={{ fontSize: "34px", fontWeight: "800", margin: "16px 0 12px", lineHeight: 1.2 }}>
              {course.title}
            </h1>
            <p style={{ color: "#ccc", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px" }}>
              {course.description}
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ color: "#f59e0b", fontSize: "16px" }}>★</span>
              ))}
              <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "4px" }}>New Course</span>
            </div>
            <p style={{ color: "#aaa", fontSize: "14px" }}>
              Instructor ID: {course.instructor} &nbsp;•&nbsp; {course.lessons?.length || 0} lessons
            </p>
          </div>

          {/* ── Right — card ── */}
          <div style={{
            background: "white", borderRadius: "8px", padding: "24px",
            color: "#1a1a1a", boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
          }}>
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "6px", marginBottom: "16px" }}
              />
            )}

            {isInstructor ? (
              /* ── INSTRUCTOR VIEW: course info card ── */
              <div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#0056d2", marginBottom: "12px" }}>
                  📋 Course Details
                </div>
                <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
                  <div><strong>Category:</strong> {course.category}</div>
                  <div><strong>Total Lessons:</strong> {course.lessons?.length || 0}</div>
                  <div><strong>Enrolled Students:</strong> {course.enrolled_count ?? "N/A"}</div>
                  <div><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "16px", paddingTop: "16px" }}>
                  <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                      width: "100%", background: "#0056d2", color: "white",
                      border: "none", padding: "12px", borderRadius: "4px",
                      fontSize: "15px", fontWeight: "700", cursor: "pointer"
                    }}
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* ── STUDENT VIEW: enrollment card ── */
              <div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#0056d2", marginBottom: "4px" }}>
                  Free
                </div>
                <div style={{ fontSize: "13px", color: "#777", marginBottom: "16px" }}>
                  Full course access included
                </div>

                {isEnrolled ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                    <button
                      onClick={() => navigate(`/course/${id}/learn`)}
                      style={{
                        width: "100%", background: "#0056d2", color: "white",
                        border: "none", padding: "12px", borderRadius: "4px",
                        fontSize: "15px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                      }}
                    >
                      ▶ Continue Learning
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      style={{
                        width: "100%", background: "transparent", color: "#16a34a",
                        border: "2px solid #16a34a", padding: "10px", borderRadius: "4px",
                        fontSize: "14px", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      ✓ Enrolled — Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    style={{
                      width: "100%", background: "#0056d2", color: "white",
                      border: "none", padding: "12px", borderRadius: "4px",
                      fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "10px"
                    }}
                  >
                    {enrolling ? "Enrolling..." : "Enroll for Free"}
                  </button>
                )}

                {enrollMessage && (
                  <p style={{ textAlign: "center", fontSize: "13px", color: isEnrolled ? "#16a34a" : "red", margin: "8px 0 0" }}>
                    {enrollMessage}
                  </p>
                )}

                <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "16px", paddingTop: "16px" }}>
                  {["Full lifetime access", "Watch on any device", "Certificate on completion"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", color: "#555" }}>
                      <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── LESSONS LIST ── */}
      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 48px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "20px", color: "#1a1a1a" }}>
          Course Content
        </h2>
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>
          {course.lessons?.length || 0} lessons
        </p>

        <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "16px 20px",
                  borderBottom: index < course.lessons.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background 0.15s",
                  cursor: (isEnrolled || isInstructor) ? "pointer" : "default"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                // Click on a lesson row directly opens lesson page if enrolled
                onClick={() => (isEnrolled || isInstructor) && navigate(`/course/${id}/learn`)}
              >
                {/* Play icon */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#e8f4ff", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>
                  <span style={{ color: "#0056d2", fontSize: "14px" }}>▶</span>
                </div>

                {/* Lesson info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
                    Lesson {lesson.order_number}
                  </div>
                </div>

                {/* Duration */}
                <div style={{ fontSize: "13px", color: "#777", flexShrink: 0 }}>
                  {lesson.duration}
                </div>

                {/* Lock icon for non-enrolled */}
                {!isEnrolled && !isInstructor && (
                  <span style={{ color: "#bbb", fontSize: "14px" }}>🔒</span>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "#777" }}>
              No lessons available yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default CourseDetailPage;
