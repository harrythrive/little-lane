(() => {
 const drawer=document.getElementById('mobile-drawer'),toggle=document.getElementById('mobile-menu'),close=document.getElementById('drawer-close');
 const sound=document.getElementById('sound'),soundAnchor=document.createComment('sound');sound.before(soundAnchor);
 const garage=document.querySelector('aside'),music=document.querySelector('.mixtapes');
 const garageAnchor=document.createComment('garage'),musicAnchor=document.createComment('music');
 garage.before(garageAnchor);music.before(musicAnchor);
 const compact=matchMedia('(max-width: 740px), (max-height: 520px) and (max-width: 1000px)');
 let resume=false;
 function setOpen(open){drawer.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));
  if(open){resume=typeof mode!=='undefined'&&mode==='playing';if(resume)pause();close.focus();}
  else {if(resume&&typeof mode!=='undefined'&&mode==='paused')pause();resume=false;toggle.focus();}
 }
 function layout(){drawer.append(garage,music,sound);}
 const full=document.getElementById('fullscreen'),exit=document.getElementById('exit-fullscreen');
 function focusMode(on){document.body.classList.toggle('focus-race',on);full.setAttribute('aria-pressed',String(on));if(on){if(drawer.classList.contains('open'))setOpen(false);exit.focus();}else full.focus();}
 async function leaveFull(){focusMode(false);if(document.fullscreenElement)try{await document.exitFullscreen();}catch{}}
 full.onclick=async()=>{focusMode(true);try{await document.documentElement.requestFullscreen?.();}catch{/* Focus view remains available when fullscreen is unsupported. */}};
 exit.onclick=leaveFull;
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('focus-race'))focusMode(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus-race')){e.preventDefault();e.stopImmediatePropagation();leaveFull();}},true);

 toggle.onclick=()=>setOpen(!drawer.classList.contains('open'));close.onclick=()=>setOpen(false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open')){e.preventDefault();e.stopImmediatePropagation();setOpen(false);}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('button,canvas,.touch,.route-hud'))e.preventDefault();});
 document.addEventListener('selectstart',e=>{if(e.target.closest('button,.touch'))e.preventDefault();});
 compact.addEventListener('change',layout);layout();
})();
