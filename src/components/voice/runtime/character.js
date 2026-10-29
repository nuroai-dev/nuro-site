import * as THREE from 'three';
import { damp } from './damp.js';
import { createOpticalGlass } from './optical-glass.js';
import { ANATOMY } from './nuro-anatomy.js';
import { EXPRESSIONS, expressionForPhase, resolvePalette, resolveExpression } from './expressions.js';
import { GESTURES, createGesturePlayer } from './gestures.js';
import { createCharacterEffects } from './character-effects.js';

/** Renderer only. State/audio-feature API accepts simulated or real voice. */
export function createNuroCharacter(canvas, { onReady, onError, materialFactory=createOpticalGlass, pixelRatio=2, random=Math.random } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 1.75, -1.75, 0.1, 20);
  camera.position.set(0, 0, 5);
  const PALETTE = resolvePalette();
  const uniforms = {
    uTime: { value: 0 }, uEnergy: { value: 0 }, uBright: { value: 0 },
    uListen: { value: 0 }, uThink: { value: 0 }, uSpeak: { value: 0 }, uLook: { value: new THREE.Vector2() },
    uFace: {value:1},uHappy:{value:0},uSleep:{value:0},uEyeScale:{value:1},uVoicePulse:{value:0},uAura:{value:0},uMoodMix:{value:0},
    uMoodA:{value:new THREE.Color(PALETTE.blue)},uMoodB:{value:new THREE.Color(PALETTE.lavender)},uMoodC:{value:new THREE.Color(PALETTE.pink)},
    uEyeL:{value:new THREE.Vector4(-ANATOMY.eyeX,ANATOMY.eyeY,1,0)},
    uEyeR:{value:new THREE.Vector4(ANATOMY.eyeX,ANATOMY.eyeY,1,0)},
    uBirthEyes:{value:1},uBirthOutline:{value:1},uBirthFill:{value:1},uBirthGlass:{value:1},
  };
  let assetState = 'loading';
  const glass = materialFactory(uniforms, {
    onLoad() { assetState = 'ready'; requestRender(); onReady?.(); },
    onError(error) { assetState = 'failed'; onError?.(error); },
  });
  const bodyGeometry = new THREE.PlaneGeometry(3.48, 3.48);
  const body = new THREE.Mesh(bodyGeometry, glass.material);
  const rig = new THREE.Group(); scene.add(rig); rig.add(body);
  const effects=createCharacterEffects(rig),gestures=createGesturePlayer();
  const colours=Object.fromEntries(Object.entries(EXPRESSIONS).map(([key,mood])=>[key,mood.colours.map(name=>{
    const c=new THREE.Color(PALETTE[name]);
    // The curious mood keeps its blue-green pigment vivid; the glass still supplies soft highlights.
    const vivid=['sea','moss'].includes(name)||(key==='curious'&&name==='sky');
    if(['sea','moss','sky','sun','clay'].includes(name))c.lerp(new THREE.Color('#ffffff'),vivid?.04:.38);
    if(vivid)c.offsetHSL(0,.18,0);
    return c;
  })]));
  let expressionOverride=null,expression='idle',speechPulse=0,slowEnergy=0,paused=false,poseSquash=1,poseLids=1;
  let phase = 'idle', energy = 0, brightness = 0, smoothed = 0, smoothBright = 0, phaseTime = 0;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let disposed = false, last = performance.now(), time = 0, flowTime = 0, frame=null, flowSpeed = 1.25, needsRender=true;
  let voiceDrive = 0, size = 1, fit = 1;
  let nextBlink = 3.6, blinkAt = -10, faceVisible=true;
  const gaze = { x: 0, y: 0 };
  let entrancePose=null;
  function requestRender() {
    needsRender=true;
    if(!disposed && !document.hidden && frame===null) frame=requestAnimationFrame(render);
  }
  function visibility() {
    if(document.hidden){cancelAnimationFrame(frame);frame=null;}
    else {last=performance.now();requestRender();}
  }
  document.addEventListener('visibilitychange',visibility);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    // Resizing clears the framebuffer. Redraw a paused/offscreen specimen once
    // so responsive layout never leaves an empty character until it resumes.
    needsRender=true;
    // Leave room for speech expansion on narrow screens, not just idle bounds.
    fit = Math.min(1, w / h * 0.95);
    camera.left = -1.75 * w / h; camera.right = 1.75 * w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  function pointer(e) {
    if(entrancePose)return;
    const r = canvas.getBoundingClientRect();
    gaze.x = (e.clientX - r.left) / r.width - 0.5; gaze.y = 0.5 - (e.clientY - r.top) / r.height;
    requestRender();
  }
  function leave() { gaze.x = 0; gaze.y = 0; }
  canvas.addEventListener('pointermove', pointer); canvas.addEventListener('pointerleave', leave);
  function render(now) {
    frame=null;
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!document.hidden&&!paused) {
      time += dt; phaseTime += dt;
      const gesture=gestures.tick(dt,reduced),activeGesture=gestures.snapshot();
      expression=expressionOverride||expressionForPhase(phase);
      const pose=EXPRESSIONS[expression].pose;
      poseSquash=reduced?pose.squash:damp(poseSquash,pose.squash,5,dt);
      poseLids=reduced?pose.lids:damp(poseLids,pose.lids,8,dt);
      const blend=reduced?1:1-Math.exp(-dt*3.2);
      [uniforms.uMoodA,uniforms.uMoodB,uniforms.uMoodC].forEach((u,i)=>u.value.lerp(colours[expression][i],blend));
      // Keep the approved resting finish; other palettes take the original glass's full influence.
      const moodMix=EXPRESSIONS[expression].colours.every((name,i)=>name===EXPRESSIONS.idle.colours[i])?0:1;
      uniforms.uMoodMix.value=reduced?moodMix:damp(uniforms.uMoodMix.value,moodMix,3.2,dt);
      smoothed = damp(smoothed, energy, energy > smoothed ? 16 : 5, dt);
      smoothBright = damp(smoothBright, brightness, 8, dt);
      const speak = phase === 'speaking', listen = phase === 'listening', think = phase === 'thinking';
      // Remap quiet speech so expression is visible without needing loud audio.
      const drivenEnergy = 1 - Math.exp(-smoothed * 2.2);
      slowEnergy=damp(slowEnergy,drivenEnergy,3,dt);
      const accent=Math.max(0,drivenEnergy-slowEnergy)*2.5;
      speechPulse=reduced?0:damp(speechPulse,speak?Math.min(1,accent):0,accent>speechPulse?28:8,dt);
      uniforms.uVoicePulse.value=speechPulse;
      uniforms.uSpeak.value = reduced ? 0 : damp(uniforms.uSpeak.value, speak ? 1 : 0, speak ? 5 : 3, dt);
      voiceDrive = reduced ? 0 : drivenEnergy * uniforms.uSpeak.value;
      flowSpeed = damp(flowSpeed, expression==='sleepy'?.48:listen ? 1.35 : think ? 1.65 : speak ? 1.65 + voiceDrive * 2.2 : 1.25, 3, dt);
      if (!reduced) flowTime += dt * flowSpeed;
      uniforms.uTime.value = flowTime;
      uniforms.uEnergy.value = reduced ? 0 : drivenEnergy;
      uniforms.uBright.value = reduced ? 0 : smoothBright;
      uniforms.uListen.value = reduced ? 0 : damp(uniforms.uListen.value, listen ? 1 : 0, 4, dt);
      uniforms.uThink.value = reduced ? 0 : damp(uniforms.uThink.value, think ? 1 : 0, 4, dt);
      uniforms.uLook.value.x = reduced ? 0 : damp(uniforms.uLook.value.x, gaze.x, 5, dt);
      uniforms.uLook.value.y = reduced ? 0 : damp(uniforms.uLook.value.y, gaze.y, 5, dt);
      // Character first: the glass can flow freely inside, but Nuro's familiar
      // rounded outline only breathes. Speech no longer turns him into a blob.
      const gestureSquash=1+(gesture.squash-1)*.45;
      const stretch = reduced ? poseSquash : poseSquash*gestureSquash*(1+Math.sin(flowTime*.93)*.006+voiceDrive*.020-speechPulse*.018);
      const sizeTarget = 1 + uniforms.uSpeak.value * 0.010 + voiceDrive * 0.046;
      size = reduced ? 1 : damp(size, sizeTarget, sizeTarget > size ? 9 : 4, dt);
      const breathing = reduced ? 1 : 1 + Math.sin(flowTime * 1.05) * 0.005;
      rig.scale.set(fit * size * breathing / Math.sqrt(stretch), fit * size * breathing * stretch, 1);
      const excitedHop=expression==='excited'?Math.max(0,Math.sin(flowTime*2))*.025:0;
      rig.position.x=reduced?0:damp(rig.position.x,gesture.x*.011,22,dt);
      rig.position.y = reduced ? 0 : Math.sin(flowTime*.77)*.022-gesture.y*.010+excitedHop+speechPulse*.018;
      const rotation=pose.tilt+gesture.rotate*Math.PI/180*(activeGesture?.name==='spin-shine'?1:.6);
      rig.rotation.z = reduced ? pose.tilt : damp(rig.rotation.z,rotation+Math.sin(flowTime*.48)*.010,18,dt);
      // 360° is neutral; avoid unwinding a completed spin in reverse.
      if(!activeGesture&&Math.abs(rig.rotation.z)>Math.PI)rig.rotation.z-=Math.sign(rig.rotation.z)*Math.PI*2;
      if (time > nextBlink) { blinkAt = time; nextBlink = time + 3.5 + random() * 3; }
      const recipe=activeGesture?GESTURES[activeGesture.name]:null;
      const happyTarget=recipe?.tracks.happy?gesture.happy:activeGesture?.name==='wink'?0:pose.happy;
      uniforms.uHappy.value=reduced?happyTarget:damp(uniforms.uHappy.value,happyTarget,8,dt);
      uniforms.uSleep.value=reduced?pose.sleep:damp(uniforms.uSleep.value,pose.sleep,7,dt);
      uniforms.uEyeScale.value=reduced?pose.eyeScale:damp(uniforms.uEyeScale.value,pose.eyeScale,7,dt);
      uniforms.uAura.value=reduced?0:damp(uniforms.uAura.value,gesture.aura,10,dt);
      for (let i=0;i<2;i++) {
        const eye=(i?uniforms.uEyeR:uniforms.uEyeL).value,side=i?1:-1;
        const blinkAge=time-blinkAt-i*0.018;
        const blink=!activeGesture&&!reduced&&blinkAge>=0&&blinkAge<0.29?Math.max(.065,1-Math.sin(blinkAge/.29*Math.PI)**2):1;
        const wander=!reduced&&phase==='idle'?Math.sin(time*.22)*.009:0;
        const lookX=pose.lookX+(reduced?0:gaze.x*.075+wander+gesture.lookX*.020);
        const lookY=pose.lookY+(reduced?0:gaze.y*.055-gesture.lookY*.020);
        const x=side*ANATOMY.eyeX+lookX,y=ANATOMY.eyeY+lookY;
        eye.x=reduced?x:damp(eye.x,x,8,dt);eye.y=reduced?y:damp(eye.y,y,8,dt);
        // Independent lids; listening opens the face, speech gently articulates.
        const lid=i?gesture.lidR:gesture.lidL;
        eye.z=blink*Math.max(.065,1-lid)*poseLids*(1+(reduced?0:voiceDrive*.018));
        eye.w=0;
      }
      effects.update(gesture,activeGesture,reduced);
    }
    // The landing entrance uses this same anatomy and glass. Its influence
    // falls to zero before normal breathing, blinking and gaze take over.
    if(entrancePose&&!paused){
      const p=entrancePose,w=p.influence,blend=(a,b)=>a+(b-a)*w;
      rig.scale.x=blend(rig.scale.x,fit*p.scale/Math.sqrt(p.stretch));
      rig.scale.y=blend(rig.scale.y,fit*p.scale*p.stretch);
      rig.position.y=blend(rig.position.y,p.lift);
      rig.rotation.z*=1-w;
      for(let i=0;i<2;i++){
        const eye=(i?uniforms.uEyeR:uniforms.uEyeL).value;
        eye.x=blend(eye.x,(i?1:-1)*ANATOMY.eyeX+p.lookX);
        eye.y=blend(eye.y,ANATOMY.eyeY);
        eye.z=blend(eye.z,p.lids);
      }
    }
    if(!document.hidden&&assetState==='ready'&&(!paused||needsRender)){renderer.render(scene,camera);needsRender=false;}
    if(!document.hidden&&!paused&&!reduced)frame = requestAnimationFrame(render);
  }
  requestRender();
  return {
    setState(next) { if (next !== phase) { phase = next; phaseTime = 0;expressionOverride=null;gestures.cancel();if(next==='ready')gestures.play('proud-swell');else if(next==='listening')gestures.play('listening-lean');requestRender(); } },
    setExpression(next) { expressionOverride=next==null?null:resolveExpression(next);requestRender(); },
    playGesture(name,options) { const result=gestures.play(name,options);requestRender();return result; },
    cancelGesture(){gestures.cancel();requestRender();},
    setPaused(value){paused=!!value;last=performance.now();requestRender();},
    setAudioFeatures(features) {
      energy = Math.max(0, Math.min(1, features.energy || 0)); brightness = Math.max(0, Math.min(1, features.brightness || 0));
    },
    setReducedMotion(value) { reduced = !!value;requestRender(); },
    setFaceVisible(value) { faceVisible=!!value;uniforms.uFace.value=faceVisible?1:0;requestRender(); },
    setEntrancePose(pose) {
      entrancePose=pose;
      uniforms.uBirthEyes.value=pose?.eyes??1;
      uniforms.uBirthOutline.value=pose?.outline??1;
      uniforms.uBirthFill.value=pose?.fill??1;
      uniforms.uBirthGlass.value=pose?.glass??1;
      requestRender();
    },
    snapshot() { return { phase,expression,gesture:gestures.snapshot(),paused,energy,smoothed,reduced,time,flowTime,flowSpeed,voiceDrive,size,speechPulse,speechAmount:uniforms.uSpeak.value,assetState,faceVisible,colours:[uniforms.uMoodA.value.getHexString(),uniforms.uMoodB.value.getHexString(),uniforms.uMoodC.value.getHexString()],body:{x:rig.position.x,y:rig.position.y,rotation:rig.rotation.z,scale:rig.scale.toArray()},eyes:{left:uniforms.uEyeL.value.toArray(),right:uniforms.uEyeR.value.toArray(),happy:uniforms.uHappy.value,sleep:uniforms.uSleep.value}, anatomy:'nuro-svg-outline', material:glass.name||'image-based-optical-glass',renderCalls:renderer.info.render.calls }; },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener('visibilitychange',visibility);
      canvas.removeEventListener('pointermove', pointer); canvas.removeEventListener('pointerleave', leave);
      effects.dispose();bodyGeometry.dispose(); glass.dispose(); renderer.dispose();
    },
  };
}
