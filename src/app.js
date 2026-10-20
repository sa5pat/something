/* Music setup: Add audio files to music/ and register each track below. */
const ARTIST='Camie';
const tracks=[
  {title:'CRAVE',src:'music/tracks/crave.mp3',cover:'images/covers/crave.jpg'},
  {title:'Keep your open eyes',artist:'scawta.',src:'music/tracks/keep-your-open-eyes.mp3',cover:'images/covers/keep-your-open-eyes.jpg',dur:'3:21'},
  {title:'Last Surprise',artist:'Atlus Sound Team',src:'music/tracks/last-surprise.mp3',cover:'images/covers/last-surprise.jpg',dur:'3:55'}
];
/* Profile and gallery assets: Add image paths in the lists below. */
const AVATAR='images/profile/profile-cutout.png';
const PHOTOS=['images/gallery/1.jpg','images/gallery/2.jpg','images/gallery/3.jpg','images/gallery/4.jpg'];
/* Try the nested path first, then fall back to the folder containing index.html. */
const flat=p=>p.split('/').pop();
function tryImg(img,src,ok,fail){img.onload=()=>ok&&ok(img);img.onerror=()=>{if(img.dataset.t){fail&&fail(img);return}img.dataset.t=1;img.src=flat(src)};img.src=src}

