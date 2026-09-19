/* Original synthesized driving effects. No external audio downloads. */
(() => {
  const profiles=[
    {base:64,range:150,wave:'sawtooth',filter:1900,pulse:2.1}, // motorcycle
    {base:36,range:90,wave:'triangle',filter:1250,pulse:1.7}, // hatchback
    {base:29,range:76,wave:'triangle',filter:950,pulse:1.5}, // wagon
    {base:44,range:135,wave:'sawtooth',filter:2300,pulse:2.5}, // sports
    {base:24,range:67,wave:'sawtooth',filter:650,pulse:1.2} // diesel SUV
  ];
  let ctx,master,engine,engineGain,engineFilter,harmonic,harmonicGain,pulse,pulseGain;
  let skid,skidGain,skidFilter,siren,sirenGain,sirenLfo,sirenDepth,effects,noise;
  let enabled=true,active=false,lastType=-1;
  const smooth=(param,value,seconds=.07)=>param.setTargetAtTime(value,ctx.currentTime,seconds);
  function setup(){
    if(ctx)return;
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=enabled?.6:0;
    const limiter=ctx.createDynamicsCompressor();master.connect(limiter);limiter.connect(ctx.destination);
    effects=ctx.createGain();effects.connect(master);
    noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    engine=ctx.createOscillator();harmonic=ctx.createOscillator();harmonic.type='triangle';
    engineFilter=ctx.createBiquadFilter();engineFilter.type='lowpass';
    engineGain=ctx.createGain();engineGain.gain.value=0;harmonicGain=ctx.createGain();harmonicGain.gain.value=.22;
    engine.connect(engineFilter);harmonic.connect(harmonicGain);harmonicGain.connect(engineFilter);engineFilter.connect(engineGain);engineGain.connect(master);
    pulse=ctx.createOscillator();pulseGain=ctx.createGain();pulseGain.gain.value=4;pulse.connect(pulseGain);pulseGain.connect(engine.frequency);
    skid=ctx.createBufferSource();skid.buffer=noise;skid.loop=true;skidFilter=ctx.createBiquadFilter();skidFilter.type='bandpass';skidFilter.frequency.value=2200;skidFilter.Q.value=5;
    skidGain=ctx.createGain();skidGain.gain.value=0;skid.connect(skidFilter);skidFilter.connect(skidGain);skidGain.connect(master);
    siren=ctx.createOscillator();siren.type='triangle';siren.frequency.value=850;
    sirenLfo=ctx.createOscillator();sirenLfo.frequency.value=1.4;sirenDepth=ctx.createGain();sirenDepth.gain.value=310;sirenLfo.connect(sirenDepth);sirenDepth.connect(siren.frequency);
    sirenGain=ctx.createGain();sirenGain.gain.value=0;siren.connect(sirenGain);sirenGain.connect(master);
    [engine,harmonic,pulse,skid,siren,sirenLfo].forEach(n=>n.start());
  }
  function unlock(){try{if(!enabled)return;setup();ctx.resume().catch(()=>{});}catch{enabled=false;}}
  function setEnabled(value){enabled=value;if(value)unlock();if(ctx)smooth(master.gain,enabled&&!document.hidden?.6:0,.025);}
  function update(s){
    active=s.mode==='playing';if(!ctx)return;
    smooth(master.gain,enabled&&!document.hidden?.6:0,.025);
    const running=active&&enabled&&!document.hidden,p=profiles[s.selected]||profiles[1];
    if(lastType!==s.selected){engine.type=p.wave;lastType=s.selected;}
    // Pitch climbs within each gear, drops on upshift, and idles at a stop.
    const velocity=Math.max(0,s.speed),gear=Math.min(5,Math.floor(velocity/48));
    const rev=velocity===0?0:Math.min(1,.24+(velocity-gear*48)/65+(s.gas?.13:0));
    const hz=p.base+p.range*rev;
    smooth(engine.frequency,hz);smooth(harmonic.frequency,hz*2.02);smooth(pulse.frequency,hz*p.pulse);smooth(pulseGain.gain,s.selected===4?9:3);
    smooth(engineFilter.frequency,p.filter*(.55+rev));smooth(engineGain.gain,running?(s.gas?.15:.105):0);
    const slip=velocity>45?Math.min(1,Math.max(s.braking?(velocity-45)/100:0,(Math.abs(s.vx)-75)/120)):0;
    smooth(skidGain.gain,running?slip*.24:0,.04);smooth(skidFilter.frequency,1700+slip*1400,.04);
    const chasing=running&&s.police.length>0;
    const proximity=chasing?Math.max(.25,Math.min(1,1-Math.abs(s.police[0].y-535)/400)):0;
    smooth(sirenGain.gain,chasing?.17*proximity:0,.08);
    smooth(effects.gain,s.mode==='paused'||document.hidden?0:1,.015);
  }
  function tone(freq,time,duration,volume){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;
    g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+duration);
    o.connect(g);g.connect(effects);o.start(time);o.stop(time+duration+.01);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  function event(kind){
    if(!enabled||!ctx||document.hidden)return;
    const t=ctx.currentTime;
    if(kind==='red'){[740,520,740].forEach((f,i)=>tone(f,t+i*.12,.1,.2));return;}
    if(kind==='crash'){
      const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=noise;filter.type='lowpass';filter.frequency.setValueAtTime(3600,t);filter.frequency.exponentialRampToValueAtTime(180,t+.6);
      gain.gain.setValueAtTime(.85,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.75);src.connect(filter);filter.connect(gain);gain.connect(effects);src.start(t);src.stop(t+.8);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};tone(58,t,.35,.55);tone(117,t+.02,.19,.15);
    }
  }
  function beep(freq,duration=.08){if(enabled&&ctx&&!document.hidden)tone(freq,ctx.currentTime,duration,.045);}
  function hush(){if(!ctx)return;smooth(master.gain,0,.015);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hush();});
  window.addEventListener('pagehide',hush);
  window.drivingAudio={unlock,setEnabled,update,event,beep};
})();
