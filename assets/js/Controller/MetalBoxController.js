import {
  IS_DEBUG,
} from "../constants.js";


import ControllerBase from "./ControllerBase.js";

export default class MetalBoxController extends ControllerBase{
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
    super.update();
  }
}
