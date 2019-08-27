
import {
  IS_DEBUG,
} from "../constants.js";


import ControllerBase from "./ControllerBase.js";

export default class ControllerManager{
  constructor(dispatcher){
    this.dispatcher=dispatcher;
    this.controllers=[];
  }
  register(target){
    target.register();
    this.controllers.push(target);
  }
  unregister(target){
    target.unregister();
    this.controllers=this.controllers.filter((controller)=>controller!=target);
  }
  updateContact(){
    let {dispatcher}=this;
    let getcontroller=(body)=>{
      return ControllerBase.getController(body);
    };
    
    for(let controller of this.controllers){
      controller.beginContact();
    }
    //see https://github.com/mrdoob/three.js/blob/r106/examples/webgl_physics_convex_break.html
    let qty=dispatcher.getNumManifolds();
    for(let i=0;i<qty;++i){
      let contactManifold=dispatcher.getManifoldByIndexInternal(i);
      if(0<contactManifold.getNumContacts()){
        let controller0=getcontroller(contactManifold.getBody0());
        let controller1=getcontroller(contactManifold.getBody1());
        if (!!controller0 && !!controller1){
          controller0.addContact(controller1);
          controller1.addContact(controller0);
        }
        
      }
    }
    for(let controller of this.controllers){
      controller.endContact();
    }
    
    
    
  }
  update(){
    for(let controller of this.controllers){
      controller.update();
    }
    
    //TODO
    /*
    let newControllers=[];
    for(let controller of this.controllers){
      if(-2<controller.object3d.position.y){
        newControllers.push(controller);
      }else{
        controller.destroy();
        console.log("DESTROY!");
      }
    }
    this.controllers=newControllers;
    */
  }
}
