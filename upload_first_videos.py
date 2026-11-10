import pathlib,json,configparser,urllib.request,subprocess
ROOT=pathlib.Path('C:/Peptide');WORK=ROOT/'video_work';LOCAL=ROOT/'Classroom - Course Folders'
config=configparser.ConfigParser(interpolation=None);config.read(WORK/'rclone.conf',encoding='utf-8')
token=json.loads(config['raaghav_course']['token'])['access_token']
req=urllib.request.Request('https://www.googleapis.com/drive/v3/about?fields=user',headers={'Authorization':'Bearer '+token})
with urllib.request.urlopen(req,timeout=30) as r:user=json.load(r)['user']
if user.get('emailAddress','').lower()!='raaghav.plumnsugar@gmail.com':raise SystemExit('Authorized account does not match Raaghav; stopped before uploading')
print(json.dumps({'account':user.get('emailAddress'),'target':'Classroom - Course Folders'}),flush=True)
status=json.loads((WORK/'upload-status.json').read_text(encoding='utf-8'))
paths=[str(pathlib.Path(i['local_path']).relative_to(LOCAL)).replace('\\','/') for i in status['verified_videos']]
listing=WORK/'first-six-upload.txt';listing.write_text('\n'.join(paths)+'\n',encoding='utf-8')
base=['rclone','--config',str(WORK/'rclone.conf'),'--log-level','ERROR']
cmd=base+['copy',str(LOCAL),'raaghav_course:','--files-from',str(listing),'--checksum','--immutable','--transfers','2','--checkers','4']
subprocess.run(cmd,check=True)
subprocess.run(base+['check',str(LOCAL),'raaghav_course:','--files-from',str(listing),'--one-way','--checkers','4'],check=True)
remote=subprocess.run(base+['lsjson','raaghav_course:','--recursive','--files-only','--files-from',str(listing),'--hash'],check=True,capture_output=True,text=True,encoding='utf-8')
files=json.loads(remote.stdout);by_path={f['Path']:f for f in files}
for i,p in zip(status['verified_videos'],paths):
 f=by_path[p]
 if f['Size']!=i['bytes']:raise ValueError('Drive file size does not match')
 i.update(upload_status='verified_on_drive',drive_file_id=f['ID'],drive_url='https://drive.google.com/file/d/'+f['ID']+'/view')
status['upload_blocker']=None
(WORK/'upload-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'uploaded_and_checked':len(files),'bytes':sum(f['Size'] for f in files),'first_video_url':status['verified_videos'][0]['drive_url']}),flush=True)
