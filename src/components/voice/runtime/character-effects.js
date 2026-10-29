import * as THREE from 'three';

/** Small, opt-in props for the platform's sparkle/juggle/hat gesture recipes. */
export function createCharacterEffects(rig){
  const group=new THREE.Group();rig.add(group);
  const geometry=new THREE.PlaneGeometry(.19,.19);
  const motes=['#c9b8ff','#ffc9e3','#a7c7ff'].map(hex=>{
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{colour:{value:new THREE.Color(hex)},amount:{value:0}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec2 vUv; uniform vec3 colour; uniform float amount; void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float core=1.-smoothstep(.15,.43,r);float glow=exp(-r*r*5.)*.24;gl_FragColor=vec4(mix(colour,vec3(1.),core*.7),(core+glow)*amount);#include <colorspace_fragment>\n}'.replace(';#include',';\n#include')});
    const mesh=new THREE.Mesh(geometry,material);group.add(mesh);return mesh;
  });
  const hat=new THREE.Group();group.add(hat);hat.position.set(0,1.09,.1);
  const capGeometry=new THREE.SphereGeometry(.39,32,16,0,Math.PI*2,0,Math.PI/2);
  const capMaterial=new THREE.MeshBasicMaterial({color:'#c9b8ff',transparent:true,opacity:0,side:THREE.DoubleSide});
  const cap=new THREE.Mesh(capGeometry,capMaterial);cap.scale.y=.76;hat.add(cap);
  const brimGeometry=new THREE.TorusGeometry(.385,.037,10,40);
  const brimMaterial=new THREE.MeshBasicMaterial({color:'#e8bfe6',transparent:true,opacity:0});
  const brim=new THREE.Mesh(brimGeometry,brimMaterial);brim.rotation.x=Math.PI/2;hat.add(brim);
  return {
    update({motes:amount,hat:hatAmount},active,reduced){
      const age=active?.age||0,juggle=active?.name==='mote-juggle';
      motes.forEach((mote,i)=>{
        const a=age*(juggle?6:4.5)+i*Math.PI*2/3;
        mote.visible=!reduced&&amount>.001;
        mote.material.uniforms.amount.value=amount;
        if(juggle){mote.position.set(Math.sin(a)*.62,.92+Math.abs(Math.cos(a))*.42,.2);if(i===2&&age>1.5){mote.position.y-=Math.min(1.4,(age-1.5)*2);mote.material.uniforms.amount.value*=Math.max(0,1-(age-1.5)*1.7);}}
        else mote.position.set(Math.cos(a)*1.35,Math.sin(a)*.85+.20,.2);
      });
      hat.visible=!reduced&&hatAmount>.001;capMaterial.opacity=hatAmount*.95;brimMaterial.opacity=hatAmount;hat.scale.setScalar(.9+hatAmount*.1);
    },
    dispose(){rig.remove(group);geometry.dispose();motes.forEach(m=>m.material.dispose());capGeometry.dispose();capMaterial.dispose();brimGeometry.dispose();brimMaterial.dispose();},
  };
}
