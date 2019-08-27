

import ControllerBase from "./ControllerBase.js";

export default class GoalController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["goal"],reportTags:[]},params));
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("GroundController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("GroundController.prototype.onLeave");
  }
  
}
