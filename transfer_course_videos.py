import pathlib,json,subprocess,hashlib,shutil,concurrent.futures,time,csv,re
from download_course_videos import download,prepare,folder,safe
from drive_api_uploader import DriveUploader
ROOT=pathlib.Path('C:/Peptide');WORK=ROOT/'video_work';LOCAL=ROOT/'Classroom - Course Folders'
STATE=WORK/'transfer-progress.json'
def write_state(s):
 tmp=STATE.with_suffix('.tmp');tmp.write_text(json.dumps(s,ensure_ascii=False,indent=2),encoding='utf-8');tmp.replace(STATE)
def rel(p):return str(pathlib.Path(p).relative_to(LOCAL)).replace('\\','/')
def upload_batch(results,batch):
 paths=[rel(r['file']) for r in results];lst=WORK/f'upload-batch-{batch:03d}.txt';lst.write_text('\n'.join(paths)+'\n',encoding='utf-8')
 return DriveUploader().upload_batch(results)
def main():
 initial=json.loads((WORK/'upload-status.json').read_text(encoding='utf-8'))
 if any(v['upload_status']!='verified_on_drive' for v in initial['verified_videos']):raise SystemExit('First six uploads must be verified before continuing')
 prepared=json.loads((WORK/'prepared-videos.json').read_text(encoding='utf-8'))
 # Two extra lesson pages refer to video resources outside their main player.
 archive=json.loads((ROOT/'Skool_Archive/archive.json').read_text(encoding='utf-8'))
 known={r['job']['lesson_url'].split('&')[0] for r in prepared}
 for l in archive:
  if l['url'].split('&')[0] in known:continue
  links=[a['url'] for a in l['links'] if re.match(r'https?://(?:www\.)?(?:youtu\.be/|youtube\.com/watch|vimeo\.com/|loom\.com/share/)',a['url'])]
  if links:
   j={'ci':l['ci'],'li':l['li'],'course':l['course'],'title':l['title'],'lesson_url':l['url'],'video_id':None,'other_video_fields':{'videoLink':links[0]},'has_access':1}
   prepared.append(prepare(j));known.add(l['url'].split('&')[0])
 if STATE.exists():state=json.loads(STATE.read_text(encoding='utf-8'))
 else:
  state={'verified':[],'failed':[],'batch':0,'total_video_lessons':len(prepared),'phase':'ready'}
  for v in initial['verified_videos']:
   r=next(r for r in prepared if rel(folder(r['job'])/f'{r["job"]["li"]+1:03d} - {safe(r["job"]["title"])}.mp4')==rel(v['local_path']))
   state['verified'].append({'job':r['job'],'file':v['local_path'],'relative_path':rel(v['local_path']),'drive_file_id':v['drive_file_id'],'drive_url':v['drive_url'],'bytes':v['bytes'],'duration':v['duration_seconds'],'status':'verified_on_drive'})
 write_state(state)
 done={r['job']['lesson_url'] for r in state['verified']}
 queue=[r for r in prepared if r['job']['lesson_url'] not in done]
 for r in queue:
  if not r['ready']:state['failed'].append({'job':r['job'],'status':'source_unavailable','error':r.get('error')})
 queue=[r for r in queue if r['ready']]
 while queue:
  batch=[];budget=0
  while queue and len(batch)<4:
   r=queue[0];estimate=r.get('estimated_bytes',0)
   if batch and budget+estimate>550000000:break
   batch.append(queue.pop(0));budget+=estimate
  if budget*2+2000000000>shutil.disk_usage(ROOT).free:
   state['phase']='disk_space_required';write_state(state);raise SystemExit('Not enough safe space for next bounded batch')
  state['batch']+=1;state['phase']='downloading';write_state(state)
  print(json.dumps({'batch':state['batch'],'phase':'downloading','batch_videos':len(batch),'estimated_batch_mb':round(budget/1e6),'already_on_drive':len(state['verified']),'total':len(prepared)}),flush=True)
  results=[]
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
   for result in ex.map(download,batch):
    if result['status']=='verified':results.append(result)
    else:state['failed'].append(result)
    write_state(state)
  if results:
   state['phase']='uploading';write_state(state)
   try:checked=upload_batch(results,state['batch'])
   except Exception as e:
    state['phase']='upload_error';state['last_error']=str(e);write_state(state);raise
   state['verified'].extend(checked)
   state['phase']='uploaded_and_verified';write_state(state)
   # Remove only this batch's temporary videos after full Drive MD5 verification.
   for r in checked:
    p=pathlib.Path(r['file']).resolve()
    if not p.is_relative_to(LOCAL.resolve()) or p.suffix.lower() not in ['.mp4','.mkv','.webm']:raise ValueError('Unexpected cleanup path')
    if p.stat().st_size==r['bytes']:p.unlink()
   print(json.dumps({'batch':state['batch'],'phase':'uploaded_and_verified','on_drive':len(state['verified']),'failed':len(state['failed']),'total':len(prepared),'free_gb':round(shutil.disk_usage(ROOT).free/1e9,2)}),flush=True)
 state['phase']='complete' if not state['failed'] else 'completed_with_failures';write_state(state)
 print(json.dumps({'phase':state['phase'],'on_drive':len(state['verified']),'failed':len(state['failed']),'total':len(prepared)}),flush=True)
if __name__=='__main__':main()
