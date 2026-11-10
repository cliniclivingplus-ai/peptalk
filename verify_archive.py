import pathlib,csv,zipfile,re,json
p=pathlib.Path('C:/Peptide/Peptalk_Classroom_Archive')
rows=list(csv.DictReader((p/'Lesson_Index.csv').open(encoding='utf-8-sig')))
files=list(p.rglob('*.html'))
checks={
 '797_indexed_lessons':len(rows)==797,
 '75_course_files_and_index':len(files)==76,
 'all_index_targets_exist':all((p/r['local_file']).exists() for r in rows),
 '797_lesson_sections':sum(len(re.findall(r'<section id=', f.read_text(encoding='utf-8'))) for f in files)==797,
 'no_remote_image_sources':all(not re.search(r'(?<![\w-])src="https://assets.skool.com', f.read_text(encoding='utf-8')) for f in files),
 'valid_zip':zipfile.ZipFile(p.parent/'Peptalk_Classroom_Archive.zip').testzip() is None
}
print(json.dumps(checks))
assert all(checks.values())
