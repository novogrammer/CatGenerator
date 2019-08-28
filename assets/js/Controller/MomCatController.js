
import {
  IS_DEBUG,
  FPS,
  MOM_CAT_MAX_VELOCITY,
  MOM_CAT_WALK_FORCE,
  MOM_CAT_FORCE_POINT,
  MAIN_CAMERA_NAME,
  MOUSE_VELOCITY_TO_FORCE,
  MOM_CAT_SPAWN_POINT,
  CAT_SPAWN_RATE,
  CAT_MAX_QTY,
} from "../constants.js"

import * as THREE from "../three/build/three.module.js";

import {
  degToRad,
  radToDeg,
} from "../math_utils.js";


import {
  convertVector3AmmoToThree,
  convertVector3ThreeToAmmo,
  convertQuaternionAmmoToThree,
  convertQuaternionThreeToAmmo,
} from "../ammo_and_three_utils.js";

import ControllerBase from "./ControllerBase.js";

export default class MomCatController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["momcat","canwalk"],reportTags:[]},params));
    this.catSensorController=null;
    this.catParameters=null;
    this.mousePosition=new THREE.Vector3();
    this.mouseDeltaPosition=new THREE.Vector3();
    this.body.setActivationState(4);//DISABLE_DEACTIVATION
    this.gameTime=0;
    this.needsSpawn=false;
  }
  assign({catSensorController,catParameters}){
    this.catSensorController=catSensorController;
    this.catParameters=catParameters;
  }
  makeMouseMatrix(){
    let {scene}=this;
    let camera=scene.getObjectByName(MAIN_CAMERA_NAME);
    let cameraZ=new THREE.Vector3();
    camera.getWorldDirection(cameraZ);
    cameraZ.multiplyScalar(-1);
    let py=new THREE.Vector3(0,1,0);
    let px=py.clone().cross(cameraZ).normalize();
    let pz=px.clone().cross(py).normalize();
    let cameraToWorldMatrix=new THREE.Matrix4().makeBasis(px,py,pz);
    let worldToFloorMatrix=new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1,0,0),degToRad(90));
    let mouseMatrix=new THREE.Matrix4();
    mouseMatrix.multiply(cameraToWorldMatrix);
    mouseMatrix.multiply(worldToFloorMatrix);
    return mouseMatrix;
  }
  getSpawnPoint(){
    let {object3d}=this;
    return object3d.localToWorld(MOM_CAT_SPAWN_POINT.clone());
  }
  getRotation(){
    let {object3d}=this;
    return object3d.quaternion;
  }
  canWalk(){
    let {catSensorController}=this;
    if(!catSensorController){
      return false;
    }
    return 0<catSensorController.findContactsByTag("canwalk").length;
  }
  isGoal(){
    let {catSensorController}=this;
    if(!catSensorController){
      return false;
    }
    return 0<catSensorController.findContactsByTag("goal").length;
  }
  update(){
    let {body,scene}=this;
    let dt=1/FPS;
    let previousGameTime=this.gameTime;
    
    if(!this.isGoal()){
      this.gameTime+=dt;
    }
    let previousCatCount=Math.floor(previousGameTime*CAT_SPAWN_RATE);
    let currentCatCount=Math.floor(this.gameTime*CAT_SPAWN_RATE);
    this.needsSpawn= currentCatCount<=CAT_MAX_QTY && previousCatCount!=currentCatCount
    
    this.mousePosition.add(this.mouseDeltaPosition);
    if(this.canWalk()){
      let velocity=body.getLinearVelocity();
      if(velocity.length()<MOM_CAT_MAX_VELOCITY){
        let transform=body.getCenterOfMassTransform();
        let quaternion=convertQuaternionAmmoToThree(transform.getRotation());
        let relativePosition=convertQuaternionThreeToAmmo(MOM_CAT_FORCE_POINT.clone().applyQuaternion(quaternion));
        
        let limitedMouseForce=this.mouseDeltaPosition.clone().multiplyScalar(FPS*MOUSE_VELOCITY_TO_FORCE);
        if(limitedMouseForce.length()>MOM_CAT_WALK_FORCE){
          limitedMouseForce.normalize().multiplyScalar(MOM_CAT_WALK_FORCE);
        }
        
        let mouseMatrix=this.makeMouseMatrix();
        let force=convertVector3ThreeToAmmo(
          limitedMouseForce.clone().applyMatrix4(mouseMatrix)
        );
        body.applyForce(force,relativePosition);
        Ammo.destroy(force);
        Ammo.destroy(relativePosition);

        //body.applyForce(new Ammo.btVector3(0,MOM_CAT_WALK_FORCE,0),relativePosition);

      }
      
    }
    this.mouseDeltaPosition.set(0,0);
    super.update();
  }
  destroy(){
    super.destroy();
  }
  
  onEnter(other){
    super.onEnter(other);
    //console.log("MomCatController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("MomCatController.prototype.onLeave");
  }
  onMousemove(e){
    let {movementX,movementY}=e;
    this.mouseDeltaPosition.add({x:movementX,y:movementY});
  }
  
}
