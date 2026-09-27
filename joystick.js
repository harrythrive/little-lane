(() => {
 const pad=document.getElementById('joystick'),knob=document.getElementById('stick-knob'),side=document.getElementById('stick-side');
 window.driveInput={x:0,y:0};let pointer=null;
 function reset(){pointer=null;window.driveInput.x=window.driveInput.y=0;knob.style.transform='translate(0px,0px)';pad.classList.remove('active');}
 window.resetJoystick=reset;
 function move(e){const r=pad.getBoundingClientRect(),radius=r.width*.32;let dx=(e.clientX-r.left-r.width/2)/radius,dy=(e.clientY-r.top-r.height/2)/radius;const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}const strength=Math.max(0,(Math.min(1,length)-.1)/.9),response=Math.pow(strength,1.25);window.driveInput.x=length?dx/Math.min(1,length)*response:0;window.driveInput.y=length?dy/Math.min(1,length)*response:0;knob.style.transform=`translate(${dx*radius}px,${dy*radius}px)`;}
 pad.addEventListener('pointerdown',e=>{if(pointer!==null||typeof mode==='undefined'||mode!=='playing')return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);pad.classList.add('active');move(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();move(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(e.pointerId===pointer)reset();});
 window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',reset);
 function setSide(value){document.body.dataset.stickSide=value==='left'?'left':'right';side.value=document.body.dataset.stickSide;try{localStorage.setItem('littleLaneStickSide',side.value);}catch{}}
 let saved='right';try{saved=localStorage.getItem('littleLaneStickSide')||'right';}catch{}setSide(saved);side.onchange=()=>{reset();setSide(side.value);};
})();
