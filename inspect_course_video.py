import http.cookiejar,urllib.request,pathlib,re,json
jar=http.cookiejar.MozillaCookieJar('C:/Peptide/www.skool.com_cookies.txt')
jar.load(ignore_discard=True,ignore_expires=False)
opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
url='https://www.skool.com/hacksmithspeptalk/classroom/5bc8906c?md=672f3b47b4da4417aaeebf80c97f04ec'
req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
with opener.open(req,timeout=30) as r:page=r.read().decode();final=r.url
work=pathlib.Path('C:/Peptide/video_work');work.mkdir(exist_ok=True)
m=re.search(r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',page,re.S)
print(json.dumps({'authenticated_lesson_page':'/classroom/' in final,'page_bytes':len(page),'next_data':bool(m)}))
if m:
 d=json.loads(m.group(1));(work/'lesson-data.json').write_text(json.dumps(d),encoding='utf-8')
 def walk(o,path=''):
  if isinstance(o,dict):
   for k,v in o.items():
    p=path+'/'+k
    if any(s in k.lower() for s in ['video','playback','stream','mux']):print(json.dumps({'path':p,'type':type(v).__name__,'keys':list(v) if isinstance(v,dict) else None}))
    walk(v,p)
  elif isinstance(o,list):
   for i,v in enumerate(o):walk(v,path+'/'+str(i))
 walk(d)
