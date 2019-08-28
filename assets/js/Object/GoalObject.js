import {
  IS_DEBUG,
  FPS,
} from "../constants.js";

import {
  degToRad,
} from "../math_utils.js";


import * as THREE from "../three/build/three.module.js";

export default class GoalObject extends THREE.Object3D{
  constructor(){
    super();
    this.setupObject();
  }
  setupObject(){
    const POLE_DIAMETER=0.1;
    const POLE_HEIGHT=2;
    const FLAG_WIDTH=1;
    const FLAG_HEIGHT=1;
    const FLAG_DEPTH=0.01;
    {
      let material=new THREE.MeshLambertMaterial({
        color:0xff0000,
      });
      let geometry=new THREE.BoxGeometry(FLAG_WIDTH,FLAG_HEIGHT,FLAG_DEPTH);
      geometry.translate(FLAG_WIDTH*0.5,POLE_HEIGHT-FLAG_HEIGHT*0.5,0);
      let mesh=new THREE.Mesh(geometry,material);
      mesh.castShadow=true;
      mesh.receiveShadow=true;
      this.add(mesh);
    }
    {
      let material=new THREE.MeshLambertMaterial({
        color:0x808080,
      });
      let geometry=new THREE.BoxGeometry(POLE_DIAMETER,POLE_HEIGHT,POLE_DIAMETER);
      geometry.translate(0,POLE_HEIGHT*0.5,0);
      let mesh=new THREE.Mesh(geometry,material);
      mesh.castShadow=true;
      mesh.receiveShadow=true;
      this.add(mesh);
    }
    
  }
}
