'use client';

import React from 'react';
import { Course } from '@/types';
import { ArrowLeft, ExternalLink, GraduationCap } from 'lucide-react';

interface CourseReaderViewProps {
  course: Course;
  onBack: () => void;
}

export default function CourseReaderView({
  course,
  onBack,
}: CourseReaderViewProps) {
  // Build URL to the local static HTML file inside public/Peptalk_Classroom_Archive/
  const fileUrl = `/Peptalk_Classroom_Archive/${course.local_file
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Area */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div 
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Classroom</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {course.clean_title || course.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="badge-tag">{course.category || course.topic}</span>
              <span className="compound-pill" style={{ background: '#F3F4F8', color: '#555768', borderColor: '#E2E4EC' }}>
                {course.lesson_count} lessons
              </span>
            </div>
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <span>Open in New Tab</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Course Reader Iframe */}
      <div style={{ flex: 1, minHeight: '650px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <iframe
          src={fileUrl}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#FFFFFF' }}
          title={course.title}
        />
      </div>
    </div>
  );
}
