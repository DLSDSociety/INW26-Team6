import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AddLessonPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    order_number: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.order_number) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('course', courseId);
      data.append('order_number', formData.order_number);
      if (videoFile) {
        data.append('video_file', videoFile);
      }

      await api.post('/api/courses/lessons/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Lesson added successfully!');
      setFormData({ title: '', order_number: '' });
      setVideoFile(null);
    } catch (err) {
      if (err.response?.data) {
        const msgs = Object.values(err.response.data).flat().join(' ');
        setError(msgs || 'Failed to add lesson.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/instructor/dashboard')}
        >
          ← Back to Dashboard
        </button>

        <h2 style={styles.title}>Add New Lesson</h2>
        <p style={styles.subtitle}>
          Adding lesson to Course ID: <strong>#{courseId}</strong>
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Lesson Title */}
          <div style={styles.field}>
            <label style={styles.label}>Lesson Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to Variables"
              style={styles.input}
            />
          </div>

          {/* Order Number */}
          <div style={styles.field}>
            <label style={styles.label}>Order Number *</label>
            <input
              type="number"
              name="order_number"
              value={formData.order_number}
              onChange={handleChange}
              placeholder="e.g. 1, 2, 3..."
              min="1"
              style={styles.input}
            />
            <span style={styles.hint}>
              This determines the order lessons appear in the course.
            </span>
          </div>

          {/* Video Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Video File (optional)</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={styles.fileInput}
            />
            {videoFile && (
              <p style={styles.fileInfo}>
                ✅ Selected: {videoFile.name} (
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={styles.btnRow}>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding...' : '+ Add Lesson'}
            </button>
            <button
              type="button"
              style={styles.doneBtn}
              onClick={() => navigate('/instructor/dashboard')}
            >
              Done
            </button>
          </div>
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
    maxWidth: '560px',
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
    fontSize: '22px',
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
    fontFamily: 'inherit',
    backgroundColor: '#fafafa',
    outline: 'none',
  },
  hint: {
    fontSize: '12px',
    color: '#aaa',
  },
  fileInput: {
    fontSize: '14px',
    padding: '8px 0',
    color: '#555',
  },
  fileInfo: {
    fontSize: '13px',
    color: '#16a34a',
    margin: '4px 0 0 0',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#4f46e5',
    color: '#fff',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    color: '#555',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
  },
};

export default AddLessonPage;