import React from 'react';

interface ClinicalMarkdownProps {
  content: string;
}

export default function ClinicalMarkdown({ content }: ClinicalMarkdownProps) {
  if (!content) return null;

  // Normalize newlines
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Horizontal divider rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(
        <hr
          key={`hr_${i}`}
          style={{
            border: 'none',
            borderTop: '1px solid #E2E8F0',
            margin: '1.75rem 0',
          }}
        />
      );
      i++;
      continue;
    }

    // 3. Fenced Code Block (``` or isolated ` fence)
    if (trimmed.startsWith('```') || trimmed === '`') {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```') && lines[i].trim() !== '`') {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing backtick

      blocks.push(
        <div
          key={`code_${i}`}
          style={{
            margin: '1.25rem 0',
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '10px',
            padding: '1.1rem 1.25rem',
            overflowX: 'auto',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.84rem',
            lineHeight: 1.55,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre' }}>{codeLines.join('\n')}</pre>
        </div>
      );
      continue;
    }

    // 4. Unicode / ASCII Box Diagram or Table (+---+)
    if (/[┌─┐└┘│├┤┬┴┼▼▲]|\+[-=]{3,}\+/.test(trimmed)) {
      const diagramLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        (/[┌─┐└┘│├┤┬┴┼▼▲]|\+[-=]{3,}\+/.test(lines[i]) ||
          lines[i].trim().startsWith('|') ||
          lines[i].trim().startsWith('│') ||
          lines[i].startsWith(' ') ||
          lines[i].startsWith('\t'))
      ) {
        diagramLines.push(lines[i]);
        i++;
      }

      blocks.push(
        <div
          key={`diagram_${i}`}
          style={{
            margin: '1.25rem 0',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            overflowX: 'auto',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.82rem',
            color: '#0F172A',
            lineHeight: 1.45,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre' }}>{diagramLines.join('\n')}</pre>
        </div>
      );
      continue;
    }

    // 5. Tables: Pipe Tables or Tab-Separated Tables
    const hasPipes = trimmed.includes('|');
    const nextLineHasPipes = lines[i + 1]?.includes('|');
    const nextLineHasDashes = lines[i + 1] && /[-:]{3,}/.test(lines[i + 1]);
    const isPipeTable = hasPipes && (nextLineHasDashes || (trimmed.startsWith('|') && nextLineHasPipes));
    const isTabTable = trimmed.includes('\t') && lines[i + 1]?.includes('\t');

    if (isPipeTable || isTabTable) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        (isTabTable ? lines[i].includes('\t') : lines[i].includes('|'))
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        let headerRow: string[] = [];
        let bodyRows: string[][] = [];

        if (isTabTable) {
          headerRow = tableLines[0].split('\t').map((c) => c.trim()).filter(Boolean);
          bodyRows = tableLines.slice(1).map((l) => l.split('\t').map((c) => c.trim()));
        } else {
          const validRows = tableLines
            .filter((l) => !/^[\|\s\-:]+$/.test(l.replace(/[-:|]/g, '')))
            .map((l) => {
              let clean = l;
              if (clean.startsWith('|')) clean = clean.slice(1);
              if (clean.endsWith('|')) clean = clean.slice(0, -1);
              return clean.split('|').map((c) => c.trim());
            });

          headerRow = validRows[0] || [];
          bodyRows = validRows.slice(1);
        }

        if (headerRow.length > 0) {
          blocks.push(
            <div
              key={`table_${i}`}
              style={{
                overflowX: 'auto',
                margin: '1.25rem 0',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    {headerRow.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        style={{
                          padding: '0.75rem 1rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: rIdx < bodyRows.length - 1 ? '1px solid #F1F5F9' : 'none',
                        background: rIdx % 2 === 1 ? '#FAFAFC' : '#FFFFFF',
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '0.65rem 1rem',
                            color: '#1E293B',
                            verticalAlign: 'top',
                          }}
                        >
                          {renderInline(cell || '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }
    }

    // 6. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1_${i}`}
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.75rem',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2_${i}`}
          style={{
            fontSize: '1.28rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.5rem',
            marginBottom: '0.6rem',
            letterSpacing: '-0.015em',
          }}
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3_${i}`}
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.35rem',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h4
          key={`h4_${i}`}
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0F172A',
            marginTop: '1.1rem',
            marginBottom: '0.4rem',
          }}
        >
          {renderInline(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // 7. Numbered Clinical Section Headers (e.g. "1. Primary Pharmacology & Molecular Mechanism")
    if (/^\d+\.\s+[A-Z][A-Za-z0-9\s&,/–—-]+$/.test(trimmed) && trimmed.length < 90 && !trimmed.endsWith('.')) {
      blocks.push(
        <h3
          key={`nh3_${i}`}
          style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.5rem',
            marginBottom: '0.65rem',
            paddingBottom: '0.35rem',
            borderBottom: '2px solid #E2E8F0',
            letterSpacing: '-0.01em',
          }}
        >
          {renderInline(trimmed)}
        </h3>
      );
      i++;
      continue;
    }

    // 8. Blockquote / Clinical Alert / Callout
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push(
        <div
          key={`quote_${i}`}
          style={{
            borderLeft: '4px solid var(--primary)',
            background: '#F8FAFC',
            padding: '0.85rem 1.15rem',
            borderRadius: '0 10px 10px 0',
            margin: '0.9rem 0',
            fontSize: '0.9rem',
            color: '#334155',
            lineHeight: 1.6,
          }}
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} style={{ margin: qIdx > 0 ? '0.4rem 0 0 0' : 0 }}>
              {renderInline(ql)}
            </p>
          ))}
        </div>
      );
      continue;
    }

    // 9. Unordered List Items (*, -, •)
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul
          key={`ul_${i}`}
          style={{
            margin: '0.6rem 0 0.8rem 1.25rem',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            listStyleType: 'disc',
          }}
        >
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              style={{
                fontSize: '0.93rem',
                color: '#1E293B',
                lineHeight: 1.6,
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 10. Ordered List Items (1. 2. etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        numItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={`ol_${i}`}
          style={{
            margin: '0.6rem 0 0.8rem 1.25rem',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            listStyleType: 'decimal',
          }}
        >
          {numItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              style={{
                fontSize: '0.93rem',
                color: '#1E293B',
                lineHeight: 1.6,
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 11. Key-Value parameter line (e.g. "Class: GLP-1 Receptor Agonist" or "Half-Life: 7 days")
    const kvMatch = trimmed.match(/^([A-Za-z\s–—-]+):\s+(.+)$/);
    if (kvMatch && kvMatch[1].length < 35 && !trimmed.startsWith('http')) {
      blocks.push(
        <p
          key={`kv_${i}`}
          style={{
            margin: '0.35rem 0',
            fontSize: '0.93rem',
            color: '#1E293B',
            lineHeight: 1.65,
          }}
        >
          <strong style={{ color: '#0F172A', fontWeight: 700 }}>{kvMatch[1]}: </strong>
          {renderInline(kvMatch[2])}
        </p>
      );
      i++;
      continue;
    }

    // 12. Standard Paragraph
    blocks.push(
      <p
        key={`p_${i}`}
        style={{
          margin: '0.5rem 0',
          fontSize: '0.93rem',
          color: '#1E293B',
          lineHeight: 1.68,
        }}
      >
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="clinical-formatted-content">{blocks}</div>;
}

/**
 * Parses inline formatting:
 * - Bold: **text**
 * - Italic: *text*
 * - Inline Code: `code`
 * - Links: [text](url)
 */
function renderInline(rawText: string): React.ReactNode {
  if (!rawText) return null;

  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = rawText.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [title](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary)',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            {match[1]}
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} style={{ color: '#0F172A', fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} style={{ color: '#334155', fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
