

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
    if(0<catSensorController.currentContactSet.size){
      let velocity=body.getLinearVelocity();
      if(velocity.length()<1){
        let force=new Ammo.btVector3(0,0,10);
        body.applyCentralLocalForce(force);
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
