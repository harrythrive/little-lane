(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const tapes = {
    70: {name:'Classic Rock', bpm:112, wave:'triangle', roots:[40,43,45,40], swing:.02},
    80: {name:'Disco Nights', bpm:120, wave:'sawtooth', roots:[45,41,48,43], swing:0},
    90: {name:'Boom Bap Hip-Hop', bpm:88, wave:'square', roots:[45,45,50,52], swing:.19}
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
  function guitar(note,time,duration,volume){
    const o=ctx.createOscillator(),filter=ctx.createBiquadFilter(),drive=ctx.createWaveShaper(),g=ctx.createGain();o.type='sawtooth';o.frequency.value=440*Math.pow(2,(note-69)/12);
    const curve=new Float32Array(256);for(let i=0;i<256;i++)curve[i]=Math.tanh((i/127.5-1)*3);drive.curve=curve;
    filter.type='lowpass';filter.frequency.setValueAtTime(chosen==='70'?3200:2200,time);filter.frequency.exponentialRampToValueAtTime(650,time+duration);
    g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.005);g.gain.exponentialRampToValueAtTime(.0001,time+duration);
    o.connect(drive);drive.connect(filter);filter.connect(g);g.connect(master);o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();drive.disconnect();filter.disconnect();g.disconnect()};
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
      const chord=[root+12,root+15,root+19,root+22];
      if(chosen==='70') {
        // Driving eighth-note power-chord riff with bass, backbeat and fills.
        if([0,6,8,10].includes(s))drum('kick',t);
        if(s===4||s===12)drum('snare',t,1.3);
        if(s%2===0)drum('hat',t,s%4===0?.8:.55);
        const riff=[0,0,7,0,10,7,5,3][Math.floor(s/2)];
        if(s%2===0){guitar(root+riff,t,tick*(s===14?2.5:1.5),.105);guitar(root+riff+7,t+.008,tick*1.4,.065);tone(root-12+riff,t,tick*1.7,.25,'triangle',850);}
        if(bar>=4&&[0,3,6,8,11,14].includes(s))guitar(root+24+[0,3,5,7,10,7][[0,3,6,8,11,14].indexOf(s)],t,tick*2.1,.055);
        if(bar%4===3&&s>=12)drum(s%2?'hat':'snare',t,.55);
      } else if(chosen==='80') {
        // Four-on-the-floor disco, octave bass, offbeat guitar and string chords.
        if(s%4===0)drum('kick',t);
        if(s===4||s===12){drum('snare',t,.85);drum('snare',t+.018,.35);}
        if(s%2===0)drum('hat',t,s%4===2?1.2:.5);
        if([0,2,3,6,8,10,11,14].includes(s))tone(root-12+(s%4===2?12:s%4===3?7:0),t,tick*1.4,.23,'sawtooth',850);
        if(s%4===2)chord.forEach(n=>guitar(n+12,t,tick*.75,.025));
        if(s===0||s===8)chord.forEach(n=>tone(n+12,t,tick*7.5,.035,'sawtooth',1800));
        if(bar%2===1&&s%2===0)tone(root+24+[7,10,12,10,7,5,3,5][s/2],t,tick*1.1,.055,'triangle',2700);
      } else {
        // Swung boom-bap drums, sub bass, mellow chopped keys and a sparse hook.
        if([0,7,10].includes(s)||(bar%2&&s===14))drum('kick',t,1.15);
        if(s===4||s===12)drum('snare',t,1.15);
        if(s%2===0||s===15)drum('hat',t,s===15?.32:.5);
        if([0,7,10].includes(s))tone(root-12+(s===10?-5:0),t,tick*3.5,.42,'sine',400);
        if([0,6,11].includes(s))chord.forEach(n=>{tone(n+12,t,tick*(s===0?3:1.5),.07,'triangle',1100);tone(n+24,t,tick*.7,.017,'sine',1600);});
        if(bar%4===3&&[2,5,8].includes(s))tone(root+24+[7,3,0][[2,5,8].indexOf(s)],t,tick*1.8,.08,'sine');
        if(s===14&&bar%2===1)drum('snare',t,.22);
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
