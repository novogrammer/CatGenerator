import {
  IS_DEBUG,
  FPS,
} from "../constants.js";

import {
  map
} from "../math_utils.js";


import * as THREE from "../three/build/three.module.js";

export default class FloorObject extends THREE.Object3D{
  constructor(){
    super();
    this.setupObject();
  }
  setupObject(){
    let geometry=new THREE.BoxGeometry(10,0.1,10);
    
    let textureLoader=new THREE.TextureLoader();
    const PATH_BASE="./assets/img/marble_01_1k_jpg/";
    let material=new THREE.MeshStandardMaterial({
      map:textureLoader.load(PATH_BASE+"marble_01_diff_1k.jpg"),
      normalMap:textureLoader.load(PATH_BASE+"marble_01_nor_1k.jpg"),
      displacementMap:textureLoader.load(PATH_BASE+"marble_01_disp_1k.jpg"),
      aoMap:textureLoader.load(PATH_BASE+"marble_01_AO_1k.jpg"),
      roughnessMap:textureLoader.load(PATH_BASE+"marble_01_rough_1k.jpg"),
      metalnessMap:textureLoader.load(PATH_BASE+"marble_01_spec_1k.jpg"),
    });
    
    let mesh=new THREE.Mesh(geometry,material);
    
    this.add(mesh);
    
  }
}
