

import ControllerBase from "./ControllerBase.js";

export default class CatController extends ControllerBase{
  constructor(params){
    super(Object.assign({tags:["cat","canwalk"],reportTags:[]},params));
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
