
import {
  IS_DEBUG,
  FPS,
} from "./constants.js"

import * as THREE from "./three/build/three.module.js";

import {
  degToRad,
  radToDeg,
} from "./math_utils.js";


import {
  convertVector3AmmoToThree,
  convertVector3ThreeToAmmo,
  convertQuaternionAmmoToThree,
  convertQuaternionThreeToAmmo,
} from "./ammo_and_three_utils.js";

import ControllerBase from "./ControllerBase.js";

export default class MomCatController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["momcat","canwalk"],reportTags:[]},params));
    this.catSensorController=null;
    this.catParameters=null;
  }
  assign({catSensorController,catParameters}){
    this.catSensorController=catSensorController;
    this.catParameters=catParameters;
  }
  update(){
    let {body,catSensorController}=this;
    super.update();
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("MomCatController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("MomCatController.prototype.onLeave");
  }
  
}
