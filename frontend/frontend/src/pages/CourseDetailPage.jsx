// import { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../services/api";
// import { AuthContext } from "../context/AuthContext";

// function CourseDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { token, role } = useContext(AuthContext);
//   const isInstructor = role === "instructor" || role === "admin";

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [enrolling, setEnrolling] = useState(false);
//   const [enrollMessage, setEnrollMessage] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);

//   useEffect(() => {
//     fetchCourse();
//     if (token) checkEnrollment();
//   }, [id]);

//   const fetchCourse = async () => {
//     try {
//       const res = await api.get(`/api/courses/${id}/`);
//       setCourse(res.data);
//     } catch (err) {
//       setError("Failed to load course");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkEnrollment = async () => {
//     try {
//       const res = await api.get("/api/enrollments/my-courses/");
//       const enrolled = res.data.some((e) => e.course === parseInt(id));
//       setIsEnrolled(enrolled);
//     } catch (err) {
//       console.error("Could not check enrollment", err);
//     }
//   };

//   const handleEnroll = async () => {
//     if (!token) { navigate("/login"); return; }
//     setEnrolling(true);
//     try {
//       await api.post("/api/enrollments/enroll/", { course_id: id });
//       setIsEnrolled(true);
//       setEnrollMessage("Successfully enrolled!");
//     } catch (err) {
//       const msg = err.response?.data?.error || "Enrollment failed";
//       setEnrollMessage(msg);
//     } finally {
//       setEnrolling(false);
//     }
//   };

//   if (loading) return (
//     <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <p style={{ color: "#555", fontSize: "16px" }}>Loading course...</p>
//     </div>
//   );

//   if (error) return (
//     <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <p style={{ color: "red", fontSize: "16px" }}>{error}</p>
//     </div>
//   );

//   return (
//     <div style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", color: "#1a1a1a" }}>

//       {/* ── NAVBAR ── */}
//       <nav style={{
//         display: "flex", justifyContent: "space-between", alignItems: "center",
//         padding: "14px 48px", background: "#ffffff",
//         borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100
//       }}>
//         <div
//           onClick={() => navigate("/")}
//           style={{ fontSize: "22px", fontWeight: "800", color: "#0056d2", cursor: "pointer" }}
//         >
//           Learning Hub
//         </div>
//         <div style={{ display: "flex", gap: "16px" }}>
//           <button
//             onClick={() => navigate("/courses")}
//             style={{ background: "transparent", border: "none", color: "#333", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
//           >
//             ← Back to Courses
//           </button>
//           <button
//             onClick={() => navigate("/dashboard")}
//             style={{ background: "#0056d2", color: "white", border: "none", padding: "8px 18px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
//           >
//             My Dashboard
//           </button>
//         </div>
//       </nav>

//       {/* ── HERO BANNER ── */}
//       <div style={{ background: "#1a1a2e", padding: "48px", color: "white" }}>
//         <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: "40px", alignItems: "center" }}>

//           {/* Left — course info */}
//           <div>
//             <span style={{
//               background: "#0056d2", color: "white", padding: "4px 12px",
//               borderRadius: "4px", fontSize: "12px", fontWeight: "700",
//               textTransform: "uppercase", letterSpacing: "1px"
//             }}>
//               {course.category}
//             </span>
//             <h1 style={{ fontSize: "34px", fontWeight: "800", margin: "16px 0 12px", lineHeight: 1.2 }}>
//               {course.title}
//             </h1>
//             <p style={{ color: "#ccc", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px" }}>
//               {course.description}
//             </p>
//             <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
//               {[1,2,3,4,5].map((s) => (
//                 <span key={s} style={{ color: "#f59e0b", fontSize: "16px" }}>★</span>
//               ))}
//               <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "4px" }}>New Course</span>
//             </div>
//             <p style={{ color: "#aaa", fontSize: "14px" }}>
//               Instructor ID: {course.instructor} &nbsp;•&nbsp; {course.lessons?.length || 0} lessons
//             </p>
//           </div>

//           {/* ── Right — card ── */}
//           <div style={{
//             background: "white", borderRadius: "8px", padding: "24px",
//             color: "#1a1a1a", boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
//           }}>
//             {course.thumbnail && (
//               <img
//                 src={course.thumbnail}
//                 alt={course.title}
//                 style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "6px", marginBottom: "16px" }}
//               />
//             )}

//             {isInstructor ? (
//               /* ── INSTRUCTOR VIEW: course info card ── */
//               <div>
//                 <div style={{ fontSize: "18px", fontWeight: "800", color: "#0056d2", marginBottom: "12px" }}>
//                   📋 Course Details
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
//                   <div><strong>Category:</strong> {course.category}</div>
//                   <div><strong>Total Lessons:</strong> {course.lessons?.length || 0}</div>
//                   <div><strong>Enrolled Students:</strong> {course.enrolled_count ?? "N/A"}</div>
//                   <div><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</div>
//                 </div>
//                 <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "16px", paddingTop: "16px" }}>
//                   <button
//                     onClick={() => navigate("/dashboard")}
//                     style={{
//                       width: "100%", background: "#0056d2", color: "white",
//                       border: "none", padding: "12px", borderRadius: "4px",
//                       fontSize: "15px", fontWeight: "700", cursor: "pointer"
//                     }}
//                   >
//                     ← Back to Dashboard
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               /* ── STUDENT VIEW: enrollment card ── */
//               <div>
//                 <div style={{ fontSize: "24px", fontWeight: "800", color: "#0056d2", marginBottom: "4px" }}>
//                   Free
//                 </div>
//                 <div style={{ fontSize: "13px", color: "#777", marginBottom: "16px" }}>
//                   Full course access included
//                 </div>

