/** Adapted from Nuro's gestures.ts / gestures-social.ts / gestures-bits.ts.
 * Pure, deterministic track recipes in original SVG units. The glass renderer
 * attenuates body travel/squash to retain the calmer silhouette. No timers,
 * React state, chained callbacks or stale gesture queue in the animation loop.
 */
const times=[0,.2,.75,1];
const track=(values,duration,at=null,delay=0,ease='smooth')=>({values,duration,times:at||values.map((_,i)=>i/(values.length-1)),delay,ease});
const hold=(value,duration)=>track([0,value,value,0],duration,times);
const blink=(delay=0,duration=.29)=>track([0,1,0],duration,[0,.46,1],delay);
const recipe=(label,group,duration,expression,tracks,extra={})=>({label,group,duration,expression,tracks,...extra});
const nod=(delay=0)=>({y:track([0,4,0,4,0],.7,null,delay),lidL:blink(delay+.42,.22),lidR:blink(delay+.44,.22)});
export const GESTURES=Object.freeze({
  blink:recipe('Blink','Small moments',.32,'idle',{lidL:blink(),lidR:blink(.018)}),
  'look-left':recipe('Look left','Small moments',1.2,'idle',{lookX:hold(-3.5,1.2),rotate:hold(-6,1.2)}),
  'look-right':recipe('Look right','Small moments',1.2,'idle',{lookX:hold(3.5,1.2),rotate:hold(6,1.2)}),
  'look-up':recipe('Look up','Small moments',1.4,'curious',{lookY:hold(-3.5,1.4),rotate:hold(3,1.4)}),
  'gaze-wander':recipe('Gaze wander','Small moments',2.5,'idle',{lookX:track([0,2.5,-2,0],2.4,[0,.35,.75,1]),lookY:track([0,-1.5,1,0],2.4,[0,.35,.75,1]),lidL:blink(1.95,.24),lidR:blink(1.97,.24)}),
  sway:recipe('Sway','Small moments',2,'idle',{rotate:track([0,3,-3,3,0],2)}),
  tilt:recipe('Curious tilt','Small moments',1.3,'curious',{rotate:track([0,10,10,0],1.3,[0,.3,.72,1]),lidL:blink(.45),lidR:blink(.47)}),
  wobble:recipe('Little wobble','Small moments',.9,'playful',{squash:track([1,.9,1.08,.96,1.02,1],.9)}),
  bounce:recipe('Bounce','Small moments',.7,'excited',{y:track([0,-14,0],.55,[0,.4,1]),squash:track([1,1.08,.92,1],.62,[0,.35,.75,1])}),
  'float-lift':recipe('Float','Small moments',3,'idle',{y:track([0,-6,-6,0],3,[0,.3,.7,1]),aura:track([0,.35,.35,0],3,[0,.3,.7,1])}),
  sigh:recipe('Sigh','Small moments',2.2,'reassuring',{squash:track([1,1.04,1.04,.97,1],2.2,[0,.3,.5,.8,1]),lidL:track([0,0,.55,.55,0],2.2,[0,.45,.62,.88,1]),lidR:track([0,0,.55,.55,0],2.2,[0,.45,.62,.88,1])}),
  shiver:recipe('Anticipation','Small moments',.4,'excited',{x:track([0,2,-2,2,-2,1,0],.35,null,0,'linear')}),
  'spin-shine':recipe('Spin & shine','Small moments',1.1,'playful',{rotate:track([0,360],.85),aura:track([0,1,0],1.1,[0,.5,1])}),
  'wave-hello':recipe('Hello','Together',1.6,'happy',{rotate:hold(-8,1.6),aura:track([0,.8,.8,0],1.6,[0,.25,.65,1]),happy:track([0,1,1,0],1.6,[0,.25,.75,1])},{reducedHappy:true}),
  nod:recipe('Nod','Together',.9,'reassuring',nod()),
  'head-shake':recipe('Gentle no','Together',1.1,'reassuring',{x:track([0,-4,4,-3,3,0],1),lidL:hold(.3,1.1),lidR:hold(.3,1.1)}),
  wink:recipe('Wink','Together',.8,'playful',{lidL:track([0,1,1,0],.8,[0,.3,.65,1]),rotate:track([0,4,4,0],.8,[0,.3,.7,1])}),
  'happy-eyes':recipe('Happy eyes','Together',.8,'happy',{happy:track([0,1,1,0],.8,[0,.2,.8,1])},{reducedHappy:true}),
  'listening-lean':recipe('Listening lean','Together',2.4,'listening',{rotate:track([0,8,8,0],2.4,[0,.15,.85,1]),lookY:track([0,3,3,0],2.4,[0,.15,.85,1])}),
  peek:recipe('Peek','Together',1.6,'curious',{y:track([34,12,12,0],1.6,[0,.3,.72,1]),lidL:blink(.7,.24),lidR:blink(.72,.24)}),
  'shy-sink':recipe('Shy','Together',2,'reassuring',{y:track([0,16,16,0],2,[0,.3,.7,1]),lookY:track([0,-4,-4,0],2,[0,.3,.7,1])}),
  'attention-hop':recipe('A little nudge','Together',1.1,'curious',{y:track([0,-10,0,-8,0],.9),squash:track([1,1.06,.94,1.05,.96,1],.95),lookX:track([0,0,3.5,3.5,0],1.1,[0,.3,.45,.85,1])}),
  'sparkle-gift':recipe('A little sparkle','Together',1.4,'happy',{aura:track([0,.5,0],1.4,[0,.4,1]),happy:track([0,1,1,0],1.4,[0,.25,.7,1]),motes:track([0,1,1,0],1.4,[0,.2,.75,1])},{reducedHappy:true,effect:'orbit'}),
  'oops-soft':recipe('Soft oops','Support',1.6,'oops',{...nod(.85),squash:track([1,.93,1.02,1],.7),lookX:track([0,3.5,3.5,0],.9,[0,.35,.8,1])}),
  'proud-swell':recipe('Proud swell','Support',1.8,'proud',{squash:track([1,1.06,1.06,1],1.8,[0,.3,.7,1]),rotate:track([0,-4,-4,0],1.8,[0,.3,.7,1]),happy:track([0,1,1,0],1.8,[0,.3,.75,1])},{reducedHappy:true}),
  'yawn-stretch':recipe('Yawn','Support',2.6,'sleepy',{squash:track([1,1.12,1.12,.92,1],2.6,[0,.25,.45,.7,1]),lidL:track([0,0,.8,.5,0],2.6,[0,.4,.62,.85,1]),lidR:track([0,0,.8,.5,0],2.6,[0,.4,.62,.85,1])}),
  'hat-trick':recipe('Hat trick','Playful bits',3,'playful',{hat:track([0,0,1,1,0,0],3,[0,.1,.16,.52,.57,1]),squash:track([1,.95,1.05,1.03,.94,1,1],3,[0,.08,.18,.5,.58,.72,1]),rotate:track([0,-8,0,0,-5,5,0],3,[0,.1,.24,.6,.74,.88,1]),lookX:track([0,0,-3.5,3.5,0],3,[0,.6,.74,.88,1]),lidL:blink(2.72,.24),lidR:blink(2.74,.24)},{bit:true}),
  'mote-juggle':recipe('Juggle','Playful bits',3,'playful',{motes:track([0,1,1,0],3,[0,.12,.82,1]),lookY:track([0,-2,3.5,3.5,0],3,[0,.3,.62,.82,1]),lidL:track([0,0,.6,.6,0],3,[0,.68,.76,.9,1]),lidR:track([0,0,.6,.6,0],3,[0,.68,.76,.9,1]),squash:track([1,1,1.05,.94,1],3,[0,.72,.82,.92,1])},{bit:true,effect:'juggle'}),
  zoomies:recipe('Zoomies','Playful bits',2.4,'playful',{x:track([0,-20,20,-20,20,-6,2,0,0],2.4,[0,.09,.22,.35,.48,.56,.63,.7,1]),y:track([0,-8,6,-8,6,-2,0,0],2.4,[0,.11,.26,.4,.5,.58,.66,1]),rotate:track([0,-12,12,-12,12,0,0],2.4,[0,.09,.22,.35,.48,.58,1]),squash:track([1,1,.9,1.06,1,1],2.4,[0,.5,.58,.66,.74,1]),lidL:track([0,1,1,0],.6,[0,.35,.6,1],1.76),lidR:track([0,1,1,0],.6,[0,.35,.6,1],1.78)},{bit:true}),
});
export const GESTURE_NAMES=Object.freeze(Object.keys(GESTURES));
export const NEUTRAL=Object.freeze({x:0,y:0,rotate:0,squash:1,lookX:0,lookY:0,lidL:0,lidR:0,happy:0,aura:0,motes:0,hat:0});
export function sampleTrack(spec,time,neutral=0){
  if(time<spec.delay||time>spec.delay+spec.duration)return neutral;
  const t=Math.min(1,Math.max(0,(time-spec.delay)/spec.duration));
  const i=Math.max(0,spec.times.findIndex((v,j)=>j>0&&v>=t)-1);
  const local=Math.min(1,Math.max(0,(t-spec.times[i])/(spec.times[i+1]-spec.times[i])));
  const eased=spec.ease==='linear'?local:local*local*(3-2*local);
  return spec.values[i]+(spec.values[i+1]-spec.values[i])*eased;
}
export function sampleGesture(name,age,{reduced=false}={}){
  const recipe=GESTURES[name];if(!recipe)throw new RangeError(`Unknown Nuro gesture: ${name}`);
  const values={...NEUTRAL};
  if(age<0||age>=recipe.duration)return values;
  if(reduced){if(recipe.reducedHappy)values.happy=1;return values;}
  for(const [key,spec]of Object.entries(recipe.tracks))values[key]=sampleTrack(spec,age,NEUTRAL[key]);
  return values;
}

/** One current gesture; a new event preempts, never queues. Rare bits only
 * run by explicit preview/request and at most once automatically per session. */
export function createGesturePlayer(){
  let current=null,bitPlayed=false;
  return {
    play(name,{preview=false}={}){const recipe=GESTURES[name];if(!recipe)throw new RangeError(`Unknown Nuro gesture: ${name}`);if(recipe.bit&&bitPlayed&&!preview)return false;if(recipe.bit&&!preview)bitPlayed=true;current={name,age:0};return true;},
    tick(dt,reduced=false){if(!current)return {...NEUTRAL};current.age+=Math.max(0,Math.min(dt,.05));if(current.age>=GESTURES[current.name].duration){current=null;return {...NEUTRAL};}return sampleGesture(current.name,current.age,{reduced});},
    cancel(){current=null;},
    snapshot(){return current?{...current}:null;},
  };
}
