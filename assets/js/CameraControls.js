import {
  IS_DEBUG,
  CAMERA_POSITION,
} from "./constants.js";


import * as THREE from "./three/build/three.module.js";

export default class CameraControls{
  constructor(context){
    this.context=context;
    this.target=new THREE.Vector3();
    this.position=new THREE.Vector3();
    this.positionToMove=new THREE.Vector3();
    this.reset();
  }
  reset(){
    let {context,target,position,positionToMove}=this;
    target.set(0,0,0);
    let {momCatController}=context;
    if(!!momCatController){
      let {object3d}=momCatController;
      position.copy(object3d.localToWorld(CAMERA_POSITION.clone()));
      positionToMove.copy(object3d.localToWorld(CAMERA_POSITION.clone()));
    }
  }
  
  update(){
    let {context,target,position,positionToMove}=this;
    let {camera}=context.three;
    let {momCatController}=context;
    if(!!momCatController){
      let {object3d}=momCatController;
      target.copy(object3d.localToWorld(new THREE.Vector3(0,0,0)));
      positionToMove.copy(object3d.localToWorld(CAMERA_POSITION.clone()));
    }
    position.lerp(positionToMove,0.1);
    camera.position.copy(position);
    camera.lookAt(target);
  }
}