(() => {
  'use strict';
  const STORE_KEY = 'nightcity_personal_os_v1';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const todayISO = () => new Date().toLocaleDateString('en-CA');
  const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = (value, opts={month:'short',day:'numeric'}) => value ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined,opts) : 'NO DATE';
  const niceDate = d => d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const uidShort = value => String(value || '').slice(0,6).toUpperCase();
  const defaultState = () => ({
    version:1, createdAt:new Date().toISOString(), directive:'MAKE SOMETHING YOU LOVE.',
    missions:[
      {id:uid(),title:'Rebuild the creative pipeline',description:'Bring the anime micro-essay project back to life. Keep the format short, personal, and beautiful.',status:'active',priority:'high',dueDate:'',category:'Main quest',createdAt:Date.now()},
      {id:uid(),title:'Build the Japan knowledge archive',description:'Keep exploring regions, prefectures, towns, food, folklore, culture, and places worth discovering.',status:'active',priority:'normal',dueDate:'',category:'Side quest',createdAt:Date.now()},
      {id:uid(),title:'Make room for a little movement',description:'A small, repeatable win. Consistency over perfection.',status:'active',priority:'low',dueDate:'',category:'Daily life',createdAt:Date.now()}
    ],
    notes:[
      {id:uid(),title:'Okhotsk — field notes',kind:'Japan research',tags:'Japan, Hokkaido, Okhotsk',body:'A region to keep exploring: Kitami, Tanno, Rubeshibe, local food, stories, landscapes, and the details that make each place feel distinct.',createdAt:Date.now()},
      {id:uid(),title:'Small moments in anime',kind:'Creative reference',tags:'Anime, storytelling, video',body:'The quiet moments that linger: a pause, a kind gesture, a familiar place, a little detail in the background. The point is to share why it matters, like talking to a friend.',createdAt:Date.now()},
      {id:uid(),title:'Visual atmosphere',kind:'Design reference',tags:'Pixel art, tea house, purple, silver',body:'Calm Japanese tea-house atmosphere, tiny ambient details, restrained color, tactile textures, and a warm feeling of returning somewhere familiar.',createdAt:Date.now()}
    ],
    ideas:[
      {id:uid(),title:'A tiny moment in Frieren that says everything',format:'Short video',status:'idea',channel:'Shorts / TikTok',dueDate:'',logline:'A small character moment that quietly reveals something beautiful.',script:'',createdAt:Date.now()},
      {id:uid(),title:'Why a quiet scene can stay with you',format:'Short video',status:'drafting',channel:'Shorts / TikTok',dueDate:'',logline:'A reflection on atmosphere, pacing, and emotional memory.',script:'',createdAt:Date.now()},
      {id:uid(),title:'The background details I always notice',format:'Collection',status:'idea',channel:'Personal archive',dueDate:'',logline:'A running list of little visual details worth revisiting.',script:'',createdAt:Date.now()}
    ],
    media:[
      {id:uid(),title:'Frieren: Beyond Journey’s End',type:'Anime',status:'watching',progress:'',rating:'',notes:'Favorite small moments and quiet character details.',createdAt:Date.now()},
      {id:uid(),title:'Manga reading list',type:'Manga',status:'planned',progress:'',rating:'',notes:'Keep track of series to revisit and discover.',createdAt:Date.now()},
      {id:uid(),title:'Films worth remembering',type:'Film',status:'planned',progress:'',rating:'',notes:'A home for scenes, atmosphere, and recommendations.',createdAt:Date.now()}
    ],
    places:[
      {id:uid(),name:'Kitami',region:'Hokkaido · Okhotsk',country:'Japan',coordinates:'',link:'https://www.google.com/maps/search/?api=1&query=Kitami%2C+Hokkaido%2C+Japan',notes:'A place to explore through local food, culture, and history.',createdAt:Date.now()},
      {id:uid(),name:'Tanno',region:'Kitami · Hokkaido',country:'Japan',coordinates:'',link:'https://www.google.com/maps/search/?api=1&query=Tanno%2C+Kitami%2C+Hokkaido%2C+Japan',notes:'Keep researching the town and its stories.',createdAt:Date.now()},
      {id:uid(),name:'Rubeshibe',region:'Kitami · Hokkaido',country:'Japan',coordinates:'',link:'https://www.google.com/maps/search/?api=1&query=Rubeshibe%2C+Kitami%2C+Hokkaido%2C+Japan',notes:'A saved research destination.',createdAt:Date.now()}
    ],
    events:[], skills:[
      {id:uid(),name:'Creative expression',level:3,description:'Make things that feel like you.'},
      {id:uid(),name:'Research & discovery',level:4,description:'Follow curiosity; collect the details.'},
      {id:uid(),name:'Video craft',level:3,description:'Writing, editing, sound, and visual rhythm.'},
      {id:uid(),name:'Everyday momentum',level:2,description:'Build steady routines without pressure.'}
    ],
    habits:[
      {id:uid(),title:'Move a little',frequency:'Daily',checkedDate:''},
      {id:uid(),title:'Drink some water',frequency:'Daily',checkedDate:''},
      {id:uid(),title:'Make or collect something',frequency:'Daily',checkedDate:''}
    ],
    inbox:[{id:uid(),title:'Save a beautiful anime moment',body:'A scene, image, line, or feeling to revisit later.',category:'Creative',createdAt:Date.now(),read:false}],
    journal:{},settings:{theme:'yellow',sound:false,compact:false}
  });
  let state;
  try { state = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState(); }
  catch { state = defaultState(); }
  try { if (!localStorage.getItem(STORE_KEY)) localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  const knownPages = ['dashboard','missions','archive','studio','media','map','calendar','character','inbox','settings'];
  let currentPage='dashboard', missionFilter='all', archiveFilter='all', calendarDate=new Date(), searchLayer=null;
  const save = () => { try { localStorage.setItem(STORE_KEY,JSON.stringify(state)); $('#storage-indicator').textContent='LOCAL STORAGE ACTIVE'; } catch(e) { $('#storage-indicator').textContent='STORAGE FULL — EXPORT BACKUP'; toast('Storage is full. Export a backup and remove large text entries.'); } };
  const toast = message => { const el=document.createElement('div');el.className='toast';el.innerHTML=message;$('#toast-root').append(el);setTimeout(()=>el.remove(),3200); };
  const setTheme = () => { document.documentElement.dataset.theme=state.settings?.theme||'yellow'; document.body.classList.toggle('compact',!!state.settings?.compact); };
  const audioTick = () => { if(!state.settings?.sound) return; try { const ctx=new (window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='square';osc.frequency.value=660;gain.gain.setValueAtTime(.025,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.055);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.06); } catch {} };
  const pageMeta = {
    dashboard:['YOUR WORLD // YOUR RULES','GOOD EVENING','The city is yours. What are we doing today?'],
    missions:['OBJECTIVES // ACTIVE CONTRACTS','MISSION CONTROL','A little direction. A lot of room to roam.'],
    archive:['KNOWLEDGE // MEMORY BANK','THE ARCHIVE','Collect the things you want to remember.'],
    studio:['IDEAS // PRODUCTION PIPELINE','CREATOR STUDIO','From first spark to the finished frame.'],
    media:['WATCH // READ // REMEMBER','MEDIA LIBRARY','A record of stories, worlds, and moments.'],
    map:['PLACES // POSSIBLE DETOURS','EXPLORATION','A personal map of places worth knowing.'],
    calendar:['TIME // UPCOMING SIGNALS','YOUR CALENDAR','Give the important things somewhere to land.'],
    character:['SKILLS // ROUTINES // PROGRESS','CHARACTER PROFILE','Progress at your own pace. No XP grind required.'],
    inbox:['QUICK CAPTURE // UNSORTED THOUGHTS','TRANSMISSIONS','Catch a thought before it disappears.'],
    settings:['PREFERENCES // LOCAL INSTANCE','SYSTEM SETTINGS','Make this space feel like yours.']
  };
  const navigate = page => { if(!knownPages.includes(page)) return; currentPage=page;render(); window.scrollTo({top:0,behavior:'smooth'}); $('#mobile-drawer').hidden=true; audioTick(); };
  const bindNavigation = () => { $$('[data-page]').forEach(b=>{b.addEventListener('click',()=>navigate(b.dataset.page));}); $('#mobile-more').addEventListener('click',()=>$('#mobile-drawer').hidden=false); $$('[data-close-drawer]').forEach(b=>b.addEventListener('click',()=>$('#mobile-drawer').hidden=true)); $('#search-open').addEventListener('click',openSearch);$('#quick-capture').addEventListener('click',()=>openEditor('inbox')); };
  const countActive = () => state.missions.filter(x=>x.status==='active').length;
  const dayHabitCount = () => state.habits.filter(h=>h.checkedDate===todayISO()).length;
  const updateClock = () => { const d=new Date();$('#clock').textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false});$('#date-label').textContent=niceDate(d); };
  const titleForPage = page => pageMeta[page]?.[1]||'OVERVIEW';
  function render(){
    setTheme(); const meta=pageMeta[currentPage];$('#page-eyebrow').textContent=meta[0];$('#page-title').innerHTML=currentPage==='dashboard'?`${getGreeting()}<span class="title-period">.</span>`:escapeHTML(meta[1]);$('#page-subtitle').textContent=meta[2];$('#crumb-current').textContent=titleForPage(currentPage);$('#inbox-count').textContent=state.inbox.length||'';
    updateClock(); const root=$('#page-content'); const renderers={dashboard:renderDashboard,missions:renderMissions,archive:renderArchive,studio:renderStudio,media:renderMedia,map:renderMap,calendar:renderCalendar,character:renderCharacter,inbox:renderInbox,settings:renderSettings};root.innerHTML=renderers[currentPage]();
    $$('.nav-item,[data-page].mobile-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));$$('.mobile-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));
  }
  function getGreeting(){const h=new Date().getHours();return h<12?'GOOD MORNING':h<18?'GOOD AFTERNOON':'GOOD EVENING';}
  function panel(title, kicker, body, code='SYS / 01'){return `<section class="panel"><header class="panel-head"><div><div class="panel-kicker">${kicker}</div><h2 class="panel-title">${title}</h2></div><span class="panel-code">${code}</span></header><div class="panel-body">${body}</div></section>`;}
  function metric(label,value,caption,cls=''){return `<div class="panel metric ${cls}"><div class="metric-label">${label}</div><strong>${value}</strong><small>${caption}</small></div>`;}
  function empty(title,desc){return `<div class="empty-state"><b>${title}</b>${desc}</div>`;}
  function actionButton(label,action,cls='btn small',attrs=''){return `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;}
  function renderDashboard(){
    const active=state.missions.filter(m=>m.status==='active').slice(0,3), inbox=state.inbox.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0,3), soon=state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>e.date>=todayISO()).slice(0,3);
    const oldNotes=state.notes.length?state.notes[(new Date().getDate()+state.notes.length-1)%state.notes.length]:null;
    const todayLog=state.journal[todayISO()]||'';
    const taskRows=active.length?active.map(m=>`<div class="task-line"><button class="check" data-action="toggle-mission" data-id="${m.id}" aria-label="Complete mission">${m.status==='done'?'✓':''}</button><div class="task-line-main"><strong>${escapeHTML(m.title)}</strong><small>${escapeHTML(m.category||'OBJECTIVE')} · ${escapeHTML(m.priority.toUpperCase())} PRIORITY</small></div><span class="due">${m.dueDate?fmtDate(m.dueDate):'NO DEADLINE'}</span></div>`).join(''):empty('NO ACTIVE CONTRACTS','Add a mission when something needs your attention.');
    const transRows=inbox.length?inbox.map(i=>`<div class="transmission-line"><span class="transmission-symbol">⌁</span><div><strong>${escapeHTML(i.title)}</strong><small>${escapeHTML(i.category||'UNSORTED')} · ${new Date(i.createdAt).toLocaleDateString()}</small></div></div>`).join(''):empty('CHANNEL CLEAR','Your next thought can land here.');
    const upcoming=soon.length?soon.map(e=>`<div class="task-line"><span class="transmission-symbol">▦</span><div class="task-line-main"><strong>${escapeHTML(e.title)}</strong><small>${fmtDate(e.date,{month:'short',day:'numeric',year:'numeric'})}${e.time?' · '+escapeHTML(e.time):''}</small></div></div>`).join(''):empty('NOTHING SCHEDULED','A little open space can be a good thing.');
    return `<div class="hero-panel"><div class="hero-copy"><div class="hero-label">PERSONAL MAINFRAME // ONLINE</div><h2>YOUR LIFE.<br>YOUR SIDE QUESTS.</h2><p>No score to chase. No one to impress. Just a place to keep your ideas, projects, discoveries, and little everyday wins moving.</p><button class="btn primary" data-page="missions">VIEW ACTIVE OBJECTIVES ↗</button></div><div class="hero-side"><div class="directive-label">TODAY'S DIRECTIVE // 001</div><div class="directive-text">${escapeHTML(state.directive||'MAKE SOMETHING YOU LOVE.')}</div><button class="directive-edit" data-action="edit-directive">EDIT DIRECTIVE ↗</button></div><div class="hero-decor">PERSONAL INSTANCE / NIGHT CITY</div></div>
    <div class="grid four" style="margin-top:14px">${metric('ACTIVE MISSIONS',countActive(), 'OBJECTIVES IN MOTION')}${metric('ARCHIVE ENTRIES',state.notes.length,'IDEAS & KNOWLEDGE','cyan')}${metric('CREATOR QUEUE',state.ideas.filter(i=>i.status!=='published').length,'IN THE PIPELINE','green')}${metric('TODAY CHECK-INS',`${dayHabitCount()}/${state.habits.length}`,'YOUR OWN PACE','red')}</div>
    <div class="grid two" style="margin-top:14px"><div>${panel('Active contracts','YOUR CURRENT OBJECTIVES',`${taskRows}<div class="divider"></div><button class="text-link" data-page="missions">OPEN MISSION CONTROL ↗</button>`,'01 / QUESTS')}</div><div>${panel('Incoming transmissions','RECENT CAPTURES',`${transRows}<div class="divider"></div><button class="text-link" data-page="inbox">OPEN TRANSMISSIONS ↗</button>`,'02 / INBOX')}</div></div>
    <div class="grid two" style="margin-top:14px"><div>${panel('Upcoming signals','WHAT IS ON THE HORIZON',`${upcoming}<div class="divider"></div><button class="text-link" data-page="calendar">OPEN CALENDAR ↗</button>`,'03 / TIME')}</div><div>${panel('Archive signal','A RANDOM RETURN TO SOMETHING',oldNotes?`<div class="recommend-card"><div class="recommend-graphic">⌘</div><div><strong>${escapeHTML(oldNotes.title)}</strong><small>${escapeHTML(oldNotes.kind||'PERSONAL NOTE')} · ${escapeHTML(oldNotes.tags||'')}</small></div></div><p class="log-entry" style="margin-top:12px">${escapeHTML(oldNotes.body.slice(0,170))}${oldNotes.body.length>170?'…':''}</p><button class="text-link" data-action="edit" data-type="note" data-id="${oldNotes.id}">REVISIT ENTRY ↗</button>`:empty('NOTHING TO RESURFACE','Add your first archive entry.'),'04 / MEMORY')}</div></div>
    <div class="grid two" style="margin-top:14px"><div>${panel('Daily log','A PLACE TO LEAVE A TRACE',`<div class="log-entry">${todayLog?escapeHTML(todayLog):'No entry for today yet. A sentence is enough. A whole page is welcome too.'}</div><div class="divider"></div><button class="btn small" data-action="edit-journal">${todayLog?'EDIT TODAY\'S LOG':'WRITE A DAILY LOG'} ↗</button>`,'05 / JOURNAL')}</div><div>${panel('Your channels','JUMP INTO YOUR WORLD',`<div class="grid three" style="gap:7px"><button class="btn" data-page="studio">◈<br>STUDIO</button><button class="btn" data-page="media">▣<br>MEDIA</button><button class="btn" data-page="map">⌖<br>EXPLORE</button></div><div class="sparkline">${[22,36,28,51,44,65,48,78,59,85,69,100,81,94].map(v=>`<i style="height:${v}%"></i>`).join('')}</div><small class="muted" style="font-size:7px">MOMENTUM ISN'T A STRAIGHT LINE. THAT'S FINE.</small>`,'06 / SHORTCUTS')}</div></div>`;
  }
  function renderMissions(){
    const filtered=state.missions.filter(m=>missionFilter==='all'||m.status===missionFilter).sort((a,b)=>({active:0,paused:1,done:2}[a.status]??3)-({active:0,paused:1,done:2}[b.status]??3));
    const cards=filtered.length?filtered.map(m=>`<article class="record-card"><div class="record-top"><div><h3>${escapeHTML(m.title)}</h3><div class="record-meta"><span class="tag ${m.priority==='high'?'red':m.priority==='low'?'cyan':'yellow'}">${escapeHTML(m.priority)} PRIORITY</span><span class="tag">${escapeHTML(m.category||'MISSION')}</span>${m.dueDate?`<span class="tag">DUE ${fmtDate(m.dueDate)}</span>`:''}</div></div><span class="status-pill ${m.status}">${escapeHTML(m.status)}</span></div>${m.description?`<p>${escapeHTML(m.description)}</p>`:''}<div class="record-actions">${m.status!=='done'?actionButton(m.status==='active'?'PAUSE':'RESUME','cycle-mission','btn small ghost',`data-id="${m.id}"`):actionButton('REOPEN','reopen-mission','btn small ghost',`data-id="${m.id}"`)}${actionButton('EDIT','edit','btn small ghost',`data-type="mission" data-id="${m.id}"`)}${actionButton('DELETE','delete','btn small danger',`data-type="mission" data-id="${m.id}"`)}</div></article>`).join(''):empty('NO MISSIONS IN THIS FILTER','Create a mission, big or small.');
    return `<div class="module-intro"><div><h2>Active objectives</h2><p>Main quests, side quests, tiny errands, and projects that matter to you. There's no penalty for changing the plan.</p></div><button class="btn primary" data-action="add" data-type="mission">＋ NEW MISSION</button></div><div class="mini-stat-row" style="margin-bottom:15px"><div class="mini-stat"><b>${state.missions.length}</b><small>ALL MISSIONS</small></div><div class="mini-stat"><b>${countActive()}</b><small>ACTIVE</small></div><div class="mini-stat"><b>${state.missions.filter(m=>m.status==='done').length}</b><small>COMPLETED</small></div></div><div class="filter-row">${['all','active','paused','done'].map(f=>`<button class="filter-btn ${missionFilter===f?'active':''}" data-action="mission-filter" data-value="${f}">${f.toUpperCase()}</button>`).join('')}</div><div class="record-list">${cards}</div>`;
  }
  function renderArchive(){
    const cats=[...new Set(state.notes.map(n=>n.kind||'General'))];const entries=state.notes.filter(n=>archiveFilter==='all'||n.kind===archiveFilter);
    return `<div class="module-intro"><div><h2>Memory bank</h2><p>Research, personal notes, reference material, ideas, and little details you don't want to lose.</p></div><button class="btn primary" data-action="add" data-type="note">＋ NEW ENTRY</button></div><div class="filter-row"><button class="filter-btn ${archiveFilter==='all'?'active':''}" data-action="archive-filter" data-value="all">ALL ENTRIES</button>${cats.map(c=>`<button class="filter-btn ${archiveFilter===c?'active':''}" data-action="archive-filter" data-value="${escapeHTML(c)}">${escapeHTML(c.toUpperCase())}</button>`).join('')}</div><div class="archive-grid">${entries.length?entries.map(n=>`<article class="archive-item"><div class="archive-symbol">▤</div><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.body.slice(0,115))}${n.body.length>115?'…':''}</p><div class="item-bottom"><small>${escapeHTML(n.kind||'GENERAL')} · ${escapeHTML(n.tags||'NO TAGS')}</small><span><button data-action="edit" data-type="note" data-id="${n.id}">OPEN ↗</button> <button data-action="delete" data-type="note" data-id="${n.id}">×</button></span></div></article>`).join(''):empty('ARCHIVE EMPTY','Start collecting the things you want to keep.')}</div>`;
  }
  function renderStudio(){
    const stages=[['idea','IDEAS'],['drafting','DRAFTING'],['editing','IN PROGRESS'],['published','PUBLISHED']];
    const items=stages.map(([key,label])=>{const list=state.ideas.filter(i=>i.status===key);return `<section class="panel"><header class="panel-head"><div><div class="panel-kicker">PIPELINE STAGE</div><h2 class="panel-title">${label}</h2></div><span class="tag">${list.length} ITEMS</span></header><div class="panel-body">${list.length?`<div class="record-list">${list.map(i=>`<article class="studio-item status-${key}"><div class="studio-symbol">◈</div><h3>${escapeHTML(i.title)}</h3><p>${escapeHTML(i.logline||i.format||'No summary yet.')}</p><div class="item-bottom"><small>${escapeHTML(i.channel||i.format||'CREATOR')}</small><span><button data-action="edit" data-type="idea" data-id="${i.id}">EDIT ↗</button> <button data-action="delete" data-type="idea" data-id="${i.id}">×</button></span></div></article>`).join('')}</div>`:empty('NO ITEMS HERE','Ideas move through the pipeline as you create.')}</div></section>`;}).join('');
    return `<div class="module-intro"><div><h2>Make something beautiful</h2><p>A calm little production desk for scripts, short-form ideas, references, and publishing. Keep it lightweight and fun.</p></div><button class="btn primary" data-action="add" data-type="idea">＋ NEW IDEA</button></div><div class="grid two" style="align-items:start">${items}</div><div class="section-row"><h2>Production notes</h2><span>THE SMALL DETAILS MATTER</span></div><div class="panel"><div class="panel-body"><div class="grid three"><div><span class="tag yellow">01 / WRITE</span><p class="muted" style="font-size:8px;line-height:1.7">Start with the moment you want to share. Write like you're telling a friend.</p></div><div><span class="tag cyan">02 / MAKE</span><p class="muted" style="font-size:8px;line-height:1.7">Keep visuals, audio, and pacing in service of the feeling.</p></div><div><span class="tag green">03 / RELEASE</span><p class="muted" style="font-size:8px;line-height:1.7">Save the final version and note what you'd like to try next time.</p></div></div></div></div>`;
  }
  function renderMedia(){
    const types=['All','Anime','Manga','Film','Book','Game','Other'];
    const filter=window.mediaFilter||'All';
    const list=state.media.filter(m=>filter==='All'||m.type===filter);
    const cards=list.map(m=>{
      const symbol=m.type==='Manga'?'▥':m.type==='Film'?'▧':m.type==='Game'?'▣':'◉';
      return `<article class="media-item"><div class="media-symbol">${symbol}</div><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.notes||'No notes yet.')}</p><div class="item-bottom"><small>${escapeHTML(m.type)} · ${escapeHTML(m.status)}${m.progress?' · '+escapeHTML(m.progress):''}</small><span><button data-action="edit" data-type="media" data-id="${m.id}">OPEN ↗</button> <button data-action="delete" data-type="media" data-id="${m.id}">×</button></span></div></article>`;
    }).join('');
    return `<div class="module-intro"><div><h2>Stories that stay with you</h2><p>Track what you're watching, reading, playing, planning, or coming back to. Keep a record of favorite scenes and feelings.</p></div><button class="btn primary" data-action="add" data-type="media">＋ ADD TITLE</button></div><div class="filter-row">${types.map(t=>`<button class="filter-btn ${filter===t?'active':''}" data-action="media-filter" data-value="${t}">${t.toUpperCase()}</button>`).join('')}</div><div class="media-grid">${cards||empty('NO STORIES LOGGED','Add a story you are enjoying or want to discover.')}</div>`;
  }
  function renderMap(){
    const pins=state.places.slice(0,8).map((p,i)=>`<span class="map-pin" style="left:${13+(i*19)%76}%;top:${17+(i*23)%65}%" title="${escapeHTML(p.name)}">⌖</span>`).join('');
    return `<div class="module-intro"><div><h2>Places worth a detour</h2><p>A personal atlas of locations, destinations, research rabbit holes, and places you'd like to experience. This is a saved-place board, not a live map service.</p></div><button class="btn primary" data-action="add" data-type="place">＋ SAVE PLACE</button></div><div class="map-display"><div class="map-grid-lines"></div><span class="map-label" style="left:9%;top:19%">YOUR DISCOVERY ZONE</span><span class="map-label" style="right:8%;top:38%">OFF THE BEATEN PATH</span><span class="map-label" style="left:34%;bottom:18%">PERSONAL ATLAS / 001</span>${pins}<div class="map-legend">⌖ SAVED PLACES <b style="color:var(--acid)">${state.places.length}</b> &nbsp; // &nbsp; YOUR NEXT DETOUR IS OUT THERE</div></div><div class="section-row"><h2>Saved coordinates</h2><span>${state.places.length} PLACES LOGGED</span></div><div class="record-list">${state.places.length?state.places.map(p=>`<article class="record-card"><div class="record-top"><div><h3>⌖ ${escapeHTML(p.name)}</h3><div class="record-meta"><span class="tag yellow">${escapeHTML(p.region||'UNSPECIFIED REGION')}</span><span class="tag">${escapeHTML(p.country||'')}</span></div></div></div>${p.notes?`<p>${escapeHTML(p.notes)}</p>`:''}<div class="record-actions">${/^https?:\/\//i.test(p.link||'')?`<a class="btn small ghost" href="${escapeHTML(p.link)}" target="_blank" rel="noopener noreferrer">OPEN MAP ↗</a>`:''}${actionButton('EDIT','edit','btn small ghost',`data-type="place" data-id="${p.id}"`)}${actionButton('DELETE','delete','btn small danger',`data-type="place" data-id="${p.id}"`)}</div></article>`).join(''):empty('NO SAVED PLACES','Save a place to start building your personal atlas.')}</div>`;
  }
  function renderCalendar(){
    const year=calendarDate.getFullYear(),month=calendarDate.getMonth(),first=new Date(year,month,1),start=new Date(year,month,1-first.getDay()),today=todayISO();let days='';
    for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=d.toLocaleDateString('en-CA');const events=state.events.filter(e=>e.date===iso);days+=`<div class="calendar-day ${d.getMonth()!==month?'outside':''} ${iso===today?'today':''}"><div class="day-number">${d.getDate()}</div>${events.slice(0,2).map(e=>`<span class="calendar-event" title="${escapeHTML(e.title)}">${escapeHTML(e.title)}</span>`).join('')}${events.length>2?`<span class="calendar-event">+${events.length-2} MORE</span>`:''}</div>`;}
    const monthTitle=calendarDate.toLocaleDateString(undefined,{month:'long',year:'numeric'}).toUpperCase();
    const upcoming=state.events.filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8);
    return `<div class="module-intro"><div><h2>Time, on your terms</h2><p>Keep plans, personal milestones, creative deadlines, and little things you want to look forward to in one place.</p></div><button class="btn primary" data-action="add" data-type="event">＋ ADD EVENT</button></div><div class="panel"><div class="panel-body"><div class="calendar-head"><button class="btn small ghost" data-action="calendar-prev">← PREV</button><strong>${monthTitle}</strong><button class="btn small ghost" data-action="calendar-next">NEXT →</button></div><div class="calendar-grid">${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=>`<div class="calendar-day-name">${d}</div>`).join('')}${days}</div></div></div><div class="section-row"><h2>Upcoming signals</h2><span>${upcoming.length} ON THE RADAR</span></div><div class="record-list">${upcoming.length?upcoming.map(e=>`<article class="record-card"><div class="record-top"><div><h3>${escapeHTML(e.title)}</h3><div class="record-meta"><span class="tag yellow">${fmtDate(e.date,{weekday:'short',month:'short',day:'numeric',year:'numeric'})}${e.time?' · '+escapeHTML(e.time):''}</span></div></div></div>${e.details?`<p>${escapeHTML(e.details)}</p>`:''}<div class="record-actions">${actionButton('EDIT','edit','btn small ghost',`data-type="event" data-id="${e.id}"`)}${actionButton('DELETE','delete','btn small danger',`data-type="event" data-id="${e.id}"`)}</div></article>`).join(''):empty('NO UPCOMING EVENTS','Add something worth looking forward to.')}</div>`;
  }
  function renderCharacter(){
    const skills=state.skills.map(s=>`<div class="skill-row"><strong>${escapeHTML(s.name)}</strong><div><div class="progress"><span style="width:${Math.min(100,(Number(s.level)||1)*20)}%"></span></div><small class="muted" style="font-size:7px">${escapeHTML(s.description||'')}</small></div><em>LV ${s.level}</em><button class="text-link" data-action="edit" data-type="skill" data-id="${s.id}">EDIT</button><button class="text-link" data-action="delete" data-type="skill" data-id="${s.id}">×</button></div>`).join('');
    const habits=state.habits.map(h=>`<div class="habit-row"><button class="check ${h.checkedDate===todayISO()?'done':''}" data-action="toggle-habit" data-id="${h.id}">${h.checkedDate===todayISO()?'✓':''}</button><strong>${escapeHTML(h.title)}</strong><small>${h.checkedDate===todayISO()?'DONE TODAY':escapeHTML(h.frequency||'DAILY')}</small><button class="text-link" data-action="edit" data-type="habit" data-id="${h.id}">EDIT</button><button class="text-link" data-action="delete" data-type="habit" data-id="${h.id}">×</button></div>`).join('');
    return `<div class="module-intro"><div><h2>Your character sheet</h2><p>Track skills you're developing and routines that make life feel better. This isn't a ranking system. It's a reminder that you're growing.</p></div><button class="btn primary" data-action="add" data-type="skill">＋ ADD SKILL</button></div><div class="grid two" style="align-items:start"><div>${panel('Skill progression','YOUR PERSONAL BUILD',`${skills||empty('NO SKILLS YET','Add a skill you want to develop.')}<div class="divider"></div><button class="btn small" data-action="add" data-type="skill">＋ NEW SKILL</button>`,'01 / ATTRIBUTES')}</div><div>${panel('Daily routines','SMALL REPEATABLE WINS',`${habits||empty('NO ROUTINES YET','Add a habit that supports your day.')}<div class="divider"></div><button class="btn small" data-action="add" data-type="habit">＋ ADD ROUTINE</button>`,'02 / ROUTINES')}</div></div><div class="grid three" style="margin-top:14px">${metric('COMPLETED TODAY',dayHabitCount(), 'CHECK-INS, NOT SCORES','green')}${metric('SKILLS TRACKED',state.skills.length,'YOUR BUILD','cyan')}${metric('QUESTS COMPLETED',state.missions.filter(m=>m.status==='done').length,'THAT COUNTS','')}</div>`;
  }
  function renderInbox(){
    const rows=state.inbox.slice().sort((a,b)=>b.createdAt-a.createdAt);
    return `<div class="module-intro"><div><h2>Catch the signal</h2><p>Quick thoughts, links, reminders, scene ideas, things to research. Sort them later. Capture first.</p></div><button class="btn primary" data-action="add" data-type="inbox">＋ NEW TRANSMISSION</button></div><div class="record-list">${rows.length?rows.map(i=>`<article class="record-card"><div class="record-top"><div><h3>${escapeHTML(i.title)}</h3><div class="record-meta"><span class="tag yellow">${escapeHTML(i.category||'UNSORTED')}</span><span class="tag">${new Date(i.createdAt).toLocaleString()}</span></div></div>${!i.read?'<span class="status-pill active">NEW</span>':'<span class="status-pill">READ</span>'}</div>${i.body?`<p>${escapeHTML(i.body)}</p>`:''}<div class="record-actions">${actionButton(i.read?'MARK NEW':'MARK READ','toggle-inbox-read','btn small ghost',`data-id="${i.id}"`)}${actionButton('EDIT','edit','btn small ghost',`data-type="inbox" data-id="${i.id}"`)}${actionButton('DELETE','delete','btn small danger',`data-type="inbox" data-id="${i.id}"`)}</div></article>`).join(''):empty('NO NEW TRANSMISSIONS','This channel is clear. Let it stay that way or send yourself something.')}</div>`;
  }
  function renderSettings(){
    const theme=state.settings?.theme||'yellow';
    return `<div class="module-intro"><div><h2>Configure your world</h2><p>Personal preferences, data portability, and local instance controls. Your personal entries are stored in this browser only.</p></div><span class="tag green">LOCAL-FIRST</span></div><div class="grid two" style="align-items:start"><div>${panel('Interface tuning','LOOK & FEEL',`<div class="field-label">ACCENT PROFILE</div><div class="filter-row">${[['yellow','NIGHT CITY'],['red','AFTER HOURS'],['cyan','NETRUNNER']].map(([v,l])=>`<button class="filter-btn ${theme===v?'active':''}" data-action="theme" data-value="${v}">${l}</button>`).join('')}</div><div class="divider"></div><div class="habit-row"><div style="flex:1"><strong>Ambient interface sounds</strong><small style="display:block;margin-top:4px">Tiny optional interaction tones.</small></div><button class="filter-btn ${state.settings?.sound?'active':''}" data-action="toggle-sound">${state.settings?.sound?'ON':'OFF'}</button></div><div class="habit-row"><div style="flex:1"><strong>Compact interface</strong><small style="display:block;margin-top:4px">Reduce some spacing on smaller screens.</small></div><button class="filter-btn ${state.settings?.compact?'active':''}" data-action="toggle-compact">${state.settings?.compact?'ON':'OFF'}</button></div>`,'01 / DISPLAY')}</div><div>${panel('Data & backups','YOUR DATA BELONGS TO YOU',`<p class="muted" style="font-size:9px;line-height:1.7;margin-top:0">Everything you add is saved in this browser's local storage. It is not uploaded to a server. Export a backup regularly, especially before clearing browser data or moving to another device.</p><button class="btn primary" style="width:100%;margin-bottom:8px" data-action="export">↓ EXPORT FULL BACKUP (.JSON)</button><button class="btn" style="width:100%;margin-bottom:8px" data-action="import">↑ IMPORT BACKUP</button><input type="file" id="import-file" accept="application/json,.json" hidden><div class="divider"></div><div class="mini-stat-row"><div class="mini-stat"><b>${countAllRecords()}</b><small>RECORDS</small></div><div class="mini-stat"><b>1</b><small>LOCAL DEVICE</small></div><div class="mini-stat"><b>0</b><small>EXTERNAL SYNC</small></div></div>`,'02 / STORAGE')}</div></div><div class="section-row"><h2>About this instance</h2><span>NO ACCOUNT REQUIRED</span></div><div class="panel"><div class="panel-body"><div class="grid three"><div><span class="tag yellow">PUBLIC CODE / PRIVATE DATA</span><p class="muted" style="font-size:8px;line-height:1.7">The GitHub Pages website and source code are public. Your entries stay in the browser profile that created them; visitors do not see them.</p></div><div><span class="tag cyan">NO ANALYTICS</span><p class="muted" style="font-size:8px;line-height:1.7">No tracking scripts, external databases, account system, or third-party analytics are included.</p></div><div><span class="tag green">BACKUP BEFORE RESET</span><p class="muted" style="font-size:8px;line-height:1.7">Browser storage can be cleared. Export JSON backups to keep a copy you control.</p></div></div><div class="divider"></div><button class="btn danger small" data-action="reset">RESET THIS INSTANCE</button><span class="muted" style="font-size:7px;margin-left:8px">This removes locally saved entries from this browser.</span></div></div>`;
  }
  function countAllRecords(){return ['missions','notes','ideas','media','places','events','skills','habits','inbox'].reduce((n,k)=>n+(state[k]?.length||0),0);}

  const fields = {
    mission:[['title','Mission name','text',true],['description','Description','textarea'],['category','Type','select',['Main quest','Side quest','Daily life','Creative project']],['priority','Priority','select',['low','normal','high']],['status','Status','select',['active','paused','done']],['dueDate','Due date','date']],
    note:[['title','Entry title','text',true],['kind','Category','text'],['tags','Tags · comma separated','text'],['body','Your notes','textarea']],
    idea:[['title','Project / video title','text',true],['format','Format','select',['Short video','Long video','Article','Collection','Stream']],['status','Pipeline stage','select',['idea','drafting','editing','published']],['channel','Channel / destination','text'],['dueDate','Target date','date'],['logline','The idea in a sentence','textarea'],['script','Script / production notes','textarea']],
    media:[['title','Title','text',true],['type','Media type','select',['Anime','Manga','Film','Book','Game','Other']],['status','Status','select',['planned','watching','reading','playing','completed','paused','dropped']],['progress','Progress · episode, chapter, etc.','text'],['rating','Personal rating · optional','text'],['notes','Notes / favorite moments','textarea']],
    place:[['name','Place name','text',true],['region','Region / neighborhood','text'],['country','Country','text'],['coordinates','Coordinates · optional','text'],['link','Map link','url'],['notes','Why save this place?','textarea']],
    event:[['title','Event / reminder','text',true],['date','Date','date',true],['time','Time · optional','time'],['details','Notes','textarea']],
    skill:[['name','Skill name','text',true],['level','Level · 1–5','number'],['description','What this means to you','textarea']],
    habit:[['title','Routine','text',true],['frequency','Frequency','select',['Daily','Weekly','Whenever','Custom']]],
    inbox:[['title','Transmission title','text',true],['category','Category','select',['Unsorted','Creative','Research','Personal','Reminder','Link']],['body','Details / link / thought','textarea']],
    directive:[['directive','Today’s directive','textarea',true]],
    journal:[['body','Today’s log','textarea',true]]
  };
  const typeLabels={mission:'NEW MISSION',note:'NEW ARCHIVE ENTRY',idea:'NEW CREATOR ITEM',media:'ADD MEDIA',place:'SAVE A PLACE',event:'ADD CALENDAR EVENT',skill:'ADD SKILL',habit:'ADD ROUTINE',inbox:'NEW TRANSMISSION',directive:'TODAY’S DIRECTIVE',journal:'DAILY LOG'};
  function openEditor(type,id=null){
    const sourceMap={mission:'missions',note:'notes',idea:'ideas',media:'media',place:'places',event:'events',skill:'skills',habit:'habits',inbox:'inbox'};
    const collection=sourceMap[type], existing=id&&collection?state[collection].find(x=>x.id===id):null;
    const isEdit=!!existing, current=existing|| (type==='directive'?{directive:state.directive}:type==='journal'?{body:state.journal[todayISO()]||''}:{});
    const title=(isEdit?'EDIT ': '')+(typeLabels[type]||'EDIT ENTRY');
    const form=(fields[type]||[]).map(([name,label,kind,reqOrOpts,maybeOpts])=>{
      const required=kind==='select'?false:!!reqOrOpts; const options=kind==='select'?reqOrOpts:maybeOpts;
      let control='';
      if(kind==='textarea')control=`<textarea class="field-textarea" name="${name}" ${required?'required':''} placeholder="Write something…">${escapeHTML(current[name]||'')}</textarea>`;
      else if(kind==='select')control=`<select class="field-select" name="${name}">${options.map(o=>`<option value="${escapeHTML(o)}" ${(current[name]||options[0])===o?'selected':''}>${escapeHTML(o.toUpperCase())}</option>`).join('')}</select>`;
      else control=`<input class="field-input" type="${kind}" name="${name}" value="${escapeHTML(current[name]??(name==='level'?1:''))}" ${required?'required':''} ${kind==='number'?'min="1" max="5"':''} placeholder="${kind==='date'?'': 'Enter '+label.toLowerCase()}">`;
      return `<div class="form-field ${kind==='textarea'?'full':''}"><label class="field-label">${label}${required?' *':''}</label>${control}</div>`;
    }).join('');
    $('#modal-root').innerHTML=`<div class="modal-backdrop" data-modal-backdrop><section class="modal" role="dialog" aria-modal="true" aria-label="${title}"><header class="modal-header"><div><div class="modal-eyebrow">PERSONAL SYSTEM // ${isEdit?'MODIFY RECORD':'NEW ENTRY'}</div><h2>${title}</h2></div><button class="close-button" type="button" data-close-modal>×</button></header><div class="modal-body"><form id="editor-form" data-type="${type}" data-id="${id||''}"><div class="form-grid">${form}</div><div class="form-actions"><button class="btn ghost" type="button" data-close-modal>CANCEL</button><button class="btn primary" type="submit">${isEdit?'SAVE CHANGES':'SAVE ENTRY'} ↗</button></div></form></div></section></div>`;
    $('[data-close-modal]').focus();
  }
  function closeModal(){ $('#modal-root').innerHTML=''; }
  function onFormSubmit(e){if(e.target.id!=='editor-form')return;e.preventDefault();const form=e.target,type=form.dataset.type,id=form.dataset.id;const fd=new FormData(form), data=Object.fromEntries(fd.entries());
    if(type==='directive'){state.directive=data.directive.trim();save();closeModal();render();toast('Directive updated.');return;}
    if(type==='journal'){state.journal[todayISO()]=data.body.trim();save();closeModal();render();toast('Daily log saved.');return;}
    const collection={mission:'missions',note:'notes',idea:'ideas',media:'media',place:'places',event:'events',skill:'skills',habit:'habits',inbox:'inbox'}[type];if(!collection)return;
    if(type==='skill')data.level=Math.max(1,Math.min(5,Number(data.level)||1));
    if(type==='inbox')data.read=false;
    if(id){const index=state[collection].findIndex(x=>x.id===id);if(index>=0)state[collection][index]={...state[collection][index],...data};}
    else state[collection].unshift({id:uid(),...data,createdAt:Date.now()});
    save();closeModal();render();toast(id?'Changes saved.':'Entry added to your system.');
  }
  function onAction(e){
    const target=e.target.closest('[data-action],[data-page]');if(!target)return;
    if(target.dataset.page){navigate(target.dataset.page);return;}
    const {action,type,id,value}=target.dataset;
    switch(action){
      case 'add':openEditor(type);break;
      case 'edit':openEditor(type,id);break;
      case 'delete':if(confirm('Delete this entry? This cannot be undone.')){const coll={mission:'missions',note:'notes',idea:'ideas',media:'media',place:'places',event:'events',inbox:'inbox'}[type];if(coll)state[coll]=state[coll].filter(x=>x.id!==id);if(type==='skill')state.skills=state.skills.filter(x=>x.id!==id);if(type==='habit')state.habits=state.habits.filter(x=>x.id!==id);save();render();toast('Entry deleted.');}break;
      case 'toggle-mission':{const m=state.missions.find(x=>x.id===id);if(m)m.status=m.status==='done'?'active':'done';save();render();break;}
      case 'cycle-mission':{const m=state.missions.find(x=>x.id===id);if(m)m.status=m.status==='active'?'paused':'active';save();render();break;}
      case 'reopen-mission':{const m=state.missions.find(x=>x.id===id);if(m)m.status='active';save();render();break;}
      case 'mission-filter':missionFilter=value;render();break;
      case 'archive-filter':archiveFilter=value;render();break;
      case 'media-filter':window.mediaFilter=value;render();break;
      case 'edit-directive':openEditor('directive');break;
      case 'edit-journal':openEditor('journal');break;
      case 'toggle-habit':{const h=state.habits.find(x=>x.id===id);if(h)h.checkedDate=h.checkedDate===todayISO()?'':todayISO();save();render();break;}
      case 'toggle-inbox-read':{const item=state.inbox.find(x=>x.id===id);if(item)item.read=!item.read;save();render();break;}
      case 'calendar-prev':calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()-1,1);render();break;
      case 'calendar-next':calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+1,1);render();break;
      case 'theme':state.settings.theme=value;save();render();break;
      case 'toggle-sound':state.settings.sound=!state.settings.sound;save();render();toast(`Interface sounds ${state.settings.sound?'enabled':'disabled'}.`);break;
      case 'toggle-compact':state.settings.compact=!state.settings.compact;save();render();break;
      case 'export':exportBackup();break;
      case 'import':$('#import-file').click();break;
      case 'reset':if(confirm('Reset this browser instance? Export a backup first. All local records will be removed.')){localStorage.removeItem(STORE_KEY);state=defaultState();save();render();toast('Fresh instance initialized.');}break;
    }
  }
  function exportBackup(){const data=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nightcity-personal-os-${todayISO()}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Backup exported. Keep it somewhere safe.');}
  document.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const expected=['missions','notes','ideas','media','places','events','skills','habits','inbox','journal','settings'];if(!parsed||typeof parsed!=='object'||!expected.some(k=>Array.isArray(parsed[k])))throw new Error('This does not look like a Personal System backup.');if(!confirm('Import this backup and replace the data currently in this browser?'))return;const fresh=defaultState();state={...fresh,...parsed,settings:{...fresh.settings,...parsed.settings}};save();render();toast('Backup restored successfully.');}catch(err){alert(`Could not import backup: ${err.message}`);}finally{e.target.value='';}});
  function openSearch(){
    if(searchLayer) return;searchLayer=document.createElement('div');searchLayer.className='search-overlay';searchLayer.innerHTML=`<div class="search-box"><input id="global-search-input" placeholder="Search missions, notes, ideas, places…" autocomplete="off"><div id="global-search-results" class="search-results"><div class="empty-state">TYPE TO SEARCH YOUR PERSONAL SYSTEM</div></div><div class="search-footer"><span>ENTER TO OPEN · ESC TO CLOSE</span><span>LOCAL SEARCH / 001</span></div></div>`;document.body.append(searchLayer);const input=$('#global-search-input');input.focus();input.addEventListener('input',()=>renderSearchResults(input.value));input.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='Enter'){const first=$('.search-result',searchLayer);if(first)first.click();}});searchLayer.addEventListener('click',e=>{if(e.target===searchLayer)closeSearch();});
  }
  function closeSearch(){searchLayer?.remove();searchLayer=null;}
  function renderSearchResults(query){const root=$('#global-search-results');const q=query.trim().toLowerCase();if(!q){root.innerHTML='<div class="empty-state">TYPE TO SEARCH YOUR PERSONAL SYSTEM</div>';return;}
    const groups=[['missions','missions','◎'],['notes','archive','▤'],['ideas','studio','◈'],['media','media','▣'],['places','map','⌖'],['events','calendar','▦'],['inbox','inbox','⇣'],['skills','character','✳'],['habits','character','✓']];let hits=[];
    groups.forEach(([key,page,icon])=>state[key].forEach(item=>{const text=JSON.stringify(item).toLowerCase();if(text.includes(q))hits.push({item,page,icon,key});}));
    root.innerHTML=hits.length?hits.slice(0,20).map(h=>`<button class="search-result" data-page="${h.page}" data-search-id="${h.item.id}" data-search-type="${h.key}"><span>${h.icon}</span><span><strong>${escapeHTML(h.item.title||h.item.name||'Untitled')}</strong><small>${h.page.toUpperCase()} · ${escapeHTML(h.item.category||h.item.status||h.item.type||h.item.kind||'RECORD')}</small></span></button>`).join(''):'<div class="empty-state"><b>NO SIGNAL FOUND</b>Try another keyword.</div>';
    $$('.search-result',root).forEach(btn=>btn.addEventListener('click',()=>{const {page,searchId,searchType}=btn.dataset;closeSearch();navigate(page);setTimeout(()=>{if(searchType==='missions')missionFilter='all';const item=state[searchType].find(x=>x.id===searchId);if(item){const typeMap={missions:'mission',notes:'note',ideas:'idea',media:'media',places:'place',events:'event',inbox:'inbox',skills:'skill',habits:'habit'};openEditor(typeMap[searchType],searchId);}},60);}));
  }
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'){closeSearch();if($('#modal-root').innerHTML)closeModal();$('#mobile-drawer').hidden=true;}});
  $('#modal-root').addEventListener('click',e=>{if(e.target.matches('[data-modal-backdrop]')||e.target.closest('[data-close-modal]'))closeModal();});
  bindNavigation();
  $('#page-content').addEventListener('click',onAction);
  $('#modal-root').addEventListener('submit',onFormSubmit);
  setInterval(updateClock,1000);render();
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
