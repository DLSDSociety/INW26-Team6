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
  const [showDropdown, setShowDropdown] = useState(false);
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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".cp-search-wrap")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filtered list of courses specifically for the quick search dropdown
  const dropdownCourses = search.trim()
    ? courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : courses.slice(0, 4);

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
              onFocus={() => setShowDropdown(true)}
            />
            {search && (
              <button className="cp-clear-search-btn" onClick={() => setSearch("")}>✕</button>
            )}

            {/* Custom Autocomplete Dropdown */}
            {showDropdown && (
              <div className="cp-search-dropdown">
                <div className="cp-search-dropdown-header">
                  {search.trim() ? "Matching Courses" : "Featured Courses"}
                </div>
                <div className="cp-search-dropdown-list">
                  {dropdownCourses.length > 0 ? (
                    dropdownCourses.map((c) => (
                      <div
                        key={c.id}
                        className="cp-search-dropdown-item"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(`/courses/${c.id}`);
                        }}
                      >
                        <div className="cp-sdi-thumb">
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt={c.title} />
                          ) : (
                            <span>📚</span>
                          )}
                        </div>
                        <div className="cp-sdi-info">
                          <span className="cp-sdi-category">{c.category || "Course"}</span>
                          <span className="cp-sdi-title">{c.title}</span>
                        </div>
                        <div className="cp-sdi-arrow">→</div>
                      </div>
                    ))
                  ) : (
                    <div className="cp-search-dropdown-empty">
                      No courses found matching "{search}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="cp-body">
        
        {/* CATEGORY DROP-DOWN FILTER */}
        <section className="cp-category-filter-section">
          <div className="cp-category-dropdown-wrapper">
            <h2 className="cp-section-subtitle" style={{ marginBottom: "4px" }}>Browse by Category</h2>
            <div className="cp-category-select-custom-wrap">
              <select
                id="category-select"
                value={categoryParam || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    searchParams.set("category", val);
                  } else {
                    searchParams.delete("category");
                  }
                  setSearchParams(searchParams);
                }}
                className="cp-category-dropdown-select"
              >
                <option value="">📁 All Categories (Show All)</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <span className="cp-category-select-arrow">▼</span>
            </div>
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