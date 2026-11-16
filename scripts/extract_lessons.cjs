const fs = require('fs');
const path = require('path');

const archivePath = path.join(__dirname, '..', 'Skool_Archive', 'archive.json');
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'lessons.json');

if (!fs.existsSync(archivePath)) {
  console.error('archive.json not found at', archivePath);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

const lessons = raw.map((l, i) => {
  const html = (l.editors || []).map((e) => e.html || '').join('\n');
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

  // Strip leading emoji or symbols
  const cleanTitle = (l.title || '').replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '').trim() || l.title || '';
  const cleanCourse = (l.course || '').replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '').trim() || l.course || '';

  return {
    id: `lesson_${i}`,
    title: cleanTitle,
    course: cleanCourse,
    text: text.slice(0, 3000),
    url: l.url || '',
  };
});

fs.writeFileSync(outputPath, JSON.stringify(lessons, null, 2), 'utf8');
console.log(`Successfully saved ${lessons.length} cleaned lessons to ${outputPath}`);
