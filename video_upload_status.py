import pathlib,json,subprocess,hashlib
root=pathlib.Path('C:/Peptide/Classroom - Course Folders')
items=[]
for p in root.rglob('*.mp4'):
 if '.f' in p.stem:continue
 run=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type','-of','json',str(p)],capture_output=True,text=True,timeout=30)
 if run.returncode:continue
 info=json.loads(run.stdout)
 if {'audio','video'}-{s['codec_type'] for s in info.get('streams',[])}:continue
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 items.append({'course_folder':p.parent.name,'filename':p.name,'local_path':str(p),'bytes':p.stat().st_size,'duration_seconds':float(info['format']['duration']),'sha256':h.hexdigest(),'upload_status':'pending'})
status={'drive_parent_folder':'1T22SSqlihGt0zpG8lDL_Z2mmaaOUZ3yb','classroom_course_folders_root':'16TzxRatyp4iK4iNzBvEEx-wzHAxcgAXB','verified_videos':items,'remaining_video_manifest':'C:/Peptide/video_work/video-jobs.json','upload_blocker':'Drive connector tools unavailable; browser connection fails before opening a page. No video uploads have completed.'}
pathlib.Path('C:/Peptide/video_work/upload-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'verified_video_files':len(items),'bytes':sum(i['bytes'] for i in items),'uploaded_video_files':0}))
