import sys,json,pathlib,re,subprocess
sys.path.insert(0,'C:/Peptide/video_tools')
import yt_dlp
d=json.loads(pathlib.Path('C:/Peptide/video_work/lesson-data.json').read_text(encoding='utf-8'))['props']['pageProps']
v=d['video']
url='https://stream.video.skool.com/'+v['playbackId']+'.m3u8?token='+v['playbackToken']
root=pathlib.Path('C:/Peptide/Classroom - Course Folders')
folder=next(p for p in root.iterdir() if p.name.startswith('02 -'))
class Quiet:
 def debug(self,msg):pass
 def warning(self,msg):pass
 def error(self,msg):print('Downloader error: '+re.sub(r'https?://\S+','[media URL]',str(msg)))
opts={'outtmpl':str(folder/'004 - Community Video Overview.%(ext)s'),'format':'bv*+ba/b','merge_output_format':'mp4','concurrent_fragment_downloads':4,'quiet':True,'no_warnings':True,'logger':Quiet(),'http_headers':{'Referer':'https://www.skool.com/','Origin':'https://www.skool.com'},'socket_timeout':25,'retries':3,'fragment_retries':3}
with yt_dlp.YoutubeDL(opts) as y:
 info=y.extract_info(url,download=True)
print(json.dumps({'downloaded':True,'duration':info.get('duration'),'files':[{'name':p.name,'bytes':p.stat().st_size} for p in folder.glob('004 - Community Video Overview.*') if p.suffix!='.txt']}))
