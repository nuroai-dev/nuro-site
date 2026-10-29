import * as THREE from 'three';
import { ANATOMY, makeBodyProfile } from './nuro-anatomy.js';
import { EYE_GLSL } from './eye-material.js';
import { resolvePalette } from './expressions.js';

// nuroai/packages/platform/src/index.css --color-holo-1 … --color-holo-5.
// THREE.Color converts these sRGB brand tokens to the shader's linear space.
export const NURO_COLOURS = ['#a7c7ff', '#c9b8ff', '#e8bfe6', '#ffc9e3', '#ffd9c2'];
// The body's five stops read from the holo tokens, NURO_COLOURS being their values.
const bodyColours=()=>{const p=resolvePalette();return [p.blue,p.lavender,p.lilac,p.pink,p.peach];};
const REFERENCE_COLOURS = ['#a8b5fc','#f6afea','#bc9af1'];

/** Image-based optical rendering; independent interior, rim and reflection motion. */
export function createOpticalGlass(uniforms, { onLoad, onError } = {}) {
  let disposed = false;
  const profile = new THREE.DataTexture(new Float32Array(256*4),256,1,THREE.RGBAFormat,THREE.FloatType);
  // Manual interpolation supports devices without float-linear filtering.
  profile.minFilter=profile.magFilter=THREE.NearestFilter;
  profile.wrapS=THREE.RepeatWrapping;
  const texture = new THREE.TextureLoader().load(
    new URL('./assets/glass-bubble-v1.webp', import.meta.url).href,
    loaded => {
      if(disposed)return;
      try { profile.image.data=makeBodyProfile(loaded.image);profile.needsUpdate=true;onLoad?.(); }
      catch(error) { onError?.(error); }
    }, undefined,
    error => { if (!disposed) onError?.(error); },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uGlass: { value: texture }, uBodyProfile: {value:profile},
      uPalette:{value:bodyColours().map(hex=>new THREE.Color(hex))},
      uReference:{value:REFERENCE_COLOURS.map(hex=>new THREE.Color(hex))} },
    transparent: true, depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uGlass;
      uniform sampler2D uBodyProfile;
      uniform float uTime, uEnergy, uBright, uListen, uThink, uSpeak;
      uniform vec2 uLook;
      uniform vec3 uPalette[5];
      uniform vec3 uReference[3];
      uniform vec3 uMoodA, uMoodB, uMoodC;
      uniform float uVoicePulse, uAura, uMoodMix;
      uniform float uBirthEyes, uBirthOutline, uBirthFill, uBirthGlass;
      varying vec2 vUv;
      mat2 rotate(float angle) {
        float c = cos(angle), s = sin(angle);
        return mat2(c, -s, s, c);
      }
      ${EYE_GLSL}
      vec2 bodyProfile(float angle) {
        float sampleAt=fract(angle)*256.0;
        float index=floor(sampleAt);
        vec2 a=texture2D(uBodyProfile,vec2((index+0.5)/256.0,0.5)).rg;
        vec2 b=texture2D(uBodyProfile,vec2((mod(index+1.0,256.0)+0.5)/256.0,0.5)).rg;
        return mix(a,b,fract(sampleAt))*1.25;
      }
      vec3 blendedInterior(vec2 uv,float radius) {
        // Blur only transmitted interior light. Keep the glass lip sharp.
        vec3 sum=texture2D(uGlass,uv,1.6).rgb*0.20;
        for(int i=0;i<8;i++){
          float angle=float(i)*0.785398163;
          sum+=texture2D(uGlass,uv+vec2(cos(angle),sin(angle))*radius,1.6).rgb*0.10;
        }
        return sum;
      }
      vec3 nuroColour(float at) {
        vec3 c=mix(uPalette[0],uPalette[1],smoothstep(0.0,0.32,at));
        c=mix(c,uPalette[2],smoothstep(0.32,0.58,at));
        c=mix(c,uPalette[3],smoothstep(0.58,0.80,at));
        return mix(c,uPalette[4],smoothstep(0.80,1.0,at));
      }
      void main() {
        float t = uTime;
        // Extra UV padding gives the morphing silhouette room on all four sides.
        vec2 p = (vUv - 0.5) * 2.4;
        float theta = atan(p.y, p.x);
        float voice = uEnergy * uSpeak;

        // Preserve Nuro's four-cubic outline; only a small breathing ripple
        // reaches the silhouette. The independent interior carries the motion.
        vec2 faceP=p;
        float contour = 1.0
          + (0.005 + voice * 0.003) * sin(theta * 3.0 + t * 0.78)
          + (0.004 + voice * 0.002) * cos(theta * 2.0 - t * 0.61)
          + 0.002 * sin(theta + t * 0.43);
        p /= contour;
        float bodyAngle=fract(atan(p.y,p.x)/6.283185307);
        float bodyRadius=bodyProfile(bodyAngle).r;
        p = rotate(0.11 * sin(t * 0.38) + 0.035 * sin(t * 0.73) + uLook.x * 0.04) * p;
        float sourceAngle=fract(atan(p.y,p.x)/6.283185307);
        float sourceRadius=bodyProfile(sourceAngle).g;
        p *= sourceRadius/max(bodyRadius,0.1);
        float r = length(p);

        // The exterior stays coherent while suspended light flows underneath.
        // Taper the warp to zero before reaching the silhouette.
        float inner = 1.0 - smoothstep(0.46, 0.87, r);
        float depth = sqrt(max(0.0, 1.0 - dot(p / 0.89, p / 0.89)));
        vec2 innerP = p;
        float swirl = 0.39 * sin(t * 0.43) + 0.14 * sin(t * 0.81);
        swirl += (uThink * 0.10 + voice * 0.19) * sin(t * 0.97);
        innerP = rotate(swirl * inner) * innerP;
        vec2 current = vec2(
          sin(p.y * 4.2 + t * 0.72) + 0.45 * sin(p.x * 5.1 - t * 0.46),
          cos(p.x * 3.8 - t * 0.63) + 0.40 * sin(p.y * 4.7 + t * 0.57)
        );
        innerP += current * (0.082 + voice * 0.060 + uListen * 0.012) * inner;
        innerP += uLook * 0.035 * depth * inner;
        vec2 shellUv = p * 0.5 + 0.5;
        vec2 flowUv = innerP * 0.5 + 0.5;
        vec4 shell = texture2D(uGlass, shellUv);
        vec3 flowing = blendedInterior(flowUv,(0.035+voice*0.008)*inner);
        vec3 colour = mix(shell.rgb, flowing, inner);

        // Subtle chromatic refraction at the lip, never an RGB/glitch effect.
        float rim = smoothstep(0.59, 0.84, r) * (1.0 - smoothstep(0.88, 0.94, r));
        vec2 split = normalize(p + vec2(0.001))
          * (0.0009 + uEnergy * 0.0006 + uBright * 0.0003) * rim;
        colour.r = mix(colour.r, texture2D(uGlass, shellUv + split).r, rim * 0.5);
        colour.b = mix(colour.b, texture2D(uGlass, shellUv - split).b, rim * 0.5);

        // Pearl rather than candy: take the strong colour out of the artwork
        // at rest, keeping contrast in the silver/blue edge and white glints.
        float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
        float saturation = 0.48 + rim * 0.16 + voice * 0.29;
        colour = mix(vec3(luminance), colour, saturation);
        colour = mix(colour, vec3(0.98, 0.975, 1.0), 0.12 - voice * 0.055);

        // Broad, travelling pastel light wells infuse the glass during speech.
        // The envelope controls their strength; time moves the light, not hue
        // jumps on individual samples. Protect specular whites and the rim.
        vec2 roseAt = vec2(0.35 * sin(t * 0.51), 0.36 * cos(t * 0.39));
        vec2 blueAt = vec2(0.38 * cos(t * 0.37 + 1.2), 0.32 * sin(t * 0.48));
        float rose = exp(-dot(innerP - roseAt, innerP - roseAt) * 2.7);
        float blue = exp(-dot(innerP - blueAt, innerP - blueAt) * 3.1);
        float warmth = 0.5 + 0.5 * sin(t * 0.32 + innerP.y * 2.0);
        vec3 roseColour = mix(vec3(0.89, 0.65, 0.78), vec3(0.96, 0.80, 0.66), warmth);
        vec3 blueColour = mix(vec3(0.60, 0.76, 0.94), vec3(0.74, 0.65, 0.91), warmth);
        vec3 infusion = (roseColour * rose + blueColour * blue) / max(rose + blue, 0.001);
        float tintStrength = (0.04 + voice * 0.40) * inner
          * (1.0 - smoothstep(0.78, 0.99, luminance));
        colour = mix(colour, infusion, tintStrength);

        // A coloured, softly scattering core beneath a clear optical skin.
        // Fill is permanent, not only a speaking effect. Preserve the outer
        // glass lip and let reflected light travel across the fuller centre.
        float core=1.0-smoothstep(0.68,0.98,length(faceP)/max(bodyRadius,0.1));
          // Both references carry their colour much closer to the perimeter;
          // leave the optical detail in a narrow lip, not a broad white border.
          core=1.0-smoothstep(.82,.995,length(faceP)/max(bodyRadius,.1));
        float colourAt=clamp(0.50+(faceP.x-faceP.y)*0.33
          +0.065*sin(t*0.34+innerP.y*2.4)+0.035*sin(t*0.51+innerP.x*3.0),0.0,1.0);
        vec3 fill=nuroColour(colourAt);
        fill=mix(fill,uPalette[0],uListen*0.09);
        fill=mix(fill,uPalette[1],uThink*0.12);
        fill=mix(fill,nuroColour(0.68+0.20*sin(t*0.30)),voice*0.17);
        // Coherent emotional colour fields, not a uniform hue-rotate filter.
        // Slow drift and moving overlap keep the full body alive in each mood.
        float moodAcross=clamp(0.48+innerP.x*.48-innerP.y*.32+.12*sin(t*.31+innerP.y*2.0),0.0,1.0);
        vec3 mood=mix(uMoodA,uMoodB,smoothstep(.05,.72,moodAcross));
        mood=mix(mood,uMoodC,smoothstep(.57,1.0,moodAcross));
          // Reference-matched colour placement, not a whole-canvas filter.
          // The original optical texture still supplies the detailed rim.
          vec2 referenceP=faceP/max(bodyRadius,.1);
          float drift=.055*sin(t*.34+referenceP.y*2.5);
            // Separate cool and warm light fields, not a uniform pink tint.
            // The slow travelling boundary keeps each hue legible at rest.
            drift+=.055*sin(t*.23-referenceP.x*2.0);
            float pink=smoothstep(-.52,.58,referenceP.x+referenceP.y*.24+drift);
            float lavender=smoothstep(.04,.90,-referenceP.y+drift);
            fill=mix(uReference[0],uReference[1],pink);
            fill=mix(fill,uReference[2],lavender*.72);
            // Same palette and 86% mood contribution as Original glass. The
            // resting reference stays intact; whites and optical detail remain separate.
            fill=mix(fill,mood,.86*uMoodMix);
            colour=mix(colour,fill,core*(.90+voice*.03));
        float transmittedGlint=smoothstep(0.64,0.95,luminance)*core;
          colour=mix(colour,vec3(1.0),transmittedGlint*.12);

        // A speech ribbon below the eyes. Its width, lift and luminosity track
        // the actual audio envelope; quiet pauses visibly let it settle away.
        float ribbonY=-.34+voice*.22+.035*sin(p.x*4.5+t*1.8);
        float ribbon=exp(-pow((p.y-ribbonY)/(.035+voice*.065),2.0));
        float echo=exp(-pow((p.y-ribbonY+.12)/.042,2.0))*.38;
        float across=exp(-pow(p.x/.60,4.0));
        float voiceLight=(ribbon+echo)*across*core*(voice*.25+uVoicePulse*.27);
        colour=mix(colour,mix(vec3(1.0),uMoodA,.22),clamp(voiceLight,0.0,.48));
        colour=mix(colour,vec3(1.0),core*uAura*.065);

        // A slower light plane drifts independently of the tinted interior.
        vec2 light = vec2(-0.30 + 0.28 * sin(t * 0.42), 0.35 + 0.19 * cos(t * 0.36));
        vec2 delta = p - light;
        float broadLight = exp(-dot(delta * vec2(1.3, 2.0), delta * vec2(1.3, 2.0)) * 4.5);
        colour *= 0.98 + 0.055 * broadLight + 0.020 * sin(t * 0.51 + p.x * 3.0) * inner;
        float caustic = exp(-pow((p.x + 0.34 + 0.055 * sin(t * 0.57) + p.y * 0.15) / 0.032, 2.0));
        caustic *= exp(-pow((p.y - 0.19) / 0.32, 2.0));
        colour = mix(colour, vec3(1.0), caustic * (0.045 + voice * 0.08));
          float edgeOnly=smoothstep(.77,.98,length(faceP)/max(bodyRadius,.1));
            // Keep the white transmission inside a distinct, rounded glass
            // lip. Follow the same breathing contour as the alpha silhouette.
            float surfaceR=length(faceP)/max(bodyRadius*contour,.1);
            float lightSkin=smoothstep(.82,.94,surfaceR);
            float lightDetail=smoothstep(.12,.95,luminance);
            // Carry the body's colour through the glass instead of laying a
            // broad white ring over it. White remains in narrow light catches.
            vec3 colouredTransmission=mix(fill,vec3(1.0),.06+.17*lightDetail);
            colour=mix(colour,colouredTransmission,lightSkin*.82);

            // Liquid reflections travel around curved optical bands, rather
            // than tinting the whole outline. Time keeps them flowing at rest;
            // gaze and measured speech inflect the same continuous motion.
            float reflectionAngle=atan(faceP.y,faceP.x);
            float reflectionPhase=t*.55+uLook.x*.70-uLook.y*.35;
            float arcA=pow(max(0.0,cos(reflectionAngle-reflectionPhase)),6.0);
            float arcB=pow(max(0.0,cos(reflectionAngle+reflectionPhase*.73+2.4)),8.0);
            float bendA=.903+.017*sin(reflectionAngle*3.0+reflectionPhase*.63);
            float bendB=.966+.006*cos(reflectionAngle*2.0-reflectionPhase);
            float bandA=exp(-pow((surfaceR-bendA)/.026,2.0));
            float bandB=exp(-pow((surfaceR-bendB)/.013,2.0));
            // Reflected colour follows the body, so teal/gold moods do not keep a pink rim.
            vec3 reflectionA=mix(uPalette[0],uMoodA,uMoodMix);
            vec3 reflectionB=mix(uPalette[1],uMoodB,uMoodMix);
            vec3 reflectionC=mix(uPalette[3],uMoodC,uMoodMix);
            vec3 reflectionD=mix(uPalette[4],uMoodB,uMoodMix);
            vec3 coolReflection=mix(fill,mix(reflectionA,reflectionB,.5+.5*sin(reflectionPhase*.71)),.72);
            vec3 warmReflection=mix(fill,mix(reflectionC,reflectionD,.5+.5*cos(reflectionPhase*.62)),.68);

            // A soft reflected shoulder crosses into the coloured interior.
            // Its curved band moves with the light, joining the clear lip to
            // the fuller body instead of reading as a separate outlined ring.
            float shoulderAt=.852+.018*sin(reflectionAngle*2.0+reflectionPhase*.32);
            float shoulder=exp(-pow((surfaceR-shoulderAt)/.042,2.0));
            float shoulderArc=pow(max(0.0,cos(reflectionAngle-1.9-.22*sin(reflectionPhase*.38))),2.0);
            vec3 shoulderLight=mix(vec3(1.0),mix(fill,coolReflection,.35),.18);
            colour=mix(colour,shoulderLight,shoulder*shoulderArc*(.32+.18*lightDetail));

            // A translucent coloured wall encloses the white, rather than
            // letting it dissolve into the page. Retain the source's delicate
            // optical striations, remapped from silver/grey to pastel and white.
            float edgeAcross=.5+.5*cos(reflectionAngle-reflectionPhase*.12);
            vec3 edgeTint=mix(fill,mix(coolReflection,warmReflection,edgeAcross),.60);
            float shellLight=smoothstep(.12,.96,dot(shell.rgb,vec3(.2126,.7152,.0722)));
            vec3 polishedLip=mix(edgeTint*.94,vec3(1.0),pow(shellLight,1.7)*.76);
            float outerLip=smoothstep(.918,.977,surfaceR);
            colour=mix(colour,polishedLip,outerLip*.84);

            // The inner refracted seam and fine outer meniscus give the rim
            // real visual thickness. A white crest sits between them, inside
            // the silhouette; no bloom or white halo is added outside it.
            float lipBend=.004*sin(reflectionAngle*3.0+reflectionPhase*.45);
            float innerSeam=exp(-pow((surfaceR-(.916+lipBend))/.012,2.0));
            float outerSeam=exp(-pow((surfaceR-(.987+lipBend*.3))/.005,2.0));
            float whiteCrest=exp(-pow((surfaceR-(.955+lipBend*.6))/.008,2.0));
            float crestLight=.42+.58*pow(.5+.5*cos(reflectionAngle-reflectionPhase*.35-1.9),3.0);
            colour=mix(colour,edgeTint,innerSeam*.24);
            colour=mix(colour,mix(edgeTint,vec3(1.0),.16),outerSeam*.64);
            colour=mix(colour,vec3(1.0),whiteCrest*crestLight*.79);

            float reflectionStrength=.66+voice*.12;
            colour=mix(colour,mix(vec3(1.0),coolReflection,.70),bandA*arcA*lightSkin*reflectionStrength);
            colour=mix(colour,mix(vec3(1.0),warmReflection,.64),bandB*arcB*lightSkin*.78);
            // A wider, faint echo makes the colour feel refracted in depth.
            float echoBand=exp(-pow((surfaceR-bendA+.035)/.044,2.0));
            float refractedSkin=smoothstep(.70,.88,surfaceR);
            colour=mix(colour,mix(vec3(1.0),warmReflection,.46),echoBand*arcA*refractedSkin*.32);
            float movingGlint=pow(max(0.0,cos(reflectionAngle-reflectionPhase-1.0)),18.0);
            colour=mix(colour,vec3(1.0),bandB*movingGlint*lightSkin*.72);
          // Broad optical folds, moving with the refracted interior beneath.
          vec2 foldP=rotate(.14*sin(t*.27))*faceP;
          float foldR=length((foldP-vec2(-.12,.15))/vec2(.81,.78));
          float fold=exp(-pow((foldR-.98)/.037,2.0))*smoothstep(.05,.45,-faceP.y);
          fold*=core*smoothstep(-.65,.25,faceP.x);
            colour=mix(colour,mix(fill,vec3(1.0),.55),fold*.10);
            vec2 glint=rotate(-.35)*(faceP-vec2(-.25+.09*sin(t*.38),.43+.05*cos(t*.31)));
            float white=exp(-dot(glint/vec2(.22,.045),glint/vec2(.22,.045)));
            colour=mix(colour,vec3(1.0),white*.27);
        // Eyes share the body's coordinate system, not the drifting texture.
        // Diffused interior illumination supplies their reflected colour.
        vec3 eyeEnvironment=mix(fill,colour,0.62);
        colour=glassEye(colour,faceP,uEyeL,eyeEnvironment);
        colour=glassEye(colour,faceP,uEyeR,eyeEnvironment);
        float alpha = shell.a;
        alpha *= smoothstep(0.02, 0.12, alpha);
        alpha *= 1.0 - smoothstep(0.94, 0.98, r);
        // A continuous entrance on the real body/eye coordinates. With glass=1
        // this branch is skipped, preserving the approved onboarding material.
        if(uBirthGlass < 1.0) {
          float boundary=length(faceP)/max(bodyRadius*contour,0.1);
          float aa=max(fwidth(boundary),0.002);
          float silhouette=1.0-smoothstep(1.0-aa,1.0+aa,boundary);
          float arc=abs(atan(faceP.x,faceP.y))/3.141592654;
          float drawn=1.0-smoothstep(uBirthOutline-0.008,uBirthOutline+0.008,arc);
          float border=silhouette*smoothstep(0.973-aa,0.973+aa,boundary)*drawn;
          border*=smoothstep(0.0,0.025,uBirthOutline);
          float tide=mix(-1.1,1.1,uBirthFill);
          tide+=sin(faceP.x*4.0+uBirthFill*2.2)*0.055*sin(uBirthFill*3.141592654);
          float inkFill=silhouette*(1.0-smoothstep(tide-0.012,tide+0.012,faceP.y));
          vec2 leftEye=(faceP-uEyeL.xy)/vec2(${ANATOMY.eyeWidth.toFixed(8)},${ANATOMY.eyeHeight.toFixed(8)}*max(uEyeL.z,0.065));
          vec2 rightEye=(faceP-uEyeR.xy)/vec2(${ANATOMY.eyeWidth.toFixed(8)},${ANATOMY.eyeHeight.toFixed(8)}*max(uEyeR.z,0.065));
          float eyeDistance=min(length(leftEye),length(rightEye));
          float eyeAA=max(fwidth(eyeDistance),0.008);
          float eyes=(1.0-smoothstep(1.0-eyeAA,1.0+eyeAA,eyeDistance))*uBirthEyes;
          float matteAlpha=max(max(border,inkFill),eyes);
          float revealDistance=length((faceP-vec2(-0.12,0.15))*vec2(1.0,1.06));
          float reveal=1.0-smoothstep(uBirthGlass*2.1-0.10,uBirthGlass*2.1+0.02,revealDistance);
          reveal*=smoothstep(0.0,0.015,uBirthGlass);
          // Invert the eyes wherever the black tide reaches them; the glass
          // reveal then restores their normal dark, reflective material.
          vec3 matteColour=mix(vec3(0.003,0.004,0.007),vec3(1.0),eyes*inkFill);
          colour=mix(matteColour,colour,reveal);
          alpha=mix(matteAlpha,alpha,reveal);
        }
        gl_FragColor = vec4(colour, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  return { name:'light-glass',material, dispose() { disposed = true; texture.dispose(); profile.dispose(); material.dispose(); } };
}
