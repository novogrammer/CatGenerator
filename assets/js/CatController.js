
import {
  IS_DEBUG,
  FPS,
  CAT_MAX_VELOCITY,
  CAT_WALK_FORCE,
  CAT_MAX_ANGLULAR_VELOCITY,
} from "./constants.js"

import * as THREE from "./three/build/three.module.js";

import {
  degToRad,
  radToDeg,
} from "./math_utils.js";

import ControllerBase from "./ControllerBase.js";

export default class CatController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["cat","canwalk"],reportTags:[]},params));
    this.catSensorController=null;
  }
  assign({catSensorController}){
    this.catSensorController=catSensorController;
  }
  update(){
    let {body,catSensorController}=this;
    let identityQuaternion=new THREE.Quaternion();
    //walk
    if(!!catSensorController && 0<catSensorController.currentContactSet.size){
      let velocity=body.getLinearVelocity();
      if(velocity.length()<CAT_MAX_VELOCITY){
        let force=new Ammo.btVector3(0,0,CAT_WALK_FORCE);
        body.applyCentralLocalForce(force);
      }
      let transform=body.getCenterOfMassTransform();
      let rotation=new THREE.Quaternion(
        transform.getRotation().x(),
        transform.getRotation().y(),
        transform.getRotation().z(),
        transform.getRotation().w()
      );
      let origin=new THREE.Vector3(
        transform.getOrigin().x(),
        transform.getOrigin().y(),
        transform.getOrigin().z()
      );
      let targetPosition=new THREE.Vector3(1,origin.y,-1);
      let targetVector=targetPosition.clone().sub(origin).normalize();
      let currentVector=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
      if(0<targetVector.length()){
        let rotationToTarget=new THREE.Quaternion().setFromUnitVectors(currentVector,targetVector);
        let angle=identityQuaternion.angleTo(rotationToTarget);
        let angleForNow=Math.min(angle,CAT_MAX_ANGLULAR_VELOCITY/FPS);
        let rotationRatio=(angle==0)?1:(angleForNow/angle)
        let rotationForNow=new THREE.Quaternion().slerp(rotationToTarget,rotationRatio);
        
        let newRotation=rotation.clone().multiply(rotationForNow);
        let newTransform=new Ammo.btTransform();
        newTransform.setRotation(new Ammo.btQuaternion(
          newRotation.x,
          newRotation.y,
          newRotation.z,
          newRotation.w
        ));
        newTransform.setOrigin(transform.getOrigin());
        body.setCenterOfMassTransform(newTransform);
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
