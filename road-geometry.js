/* Road coordinates stay lane-relative; every visible object shares this projection. */
(() => {
 let cachedSeed=-1,angles=[],prefix=[0];
 function angle(index,seed){if(seed!==cachedSeed){cachedSeed=seed;angles=[];prefix=[0];}while(angles.length<=index){const i=angles.length;let h=(Math.imul(i+17,374761393)^Math.imul(seed+1,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;const a=(h%5===0?0:(30+(h>>>3)%61)*((h&2)?1:-1))*Math.PI/180;angles.push(a);prefix.push(prefix.at(-1)+a);}return angles[index];}
 function heading(at,seed){if(at<350)return 0;const n=Math.floor((at-350)/400),u=Math.max(0,Math.min(1,(at-(350+n*400))/200));angle(n,seed);return prefix[n]+angles[n]*(u*u*(3-2*u));}
 function bendAt(at,seed){const n=Math.max(0,Math.floor((at-350)/400)),start=350+n*400;const radians=angle(n,seed);return {start,end:start+200,degrees:Math.round(radians*180/Math.PI),active:at>=start&&at<start+200};}
 function createFrame(distance,seed){const base=heading(distance,seed),points=new Map();points.set(0,{x:0,z:0,theta:0});for(const dir of [-1,1]){let x=0,z=0;for(let offset=2;offset<=(dir<0?80:520);offset+=2){const mid=dir*(offset-1),theta=heading(distance+mid,seed)-base;x+=Math.sin(theta)*dir*2*.648;z-=Math.cos(theta)*dir*2*.648;points.set(dir*offset,{x,z,theta:heading(distance+dir*offset,seed)-base});}}
  return (offset,lateral=0)=>{offset=Math.max(-80,Math.min(520,offset));const lo=Math.floor(offset/2)*2,hi=Math.min(520,lo+2),a=points.get(lo),b=points.get(hi)||a,u=(offset-lo)/2,theta=a.theta+(b.theta-a.theta)*u;return {x:a.x+(b.x-a.x)*u+Math.cos(theta)*lateral,z:a.z+(b.z-a.z)*u+Math.sin(theta)*lateral,theta};};
 }
 window.LaneRoad={heading,bendAt,createFrame};
})();
