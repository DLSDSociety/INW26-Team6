import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoursesPage.css";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, role } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const categories = [
    { name: "IT & Software", icon: "💻" },
    { name: "Data Science", icon: "📊" },
    { name: "Artificial Intelligence", icon: "🤖" },
    { name: "Digital Marketing", icon: "📈" },
    { name: "Cloud Computing", icon: "☁️" },
    { name: "Cybersecurity", icon: "🔒" },
    { name: "Design", icon: "🎨" },
    { name: "Business", icon: "💼" }
  ];

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

  const handleCategoryClick = (catName) => {
    if (categoryParam === catName) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catName);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    searchParams.delete("category");
    searchParams.delete("search");
    setSearchParams(searchParams);
    setSearch("");
  };

  // Filtering Logic
  const filtered = courses.filter((c) => {
    const matchesCategory = categoryParam
      ? c.category && c.category.toLowerCase() === categoryParam.toLowerCase()
      : true;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "alphabetical-desc") {
      return b.title.localeCompare(a.title);
    } else {
      return b.id - a.id;
    }
  });

  return (
    <div className="cp-page">

      {/* NAVBAR */}
      <nav className="cp-navbar">
        <div className="cp-navbar-logo" onClick={() => navigate("/")}>
          <span className="cp-logo-spark">⚡</span> Learning Hub
        </div>
        <div className="cp-navbar-links">
          <Link to="/" className="cp-nav-link">Home</Link>
          <Link to="/quizzes" className="cp-nav-link">Quizzes</Link>
          {token ? (
            <button className="cp-navbar-btn" onClick={() => navigate("/dashboard")}>
              {role === "student" ? "My Learning" : "Dashboard"}
            </button>
          ) : (
            <button className="cp-navbar-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* HERO HEADER */}
      <div className="cp-hero">
        <div className="cp-hero-overlay-grid"></div>
        <div className="cp-hero-content">
          <span className="cp-hero-badge">🌍 Join 100,000+ Students</span>
          <h1>Master In-Demand Skills</h1>
          <p>Explore professional expert-led courses across multiple high-income career tracks — 100% Free.</p>
          
          <div className="cp-search-wrap">
            <span className="cp-search-icon">🔍</span>
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="cp-clear-search-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="cp-body">
        
        {/* CATEGORY FAST-FILTER CONTAINER */}
        <section className="cp-category-scroll-section">
          <h2 className="cp-section-subtitle">Browse by Category</h2>
          <div className="cp-category-scroll-container">
            {categories.map((cat) => {
              const isActive = categoryParam?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  className={`cp-category-pill-card ${isActive ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <span className="cp-cat-pill-icon">{cat.icon}</span>
                  <span className="cp-cat-pill-name">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTROLS HEADER */}
        <div className="cp-controls-header">
          <div>
            <p className="cp-count">
              Found <strong>{sorted.length}</strong> premium courses
            </p>
            {(categoryParam || search) && (
              <button className="cp-reset-filters-btn" onClick={handleClearFilters}>
                Clear Active Filters ✕
              </button>
            )}
          </div>

          <div className="cp-controls-right">
            <div className="cp-sort-wrapper">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="alphabetical">Title: A to Z</option>
                <option value="alphabetical-desc">Title: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* COURSES LISTINGS */}
        {loading ? (
          <div className="cp-loading-state">
            <div className="cp-spinner"></div>
            <p>Gathering courses database...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">📂</div>
            <h3>No courses fit your criteria</h3>
            <p>Try refining your search terms or choosing a different category path.</p>
            <button className="cp-navbar-btn" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="cp-grid">
            {sorted.map((course) => (
              <div
                key={course.id}
                className="cp-card"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="cp-card-thumb-container">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="cp-card-thumb"
                    />
                  ) : (
                    <div className="cp-card-thumb-placeholder">🎓</div>
                  )}
                  <span className="cp-card-badge-floating">{course.category}</span>
                </div>

                <div className="cp-card-body">
                  <h3 className="cp-card-title" title={course.title}>{course.title}</h3>
                  <p className="cp-card-desc">{course.description}</p>
                  
                  <div className="cp-card-metrics-row">
                    <div className="cp-rating-wrap">
                      <span className="cp-star-icon">★</span>
                      <span className="cp-rating-score">4.9</span>
                      <span className="cp-rating-count">(1,240 reviews)</span>
                    </div>
                  </div>

                  <div className="cp-card-footer">
                    <span className="cp-card-level">All Levels</span>
                    <span className="cp-card-tag-badge">Free Access</span>
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