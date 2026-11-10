import pathlib,json
from transfer_course_videos import upload_batch,write_state,STATE,LOCAL,rel
from download_course_videos import folder,safe,probe
work=pathlib.Path('C:/Peptide/video_work')
state=json.loads(STATE.read_text(encoding='utf-8'))
pending=(work/'upload-batch-010.txt').read_text(encoding='utf-8').strip()
prepared=json.loads((work/'prepared-videos.json').read_text(encoding='utf-8'))
item=next(r for r in prepared if rel(folder(r['job'])/f'{r["job"]["li"]+1:03d} - {safe(r["job"]["title"])}.mp4')==pending)
path=LOCAL/pending
stats=probe(path)
result={'job':item['job'],'file':str(path),'status':'verified',**stats}
print(json.dumps({'retrying':pending,'bytes':stats['bytes'],'duration_seconds':stats['duration']}),flush=True)
checked=upload_batch([result],100)
if not any(v['job']['lesson_url']==item['job']['lesson_url'] for v in state['verified']):state['verified'].extend(checked)
state['phase']='uploaded_and_verified';write_state(state)
print(json.dumps({'on_drive':len(state['verified']),'recovered_video_url':checked[0]['drive_url']}),flush=True)
