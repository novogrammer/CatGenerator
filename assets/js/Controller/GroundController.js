import {
  IS_DEBUG,
} from "../constants.js";


import ControllerBase from "./ControllerBase.js";

export default class GroundController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["ground","canwalk"],reportTags:[]},params));
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("GroundController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("GroundController.prototype.onLeave");
  }
  update(){
    this.object3d.visible=IS_DEBUG;
    super.update();
  }
}
