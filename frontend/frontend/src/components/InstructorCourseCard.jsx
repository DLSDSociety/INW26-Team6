import React from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorCourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      {/* Thumbnail */}
      {course.thumbnail ? (
        <img
          src={`http://localhost:8000${course.thumbnail}`}
          alt={course.title}
          style={styles.thumbnail}
        />
      ) : (
        <div style={styles.placeholderThumb}>
          <span style={styles.thumbIcon}>📚</span>
        </div>
      )}

      {/* Course Info */}
      <div style={styles.body}>
        <span style={styles.category}>{course.category || 'General'}</span>
        <h3 style={styles.courseTitle}>{course.title}</h3>
        <p style={styles.description}>
          {course.description?.length > 100
            ? course.description.substring(0, 100) + '...'
            : course.description}
        </p>

        {/* Student Count */}
        <div style={styles.meta}>
          <span style={styles.studentCount}>
            👥 {course.enrolled_count || 0} students enrolled
          </span>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            style={styles.editBtn}
            onClick={() => navigate(`/instructor/edit-course/${course.id}`)}
          >
            ✏️ Edit
          </button>
          <button
            style={styles.lessonBtn}
            onClick={() => navigate(`/instructor/add-lesson/${course.id}`)}
          >
            + Add Lesson
          </button>
          <button
            style={styles.deleteBtn}
            onClick={() => onDelete(course.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #eee',
  },
  thumbnail: {
    width: '100%',
    height: '170px',
    objectFit: 'cover',
  },
  placeholderThumb: {
    width: '100%',
    height: '170px',
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    fontSize: '48px',
  },
  body: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  category: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  courseTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
  },
  description: {
    fontSize: '13px',
    color: '#777',
    lineHeight: '1.5',
    margin: 0,
  },
  meta: {
    marginTop: '4px',
  },
  studentCount: {
    fontSize: '13px',
    color: '#555',
    backgroundColor: '#f0f0f0',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  editBtn: {
    flex: 1,
    padding: '9px 0',
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '7px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  lessonBtn: {
    flex: 1,
    padding: '9px 0',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    border: 'none',
    borderRadius: '7px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deleteBtn: {
    flex: 1,
    padding: '9px 0',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '7px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default InstructorCourseCard;