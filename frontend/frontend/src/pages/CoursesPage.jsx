
// export default CoursesPage;
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoursesPage.css";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, role } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/courses/");
      setCourses(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesCategory = categoryParam
      ? c.category && c.category.toLowerCase() === categoryParam.toLowerCase()
      : true;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="courses-page">

      {/* NAVBAR */}
      <nav className="courses-navbar">
        <div className="courses-navbar-logo" onClick={() => navigate("/")}>
          Learning Hub
        </div>
        <div className="courses-navbar-links">
          <Link to="/">Home</Link>
          {token ? (
            <button className="courses-navbar-btn" onClick={() => navigate("/dashboard")}>
              {role === "student" ? "My Learning" : "Dashboard"}
            </button>
          ) : (
            <button className="courses-navbar-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <div className="courses-header">
        <h1>Explore All Courses</h1>
        <p>Learn new skills from expert instructors</p>
        <div className="courses-search-wrap">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      {/* GRID */}
      <div className="courses-body">
        {categoryParam && (
          <div className="category-filter-badge" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#0056d2",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "20px"
          }}>
            Showing Category: {categoryParam}
            <button 
              onClick={() => {
                searchParams.delete("category");
                setSearchParams(searchParams);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#0056d2",
                fontWeight: "800",
                cursor: "pointer",
                padding: "0 4px",
                fontSize: "14px"
              }}
            >
              ✕
            </button>
          </div>
        )}
        <p className="courses-count">{filtered.length} courses available</p>

        {loading ? (
          <p style={{ color: "#777", textAlign: "center" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="courses-empty">
            <p>No courses found for "{search}"</p>
            <button className="courses-navbar-btn" onClick={() => setSearch("")}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="course-card-thumb"
                  />
                ) : (
                  <div className="course-card-thumb-placeholder">📚</div>
                )}

                <div className="course-card-body">
                  <div className="course-card-category">{course.category}</div>
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">{course.description}</p>
                  <div className="course-card-footer">
                    <div className="course-card-stars">
                      {[1,2,3,4,5].map((s) => <span key={s}>★</span>)}
                    </div>
                    <span className="course-card-tag">Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default CoursesPage;