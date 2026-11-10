import pathlib,json,urllib.parse
from download_course_videos import safe,folder
root=pathlib.Path('C:/Peptide');work=root/'video_work';local=root/'Classroom - Course Folders'
state=json.loads((work/'transfer-progress.json').read_text(encoding='utf-8'))
archive=json.loads((root/'Skool_Archive/archive.json').read_text(encoding='utf-8'))
def key(u):
 p=urllib.parse.urlparse(u);return p.path,urllib.parse.parse_qs(p.query).get('md',[''])[0]
old={key(l['url']):l for l in archive};plan=[]
for video in state['verified']:
 l=old.get(key(video['job']['lesson_url']))
 if not l or l['images'] or any(e['text'].strip() for e in l['editors']):continue
 note=folder(video['job'])/f'{l["li"]+1:03d} - {safe(l["title"])}.txt'
 if not note.exists():continue
 text=note.read_text(encoding='utf-8')
 if '[This lesson exposed no text. Its video or other media must be opened on Skool.]' not in text:continue
 plan.append({'relative_path':str(note.relative_to(local)).replace('\\','/'),'course':video['job']['course'],'lesson':l['title'],'replacement_video_id':video['drive_file_id'],'replacement_video_url':video['drive_url']})
(work/'placeholder-cleanup-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'verified_videos':len(state['verified']),'empty_video_placeholders_identified':len(plan)}))
