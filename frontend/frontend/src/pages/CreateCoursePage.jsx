import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CreateCoursePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      // Use FormData to support file upload (thumbnail)
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      }

      await api.post('/api/courses/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Course created successfully! Redirecting...');
      setTimeout(() => navigate('/instructor/dashboard'), 1500);
    } catch (err) {
      if (err.response?.data) {
        const msgs = Object.values(err.response.data).flat().join(' ');
        setError(msgs || 'Failed to create course.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'UI/UX Design',
    'DevOps',
    'Cybersecurity',
    'Business',
    'Other',
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate('/instructor/dashboard')}>
          ← Back to Dashboard
        </button>

        <h2 style={styles.title}>Create New Course</h2>
        <p style={styles.subtitle}>Fill in the details below to publish a new course.</p>

        {/* Feedback Messages */}
        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Course Title */}
          <div style={styles.field}>
            <label style={styles.label}>Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Complete Python Bootcamp"
              style={styles.input}
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              rows={5}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          {/* Category */}
          <div style={styles.field}>
            <label style={styles.label}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Course Thumbnail (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={styles.fileInput}
            />
            {thumbnailPreview && (
              <img src={thumbnailPreview} alt="Preview" style={styles.preview} />
            )}
          </div>

          {/* Submit */}
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : '🚀 Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f7ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
    fontFamily: 'Segoe UI, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '36px',
    width: '100%',
    maxWidth: '620px',
    boxShadow: '0 4px 24px rgba(79,70,229,0.1)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '20px',
    display: 'block',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '24px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid #d1d5db',
    fontSize: '14px',
    color: '#111',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.2s',
  },
  fileInput: {
    fontSize: '14px',
    padding: '8px 0',
    color: '#555',
  },
  preview: {
    marginTop: '10px',
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  submitBtn: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default CreateCoursePage;