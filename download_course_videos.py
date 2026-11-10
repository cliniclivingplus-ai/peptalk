import sys,pathlib,json,re,subprocess,shutil,threading,time,concurrent.futures
sys.path.insert(0,'C:/Peptide/video_tools')
import yt_dlp
from scan_course_videos import fetch
ROOT=pathlib.Path('C:/Peptide');WORK=ROOT/'video_work';COURSES=ROOT/'Classroom - Course Folders'
JOBS=json.loads((WORK/'video-jobs.json').read_text(encoding='utf-8'))
LOCK=threading.Lock()
def safe(s):return re.sub(r'[<>:"/\\|?*\x00-\x1f]','-',s).strip(' .')[:130]
class Quiet:
 def debug(self,msg):pass
 def warning(self,msg):pass
 def error(self,msg):pass
def folder(j):return next(p for p in COURSES.iterdir() if p.is_dir() and p.name.startswith(f'{j["ci"]+1:02d} - '))
def source(j):
 if j['video_id']:
  p=fetch(j['lesson_url']);v=p.get('video')
  if not v:raise ValueError('Lesson did not return an accessible video')
  return 'https://stream.video.skool.com/'+v['playbackId']+'.m3u8?token='+v['playbackToken'],v.get('duration')
 return j['other_video_fields']['videoLink'],None
def disk_guard(progress):
 if shutil.disk_usage(ROOT).free < 1500000000:raise RuntimeError('Stopped to preserve system disk space')
def options(j):return {'outtmpl':str(folder(j)/f'{j["li"]+1:03d} - {safe(j["title"])}.%(ext)s'),'format':'bv*[height<=720]+ba/b[height<=720]/b','merge_output_format':'mp4','concurrent_fragment_downloads':4,'quiet':True,'no_warnings':True,'logger':Quiet(),'http_headers':{'Referer':'https://www.skool.com/','Origin':'https://www.skool.com'},'socket_timeout':25,'retries':3,'fragment_retries':3,'skip_unavailable_fragments':False,'progress_hooks':[disk_guard],'noplaylist':True}
def probe(path):
 args=['ffprobe','-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type,width,height','-of','json',str(path)]
 p=subprocess.run(args,capture_output=True,text=True,timeout=30)
 if p.returncode:raise ValueError('Saved media verification failed')
 data=json.loads(p.stdout);types={s['codec_type'] for s in data['streams']}
 if 'video' not in types or 'audio' not in types:raise ValueError('Saved file lacks video or audio')
 return {'duration':float(data['format']['duration']),'bytes':int(data['format']['size']),'height':max(s.get('height',0) for s in data['streams'])}
def prepare(j):
 try:
  url,duration=source(j)
  with yt_dlp.YoutubeDL(options(j)) as y:info=y.extract_info(url,download=False)
  streams=info.get('requested_formats') or [info]
  size=sum(s.get('filesize') or s.get('filesize_approx') or (float(s.get('tbr') or 0)*1000/8*float(info.get('duration') or duration or 0)) for s in streams)
  result={'job':j,'source':url,'duration':info.get('duration') or duration,'estimated_bytes':round(size),'ready':True}
 except Exception as e:result={'job':j,'ready':False,'error':re.sub(r'https?://\S+','[URL]',str(e))[:300]}
 return result
def download(prepared):
 j=prepared['job'];stem=f'{j["li"]+1:03d} - {safe(j["title"])}';matches=[folder(j)/(stem+ext) for ext in ['.mp4','.mkv','.webm'] if (folder(j)/(stem+ext)).is_file()]
 try:
  if matches:
   stats=probe(matches[0]);return {'job':j,'status':'verified','file':str(matches[0]),**stats}
  if shutil.disk_usage(ROOT).free < max(prepared.get('estimated_bytes',0)*1.5,300000000)+1200000000: return {'job':j,'status':'disk_space_required'}
  url,duration=source(j)
  with yt_dlp.YoutubeDL(options(j)) as y:info=y.extract_info(url,download=True)
  matches=[folder(j)/(stem+ext) for ext in ['.mp4','.mkv','.webm'] if (folder(j)/(stem+ext)).is_file()]
  if not matches:raise ValueError('No complete video file was produced')
  stats=probe(matches[0]);expected=float(info.get('duration') or duration or 0)
  if expected and abs(stats['duration']-expected)>max(5,expected*.01):raise ValueError('Saved duration does not match source')
  return {'job':j,'status':'verified','file':str(matches[0]),**stats}
 except Exception as e:return {'job':j,'status':'failed','error':re.sub(r'https?://\S+','[URL]',str(e))[:300]}
if __name__=='__main__':
 mode=sys.argv[1] if len(sys.argv)>1 else 'prepare'
 if mode=='prepare':
  results=[]
  with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
   for r in ex.map(prepare,JOBS):
    results.append(r);(WORK/'prepared-videos.json').write_text(json.dumps(results,ensure_ascii=False),encoding='utf-8')
  print(json.dumps({'ready':sum(r['ready'] for r in results),'failed':[{'course':r['job']['course'],'title':r['job']['title'],'error':r['error']} for r in results if not r['ready']],'estimated_gb':round(sum(r.get('estimated_bytes',0) for r in results)/1e9,2),'hours':round(sum(float(r.get('duration') or 0) for r in results)/3600,2)}),flush=True)
 else:
  prepared=json.loads((WORK/'prepared-videos.json').read_text(encoding='utf-8'))
  if mode=='batch':
   # A bounded batch leaves well over 7 GB free on the current machine.
   selected=[];budget=0
   for r in prepared:
    if not r['ready']:continue
    j=r['job'];stem=f'{j["li"]+1:03d} - {safe(j["title"])}'
    if any(p.suffix.lower() in ['.mp4','.mkv','.webm'] for p in folder(j).glob(stem+'.*')):continue
    estimate=r.get('estimated_bytes',0)
    if not estimate or estimate>300000000:continue
    if budget+estimate>500000000:continue
    selected.append(r);budget+=estimate
    if len(selected)>=5:break
   prepared=selected
   if shutil.disk_usage(ROOT).free < budget*2+2000000000:raise SystemExit('Insufficient safe free space for bounded batch')
   print(json.dumps({'batch_videos':len(selected),'estimated_batch_bytes':budget,'free_bytes':shutil.disk_usage(ROOT).free}),flush=True)
  results=[]
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
   futuremap={ex.submit(download,r):r for r in prepared if r['ready']}
   for f in concurrent.futures.as_completed(futuremap):
    r=f.result();results.append(r);(WORK/'download-progress.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'completed':len(results),'verified':sum(r['status']=='verified' for r in results),'last_course':r['job']['course'],'last_title':r['job']['title'],'status':r['status'],'free_gb':round(shutil.disk_usage(ROOT).free/1e9,2)}),flush=True)
