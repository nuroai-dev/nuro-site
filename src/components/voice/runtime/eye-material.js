/** Analytic convex black eyes beneath a glass cover, not emissive stickers.
 * Fresnel edge response + studio-card reflections + a diffused rear caustic.
 * This is an art-directed 2.5D optical approximation, not ray-traced transport.
 */
import { ANATOMY } from './nuro-anatomy.js';

export const EYE_GLSL = `
  uniform float uFace, uHappy, uSleep, uEyeScale;
  uniform vec4 uEyeL, uEyeR;
  vec3 glassEye(vec3 behind, vec2 face, vec4 rig, vec3 environment) {
    vec2 local = rotate(rig.w) * (face - rig.xy);
    vec2 eyeSize = vec2(${ANATOMY.eyeWidth.toFixed(8)}, ${ANATOMY.eyeHeight.toFixed(8)} * max(rig.z, 0.065))*uEyeScale;
    vec2 q = local / eyeSize;
    float dist = length(q) - 1.0;
    float ax = clamp(local.x, -0.135, 0.135);
    float archY = 0.060 * (1.0 - pow(ax / 0.135, 2.0));
    float arcDist = length(vec2(local.x - ax, local.y - archY)) - 0.022;
    // Morph signed distances, not alpha: no ghost oval behind the happy arc.
    float signedEdge = mix(dist * 0.116, arcDist, smoothstep(0.0,1.0,uHappy));
    float sleepY=-0.040*(1.0-pow(ax/0.135,2.0));
    float sleepEdge=length(vec2(local.x-ax,local.y-sleepY))-0.018;
    signedEdge=mix(signedEdge,sleepEdge,smoothstep(0.0,1.0,uSleep));
    float aa = max(fwidth(signedEdge), 0.001);
    float mask = (1.0-smoothstep(-aa,aa,signedEdge))*uFace;

    // Backlight goes around opaque eyes, not through their black centres.
    float edge = exp(-pow(signedEdge / 0.018, 2.0));
    float lowerRight = clamp(0.55 + q.x * 0.24 - q.y * 0.27, 0.0, 1.0);
    float halo = edge * (1.0-mask) * lowerRight * 0.24 * uFace;
    behind = mix(behind, min(vec3(1.0), environment * 0.45 + vec3(0.65)), halo);
    // A soft displaced shadow anchors each eye a little below the cover.
    float shadowQ = length((local - vec2(0.007, -0.010)) / (eyeSize + vec2(0.007)));
    float shadow = exp(-pow(shadowQ / 0.98, 4.0)) * (1.0-mask) * 0.11 * uFace * (1.0-uHappy);
    behind *= 1.0-shadow;

    float z = sqrt(max(0.002, 1.0-min(dot(q,q),0.998)));
    vec3 n = normalize(vec3(q.x*0.82,q.y*0.72,z));
    float fresnel = 0.012 + 0.988 * pow(1.0-max(n.z,0.0),5.0);
    vec3 eye = vec3(0.003,0.004,0.007);
    vec3 reflected = mix(vec3(0.43,0.56,0.72),environment,0.60);
    eye += reflected * fresnel * (0.18+0.12*lowerRight);
    float reflectedRim=pow(1.0-z,2.8)*max(0.0,q.x)*0.075;
    eye+=environment*reflectedRim;

    // Broad dim studio reflection and a very small crisp key-light catchlight.
    // Both move with the common lighting and gaze; the eye stays mostly black.
    vec2 highlightAt=vec2(-0.34+0.06*sin(uTime*0.35)+uLook.x*0.10,0.41+uLook.y*0.08);
    vec2 h=(q-highlightAt)/vec2(0.37,0.43);
    float softbox=exp(-dot(h,h)*1.5);
    vec2 pin=(q-highlightAt-vec2(-0.025,0.055))/vec2(0.105,0.14);
    float catchlight=exp(-dot(pin,pin)*1.7);
    float glintScale=(1.0-uHappy)*(1.0-uSleep)*smoothstep(0.20,0.65,rig.z);
    eye += vec3(0.032,0.038,0.046)*softbox*glintScale;
    eye += vec3(0.11,0.12,0.13)*catchlight*glintScale;
    // A thin glass-cover reflection crosses above the object. Keep this tiny:
    // translucent veil, not a white iris or an outer neon outline.
    float cover=exp(-pow((q.x+0.50+0.16*q.y+0.05*sin(uTime*.45))/0.075,2.0));
    cover*=exp(-pow((q.y-0.12)/0.65,2.0));
    eye+=environment*cover*0.025*glintScale;
    eye=mix(eye,vec3(.006,.008,.014)+environment*.014,max(uHappy,uSleep));
    return mix(behind,eye,mask);
  }
`;
