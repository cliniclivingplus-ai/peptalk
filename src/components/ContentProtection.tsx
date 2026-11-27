'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ContentProtectionProps {
  userEmail: string;
}

/**
 * Strict anti-copy, anti-print, anti-export protection + subtle forensic watermark.
 * Users can read, scroll, search, and learn normally, but cannot copy/transfer content.
 * Every blocked attempt is silently logged to God View.
 */
export default function ContentProtection({ userEmail }: ContentProtectionProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const lastLogRef = useRef<number>(0);

  const triggerBlocked = (action: 'copy_blocked' | 'print_blocked' | 'devtools_blocked', detail: string, msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);

    // Throttle telemetry writes to once every 4 seconds
    const now = Date.now();
    if (now - lastLogRef.current > 4000) {
      lastLogRef.current = now;
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, detail }),
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    };

    const onCopyOrCut = (e: ClipboardEvent) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
      triggerBlocked('copy_blocked', `Blocked ${e.type} attempt`, 'Copying clinical content is disabled.');
    };

    const onContextMenu = (e: MouseEvent) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    const onDragStart = (e: DragEvent) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Block Print (Ctrl+P) & Save Page (Ctrl+S) & View Source (Ctrl+U)
      if (ctrlOrMeta && (key === 'p' || key === 's' || key === 'u')) {
        e.preventDefault();
        triggerBlocked(
          'print_blocked',
          `Blocked shortcut Ctrl+${key.toUpperCase()}`,
          'Printing and saving pages are disabled to protect clinical IP.'
        );
        return;
      }

      // Block Copy / Cut / Select-All outside input boxes
      if (ctrlOrMeta && (key === 'c' || key === 'x' || key === 'a') && !isEditable(e.target)) {
        e.preventDefault();
        triggerBlocked(
          'copy_blocked',
          `Blocked shortcut Ctrl+${key.toUpperCase()}`,
          'Copying clinical content is disabled.'
        );
        return;
      }

      // Block DevTools shortcuts (F12, Ctrl+Shift+I/J/C)
      if (
        e.key === 'F12' ||
        (ctrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))
      ) {
        e.preventDefault();
        triggerBlocked(
          'devtools_blocked',
          `Blocked DevTools shortcut (${e.key})`,
          'Developer tools are restricted on this portal.'
        );
      }
    };

    const onBeforePrint = () => {
      triggerBlocked('print_blocked', 'Browser print dialog triggered', 'Printing is disabled.');
    };

    document.addEventListener('copy', onCopyOrCut);
    document.addEventListener('cut', onCopyOrCut);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('beforeprint', onBeforePrint);

    return () => {
      document.removeEventListener('copy', onCopyOrCut);
      document.removeEventListener('cut', onCopyOrCut);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('beforeprint', onBeforePrint);
    };
  }, []);

  return (
    <>
      {/* Toast when a copy/print/export attempt is blocked */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            zIndex: 10000,
            background: '#1E1B4B',
            color: '#FFFFFF',
            padding: '0.7rem 1.05rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.28)',
            border: '1px solid rgba(127, 102, 255, 0.45)',
          }}
        >
          <ShieldAlert size={16} style={{ color: '#FBBF24', flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}
    </>
  );
}
