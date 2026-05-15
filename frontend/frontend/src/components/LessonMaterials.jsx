// src/components/LessonMaterials.jsx

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './LessonMaterials.css';

const getIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf':    return '📄';
    case 'doc':
    case 'docx':   return '📝';
    case 'video':  return '🎬';
    case 'pptx':
    case 'ppt':    return '📊';
    case 'zip':    return '🗜️';
    default:       return '📎';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LessonMaterials = ({ lessonId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [downloading, setDownloading] = useState(null); // tracks which item is downloading

  useEffect(() => {
    if (!lessonId) return;

    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const response = await api.get(
          `/api/courses/lessons/${lessonId}/materials/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMaterials(response.data);
      } catch (err) {
        setError('Could not load materials.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [lessonId]);

  // ── Force download via blob (prevents browser from just opening the file) ──
  const handleDownload = async (fileUrl, fileName, materialId) => {
    setDownloading(materialId);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="lm-wrapper">
        <h3 className="lm-heading">📚 Lesson Materials</h3>
        <div className="lm-skeleton">
          <div className="lm-skeleton-row" />
          <div className="lm-skeleton-row" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lm-wrapper">
        <h3 className="lm-heading">📚 Lesson Materials</h3>
        <p className="lm-error">{error}</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="lm-wrapper">
        <h3 className="lm-heading">📚 Lesson Materials</h3>
        <p className="lm-empty">No materials available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="lm-wrapper">
      <h3 className="lm-heading">
        📚 Lesson Materials
        <span className="lm-count">{materials.length}</span>
      </h3>

      <ul className="lm-list">
        {materials.map((material) => {
          const fileName = material.file_name || `Material #${material.id}`;
          const isDownloading = downloading === material.id;

          return (
            <li key={material.id} className="lm-item">
              <span className="lm-icon">{getIcon(material.material_type)}</span>

              <div className="lm-info">
                <span className="lm-name">{fileName}</span>
                <span className="lm-meta">
                  <span className="lm-type">{material.material_type?.toUpperCase()}</span>
                  {material.file_size && (
                    <span className="lm-size">{formatFileSize(material.file_size)}</span>
                  )}
                </span>
              </div>

              <button
                className="lm-download-btn"
                disabled={isDownloading}
                onClick={() => handleDownload(material.file_url, fileName, material.id)}
              >
                {isDownloading ? '⏳ Downloading...' : '⬇ Download'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LessonMaterials;