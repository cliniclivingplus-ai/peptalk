import React from 'react';

interface ClinicalMarkdownProps {
  content: string;
}

export default function ClinicalMarkdown({ content }: ClinicalMarkdownProps) {
  if (!content) return null;

  // Split lines and parse into blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Table Detection (starts with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && lines[i + 1]?.includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const headerCells = tableLines[0]
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      const bodyRows = tableLines.slice(2).map((rowLine) =>
        rowLine
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
      );

      blocks.push(
        <div
          key={`table_${i}`}
          style={{
            overflowX: 'auto',
            margin: '1.25rem 0',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
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
                {headerCells.map((h, hIdx) => (
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
                      }}
                    >
                      {renderInline(cell)}
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

    // 2. Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3_${i}`}
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.4rem',
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

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2_${i}`}
          style={{
            fontSize: '1.28rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '1.6rem',
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
          }}
        >
          {renderInline(trimmed.slice(2))}
        </h1>
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

    // 3. Blockquote / Clinical Callout
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

    // 4. Unordered List Items (*, -, •)
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

    // 5. Ordered List Items (1. 2. etc.)
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

    // 6. Normal Paragraph
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
 * - Bold: **text** or __text__ -> dark strong font
 * - Italic: *text* or _text_ -> em
 * - Inline Code: `code` -> styled code
 * - Links: [text](url) -> styled a
 * - Cleans any leftover raw asterisks
 */
function renderInline(rawText: string): React.ReactNode {
  if (!rawText) return null;

  // Regex tokens:
  // 1. Links: [text](url)
  // 2. Bold: **text**
  // 3. Italic: *text*
  // 4. Code: `text`
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
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          style={{
            fontWeight: 800,
            color: '#0F172A', // Dark font as requested by user
          }}
        >
          {inner}
        </strong>
      );
    }

    // Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          style={{
            background: '#F1F5F9',
            padding: '0.15rem 0.4rem',
            borderRadius: '5px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
            color: '#0F172A',
            fontWeight: 600,
          }}
        >
          {inner}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return <em key={index}>{inner}</em>;
    }

    // Plain text: strip any lone stray asterisks that failed matching
    const cleanText = part.replace(/\*\*/g, '');
    return <span key={index}>{cleanText}</span>;
  });
}
