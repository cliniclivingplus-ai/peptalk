import json, re, html, pathlib, base64, mimetypes, csv, zipfile

base=pathlib.Path('C:/Peptide/Skool_Archive')
out=pathlib.Path('C:/Peptide/Peptalk_Classroom_Archive')
out.mkdir(exist_ok=True)
inventory=json.loads((base/'inventory.json').read_text(encoding='utf-8'))
lessons=json.loads((base/'archive.json').read_text(encoding='utf-8'))
images=json.loads((base/'image-results.json').read_text(encoding='utf-8'))
def key(url):
    return re.sub(r'\.(png|jpe?g|webp|gif|svg)$','',re.sub(r'-(md|sm|lg)(?=\.|$)','',url.rsplit('/',1)[-1]),flags=re.I)
image_map={key(i['url']):base/i['path'] for i in images if i['status']=='saved'}
def safe(s): return re.sub(r'[<>:"/\\|?*\x00-\x1f]','-',s).strip(' .')
def topic(t):
    if t in ['🌱 Start Here','🌳 Level 2','🪾 Level 3','Premium Access','Table of Contents','FAQ','Keywords and Concepts','Helpful AI Prompts','Beginner Peptide Information']: return '01 - Start Here and Foundations'
    if t in ['Consolidated Dose, Reconstitution, and Cycles','Dosage and Timing','How Much is Needed for a Cycle','Peptide Blends','Peptide Calculator How-To','Peptide Cycle Lengths','Peptide Half-Lives','Peptide Reactions / Pain','Peptide Stacking','Peptide Storage','Peptide Struggles','Reconstitution Cheat Sheet','Understanding Units and Concentration','Nasal Peptides']: return '02 - Dosing Preparation Storage and Safety'
    if t in ['GLP-1 Maintenance','Breaking a Stall','The Last 10 Pounds','Retatrutide Deep Dive','Transitioning GLPs']: return '03 - GLP-1 and Weight Management'
    if t in ['All Things Growth Hormone','The Science of Building Muscle','Joint, Cartilage & Tendon Repair','Training and Exercise','BPC-157 Deep Dive','Tesamorelin Deep Dive']: return '04 - Growth Hormone Muscle and Recovery'
    if t in ['Bioregulator Uses','Slowing Aging: Everything to Fight Aging','Epitalon Deep Dive','SS-31 Deep Dive','Understanding Mitochondria','Energy','Glutathione Deep Dive']: return '05 - Longevity Energy and Bioregulators'
    if t in ['Cognitive Support','Semax Deep Dive','P-21 Deep Dive','Racetam Course','Sleep.']: return '06 - Cognition Mood and Sleep'
    if t in ['Hormones','Fertility','Sexual Health','Skincare','Hair Loss','Melanotan Deep Dive']: return '07 - Hormones Fertility Skin and Hair'
    if t in ['The Immune System','Peptides for Specific Health Issues','Peptide Uses Cheat Sheet','KPV Deep Dive','Thymosin Alpha-1 (TA-1) Deep Dive','VIP Deep Dive','ARA-290 Deep Dive','PNC-27 Deep Dive']: return '08 - Immune Support and Health Conditions'
    if t in ['Nutrition','Recipes','Grillsmith','Amino Acid Blends','Vitamins / Supplements']: return '09 - Nutrition Supplements and Recipes'
    return '10 - Evidence Testing Community and Resources'

css='body{font:17px/1.6 system-ui,sans-serif;color:#17212b;max-width:1000px;margin:40px auto;padding:0 24px}a{color:#075eab}img{max-width:100%;height:auto}table{border-collapse:collapse;display:block;overflow-x:auto}td,th{border:1px solid #aeb8c0;padding:8px}section{border-top:1px solid #bbb;margin-top:40px;padding-top:20px}nav{background:#f1f5f8;padding:20px}.note{background:#fff3d6;padding:16px}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap}input{padding:12px;width:90%}'
def wrap(title,body):return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><style>'+css+'</style><body>'+body+'</body></html>'
def offline_images(markup):
    def sub(m):
        path=image_map.get(key(html.unescape(m.group(2))))
        if not path:return m.group(0)
        mime=mimetypes.guess_type(path.name)[0] or 'image/png'
        return m.group(1)+'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()+m.group(3)
    return re.sub(r'(\bsrc=")([^"]+)(")',sub,markup)

