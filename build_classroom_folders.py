import pathlib,json,re,csv,shutil
b=pathlib.Path('C:/Peptide/Skool_Archive')
out=pathlib.Path('C:/Peptide/Classroom - Course Folders')
out.mkdir(exist_ok=True)
courses=json.loads((b/'inventory.json').read_text(encoding='utf-8'))
lessons=json.loads((b/'archive.json').read_text(encoding='utf-8'))
images=json.loads((b/'image-results.json').read_text(encoding='utf-8'))
def safe(s):return re.sub(r'[<>:"/\\|?*\x00-\x1f]','-',s).strip(' .')[:130]
def key(u):return re.sub(r'\.(png|jpe?g|webp|gif|svg)$','',re.sub(r'-(md|sm|lg)(?=\.|$)','',u.rsplit('/',1)[-1]),flags=re.I)
im={key(x['url']):x for x in images if x['status']=='saved'}
rows=[]
for ci,c in enumerate(courses):
    p=out/f'{ci+1:02d} - {safe(c["title"])}';p.mkdir(exist_ok=True)
    ls=[l for l in lessons if l['ci']==ci]
    index=[c['title'],'Lesson order matches the accessible classroom sidebar.','Videos have NOT been downloaded. Open lesson links to watch on Skool.','']
    for l in ls:
        name=f'{l["li"]+1:03d} - {safe(l["title"])}'
        content='\n\n'.join(e['text'] for e in l['editors']).strip()
        text=l['title']+'\n'+c['title']+'\n\nOriginal lesson: '+l['url']+'\n\n'+(content or '[This lesson exposed no text. Its video or other media must be opened on Skool.]')
        if l['images']:
            text+='\n\nLESSON IMAGES\n'
            for i,x in enumerate(l['images']):
                a=im.get(key(x['url']))
                if a:
                    src=b/a['path']; dest=f'{name} - image {i+1:02d}'+src.suffix
                    shutil.copyfile(src,p/dest);text+=dest+'\n'
        # Preserve all resource links apart from the repeated sidebar/navigation.
        own=l['url'].split('?')[0]
        links=[a for a in l['links'] if a['url'].split('?')[0]!=own and not re.fullmatch(r'https://www.skool.com/(hacksmithspeptalk(?:/(?:classroom|calendar|-/members|-/leaderboards|about))?|discovery)',a['url'])]
        if links:text+='\nRESOURCE LINKS\n'+'\n'.join((a['title'] or 'Resource')+' — '+a['url'] for a in links)
        (p/(name+'.txt')).write_text(text+'\n',encoding='utf-8')
        index+=[name+'.txt',l['url'],'']
        rows.append({'course_order':ci+1,'course':c['title'],'lesson_order':l['li']+1,'lesson':l['title'],'notes_file':str((p/(name+'.txt')).relative_to(out)),'source':l['url'],'video_status':'Not downloaded; use source lesson link'})
    (p/'00 - Course Contents.txt').write_text('\n'.join(index),encoding='utf-8')
(out/'READ ME - Video download status.txt').write_text('Classroom structure: 75 course folders, ordered as in the classroom. Each accessible lesson has its own numbered TXT file. Images are beside their matching lesson notes.\n\nVIDEO STATUS: No videos have been downloaded. The normal video download attempt failed. An alternate browser asset export was also tested and rejected the segmented streaming format. The player has no download option. Original lesson links are included in every note and course contents file.\n\nUnavailable sidebar items without lesson links are not included. External articles and PDFs remain links.\n',encoding='utf-8')
with (out/'Classroom Lesson Index.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
assert len(rows)==797 and len([x for x in out.iterdir() if x.is_dir()])==75
print(json.dumps({'course_folders':75,'lesson_txt_files':797,'image_files':len(list(out.rglob('*.png')))+len(list(out.rglob('*.jpg'))),'total_files':len([x for x in out.rglob('*') if x.is_file()])}))
