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
  const [expandedLesson, setExpandedLesson] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const seedReviews = [
    { name: "Sarah Jenkins", rating: 5, comment: "This course is absolute gold! The explanations are incredibly clear, and the pacing is perfect for beginners and intermediate students alike.", date: "2 weeks ago" },
    { name: "Alex Rodriguez", rating: 4, comment: "Really solid curriculum. The quiz questions were highly relevant to real-world scenarios. Recommended!", date: "1 month ago" },
    { name: "Michael Chen", rating: 5, comment: "Learning Hub has outdone themselves here. The lessons are high-quality, straight to the point, and easy to follow. 10/10.", date: "1 month ago" }
  ];

  useEffect(() => {
    fetchCourse();
    if (token && !isInstructor) checkEnrollment();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      setReviews(seedReviews);
      localStorage.setItem(`reviews_${id}`, JSON.stringify(seedReviews));
    }
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

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    
    const usernameVal = localStorage.getItem("username") || "Active Student";
    const newReview = {
      name: usernameVal.charAt(0).toUpperCase() + usernameVal.slice(1),
      rating: userRating,
      comment: userComment,
      date: "Just now"
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setUserComment("");
    setReviewSubmitted(true);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  const totalDuration = (lessons) => {
    if (!lessons || lessons.length === 0) return "N/A";
    let total = 0;
    lessons.forEach((l) => {
      if (l.duration) {
        const parts = String(l.duration).split(":");
        if (parts.length === 2) total += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        else if (parts.length === 1) total += parseInt(parts[0]);
      }
    });
    if (total === 0) return "N/A";
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
        <div style={{
          maxWidth: "1000px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "40px", alignItems: "start"
        }}>

          {/* Left — course info */}
          <div>
            {isInstructor && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                padding: "4px 12px", borderRadius: "20px", marginBottom: "12px",
                fontSize: "12px", color: "#a5c8ff", fontWeight: "600", letterSpacing: "0.5px"
              }}>
                🎓 Instructor View
              </div>
            )}

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

            {/* Stats row */}
            {isInstructor ? (
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {[
                  { label: "Total Lessons", value: course.lessons?.length || 0, icon: "📚" },
                  { label: "Total Duration", value: totalDuration(course.lessons), icon: "⏱" },
                  { label: "Students Enrolled", value: course.enrolled_count ?? "—", icon: "👥" },
                  { label: "Created", value: new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: "📅" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", marginBottom: "2px" }}>{icon}</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ color: "#fbbf24", fontSize: "16px", fontWeight: "700" }}>★ {averageRating}</span>
                  <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "4px" }}>({reviews.length} ratings)</span>
                  <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "8px" }}>•</span>
                  <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "8px" }}>Interactive Review Verified</span>
                </div>
                <p style={{ color: "#aaa", fontSize: "14px" }}>
                  Instructor ID: {course.instructor} &nbsp;•&nbsp; {course.lessons?.length || 0} lessons
                </p>
              </>
            )}
          </div>

          {/* ── Right Card ── */}
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
              /* ── INSTRUCTOR CARD ── */
              <div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a1a", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #f0f0f0" }}>
                  📋 Course Overview
                </div>

                {/* Stat tiles */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { label: "Lessons", value: course.lessons?.length || 0, color: "#e8f4ff", accent: "#0056d2" },
                    { label: "Enrolled", value: course.enrolled_count ?? "—", color: "#f0fdf4", accent: "#16a34a" },
                    { label: "Category", value: course.category || "—", color: "#fef9ec", accent: "#d97706" },
                    { label: "Duration", value: totalDuration(course.lessons), color: "#f5f0ff", accent: "#7c3aed" },
                  ].map(({ label, value, color, accent }) => (
                    <div key={label} style={{ background: color, borderRadius: "6px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: accent }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
                  Created on {new Date(course.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    width: "100%", background: "#0056d2", color: "white",
                    border: "none", padding: "12px", borderRadius: "4px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "8px"
                  }}
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/course/${id}/learn`)}
                  style={{
                    width: "100%", background: "transparent", color: "#0056d2",
                    border: "2px solid #0056d2", padding: "10px", borderRadius: "4px",
                    fontSize: "14px", fontWeight: "600", cursor: "pointer"
                  }}
                >
                  👁 Preview Course
                </button>
              </div>
            ) : (
              /* ── STUDENT CARD ── */
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

      {/* ── COURSE CONTENT / MODULES ── */}
      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 48px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0, color: "#1a1a1a" }}>
              {isInstructor ? "Course Modules" : "Course Content"}
            </h2>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
              {course.lessons?.length || 0} lessons &nbsp;•&nbsp; {totalDuration(course.lessons)} total
            </p>
          </div>
          {isInstructor && course.lessons?.length > 0 && (
            <button
              onClick={() => navigate(`/course/${id}/learn`)}
              style={{
                background: "#0056d2", color: "white", border: "none",
                padding: "10px 20px", borderRadius: "4px", fontSize: "13px",
                fontWeight: "700", cursor: "pointer"
              }}
            >
              👁 Preview All
            </button>
          )}
        </div>

        <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, index) => {
              const isExpanded = expandedLesson === lesson.id;
              return (
                <div
                  key={lesson.id}
                  style={{ borderBottom: index < course.lessons.length - 1 ? "1px solid #f0f0f0" : "none" }}
                >
                  {/* Lesson Row */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      background: isExpanded ? "#f0f7ff" : "white",
                    }}
                    onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "#f9f9f9"; }}
                    onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "white"; }}
                    onClick={() => {
                      if (isInstructor) {
                        setExpandedLesson(isExpanded ? null : lesson.id);
                      } else if (isEnrolled) {
                        navigate(`/course/${id}/learn`);
                      }
                    }}
                  >
                    {/* Lesson number badge */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: isInstructor ? "#e8f4ff" : (isEnrolled ? "#e8f4ff" : "#f5f5f5"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontWeight: "700", fontSize: "13px",
                      color: isInstructor ? "#0056d2" : (isEnrolled ? "#0056d2" : "#aaa"),
                    }}>
                      {isInstructor ? (
                        <span style={{ fontSize: "14px" }}>▶</span>
                      ) : isEnrolled ? (
                        <span style={{ fontSize: "14px" }}>▶</span>
                      ) : (
                        <span style={{ fontSize: "14px" }}>🔒</span>
                      )}
                    </div>

                    {/* Lesson info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
                        Lesson {lesson.order_number}
                        {lesson.duration && ` • ${lesson.duration}`}
                      </div>
                    </div>

                    {/* Right side */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      {lesson.duration && (
                        <span style={{ fontSize: "13px", color: "#777" }}>{lesson.duration}</span>
                      )}
                      {isInstructor && (
                        <span style={{
                          fontSize: "11px", color: isExpanded ? "#0056d2" : "#aaa",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s", display: "inline-block",
                          fontWeight: "700"
                        }}>▼</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail (Instructor only) */}
                  {isInstructor && isExpanded && (
                    <div style={{
                      padding: "0 20px 20px 72px",
                      background: "#f8fbff",
                      borderTop: "1px solid #e8f0ff",
                      animation: "fadeIn 0.2s ease"
                    }}>
                      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "14px", marginTop: "14px" }}>
                        <div style={{ background: "white", borderRadius: "6px", padding: "10px 12px", border: "1px solid #e8f0ff" }}>
                          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order</div>
                          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0056d2" }}>#{lesson.order_number}</div>
                        </div>
                        <div style={{ background: "white", borderRadius: "6px", padding: "10px 12px", border: "1px solid #e8f0ff" }}>
                          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Duration</div>
                          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0056d2" }}>{lesson.duration || "—"}</div>
                        </div>
                        <div style={{ background: "white", borderRadius: "6px", padding: "10px 12px", border: "1px solid #e8f0ff" }}>
                          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Materials</div>
                          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0056d2" }}>{lesson.materials?.length || 0}</div>
                        </div>
                      </div>

                      {lesson.materials && lesson.materials.length > 0 && (
                        <div style={{ marginBottom: "14px" }}>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Attachments
                          </div>
                          {lesson.materials.map((m, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              fontSize: "13px", color: "#444", marginBottom: "4px"
                            }}>
                              <span>{m.material_type === "PDF" ? "📄" : m.material_type === "Video" ? "🎬" : "📎"}</span>
                              <span>{m.file?.split("/").pop() || m.material_type}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/course/${id}/learn`)}
                        style={{
                          background: "#0056d2", color: "white", border: "none",
                          padding: "8px 18px", borderRadius: "4px", fontSize: "13px",
                          fontWeight: "700", cursor: "pointer"
                        }}
                      >
                        ▶ Preview This Lesson
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "#777" }}>
              No lessons available yet.
            </div>
          )}
        </div>
      </div>

      {/* ── STUDENT REVIEWS & RATINGS SYSTEM ── */}
      <div style={{ maxWidth: "1000px", margin: "48px auto 80px auto", padding: "0 48px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "24px", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⭐</span> Student Reviews & Ratings
        </h2>

        {/* Rating Metrics Header */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "240px 1fr", 
          gap: "40px", 
          background: "#ffffff", 
          border: "1px solid #e0e0e0", 
          borderRadius: "8px", 
          padding: "32px",
          marginBottom: "32px",
          alignItems: "center"
        }}>
          {/* Left Summary Box */}
          <div style={{ textAlign: "center", borderRight: "1px solid #f0f0f0", paddingRight: "40px" }}>
            <div style={{ fontSize: "56px", fontWeight: "800", color: "#0056d2", lineHeight: 1 }}>{averageRating}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", margin: "12px 0 6px 0" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ color: s <= Math.round(averageRating) ? "#fbbf24" : "#e2e8f0", fontSize: "18px" }}>★</span>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Course Rating ({reviews.length} reviews)</div>
          </div>

          {/* Right Rating bars */}
          <div>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ width: "48px", color: "#444", fontWeight: "600", textAlign: "right" }}>{stars} stars</span>
                  <div style={{ flexGrow: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#fbbf24", borderRadius: "4px" }}></div>
                  </div>
                  <span style={{ width: "32px", color: "#888", fontWeight: "500" }}>{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add a Review form (Only shown if enrolled & student) */}
        {isEnrolled && !isInstructor && (
          <div style={{ 
            background: "#ffffff", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px", 
            padding: "28px", 
            marginBottom: "32px" 
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#1a1a1a" }}>
              Share Your Thoughts
            </h3>

            {reviewSubmitted ? (
              <div style={{ 
                background: "#f0fdf4", 
                border: "1px solid #bbf7d0", 
                color: "#16a34a", 
                borderRadius: "6px", 
                padding: "16px", 
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>✓</span> Review posted successfully! Thank you for supporting your fellow learners.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {/* Interactive Star rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#444" }}>Your Rating:</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        style={{ 
                          color: star <= userRating ? "#fbbf24" : "#cbd5e1", 
                          fontSize: "24px", 
                          cursor: "pointer",
                          transition: "transform 0.1s"
                        }}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.15)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1.0)"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Textarea */}
                <div style={{ marginBottom: "16px" }}>
                  <textarea
                    rows="3"
                    placeholder="Write your review here... What did you like? What could be improved?"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      padding: "12px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    background: "#0056d2", 
                    color: "white", 
                    border: "none", 
                    padding: "10px 24px", 
                    borderRadius: "4px", 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 86, 210, 0.1)"
                  }}
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((r, idx) => (
            <div key={idx} style={{ 
              background: "#ffffff", 
              border: "1px solid #e0e0e0", 
              borderRadius: "8px", 
              padding: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              animation: idx === 0 ? "fadeInReview 0.3s ease" : "none"
            }}>
              <style>{`@keyframes fadeInReview { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{r.name}</div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ color: star <= r.rating ? "#fbbf24" : "#e2e8f0", fontSize: "13px" }}>★</span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>{r.date}</span>
              </div>
              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6, margin: 0 }}>
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default CourseDetailPage;