rows=[]; coursefiles=[]; empty=[]; refs=[]
for ci,c in enumerate(inventory):
    ls=[l for l in lessons if l['ci']==ci]
    folder=out/topic(c['title']);folder.mkdir(exist_ok=True)
    filename=f'{ci+1:02d} - {safe(c["title"])}'
    rel=str((folder/(filename+'.html')).relative_to(out)).replace('\\','/')
    nav='<nav><strong>Lessons</strong><ol>'+''.join(f'<li><a href="#lesson-{l["li"]}">{html.escape(l["title"])}</a></li>' for l in ls)+'</ol></nav>'
    body=f'<h1>{html.escape(c["title"])}</h1><p>{html.escape(topic(c["title"]))}</p><p>Saved 4 November 2026 from Hacksmith’s Peptalk Community.</p><p class="note">Lesson text and available images are saved below. Embedded videos remain online on Skool and were not downloaded or transcribed. External links are preserved; their contents are not included unless explicitly stated.</p>'+nav
    plain=[c['title'],topic(c['title']),'Saved 4 November 2026. Embedded videos and external webpages remain online.','']
    for l in ls:
        text='\n\n'.join(e['text'] for e in l['editors']).strip()
        markup='\n'.join(e['html'] for e in l['editors'])
        status='Text saved' if text else ('Images saved; no lesson text' if l['images'] else 'No lesson text exposed; open source lesson for media')
        if not text:empty.append(l)
        source=html.escape(l['url'],quote=True)
        body+=f'<section id="lesson-{l["li"]}"><h2>{html.escape(l["title"])}</h2><p><a href="{source}">Open original lesson</a> · {status}</p>'+offline_images(markup)
        if not markup:body+='<p class="note">This page did not expose lesson text. Use the original lesson link to view its video or other media.</p>'
        ownpath=l['url'].split('?')[0]
        resources=[a for a in l['links'] if a['url'].split('?')[0] != ownpath and a['url'] not in ['https://www.skool.com/hacksmithspeptalk','https://www.skool.com/hacksmithspeptalk/classroom','https://www.skool.com/hacksmithspeptalk/calendar','https://www.skool.com/hacksmithspeptalk/-/members','https://www.skool.com/hacksmithspeptalk/-/leaderboards','https://www.skool.com/hacksmithspeptalk/about','https://www.skool.com/discovery']]
        if resources:
            body+='<details><summary>Resource links</summary><ul>'+''.join('<li><a href="'+html.escape(a['url'],quote=True)+'">'+html.escape(a['title'] or a['url'])+'</a></li>' for a in resources)+'</ul></details>'
            refs.extend({'topic':topic(c['title']),'course':c['title'],'lesson':l['title'],'resource':a['title'],'url':a['url'],'source':l['url']} for a in resources)
        body+='</section>'
        plain.extend([l['title'],l['url'],status,text or '[No lesson text exposed. Open original lesson for media.]',''])
        rows.append({'topic':topic(c['title']),'course':c['title'],'lesson':l['title'],'source':l['url'],'status':status,'characters':len(text),'images':len(l['images']),'local_file':rel})
    (folder/(filename+'.html')).write_text(wrap(c['title'],body),encoding='utf-8')
    (folder/(filename+'.txt')).write_text('\n\n'.join(plain),encoding='utf-8')
    coursefiles.append((topic(c['title']),c['title'],rel,len(ls)))

for name,data in [('Lesson_Index.csv',rows),('Resource_Links.csv',refs)]:
    with (out/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(data[0]));w.writeheader();w.writerows(data)
index='<h1>Peptalk Classroom Archive</h1><p>75 courses · 797 accessible lesson pages · 80 embedded images saved · 4 November 2026</p><p class="note">Embedded videos were not downloaded or transcribed. External webpages and cited PDF contents remain linked. Lessons shown without accessible links in the classroom were not extracted.</p><p>Open a course below. Each HTML file contains its lesson text, source links, and embedded offline images. TXT copies support full-text searching.</p><input id="q" aria-label="Search courses" placeholder="Filter by topic or course name"><div id="courses">'
for t in sorted(set(x[0] for x in coursefiles)):
    index+='<section><h2>'+html.escape(t)+'</h2><ul>'+''.join('<li><a href="'+html.escape(p,quote=True)+'">'+html.escape(title)+'</a> ('+str(count)+' lessons)</li>' for tt,title,p,count in coursefiles if tt==t)+'</ul></section>'
index+='</div><script>document.getElementById("q").addEventListener("input",function(){const q=this.value.toLowerCase();document.querySelectorAll("#courses li").forEach(e=>e.hidden=!e.textContent.toLowerCase().includes(q));});</script>'
(out/'START_HERE.html').write_text(wrap('Peptalk Classroom Archive',index),encoding='utf-8')
report='''Peptalk Classroom Archive — Coverage Report
Saved: 4 November 2026

Captured all 797 accessible lesson links found across all 75 classroom courses.
Saved lesson HTML and plain text, source URLs, original headings/tables/links, and all 80 embedded lesson image references as offline images inside the HTML course files.

LIMITATIONS
- Embedded videos were not downloaded or transcribed. A supported player download attempt failed; all lesson source links are preserved.
- External webpages, research articles, vendor pages and cited PDFs remain links. Their full contents have not been downloaded.
- Some classroom sidebar items were displayed as text without an accessible lesson link. These were not extracted. An example is “Side Effects and Red Flags” in Beginner Peptide Information.
- Pages with no exposed text may contain a video, image, or other resource. They are explicitly flagged in Lesson_Index.csv and listed below.
- Course content is archived as written, including its disclaimers; claims have not been independently verified.

HOW TO USE
Open START_HERE.html after downloading the folder or ZIP. Topic folders contain one HTML file and one searchable TXT file per original course. HTML course files include their images and work independently offline. Lesson_Index.csv lists every accessible lesson and its capture status. Resource_Links.csv lists additional resource links.

PAGES WITHOUT TEXT
'''
report+='\n'.join(f'{l["course"]} — {l["title"]}\n{l["url"]}' for l in empty)
(out/'Coverage_Report.txt').write_text(report,encoding='utf-8')
(out/'README.txt').write_text('Open START_HERE.html. See Coverage_Report.txt for what was saved and what remains online.\n75 courses / 797 accessible lesson pages / 80 image references saved.\n',encoding='utf-8')
with zipfile.ZipFile(out.parent/'Peptalk_Classroom_Archive.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in out.rglob('*'):
        if f.is_file():z.write(f,f.relative_to(out.parent))
print(json.dumps({'courses':len(coursefiles),'lessons':len(rows),'images_mapped':len(image_map),'no_text_pages':len(empty),'files':len(list(out.rglob('*'))),'zip_bytes':(out.parent/'Peptalk_Classroom_Archive.zip').stat().st_size}))
