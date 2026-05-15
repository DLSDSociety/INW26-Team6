import LessonMaterials from '../components/LessonMaterials';
import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/LessonPage.css";

export default function LessonPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isInstructor = role === "instructor" || role === "admin";

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [enrollmentId, setEnrollmentId] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const courseRes = await api.get(`/api/courses/${courseId}/`);
        const fetchedLessons = courseRes.data.lessons || [];
        setLessons(fetchedLessons);

        if (isInstructor) {
          // Instructors don't need enrollment data
          setCurrentLesson(fetchedLessons[0]);
        } else {
          const enrollRes = await api.get(`/api/enrollments/my-courses/`);
          const enrollment = enrollRes.data.find(
            (e) => String(e.course_id) === String(courseId) || String(e.course) === String(courseId)
          );

          if (enrollment) {
            setEnrollmentId(enrollment.id);
            const doneIds = new Set(
              (enrollment.progress || [])
                .filter((p) => p.is_completed)
                .map((p) => p.lesson)
            );
            setCompletedLessons(doneIds);

            if (fetchedLessons.length > 0) {
              setProgress(Math.round((doneIds.size / fetchedLessons.length) * 100));
            }

            const firstIncomplete = fetchedLessons.find((l) => !doneIds.has(l.id));
            setCurrentLesson(firstIncomplete || fetchedLessons[0]);
          } else {
            setCurrentLesson(fetchedLessons[0]);
          }
        }
      } catch (err) {
        setError("Failed to load course content.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentLesson]);

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || completedLessons.has(currentLesson.id)) return;
    setMarking(true);
    try {
      await api.patch(`/api/enrollments/complete-lesson/`, {
        lesson_id: currentLesson.id,
        enrollment_id: enrollmentId,
      });

      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);
      setProgress(Math.round((newCompleted.size / lessons.length) * 100));

      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => {
          setCurrentLesson(lessons[currentIndex + 1]);
        }, 800);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete", err);
    } finally {
      setMarking(false);
    }
  };

  const getVideoUrl = (lesson) => {
    if (!lesson?.video_file) return null;
    if (lesson.video_file.startsWith("http")) return lesson.video_file;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}${lesson.video_file}`;
  };

  const getMaterialUrl = (material) => {
    if (!material?.file) return "#";
    if (material.file.startsWith("http")) return material.file;
    return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}${material.file}`;
  };

  // ── Force download instead of opening in browser ──
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="lesson-spinner" />
        <p>Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const isCurrentDone = currentLesson && completedLessons.has(currentLesson.id);

  return (
    <div className="lesson-page">
      {/* ── Top Bar ── */}
      <div className="lesson-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Course
        </button>
        {isInstructor ? (
          <div className="topbar-progress">
            <span className="progress-label" style={{ color: "#0056d2", fontWeight: 700 }}>📋 Instructor Preview</span>
          </div>
        ) : (
          <div className="topbar-progress">
            <span className="progress-label">{progress}% complete</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="lesson-body">
        {/* ── Left Sidebar ── */}
        <aside className="lesson-sidebar">
          <h3 className="sidebar-title">Course Lessons</h3>
          <ul className="lesson-list">
            {lessons.map((lesson, index) => {
              const done = !isInstructor && completedLessons.has(lesson.id);
              const active = currentLesson?.id === lesson.id;
              return (
                <li
                  key={lesson.id}
                  className={`lesson-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => handleSelectLesson(lesson)}
                >
                  <span className="lesson-check">
                    {done ? "✓" : <span className="lesson-num">{index + 1}</span>}
                  </span>
                  <span className="lesson-title-text">{lesson.title}</span>
                  {lesson.duration && (
                    <span className="lesson-duration">{lesson.duration}m</span>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Main Content ── */}
        <main className="lesson-main">
          {currentLesson ? (
            <>
              <h2 className="current-lesson-title">{currentLesson.title}</h2>

              {/* Video Player */}
              <div className="video-wrapper">
                {getVideoUrl(currentLesson) ? (
                  <video
                    ref={videoRef}
                    className="video-player"
                    controls
                    controlsList="nodownload"
                  >
                    <source src={getVideoUrl(currentLesson)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="video-placeholder">
                    <span>🎬</span>
                    <p>No video available for this lesson.</p>
                  </div>
                )}
              </div>

              {/* ── Lesson Materials ── */}
              <LessonMaterials lessonId={currentLesson.id} />

              {/* Lesson Actions */}
              <div className="lesson-actions">
                {isInstructor ? (
                  /* Instructor: lesson info only, no mark-complete */
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#555", background: "#f0f4ff", padding: "6px 14px", borderRadius: "6px", fontWeight: 600 }}>
                      📖 Lesson {currentLesson.order_number}
                    </span>
                    {currentLesson.duration && (
                      <span style={{ fontSize: "13px", color: "#555", background: "#f0f4ff", padding: "6px 14px", borderRadius: "6px", fontWeight: 600 }}>
                        ⏱ Duration: {currentLesson.duration}m
                      </span>
                    )}
                  </div>
                ) : (
                  /* Student: mark-complete button */
                  <>
                    {isCurrentDone ? (
                      <button className="complete-btn done-btn" disabled>
                        ✓ Lesson Completed
                      </button>
                    ) : (
                      <button
                        className="complete-btn"
                        onClick={handleMarkComplete}
                        disabled={marking}
                      >
                        {marking ? "Saving..." : "✓ Mark as Complete"}
                      </button>
                    )}
                  </>
                )}

                {(() => {
                  const idx = lessons.findIndex((l) => l.id === currentLesson.id);
                  return idx < lessons.length - 1 ? (
                    <button
                      className="next-btn"
                      onClick={() => setCurrentLesson(lessons[idx + 1])}
                    >
                      Next Lesson →
                    </button>
                  ) : (
                    <span className="course-done-tag">🎉 Last Lesson</span>
                  );
                })()}
              </div>

              {/* Downloadable Materials */}
              {currentLesson.materials && currentLesson.materials.length > 0 && (
                <div className="materials-section">
                  <h4>📎 Lesson Materials</h4>
                  <ul className="materials-list">
                    {currentLesson.materials.map((mat, i) => {
                      const fileUrl = getMaterialUrl(mat);
                      const fileName = mat.file?.split("/").pop() || `Material ${i + 1}`;
                      return (
                        <li key={i} className="material-item">
                          <span className="mat-icon">
                            {mat.material_type === "pdf"
                              ? "📄"
                              : mat.material_type === "video"
                              ? "🎬"
                              : "📁"}
                          </span>
                          <span>{fileName}</span>
                          <span className="mat-type">{mat.material_type?.toUpperCase()}</span>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(fileUrl, fileName)}
                          >
                            ⬇ Download
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="no-lesson">
              <p>Select a lesson to begin watching.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}