/* ===== Music player ===== */
const $=id=>document.getElementById(id);
const a=$('audio'),list=$('list'),seek=$('seek'),vol=$('vol');let idx=0;
const VOLUME_SCALE=.3;
let glowRequest=0;
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
const I={play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  vol:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  mute:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.6 3 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z"/></svg>'};
function fill(el){
  const pct=(el.value-el.min)/(el.max-el.min)*100;el.style.setProperty('--p',pct+'%');
  if(el===vol)$('wave').querySelectorAll('i').forEach((bar,i,bars)=>bar.classList.toggle('active',(i+.5)/bars.length*100<=pct));
}
function updateGlow(src){
  const glow=document.querySelector('.glow'),request=++glowRequest;glow.style.opacity='0';
  const img=new Image();img.onload=()=>{if(request!==glowRequest)return;glow.style.backgroundImage=`url("${src}")`;requestAnimationFrame(()=>{if(request===glowRequest)glow.style.opacity='.28'})};
  img.onerror=()=>{if(request===glowRequest)glow.style.opacity='.18'};img.src=src;
}
for(let i=0;i<40;i++){const bar=document.createElement('i');const height=5+Math.abs(Math.sin(i*.71)*12+Math.cos(i*.23)*5);bar.style.height=height+'px';$('wave').appendChild(bar)}
function renderList(){list.innerHTML='';tracks.forEach((t,i)=>{const li=document.createElement('li');
  li.className=i===idx?'on':'';li.innerHTML=`<img src="${t.cover}" alt=""><b>${t.title}</b><span>${t.dur||''}</span>`;li.onclick=()=>load(i,true);list.appendChild(li)})}
function load(i,go){
  idx=(i+tracks.length)%tracks.length;const t=tracks[idx];a.src=t.src;$('err').textContent='';
  $('title').textContent=t.title;$('artist').textContent=t.artist||ARTIST;updateGlow(t.cover);delete t.tried;delete $('cover').dataset.t;tryImg($('cover'),t.cover,null,im=>im.style.opacity=.3);seek.value=0;fill(seek);
  renderList();if(go)a.play().catch(()=>{});
}
$('play').innerHTML=I.play;$('mute').innerHTML=I.vol;
$('play').onclick=()=>a.paused?a.play().catch(()=>{}):a.pause();
$('stop').onclick=()=>{a.pause();a.currentTime=0};
$('mute').onclick=()=>{a.muted=!a.muted;$('mute').innerHTML=a.muted?I.mute:I.vol};
vol.oninput=()=>{a.volume=vol.value/100*VOLUME_SCALE;a.muted=false;$('mute').innerHTML=I.vol;fill(vol)};
seek.oninput=()=>{if(a.duration)a.currentTime=a.duration*seek.value/1000;fill(seek)};
a.onplay=()=>{$('play').innerHTML=I.pause;$('play').ariaLabel='Pause';$('cover').classList.add('spin');$('eq').classList.add('on')};
a.onpause=()=>{$('play').innerHTML=I.play;$('play').ariaLabel='Play';$('cover').classList.remove('spin');$('eq').classList.remove('on')};
a.onended=()=>tracks.length>1?load(idx+1,true):(a.currentTime=0);
a.ontimeupdate=()=>{$('cur').textContent=fmt(a.currentTime);if(a.duration){seek.value=a.currentTime/a.duration*1000;fill(seek)}};
a.onloadedmetadata=()=>{$('dur').textContent=fmt(a.duration);tracks[idx].dur=fmt(a.duration);renderList()};
a.onerror=()=>{const t=tracks[idx];if(!t.tried){t.tried=1;a.src=flat(t.src);return}
  $('err').textContent='Audio file not found. Place crave.mp3 in music/tracks/ next to index.html.'};
a.volume=.2*VOLUME_SCALE;fill(vol);load(0,false);
updateGlow(tracks[0].cover);
tryImg($('av'),AVATAR,im=>{im.hidden=false;$('ini').hidden=true;buildProfileHitMap(im)});
PHOTOS.forEach(p=>{const im=new Image();im.alt='';tryImg(im,p,x=>{$('gal').hidden=false;$('grid').appendChild(x);x.onclick=()=>{$('lb').firstChild.src=x.src;$('lb').classList.add('on')}})});
$('lb').onclick=()=>$('lb').classList.remove('on');
addEventListener('keydown',e=>{if(e.key==='Escape')$('lb').classList.remove('on')});
const profileStage=document.querySelector('.profile-stage'),profileToggle=$('profileToggle');
const profileCards=[...profileStage.querySelectorAll('.art-age,.art-name')];
const popSfx=new Audio('music/sfx/profile-toggle.mp3');popSfx.preload='auto';popSfx.volume=.3;
const hoverSfx=new Audio('music/sfx/hover.mp3');hoverSfx.preload='auto';hoverSfx.volume=.3;
const profileHitCanvas=document.createElement('canvas');
const profileHitContext=profileHitCanvas.getContext('2d',{willReadFrequently:true});
let profileHitAlpha=null,profileHitWidth=0,profileHitHeight=0,profilePointerActive=false;
function buildProfileHitMap(img){
  if(!profileHitContext)return;
  profileHitWidth=256;profileHitHeight=Math.round(profileHitWidth*img.naturalHeight/img.naturalWidth);
  profileHitCanvas.width=profileHitWidth;profileHitCanvas.height=profileHitHeight;
  try{
    profileHitContext.clearRect(0,0,profileHitWidth,profileHitHeight);
    profileHitContext.drawImage(img,0,0,profileHitWidth,profileHitHeight);
    profileHitAlpha=profileHitContext.getImageData(0,0,profileHitWidth,profileHitHeight).data;
  }catch{profileHitAlpha=null}
}
function isProfileImageHit(e){
  const img=$('av');if(!img.naturalWidth||!img.naturalHeight)return false;
  const rect=img.getBoundingClientRect();
  const scale=Math.min(rect.width/img.naturalWidth,rect.height/img.naturalHeight);
  const drawWidth=img.naturalWidth*scale,drawHeight=img.naturalHeight*scale;
  const x=e.clientX-(rect.left+(rect.width-drawWidth)/2),y=e.clientY-(rect.top+(rect.height-drawHeight)/2);
  if(x<0||y<0||x>=drawWidth||y>=drawHeight)return false;
  if(!profileHitAlpha)return true;
  const px=Math.min(profileHitWidth-1,Math.floor(x/drawWidth*profileHitWidth));
  const py=Math.min(profileHitHeight-1,Math.floor(y/drawHeight*profileHitHeight));
  return profileHitAlpha[(py*profileHitWidth+px)*4+3]>24;
}
function updateProfilePointer(e){
  if(e.pointerType==='touch')return;
  const hit=isProfileImageHit(e);
  profileToggle.classList.toggle('profile-hit',hit);
  if(hit&&!profilePointerActive){hoverSfx.pause();hoverSfx.currentTime=0;hoverSfx.play().catch(()=>{})}
  profilePointerActive=hit;
}
profileToggle.addEventListener('pointermove',updateProfilePointer);
profileToggle.addEventListener('pointerleave',()=>{profileToggle.classList.remove('profile-hit');profilePointerActive=false});
profileToggle.onclick=e=>{
  if(e.detail!==0&&!isProfileImageHit(e))return;
  popSfx.pause();popSfx.currentTime=0;popSfx.play().catch(()=>{});
  const folding=profileStage.classList.contains('art-revealed')&&!profileStage.classList.contains('art-fold');
  if(folding){
    profileStage.classList.remove('art-pop');profileToggle.setAttribute('aria-pressed','false');
    if(cameraMotion.matches)profileStage.classList.remove('art-fold','art-revealed');
    else profileStage.classList.add('art-fold');
  }else{
    profileStage.classList.remove('art-fold','art-revealed');void profileStage.offsetWidth;
    profileStage.classList.add('art-revealed','art-pop');profileToggle.setAttribute('aria-pressed','true');
  }
};
profileStage.addEventListener('animationend',e=>{
  if(e.target.matches('.art-name')&&profileStage.classList.contains('art-pop'))profileStage.classList.remove('art-pop');
  if(e.target.matches('.art-age')&&profileStage.classList.contains('art-fold'))profileStage.classList.remove('art-fold','art-revealed');
});

/* Track pointer position to move the light effect across each social link. */
const socialHoverSfx=new Audio('music/sfx/social-hover.mp3');
socialHoverSfx.preload='auto';socialHoverSfx.volume=.2;
document.querySelectorAll('.links a').forEach(el=>{
  el.addEventListener('pointerenter',e=>{
    if(e.pointerType==='touch')return;
    socialHoverSfx.pause();socialHoverSfx.currentTime=0;socialHoverSfx.play().catch(()=>{});
  });
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();
    el.style.setProperty('--mx',e.clientX-r.left+'px');el.style.setProperty('--my',e.clientY-r.top+'px')});
});

