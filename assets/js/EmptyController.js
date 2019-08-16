

import ControllerBase from "./ControllerBase.js";

export default class EmptyController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:[],reportTags:[]},params));
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("EmptyController.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("EmptyController.prototype.onLeave");
  }
  
}
