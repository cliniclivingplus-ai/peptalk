import json,pathlib,re,urllib.request,http.cookiejar,concurrent.futures,threading
b=pathlib.Path('C:/Peptide');work=b/'video_work';work.mkdir(exist_ok=True)
courses=json.loads((b/'Skool_Archive/inventory.json').read_text(encoding='utf-8'))
local=threading.local()
def fetch(url):
 if not hasattr(local,'opener'):
  jar=http.cookiejar.MozillaCookieJar(str(b/'www.skool.com_cookies.txt'));jar.load(ignore_discard=True,ignore_expires=False)
  local.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
 with local.opener.open(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:page=r.read().decode()
 m=re.search(r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',page,re.S)
 if not m:raise ValueError('Missing course page data')
 return json.loads(m.group(1))['props']['pageProps']
def scan(pair):
 ci,c=pair;p=fetch(c['url']);tree=p.get('course',{});(work/f'course-{ci+1:02d}.json').write_text(json.dumps(tree),encoding='utf-8')
 modules=[]
 def walk(n):
  if not isinstance(n,dict):return
  if n.get('course',{}).get('unitType')=='module':modules.append(n['course'])
  for child in n.get('children',[]):walk(child)
 walk(tree)
 jobs=[];keys=set()
 for li,m in enumerate(modules):
  meta=m.get('metadata',{});keys.update(meta)
  vid=meta.get('videoId');links={k:v for k,v in meta.items() if ('video' in k.lower() or 'url' in k.lower()) and isinstance(v,str) and v and k!='videoId'}
  if vid or links:
   url=c['url'].split('?')[0]+'?md='+m['id']
   # Preserve existing numbered notes when an inaccessible item affects numbering.
   old=next((i for i,l in enumerate(c['lessons']) if l['url'].split('md=')[-1].split('&')[0]==m['id']),None)
   jobs.append({'ci':ci,'course':c['title'],'li':old if old is not None else li,'title':meta.get('title',m.get('name')),'lesson_url':url,'video_id':vid,'other_video_fields':links,'has_access':meta.get('hasAccess')})
 return {'ci':ci,'title':c['title'],'jobs':jobs,'metadata_keys':sorted(keys),'module_count':len(modules)}
if __name__=='__main__':
 results=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
  futures={ex.submit(scan,x):x[0] for x in enumerate(courses)}
  for future in concurrent.futures.as_completed(futures):
   try:results.append(future.result())
   except Exception as e:results.append({'ci':futures[future],'error':type(e).__name__})
   (work/'scan-progress.json').write_text(json.dumps(results),encoding='utf-8')
 jobs=[j for r in sorted(results,key=lambda r:r['ci']) for j in r.get('jobs',[])]
 (work/'video-jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'courses_scanned':len(results),'errors':[r for r in results if 'error' in r],'video_lessons':len(jobs),'native_videos':sum(bool(j['video_id']) for j in jobs),'metadata_keys':sorted({k for r in results for k in r.get('metadata_keys',[])})}))
