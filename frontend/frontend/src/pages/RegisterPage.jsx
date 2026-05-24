import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "student" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/users/register/", formData);
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.username) setError(`Username: ${msg.username[0]}`);
      else if (msg?.email) setError(`Email: ${msg.email[0]}`);
      else if (msg?.password) setError(`Password: ${msg.password[0]}`);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* NAVBAR */}
      <nav className="auth-navbar">
        <Link to="/" className="auth-navbar-logo">Learning Hub</Link>
        <div className="auth-navbar-links">
          <span style={{ color: "#777", fontSize: "14px" }}>Already have an account?</span>
          <Link to="/login">
            <button style={{ background: "transparent", color: "#0056d2", border: "2px solid #0056d2", padding: "7px 16px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
              Log In
            </button>
          </Link>
        </div>
      </nav>

      <div className="auth-body">

        {/* LEFT */}
        <div className="auth-left">
          <h2>Start learning for free today</h2>
          <p>Join hundreds of students already growing their skills on Learning Hub.</p>
          <div className="auth-features">
            {[
              { icon: "📚", text: "Access all courses for free" },
              { icon: "🎯", text: "Learn at your own pace" },
              { icon: "🚀", text: "Build real-world skills" },
              { icon: "🏅", text: "Earn completion certificates" },
            ].map((f) => (
              <div key={f.text} className="auth-feature-item">
                <div className="auth-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-card">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Join Learning Hub — it's completely free</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label>I am a</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Creating account..." : "Join for Free"}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;