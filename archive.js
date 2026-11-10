function archiveHref(path){return 'Peptalk_Classroom_Archive/'+String(path||'').split('/').map(encodeURIComponent).join('/')}

function renderArchive(){
  const rows=window.communityLessons||[];
  const courses=[...new Set(rows.map(x=>x.course).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  content.innerHTML=`<div class="page-title-row"><div><div class="eyebrow">Local source collection</div><h1>Community archive</h1><p class="subhead">Search the 797 archived lesson records and open their original local course pages. Community material is unverified and used only to discover questions, aliases, and claims to check.</p></div><span class="text-link">${rows.length} records</span></div><section class="panel"><div class="panel-head"><h3>Search the archive index</h3><span class="tier community">UNVERIFIED SOURCE</span></div><div class="toolbar"><input class="search-input" id="archiveSearch" placeholder="Search lesson title, course, or topic…" aria-label="Search archived lesson titles"><select class="filter-select" id="archiveCourse" aria-label="Filter by course"><option>All courses</option>${courses.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select><span class="search-count" id="archiveCount"></span></div><div id="archiveResults" class="archive-results"></div><div class="archive-more-wrap"><button class="suggestion" id="archiveMore">Show more results</button></div></section><div class="disclaimer-strip"><span>◇</span><span><strong>Coverage limits:</strong> embedded videos were not transcribed; linked papers and external pages remain external; some entries have no exposed text. The archive's Coverage_Report.txt records the full capture limits.</span></div>`;
  const query=document.getElementById('archiveSearch');
  const course=document.getElementById('archiveCourse');
  query.value=archiveQuery;
  course.value=archiveCourse;
  function update(reset=true){
    archiveQuery=query.value.trim().toLowerCase();
    archiveCourse=course.value;
    if(reset) archiveLimit=30;
    const found=rows.filter(r=>(archiveCourse==='All courses'||r.course===archiveCourse)&&`${r.lesson} ${r.course} ${r.topic}`.toLowerCase().includes(archiveQuery));
    const visible=found.slice(0,archiveLimit);
    document.getElementById('archiveCount').textContent=`Showing ${visible.length} of ${found.length} matches`;
    document.getElementById('archiveResults').innerHTML=visible.length?visible.map(r=>`<article class="archive-row"><div class="archive-copy"><div class="archive-topic">${escapeHtml(r.topic)} <span>·</span> ${escapeHtml(r.course)}</div><h3>${escapeHtml(r.lesson||'Untitled lesson')}</h3><div class="archive-meta"><span>${escapeHtml(r.status)}</span><span>${Number(r.characters).toLocaleString()} characters</span>${r.images?`<span>${r.images} image refs</span>`:''}</div></div><div class="archive-actions"><a class="archive-open" href="${archiveHref(r.local_file)}" target="_blank" rel="noreferrer">Open local page ↗</a>${r.source?`<a class="text-link" href="${escapeHtml(r.source)}" target="_blank" rel="noreferrer">Source</a>`:''}</div></article>`).join(''):'<div class="empty-state">No archived lesson titles match that search.</div>';
    document.getElementById('archiveMore').hidden=visible.length>=found.length;
  }
  query.addEventListener('input',()=>update());
  course.addEventListener('change',()=>update());
  document.getElementById('archiveMore').addEventListener('click',()=>{archiveLimit+=30;update(false)});
  update();
}