/* Camera-style pointer parallax with a damped spring, applied to the page and its layers. */
const cameraMotion=matchMedia('(prefers-reduced-motion: reduce)');
if(!cameraMotion.matches){
  const scene=document.querySelector('main');
  const camera={x:0,y:0,vx:0,vy:0,targetX:0,targetY:0};
  const cameraLayers=[
    [document.querySelector('.profile-backdrop'),.42],
    [document.querySelector('.hero'),.75],
    ...profileCards.map(el=>[el,1.05]),
    [document.querySelector('footer'),.22]
  ].filter(([el])=>el);
  let cameraFrame=0,lastCameraFrame=0;
  function moveCamera(e){
    if(e.pointerType==='touch')return;
    camera.targetX=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2));
    camera.targetY=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2));
    if(!cameraFrame)cameraFrame=requestAnimationFrame(updateCamera);
  }
  function resetCamera(){camera.targetX=0;camera.targetY=0;if(!cameraFrame)cameraFrame=requestAnimationFrame(updateCamera)}
  function updateCamera(now){
    cameraFrame=0;
    const step=lastCameraFrame?Math.min((now-lastCameraFrame)/16.667,2):1;lastCameraFrame=now;
    camera.vx+=(camera.targetX-camera.x)*.045*step;camera.vy+=(camera.targetY-camera.y)*.045*step;
    camera.vx*=Math.pow(.78,step);camera.vy*=Math.pow(.78,step);
    camera.x+=camera.vx*step;camera.y+=camera.vy*step;
    if(Math.abs(camera.targetX-camera.x)<.001&&Math.abs(camera.vx)<.001){camera.x=camera.targetX;camera.vx=0}
    if(Math.abs(camera.targetY-camera.y)<.001&&Math.abs(camera.vy)<.001){camera.y=camera.targetY;camera.vy=0}
    scene.style.setProperty('--camera-rotate-x',`${-camera.y*2.2}deg`);
    scene.style.setProperty('--camera-rotate-y',`${camera.x*3}deg`);
    scene.style.setProperty('--camera-offset-x',`${-camera.x*5}px`);
    scene.style.setProperty('--camera-offset-y',`${-camera.y*4}px`);
    cameraLayers.forEach(([el,depth])=>{
      el.style.setProperty('--camera-layer-x',`${camera.x*10*depth}px`);
      el.style.setProperty('--camera-layer-y',`${camera.y*8*depth}px`);
      el.style.setProperty('--camera-layer-z',`${Math.hypot(camera.x,camera.y)*12*depth}px`);
    });
    if(camera.x!==camera.targetX||camera.y!==camera.targetY||camera.vx||camera.vy)cameraFrame=requestAnimationFrame(updateCamera);
    else lastCameraFrame=0;
  }
  addEventListener('pointermove',moveCamera,{passive:true});
  addEventListener('pointerleave',resetCamera);
  addEventListener('blur',resetCamera);
}

