'use client';

import React, { useState, useMemo } from 'react';
import { Course } from '@/types';
import { Search, GraduationCap, ArrowRight } from 'lucide-react';

interface ClassroomViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const ORDERED_CATEGORIES = [
  'All',
  'Foundations',
  'Dosing & Safety',
  'GLP-1 & Weight',
  'Growth Hormone & Muscle',
  'Longevity & Energy',
  'Cognition & Sleep',
  'Hormones, Skin & Hair',
  'Immune & Health',
  'Nutrition & Recipes',
  'Evidence & Community',
];

export default function ClassroomView({
  courses,
  onSelectCourse,
}: ClassroomViewProps) {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter((c) => {
      if (selectedCat !== 'All' && (c.category || '').toLowerCase() !== selectedCat.toLowerCase()) {
        return false;
      }
      if (q) {
        const matchTitle = (c.title || '').toLowerCase().includes(q) || (c.clean_title || '').toLowerCase().includes(q);
        const matchTopic = (c.topic || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
        const matchLessons = (c.lessons || []).some((l) => (l.title || '').toLowerCase().includes(q) || (l.clean_title || '').toLowerCase().includes(q));
        return matchTitle || matchTopic || matchLessons;
      }
      return true;
    });
  }, [courses, selectedCat, search]);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.8rem', background: 'var(--primary-light)', borderRadius: '9999px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)' }}></span>
            <span>PepTalk Academy · 75 Courses · 797 Lessons</span>
          </div>
          <h1 className="page-title">Classroom</h1>
          <p className="page-subtitle">
            Full masterclass curriculum, deep-dive lessons, video tutorials, protocols, and biohacking archives.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-container">
        <Search className="search-icon-pos" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search across 75 courses and 797 lessons..."
          className="search-input-field"
        />
      </div>

      {/* Category Chips */}
      <div className="filter-chips-list">
        {ORDERED_CATEGORIES.map((cat) => {
          const count = cat === 'All' ? courses.length : courses.filter((c) => c.category === cat).length;
          if (cat !== 'All' && count === 0) return null;

          return (
            <button
              key={cat}
              className={`chip ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              <span>{cat}</span>
              <span className="tab-badge-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Courses Grid */}
      <div className="compounds-grid">
        {filteredCourses.map((c) => {
          const lessonTitles = (c.lessons || [])
            .slice(0, 3)
            .map((l) => (l.clean_title || l.title || '').replace(/^[^\w\s]+/, '').trim())
            .filter(Boolean);

          const overviewText =
            lessonTitles.length > 0
              ? 'Lessons: ' + lessonTitles.join(' • ') + (c.lessons.length > 3 ? ` (+${c.lessons.length - 3} more)` : '')
              : 'Comprehensive masterclass curriculum, deep-dive notes, and protocols.';

          const cleanTopic = (c.topic || '').replace(/^\d+\s*[-–]\s*/, '').trim();

          return (
            <div
              key={c.id || c.title}
              className="compound-item-card"
              onClick={() => onSelectCourse(c)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.5rem' }}>
                <span className="badge-tag">{c.category || 'Course'}</span>
                <span className="compound-pill" style={{ fontSize: '0.76rem', padding: '0.15rem 0.6rem', background: '#F3F4F8', color: '#555768', borderColor: '#E2E4EC' }}>
                  {c.lesson_count} {c.lesson_count === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>

              <h3 className="compound-item-title" style={{ fontSize: '1.18rem', marginBottom: '0.3rem' }}>
                {c.clean_title || c.title}
              </h3>
              <p className="compound-item-subtitle" style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                {cleanTopic}
              </p>
              <p className="compound-item-overview" style={{ fontSize: '0.88rem', color: '#555768', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                {overviewText}
              </p>

              <div className="compound-item-footer" style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>View Course</span> <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
