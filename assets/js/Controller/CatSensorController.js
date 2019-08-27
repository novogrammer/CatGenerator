import {
  IS_DEBUG,
} from "../constants.js";


import ControllerBase from "./ControllerBase.js";

export default class CatSensorController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["catsensor"],reportTags:["canwalk","goal"]},params));
    this.catController=null;
  }
  assign({catController,anchor}){
    this.catController=catController;
    this.constraints.push(anchor);
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("CatSensorController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("CatSensorController.prototype.onLeave");
  }
  update(){
    this.object3d.visible=IS_DEBUG;
    super.update();
  }
  
}
