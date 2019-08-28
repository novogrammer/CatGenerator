import {
  IS_DEBUG,
  FPS,
  ROOM_SIZE,
} from "../constants.js";

import {
  degToRad,
} from "../math_utils.js";


import * as THREE from "../three/build/three.module.js";

export default class FloorObject extends THREE.Object3D{
  constructor(){
    super();
    this.setupObject();
  }
  setupObject(){
    const REPEAT_PER_SIZE=0.25;
    const PATH_BASE="./assets/img/marble_01_1k_jpg/";
    let textureLoader=new THREE.TextureLoader();
    let load=(filename)=>{
      let texture=textureLoader.load(PATH_BASE+filename);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };
    let material=new THREE.MeshStandardMaterial({
      map:load("marble_01_diff_1k.jpg"),
      normalMap:load("marble_01_nor_1k.jpg"),
      displacementMap:load("marble_01_disp_1k.jpg"),
      aoMap:load("marble_01_AO_1k.jpg"),
      roughnessMap:load("marble_01_rough_1k.jpg"),
      metalnessMap:load("marble_01_spec_1k.jpg"),
      displacementScale:0.01
    });
    
    let geometry=new THREE.PlaneGeometry(ROOM_SIZE.x,ROOM_SIZE.z);
    for(let faceVertexUv of geometry.faceVertexUvs[0]){
      for(let vertexUv of faceVertexUv){
        vertexUv.multiply(new THREE.Vector2(
          ROOM_SIZE.x*REPEAT_PER_SIZE,
          ROOM_SIZE.z*REPEAT_PER_SIZE
        ));
      }
    }
    geometry.rotateX(degToRad(-90));
    
    let mesh=new THREE.Mesh(geometry,material);
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    this.add(mesh);
    
    
  }
}
