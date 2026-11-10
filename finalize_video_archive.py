import pathlib,json,hashlib,subprocess,concurrent.futures,sys
from download_course_videos import folder
ROOT=pathlib.Path('C:/Peptide');WORK=ROOT/'video_work';LOCAL=ROOT/'Classroom - Course Folders'
BASE=['rclone','--config',str(WORK/'rclone.conf'),'--log-level','ERROR']
state=json.loads((WORK/'transfer-progress.json').read_text(encoding='utf-8'))
if state['phase'] not in ['complete','completed_with_failures'] and '--partial' not in sys.argv:raise SystemExit('Wait for video transfer to finish before final cleanup')
subprocess.run([sys.executable,str(ROOT/'plan_video_placeholder_cleanup.py')],check=True)
plan=json.loads((WORK/'placeholder-cleanup-plan.json').read_text(encoding='utf-8'))
listing=WORK/'placeholder-candidates.txt';listing.write_text('\n'.join(p['relative_path'] for p in plan)+'\n',encoding='utf-8')
run=subprocess.run(BASE+['lsjson','raaghav_course:','--recursive','--files-only','--files-from',str(listing),'--hash'],check=True,capture_output=True,text=True,encoding='utf-8')
remote={f['Path']:f for f in json.loads(run.stdout)}
safe=[];protected=[]
for p in plan:
 r=remote.get(p['relative_path'])
 if r is None:continue
 note=(LOCAL/p['relative_path']).resolve()
 if not note.is_relative_to(LOCAL.resolve()) or note.suffix!='.txt':raise ValueError('Unexpected placeholder path')
 with note.open('rb') as f:digest=hashlib.file_digest(f,'md5').hexdigest()
 if r.get('Hashes',{}).get('md5','').lower()!=digest:protected.append(p);continue
 safe.append(p)
(WORK/'placeholder-cleanup-reviewed.json').write_text(json.dumps({'safe_to_trash':safe,'protected_modified_notes':protected},ensure_ascii=False,indent=2),encoding='utf-8')
if '--apply' not in sys.argv:
 print(json.dumps({'safe_empty_placeholders':len(safe),'modified_notes_preserved':len(protected)}));raise SystemExit()
def trash(p):
 subprocess.run(BASE+['deletefile','raaghav_course:'+p['relative_path'],'--drive-use-trash=true'],check=True)
 return p['relative_path']
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:removed=list(ex.map(trash,safe))
previous_path=WORK/'placeholder-cleanup-complete.json'
previous=json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
removed_set=set(previous.get('trashed_empty_placeholders',[]))|set(removed)
updated=0
for ci in sorted({v['job']['ci'] for v in state['verified']}):
 videos=[v for v in state['verified'] if v['job']['ci']==ci];course=folder(videos[0]['job'])
 files=[p.name for p in course.glob('*.txt') if not p.name.startswith('00 - ') and str(p.relative_to(LOCAL)).replace('\\','/') not in removed_set]
 files+=list({pathlib.Path(v['relative_path']).name for v in videos})
 files+= [p.name for p in course.iterdir() if p.is_file() and p.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif','.img']]
 content=videos[0]['job']['course']+'\n\nCourse files, numbered in classroom order:\n\n'+'\n'.join(sorted(set(files)))+'\n'
 note=WORK/f'course-index-{ci+1:02d}.txt';note.write_text(content,encoding='utf-8')
 subprocess.run(BASE+['copyto',str(note),'raaghav_course:'+course.name+'/00 - Course Contents.txt','--checksum'],check=True);updated+=1
(WORK/'placeholder-cleanup-complete.json').write_text(json.dumps({'trashed_empty_placeholders':sorted(removed_set),'modified_notes_preserved':protected,'course_indexes_updated':updated},ensure_ascii=False,indent=2),encoding='utf-8')
subprocess.run([sys.executable,str(ROOT/'publish_video_progress.py')],check=True)
print(json.dumps({'empty_placeholders_moved_to_trash':len(removed),'modified_notes_preserved':len(protected),'course_indexes_updated':updated}))
