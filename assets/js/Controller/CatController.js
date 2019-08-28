
import {
  IS_DEBUG,
  FPS,
  CAT_MAX_VELOCITY,
  CAT_WALK_FORCE,
  CAT_MAX_ANGLULAR_VELOCITY,
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

export default class CatController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["cat","canwalk"],reportTags:[]},params));
    this.catSensorController=null;
    this.momCatController=null;
    this.catParameters=null;
  }
  assign({catSensorController,momCatController,catParameters}){
    this.catSensorController=catSensorController;
    this.momCatController=momCatController;
    this.catParameters=catParameters;
  }
  getMomPosition(){
    let {momCatController}=this;
    if(!momCatController){
      return new THREE.Vector3(0,0,0);
    }
    return momCatController.object3d.position.clone();
  }
  canWalk(){
    let {catSensorController}=this;
    if(!catSensorController){
      return false;
    }
    return 0<catSensorController.findContactsByTag("canwalk").length;
  }
  update(){
    let {body}=this;
    let identityQuaternion=new THREE.Quaternion();
    //walk
    if(this.canWalk()){
      let velocity=body.getLinearVelocity();
      if(velocity.length()<CAT_MAX_VELOCITY){
        let force=new Ammo.btVector3(0,0,CAT_WALK_FORCE);
        body.applyCentralLocalForce(force);
        Ammo.destroy(force);
      }
      let transform=body.getCenterOfMassTransform();
      let rotation=convertQuaternionAmmoToThree(transform.getRotation());
      let origin=convertVector3AmmoToThree(transform.getOrigin());
      let momPosition=this.getMomPosition();
      let targetPosition=new THREE.Vector3(momPosition.x,origin.y,momPosition.z);
      let targetVector=targetPosition.clone().sub(origin).normalize();
      let currentVector=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
      if(0<targetVector.length()){
        let rotationToTarget=new THREE.Quaternion().setFromUnitVectors(currentVector,targetVector);
        let angle=identityQuaternion.angleTo(rotationToTarget);
        let angleForNow=Math.min(angle,CAT_MAX_ANGLULAR_VELOCITY/FPS);
        let rotationRatio=(angle==0)?1:(angleForNow/angle)
        let rotationForNow=new THREE.Quaternion().slerp(rotationToTarget,rotationRatio);
        
        let newRotation=rotation.clone().multiply(rotationForNow);
        let newRotationAmmo=convertQuaternionThreeToAmmo(newRotation);
        let newTransform=new Ammo.btTransform();
        newTransform.setRotation(newRotationAmmo);
        Ammo.destroy(newRotationAmmo);
        newTransform.setOrigin(transform.getOrigin());
        body.setCenterOfMassTransform(newTransform);
        Ammo.destroy(newTransform);
      }
      
    }
    super.update();
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("CatController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("CatController.prototype.onLeave");
  }
  
}