/* ===== Animated interactive background ===== */
const cv=$('bg'),c=cv.getContext('2d');let W,H,P=[],rings=[],frame=0;
const m={x:-999,y:-999},still=matchMedia('(prefers-reduced-motion:reduce)').matches;
function size(){
  const d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);c.setTransform(d,0,0,d,0,0);
  P=Array.from({length:Math.min(105,Math.floor(W*H/15000))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.5+.7}));
}
addEventListener('resize',size);visualViewport?.addEventListener('resize',size);size();
addEventListener('pointermove',e=>{m.x=e.clientX;m.y=e.clientY});
addEventListener('pointerleave',()=>{m.x=m.y=-999});
addEventListener('pointerdown',e=>rings.push({x:e.clientX,y:e.clientY,r:0}));
function draw(){
  frame+=still?0:.006;
  c.fillStyle='#05030b';c.fillRect(0,0,W,H);
  /* Soft violet edge light, brightest around the middle of each edge. */
  const glow=(x,y,r,a)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(113,54,190,${a})`);g.addColorStop(.48,`rgba(61,27,112,${a*.48})`);g.addColorStop(1,'rgba(20,8,40,0)');c.fillStyle=g;c.fillRect(Math.max(0,x-r),Math.max(0,y-r),Math.min(W,x+r)-Math.max(0,x-r),Math.min(H,y+r)-Math.max(0,y-r))};
  const pulse=still?0:Math.sin(frame*1.5)*.025;
  glow(W/2,0,Math.max(240,W*.48),.22+pulse);glow(W/2,H,Math.max(240,W*.48),.2+pulse);
  glow(0,H/2,Math.max(200,H*.45),.15+pulse);glow(W,H/2,Math.max(200,H*.45),.15+pulse);
  /* Repeating diagonal name pattern, moving slowly in alternating directions. */
  const heroRect=document.querySelector('.hero').getBoundingClientRect();
  const textCx=heroRect.left+heroRect.width/2,textCy=heroRect.top+heroRect.height*.42;
  const textRx=Math.min(W*.47,Math.max(260,heroRect.width*.95)),textRy=Math.max(180,heroRect.height*.72);
  c.save();
  c.translate(W/2,H/2);c.rotate(-.22);
  const font=Math.max(42,Math.min(118,W*.105));c.font=`800 ${font}px system-ui, sans-serif`;c.textAlign='center';c.textBaseline='middle';
  const spacing=font*1.2,rows=Math.ceil((W+H*1.2)/spacing)+3,cols=Math.ceil((W+H)/ (font*3.1))+3;
  for(let row=-rows;row<=rows;row++){
    const y=row*spacing,shift=(row%2?1:-1)*(still?0:frame*24)% (font*3.1);
    const fade=c.createLinearGradient(0,y-font,0,y+font);fade.addColorStop(0,'rgba(255,255,255,.015)');fade.addColorStop(.5,'rgba(234,221,255,.10)');fade.addColorStop(1,'rgba(255,255,255,.015)');c.fillStyle=fade;
    for(let col=-cols;col<=cols;col++){
      const x=col*font*3.1+shift,screenX=W/2+x*Math.cos(-.22)-y*Math.sin(-.22),screenY=H/2+x*Math.sin(-.22)+y*Math.cos(-.22);
      const dist=Math.hypot((screenX-textCx)/textRx,(screenY-textCy)/textRy);
      const fade=Math.max(0,Math.min(1,(1-dist)/.34));c.globalAlpha=fade*fade*(3-2*fade);
      c.fillText('LEZN',x,y);
    }
  }
  c.globalAlpha=1;
  c.restore();
  /* Mouse glow and gentle particle response. */
  if(m.x>=0){glow(m.x,m.y,290,.27);const h=c.createRadialGradient(m.x,m.y,0,m.x,m.y,220);h.addColorStop(0,'rgba(210,178,255,.10)');h.addColorStop(1,'rgba(139,92,246,0)');c.fillStyle=h;c.fillRect(m.x-220,m.y-220,440,440)}
  for(const p of P){
    const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy);
    if(d<145&&d>0){const f=(145-d)/145;p.vx+=dx/d*f*.16;p.vy+=dy/d*f*.16}
    for(const r of rings){const rd=Math.hypot(p.x-r.x,p.y-r.y);if(Math.abs(rd-r.r)<25&&rd>0){p.vx+=(p.x-r.x)/rd*.28;p.vy+=(p.y-r.y)/rd*.28}}
    p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
  }
  for(let i=0;i<P.length;i++){
    const p=P[i];for(let j=i+1;j<P.length;j++){const q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){c.strokeStyle=`rgba(183,157,226,${(1-d/110)*.12})`;c.lineWidth=.65;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}
    const dm=Math.hypot(p.x-m.x,p.y-m.y);if(dm<165){c.strokeStyle=`rgba(210,190,255,${(1-dm/165)*.3})`;c.lineWidth=.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(m.x,m.y);c.stroke()}
    c.fillStyle='rgba(228,222,242,.75)';c.shadowColor='#b28cff';c.shadowBlur=6;c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill();c.shadowBlur=0;
  }
  rings=rings.filter(r=>(r.r+=5)<Math.max(W,H));
  for(const r of rings){c.strokeStyle=`rgba(196,181,253,${Math.max(0,.42-r.r/1000)})`;c.lineWidth=1.2;c.beginPath();c.arc(r.x,r.y,r.r,0,6.283);c.stroke()}
  if(!still)requestAnimationFrame(draw);
}
draw();
