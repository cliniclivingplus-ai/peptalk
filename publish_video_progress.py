import pathlib,json,csv,subprocess
work=pathlib.Path('C:/Peptide/video_work');state=json.loads((work/'transfer-progress.json').read_text(encoding='utf-8'))
verified=state['verified'];failed=state['failed']
summary=f'Classroom video archive\n\nVerified videos in Drive: {len(verified)} of {state["total_video_lessons"]}\nCurrent transfer status: {state["phase"]}\nReported failures: {len(failed)}\n\nEach completed video is saved in its matching numbered course folder, beside the lesson notes and images. Video names preserve the lesson order.\n\nVideo_Upload_Index.csv lists the actual verified video files and their locations. The transfer is complete only when all expected videos are verified or an unavailable source is explicitly reported.\n'
if failed:summary+='\nUnavailable or failed items:\n'+'\n'.join(r['job']['course']+' — '+r['job']['title']+': '+r.get('error',r['status']) for r in failed)
(work/'video-status-current.txt').write_text(summary,encoding='utf-8')
with (work/'video-upload-index.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['course','lesson','filename','bytes','duration_seconds','drive_url','status']);w.writeheader()
 for v in verified:w.writerow({'course':v['job']['course'],'lesson':v['job']['title'],'filename':pathlib.Path(v['file']).name,'bytes':v['bytes'],'duration_seconds':v.get('duration'),'drive_url':v['drive_url'],'status':'Uploaded and verified'})
base=['rclone','--config',str(work/'rclone.conf'),'--log-level','ERROR','copyto']
subprocess.run(base+[str(work/'video-status-current.txt'),'raaghav_course:READ ME - Video download status.txt','--checksum'],check=True)
subprocess.run(base+[str(work/'video-upload-index.csv'),'raaghav_course:Video_Upload_Index.csv','--checksum'],check=True)
print(json.dumps({'published_verified_count':len(verified),'phase':state['phase']}))