//                 {isEnrolled ? (
//                   <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
//                     <button
//                       onClick={() => navigate(`/course/${id}/learn`)}
//                       style={{
//                         width: "100%", background: "#0056d2", color: "white",
//                         border: "none", padding: "12px", borderRadius: "4px",
//                         fontSize: "15px", fontWeight: "700", cursor: "pointer",
//                         display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
//                       }}
//                     >
//                       ▶ Continue Learning
//                     </button>
//                     <button
//                       onClick={() => navigate("/dashboard")}
//                       style={{
//                         width: "100%", background: "transparent", color: "#16a34a",
//                         border: "2px solid #16a34a", padding: "10px", borderRadius: "4px",
//                         fontSize: "14px", fontWeight: "600", cursor: "pointer"
//                       }}
//                     >
//                       ✓ Enrolled — Go to Dashboard
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={handleEnroll}
//                     disabled={enrolling}
//                     style={{
//                       width: "100%", background: "#0056d2", color: "white",
//                       border: "none", padding: "12px", borderRadius: "4px",
//                       fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "10px"
//                     }}
//                   >
//                     {enrolling ? "Enrolling..." : "Enroll for Free"}
//                   </button>
//                 )}

//                 {enrollMessage && (
//                   <p style={{ textAlign: "center", fontSize: "13px", color: isEnrolled ? "#16a34a" : "red", margin: "8px 0 0" }}>
//                     {enrollMessage}
//                   </p>
//                 )}

//                 <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "16px", paddingTop: "16px" }}>
//                   {["Full lifetime access", "Watch on any device", "Certificate on completion"].map((item) => (
//                     <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", color: "#555" }}>
//                       <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span> {item}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//         </div>
//       </div>

//       {/* ── LESSONS LIST ── */}
//       <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 48px" }}>
//         <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "20px", color: "#1a1a1a" }}>
//           Course Content
//         </h2>
//         <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>
//           {course.lessons?.length || 0} lessons
//         </p>

//         <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
//           {course.lessons && course.lessons.length > 0 ? (
//             course.lessons.map((lesson, index) => (
//               <div
//                 key={lesson.id}
//                 style={{
//                   display: "flex", alignItems: "center", gap: "16px",
//                   padding: "16px 20px",
//                   borderBottom: index < course.lessons.length - 1 ? "1px solid #f0f0f0" : "none",
//                   transition: "background 0.15s",
//                   cursor: (isEnrolled || isInstructor) ? "pointer" : "default"
//                 }}
//                 onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
//                 onMouseLeave={(e) => e.currentTarget.style.background = "white"}
//                 // Click on a lesson row directly opens lesson page if enrolled
//                 onClick={() => (isEnrolled || isInstructor) && navigate(`/course/${id}/learn`)}
//               >
//                 {/* Play icon */}
//                 <div style={{
//                   width: "36px", height: "36px", borderRadius: "50%",
//                   background: "#e8f4ff", display: "flex", alignItems: "center",
//                   justifyContent: "center", flexShrink: 0
//                 }}>
//                   <span style={{ color: "#0056d2", fontSize: "14px" }}>▶</span>
//                 </div>

//                 {/* Lesson info */}
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>
//                     {lesson.title}
//                   </div>
//                   <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>
//                     Lesson {lesson.order_number}
//                   </div>
//                 </div>

//                 {/* Duration */}
//                 <div style={{ fontSize: "13px", color: "#777", flexShrink: 0 }}>
//                   {lesson.duration}
//                 </div>

//                 {/* Lock icon for non-enrolled */}
//                 {!isEnrolled && !isInstructor && (
//                   <span style={{ color: "#bbb", fontSize: "14px" }}>🔒</span>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div style={{ padding: "32px", textAlign: "center", color: "#777" }}>
//               No lessons available yet.
//             </div>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// }

// export default CourseDetailPage;


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

  useEffect(() => {
    fetchCourse();
    if (token && !isInstructor) checkEnrollment();
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

  const totalDuration = (lessons) => {
    if (!lessons || lessons.length === 0) return "N/A";
    // If duration is a string like "10:30", sum minutes
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
            {/* Instructor badge */}
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

            {/* Stats row — shown for both, but different data */}
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
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ color: "#f59e0b", fontSize: "16px" }}>★</span>
                  ))}
                  <span style={{ color: "#aaa", fontSize: "14px", marginLeft: "4px" }}>New Course</span>
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
                        // Toggle expand for instructor
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

                  {/* ── EXPANDED DETAIL (Instructor only) ── */}
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

                      {/* Materials list if any */}
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

    </div>
  );
}

export default CourseDetailPage;