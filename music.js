(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const tapes = {
    70: {name:'Soul & Sun', bpm:104, wave:'triangle', roots:[45,50,43,52], swing:.13},
    80: {name:'Neon Cruise', bpm:118, wave:'sawtooth', roots:[45,41,48,43], swing:0},
    90: {name:'Coast Club', bpm:126, wave:'square', roots:[48,44,46,43], swing:.04}
  };
  let chosen='80', playing=false, ctx, master, noise, timer, step=0, next=0, generation=0;
  try { if(tapes[localStorage.getItem('little-lane-tape')]) chosen=localStorage.getItem('little-lane-tape'); } catch {}
  function ui() {
    document.querySelectorAll('[data-tape]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tape===chosen));
    $('tape-play').textContent=playing?'Ⅱ PAUSE':'▶ PLAY';
    $('tape-play').setAttribute('aria-label',(playing?'Pause':'Play')+' mixtape');
    $('tape-status').textContent=(playing?'Playing · ':'Ready · ')+chosen+'s / '+tapes[chosen].name;
  }
  function setup() {
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;
    const compressor=ctx.createDynamicsCompressor();master.connect(compressor);compressor.connect(ctx.destination);
    noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }
  function tone(note,time,duration,volume,type='triangle',cutoff=2200) {
    const osc=ctx.createOscillator(), gain=ctx.createGain(), filter=ctx.createBiquadFilter();
    osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);
    filter.type='lowpass';filter.frequency.value=cutoff;
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(filter);filter.connect(gain);gain.connect(master);
    osc.start(time);osc.stop(time+duration+.02);osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect()};
  }
  function drum(kind,time,accent=1) {
    const gain=ctx.createGain();gain.connect(master);
    const source=kind==='kick'?ctx.createOscillator():ctx.createBufferSource();
    const filter=ctx.createBiquadFilter();
    if(kind==='kick') {source.frequency.setValueAtTime(135,time);source.frequency.exponentialRampToValueAtTime(42,time+.16);filter.type='lowpass';filter.frequency.value=500;}
    else {source.buffer=noise;filter.type='highpass';filter.frequency.value=kind==='hat'?7500:1300;}
    const length=kind==='hat'?.045:kind==='kick'?.23:.13;
    gain.gain.setValueAtTime((kind==='hat'?.07:kind==='kick'?.65:.22)*accent,time);
    gain.gain.exponentialRampToValueAtTime(.0001,time+length);
    source.connect(filter);filter.connect(gain);source.start(time);source.stop(time+length+.01);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
  }
  function schedule() {
    const tape=tapes[chosen], tick=60/tape.bpm/4;
    while(next<ctx.currentTime+.13) {
      const s=step%16, bar=Math.floor(step/16)%8, root=tape.roots[Math.floor(bar/2)], t=next+(s%2?tick*tape.swing:0);
      const minor=chosen!=='70';const chord=[root+12,root+(minor?15:16),root+19,root+22];
      if((chosen==='90'&&s%4===0)||(chosen==='80'&&[0,8,10].includes(s))||(chosen==='70'&&[0,6,10].includes(s)))drum('kick',t);
      if(s===4||s===12)drum('snare',t);
      if(s%2===0||chosen==='70')drum('hat',t,s%4===2?1:.55);
      if(chosen==='70') {
        if([0,3,6,8,10,14].includes(s))tone(root-12+([3,14].includes(s)?7:s===10?12:0),t,tick*1.8,.36,'triangle',900);
        if([2,7,10,15].includes(s))chord.forEach(n=>tone(n,t,tick*1.3,.075,'triangle',2600));
        if(bar%2&&[1,5,9,13].includes(s))tone(root+24+[7,4,2,0][Math.floor(s/4)],t,tick*2,.075,'sine');
      } else if(chosen==='80') {
        if(s%2===0)tone(root-12+(s===14?12:0),t,tick*1.7,.18,'sawtooth',550);
        if(s===0)chord.forEach(n=>tone(n,t,tick*14,.045,'sawtooth',1500));
        tone(chord[[0,2,1,3,2,1,3,2][s%8]]+12,t,tick*1.5,.045,'square',1800);
      } else {
        if([0,3,6,8,11,14].includes(s))tone(root-12+(s===6||s===14?7:0),t,tick*1.5,.28,'sine');
        if([2,6,10,14].includes(s))chord.forEach(n=>tone(n+12,t,tick*1.9,.065,'triangle',3200));
        if(bar%2===1&&[7,15].includes(s))drum('snare',t,.35);
        if(bar>=4&&s%4===0)tone(root+24+[0,7,10,7][s/4],t,tick*2.5,.04,'square',1100);
      }
      next+=tick;step++;
    }
  }
  function stop() {generation++;playing=false;clearInterval(timer);if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.03);}ui();}
  async function play() {
    const token=++generation;
    try {setup();await ctx.resume();if(token!==generation)return;playing=true;step=0;next=ctx.currentTime+.06;master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(Number($('tape-volume').value)/100,ctx.currentTime,.035);clearInterval(timer);schedule();timer=setInterval(schedule,25);ui();}
    catch {stop();$('tape-status').textContent='Audio unavailable in this browser.';}
  }
  document.querySelectorAll('[data-tape]').forEach(b=>b.onclick=()=>{stop();chosen=b.dataset.tape;try{localStorage.setItem('little-lane-tape',chosen)}catch{}play()});
  $('tape-play').onclick=()=>playing?stop():play();
  $('tape-volume').oninput=()=>{if(master&&playing)master.gain.setTargetAtTime(Number($('tape-volume').value)/100,ctx.currentTime,.03)};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  window.addEventListener('pagehide',stop);ui();
})();
