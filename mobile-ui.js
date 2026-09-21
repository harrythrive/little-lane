(() => {
 const drawer=document.getElementById('mobile-drawer'),toggle=document.getElementById('mobile-menu'),close=document.getElementById('drawer-close');
 const sound=document.getElementById('sound'),soundAnchor=document.createComment('sound');sound.before(soundAnchor);
 const garage=document.querySelector('aside'),music=document.querySelector('.mixtapes');
 const garageAnchor=document.createComment('garage'),musicAnchor=document.createComment('music');
 garage.before(garageAnchor);music.before(musicAnchor);
 const compact=matchMedia('(max-width: 740px), (max-height: 520px) and (max-width: 1000px)');
 let resume=false;
 function setOpen(open){if(!compact.matches)open=false;drawer.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));
  if(open){resume=typeof mode!=='undefined'&&mode==='playing';if(resume)pause();close.focus();}
  else {if(resume&&typeof mode!=='undefined'&&mode==='paused')pause();resume=false;toggle.focus();}
 }
 function layout(){if(compact.matches){drawer.append(garage,music,sound);}else{setOpen(false);garageAnchor.after(garage);musicAnchor.after(music);soundAnchor.after(sound);}}
 toggle.onclick=()=>setOpen(!drawer.classList.contains('open'));close.onclick=()=>setOpen(false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open')){e.preventDefault();e.stopImmediatePropagation();setOpen(false);}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('button,canvas,.touch,.route-hud'))e.preventDefault();});
 document.addEventListener('selectstart',e=>{if(e.target.closest('button,.touch'))e.preventDefault();});
 compact.addEventListener('change',layout);layout();
})();
