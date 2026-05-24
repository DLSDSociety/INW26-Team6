import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", password: "" });
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
      const response = await api.post("/api/users/login/", formData);
      login(
        response.data.access,
        response.data.refresh,
        response.data.role,
        response.data.username
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
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
          <span style={{ color: "#777", fontSize: "14px" }}>New to Learning Hub?</span>
          <Link to="/register">
            <button style={{ background: "transparent", color: "#0056d2", border: "2px solid #0056d2", padding: "7px 16px", borderRadius: "4px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
              Join for Free
            </button>
          </Link>
        </div>
      </nav>

      <div className="auth-body">

        {/* LEFT */}
        <div className="auth-left">
          <h2>Welcome back to Learning Hub</h2>
          <p>Continue your learning journey and track your progress across all your courses.</p>
          <div className="auth-features">
            {[
              { icon: "🎬", text: "Access all your enrolled courses" },
              { icon: "📊", text: "Track your learning progress" },
              { icon: "🏅", text: "Earn certificates on completion" },
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
            <h1>Log In</h1>
            <p className="auth-subtitle">Enter your credentials to continue learning</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <p className="auth-footer-text">
              Don't have an account? <Link to="/register">Join for Free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;