// Neutral anatomy copied from nuroai's brand/nuro-mascot.tsx (120-unit SVG).
// Keep the softly asymmetric outline and the rig's 46/74,58 eye placement.
const SEGMENTS = [
  [[60,33],[79,32],[93,45],[94,63]],
  [[94,63],[95,82],[83,99],[61,100]],
  [[61,100],[39,101],[25,84],[26,65]],
  [[26,65],[27,47],[42,34],[60,33]],
];
// A 6% narrower eye separation, requested for the voice character. Eye sizes
// and vertical placement remain the source SVG's friendly proportions.
export const ANATOMY = { eyeX: 14 / 34 * .86 * .94, eyeY: 8.5 / 34 * .86, eyeWidth: 4.6 / 34 * .86, eyeHeight: 6.2 / 34 * .86 };
const outline = SEGMENTS.flatMap(curve => Array.from({length:64}, (_,i) => {
  const t=i/64, s=1-t;
  const xy=[0,1].map(k=>s*s*s*curve[0][k]+3*s*s*t*curve[1][k]+3*s*t*t*curve[2][k]+t*t*t*curve[3][k]);
  return [(xy[0]-60)/34*.86,(66.5-xy[1])/34*.86];
}));
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function nuroRadius(angle) {
  const ray=[Math.cos(angle),Math.sin(angle)];
  for(let i=0;i<outline.length;i++){
    const a=outline[i],b=outline[(i+1)%outline.length],edge=[b[0]-a[0],b[1]-a[1]];
    const denominator=cross(ray,edge); if(Math.abs(denominator)<1e-8)continue;
    const distance=cross(a,edge)/denominator, portion=cross(a,ray)/denominator;
    if(distance>0&&portion>=0&&portion<=1)return distance;
  }
  return .86;
}

// One-time silhouette remap: red = Nuro's cubic outline; green = the source
// glass alpha contour. The shader can roll the glass without rotating the face.
export function makeBodyProfile(image, count=256) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,512,512);
  const pixels=ctx.getImageData(0,0,512,512).data;
  const source=Array.from({length:count},(_,i)=>{
    const angle=i/count*Math.PI*2,dx=Math.cos(angle),dy=Math.sin(angle);
    let radius=.86;
    for(let r=.70;r<.95;r+=.002){
      const x=Math.round((.5+dx*r*.5)*511),y=Math.round((.5-dy*r*.5)*511);
      if(pixels[(y*512+x)*4+3]>150)radius=r;
    }
    return radius;
  });
  // Fit only low-order modes: an alpha cutout can contain isolated subpixel
  // specks, which must never become little ripples in the refracted glass rim.
  const mean=source.reduce((a,b)=>a+b,0)/count;
  const modes=Array.from({length:8},(_,k)=>{
    const order=k+1;
    return [order,source.reduce((v,r,i)=>v+r*Math.cos(i/count*Math.PI*2*order),0)*2/count,
      source.reduce((v,r,i)=>v+r*Math.sin(i/count*Math.PI*2*order),0)*2/count];
  });
  const data=new Float32Array(count*4);
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2;
    const radius=modes.reduce((v,[order,a,b])=>v+a*Math.cos(angle*order)+b*Math.sin(angle*order),mean);
    data[i*4]=nuroRadius(angle)/1.25;
    data[i*4+1]=radius/1.25;data[i*4+3]=1;
  }
  return data;
}
