'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  RefreshCw,
  ShieldAlert,
  Users,
  MessageSquare,
  Activity,
  Smartphone,
  Monitor,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface GodViewEvent {
  id: string;
  email: string;
  action: string;
  detail: string;
  device?: string;
  timestamp: string;
}

interface GodViewUser {
  email: string;
  totalActions: number;
  logins: number;
  aiChats: number;
  views: number;
  securityAlerts: number;
  totalTimeSeconds: number;
  lastActive: string;
  device: string;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 60) return '< 1m';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

interface GodViewPanelProps {
  adminKey: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  login: { label: 'Login', color: '#047857', bg: '#ECFDF5' },
  page_view: { label: 'Tab View', color: '#4338CA', bg: '#EEF2FF' },
  compound_view: { label: 'Monograph', color: '#583EDB', bg: '#F5F3FF' },
  protocol_view: { label: 'Protocol', color: '#0369A1', bg: '#F0F9FF' },
  course_view: { label: 'Classroom', color: '#0F766E', bg: '#F0FDFA' },
  ai_chat: { label: 'AI Chat', color: '#6D28D9', bg: '#F5F3FF' },
  content_studio: { label: 'Content Studio', color: '#7C3AED', bg: '#FAF5FF' },
  copy_blocked: { label: 'Copy Blocked', color: '#B91C1C', bg: '#FEF2F2' },
  print_blocked: { label: 'Print Blocked', color: '#B91C1C', bg: '#FEF2F2' },
  devtools_blocked: { label: 'DevTools Blocked', color: '#B91C1C', bg: '#FEF2F2' },
  device_kicked: { label: '2nd Device Blocked', color: '#C2410C', bg: '#FFF7ED' },
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function GodViewPanel({ adminKey }: GodViewPanelProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ activeUsers: 0, totalEvents: 0, totalAiQueries: 0, totalAlerts: 0, totalTimeSeconds: 0 });
  const [users, setUsers] = useState<GodViewUser[]>([]);
  const [events, setEvents] = useState<GodViewEvent[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'alerts' | 'ai' | 'views'>('all');
  const [filterEmail, setFilterEmail] = useState<string>('all');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity', {
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSummary(data.summary);
        setUsers(data.users || []);
        setEvents(data.events || []);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) fetchTelemetry();
  }, [adminKey]);

  const filteredEvents = events.filter((ev) => {
    if (filterEmail !== 'all' && ev.email !== filterEmail) return false;
    if (filterType === 'alerts') {
      return (
        ev.action === 'copy_blocked' ||
        ev.action === 'print_blocked' ||
        ev.action === 'devtools_blocked' ||
        ev.action === 'device_kicked'
      );
    }
    if (filterType === 'ai') {
      return ev.action === 'ai_chat' || ev.action === 'content_studio';
    }
    if (filterType === 'views') {
      return ev.action === 'page_view' || ev.action === 'compound_view' || ev.action === 'protocol_view' || ev.action === 'course_view';
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111116', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={20} style={{ color: '#583EDB' }} />
            <span>God View · Live User Activity &amp; Anti-Copy Telemetry</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
            Monitor every doctor&apos;s page views, AI queries, and blocked copy/print/DevTools attempts in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTelemetry}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.95rem',
            borderRadius: '9px',
            border: '1px solid #DDD6FE',
            background: '#F5F3FF',
            color: '#583EDB',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.35rem' }}>
            <Users size={15} style={{ color: '#583EDB' }} />
            <span>Active Users</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{summary.activeUsers}</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.35rem' }}>
            <Clock size={15} style={{ color: '#2563EB' }} />
            <span>Total Study Time</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{formatDuration(summary.totalTimeSeconds)}</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.35rem' }}>
            <Activity size={15} style={{ color: '#059669' }} />
            <span>Tracked Actions</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{summary.totalEvents}</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.35rem' }}>
            <MessageSquare size={15} style={{ color: '#7C3AED' }} />
            <span>AI &amp; Studio Queries</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{summary.totalAiQueries}</div>
        </div>

        <div
          style={{
            background: summary.totalAlerts > 0 ? '#FEF2F2' : '#FFFFFF',
            border: summary.totalAlerts > 0 ? '1px solid #FECACA' : '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '1rem 1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: summary.totalAlerts > 0 ? '#B91C1C' : '#6B7280', marginBottom: '0.35rem' }}>
            <ShieldAlert size={15} style={{ color: '#DC2626' }} />
            <span>Blocked Copy / Export</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: summary.totalAlerts > 0 ? '#B91C1C' : '#111827' }}>
            {summary.totalAlerts}
          </div>
        </div>
      </div>

      {/* Per-User Summary Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.15rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '0.84rem', fontWeight: 800, color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Usage &amp; Time Breakdown by User</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280' }}>Click any user to filter their full activity below</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.7rem 1rem' }}>User Email</th>
                <th style={{ padding: '0.7rem 1rem' }}>Device</th>
                <th style={{ padding: '0.7rem 1rem' }}>Time Spent</th>
                <th style={{ padding: '0.7rem 1rem' }}>Logins</th>
                <th style={{ padding: '0.7rem 1rem' }}>Page Views</th>
                <th style={{ padding: '0.7rem 1rem' }}>AI Queries</th>
                <th style={{ padding: '0.7rem 1rem' }}>Security Alerts</th>
                <th style={{ padding: '0.7rem 1rem' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.email}
                  onClick={() => setFilterEmail(filterEmail === u.email ? 'all' : u.email)}
                  style={{
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    background: filterEmail === u.email ? '#F5F3FF' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#111827' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#4B5563' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {u.device === 'Mobile' ? <Smartphone size={13} /> : <Monitor size={13} />}
                      {u.device}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#2563EB' }}>{formatDuration(u.totalTimeSeconds)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.logins || 0}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.views}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#583EDB' }}>{u.aiChats}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {u.securityAlerts > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', background: '#FEF2F2', color: '#B91C1C', fontWeight: 700, fontSize: '0.74rem' }}>
                        <AlertTriangle size={12} />
                        {u.securityAlerts} alerts
                      </span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.76rem' }}>Clean</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6B7280' }}>{formatTime(u.lastActive)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
                    No user activity recorded yet. Activity will appear here automatically as staff use the portal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Chronological Feed */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.15rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#111827' }}>
            Live Activity Feed ({filteredEvents.length})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {(['all', 'alerts', 'ai', 'views'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                style={{
                  padding: '0.28rem 0.7rem',
                  borderRadius: '9999px',
                  border: filterType === t ? 'none' : '1px solid #E5E7EB',
                  background: filterType === t ? '#583EDB' : '#FFFFFF',
                  color: filterType === t ? '#FFFFFF' : '#4B5563',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t === 'all' ? 'All' : t === 'alerts' ? 'Security Alerts' : t === 'ai' ? 'AI & Studio' : 'Views'}
              </button>
            ))}

            <select
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              style={{
                padding: '0.28rem 0.6rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '0.76rem',
                fontWeight: 600,
                background: '#FFFFFF',
              }}
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {filteredEvents.map((ev) => {
            const meta = ACTION_LABELS[ev.action] || { label: ev.action, color: '#374151', bg: '#F3F4F6' };
            return (
              <div
                key={ev.id}
                style={{
                  padding: '0.7rem 1.15rem',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      padding: '0.16rem 0.55rem',
                      borderRadius: '9999px',
                      background: meta.bg,
                      color: meta.color,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {meta.label}
                  </span>
                  <strong style={{ color: '#111827', whiteSpace: 'nowrap' }}>{ev.email}</strong>
                  <span style={{ color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.detail}>
                    {ev.detail}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {formatTime(ev.timestamp)}
                </span>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div style={{ padding: '1.75rem', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
              No matching activity events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
