(() => {
 const buttons=[...document.querySelectorAll('[data-drive]')],held=new Map();
 window.driveInput={x:0,y:0};
 function sync(){const active=new Set(held.values());window.driveInput.x=Number(active.has('right'))-Number(active.has('left'));window.driveInput.y=active.has('brake')?1:active.has('gas')?-1:0;buttons.forEach(b=>b.classList.toggle('held',active.has(b.dataset.drive)));}
 function reset(){held.clear();sync();}
 window.resetJoystick=reset;
 for(const button of buttons){button.addEventListener('pointerdown',e=>{if(typeof mode==='undefined'||mode!=='playing')return;e.preventDefault();held.set(e.pointerId,button.dataset.drive);button.setPointerCapture(e.pointerId);sync();});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{held.delete(e.pointerId);sync();});}
 window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',reset);
})();
