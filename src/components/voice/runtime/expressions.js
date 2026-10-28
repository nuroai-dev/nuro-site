// Nuro's five holo tokens + subject sea/moss/sky/sun/clay from platform/src/index.css.
// The subject colours are used here as an art-directed emotion palette, never
// as diagnostic/profile colours or an inference about the learner's feelings.
export const PALETTE = Object.freeze({blue:'#a7c7ff',lavender:'#c9b8ff',lilac:'#e8bfe6',pink:'#ffc9e3',peach:'#ffd9c2',sea:'#4fa8bd',moss:'#6fbf8f',sky:'#7fb1f5',sun:'#edc25a',clay:'#e08a66'});
// Each colour's source token in index.css; the hex values above are the token values, kept as the fallback.
export const PALETTE_TOKENS = Object.freeze({blue:'--color-holo-1',lavender:'--color-holo-2',lilac:'--color-holo-3',pink:'--color-holo-4',peach:'--color-holo-5',sea:'--color-subject-sea',moss:'--color-subject-moss',sky:'--color-subject-sky',sun:'--color-subject-sun',clay:'--color-subject-clay'});
export function resolvePalette(root=globalThis.document?.documentElement){
  if(!root||typeof getComputedStyle!=='function')return PALETTE;
  const style=getComputedStyle(root);
  return Object.freeze(Object.fromEntries(Object.entries(PALETTE).map(([name,hex])=>[name,style.getPropertyValue(PALETTE_TOKENS[name]).trim()||hex])));
}
const mood=(label,description,colours,pose={})=>({label,description,colours,pose:{tilt:0,squash:1,lids:1,happy:0,sleep:0,lookX:0,lookY:0,eyeScale:1,...pose}});
export const EXPRESSIONS = Object.freeze({
  idle:mood('At ease','Familiar pastel colour. A quiet breath. Right here with you.',['blue','lavender','pink']),
  listening:mood('Listening','A little lean and open eyes. Cool blue, with your full attention.',['blue','sky','lavender'],{tilt:.045,lids:1.05,lookY:.008}),
  thinking:mood('Thinking','A thoughtful glance. Lavender light slowly finding its way.',['lavender','lilac','blue'],{tilt:-.06,lookX:-.045,lookY:.055,lids:.94}),
  speaking:mood('Speaking','Light and small movements follow each phrase and pause.',['blue','lavender','pink']),
  curious:mood('Curious','Something worth exploring. Blue-green light and a little lift.',['sea','moss','sky'],{tilt:.055,squash:1.012,lookY:.018,lids:1.07,eyeScale:1.035}),
  happy:mood('Happy','Warm peach and pink. Nuro’s familiar smiling eyes.',['peach','pink','lilac'],{happy:1,squash:.992}),
  excited:mood('Excited','A bright idea. A small bounce and a warmer glow.',['peach','sun','pink'],{happy:.35,squash:1.015,eyeScale:1.045}),
  proud:mood('Proud','A small win deserves a moment. A warm, gentle swell.',['sun','peach','pink'],{happy:1,squash:1.022,tilt:-.025}),
  reassuring:mood('Reassuring','Soft rose, kind eyes. We can take our time.',['pink','peach','lilac'],{tilt:-.035,lids:.9,lookY:-.006}),
  oops:mood('Soft oops','A small dip, then a reassuring recovery. Never a scolding face.',['lilac','pink','peach'],{lids:.87,squash:.986,lookX:.025}),
  sleepy:mood('Sleepy','Resting eyes and a slower breath in soft blue-lavender.',['blue','lavender','lilac'],{sleep:1,tilt:.045,squash:.985}),
  playful:mood('Playful','A hint of mischief. Pink and blue shimmer together.',['pink','blue','lavender'],{tilt:-.04,happy:.18}),
});
export const EXPRESSION_NAMES=Object.freeze(Object.keys(EXPRESSIONS));
export const EXPRESSION_ALIASES=Object.freeze({think:'thinking',cheer:'happy',sleep:'sleepy',wave:'playful',interested:'curious'});
export function resolveExpression(name){const key=EXPRESSION_ALIASES[name]||name;if(!EXPRESSIONS[key])throw new RangeError(`Unknown Nuro expression: ${name}`);return key;}
export function expressionForPhase(phase){return {idle:'idle',listening:'listening',thinking:'thinking',speaking:'speaking',ready:'happy'}[phase]||'idle';}
