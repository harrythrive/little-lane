(() => {
 const names={bayside:'Bayside',mountains:'Mountains',desert:'Desert'};
 let selected='bayside';try{const saved=localStorage.getItem('littleLaneTrack');if(names[saved])selected=saved;}catch{}
 function choose(track){if(!names[track])return;window.littleLaneTrack=track;document.querySelectorAll('[data-track]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.track===track)));document.getElementById('track-status').textContent=names[track]+' selected · ready to drive';try{localStorage.setItem('littleLaneTrack',track);}catch{}}
 document.querySelectorAll('[data-track]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.track)));
 choose(selected);
})();
