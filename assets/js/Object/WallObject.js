import {
  IS_DEBUG,
  FPS,
  ROOM_SIZE,
} from "../constants.js";

import {
  degToRad,
} from "../math_utils.js";


import * as THREE from "../three/build/three.module.js";

export default class WallObject extends THREE.Object3D{
  constructor(){
    super();
    this.setupObject();
  }
  setupObject(){
    const REPEAT_PER_SIZE=0.25;
    const PATH_BASE="./assets/img/factory_brick_1k_jpg/";
    let textureLoader=new THREE.TextureLoader();
    let load=(filename)=>{
      let texture=textureLoader.load(PATH_BASE+filename);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };
    let material=new THREE.MeshStandardMaterial({
      map:load("factory_brick_diff_1k.jpg"),
      normalMap:load("factory_brick_nor_1k.jpg"),
      displacementMap:load("factory_brick_disp_1k.jpg"),
      aoMap:load("factory_brick_ao_1k.jpg"),
      roughnessMap:load("factory_brick_rough_1k.jpg"),
      metalness:0,
      displacementScale:0.01
    });
    const WALL_PARAMS_LIST=[
      {width:ROOM_SIZE.x,height:ROOM_SIZE.y,depth:ROOM_SIZE.z*-0.5,rotation:degToRad(0)},
      {width:ROOM_SIZE.z,height:ROOM_SIZE.y,depth:ROOM_SIZE.x*-0.5,rotation:degToRad(90)},
      {width:ROOM_SIZE.x,height:ROOM_SIZE.y,depth:ROOM_SIZE.z*-0.5,rotation:degToRad(180)},
      {width:ROOM_SIZE.z,height:ROOM_SIZE.y,depth:ROOM_SIZE.x*-0.5,rotation:degToRad(270)},
    ];
    for(let wallParams of WALL_PARAMS_LIST){
      let geometry=new THREE.PlaneGeometry(wallParams.width,wallParams.height);
      for(let faceVertexUv of geometry.faceVertexUvs[0]){
        for(let vertexUv of faceVertexUv){
          vertexUv.multiply(new THREE.Vector2(
            wallParams.width*REPEAT_PER_SIZE,
            wallParams.height*REPEAT_PER_SIZE
          ));
        }
      }
      geometry.translate(0,wallParams.height*0.5,wallParams.depth);
      geometry.rotateY(wallParams.rotation);
      let mesh=new THREE.Mesh(geometry,material);
      
      this.add(mesh);
    }
  }
}
