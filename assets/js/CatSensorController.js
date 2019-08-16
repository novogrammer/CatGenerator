

import ControllerBase from "./ControllerBase.js";

export default class CatSensorController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["catsensor"],reportTags:["canwalk"]},params));
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("CatSensorController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("CatSensorController.prototype.onLeave");
  }
  
}
