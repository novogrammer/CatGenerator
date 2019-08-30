

import {
  IS_DEBUG,
} from "../constants.js";

import {
  difference,
} from "../math_utils.js";

import {
  convertVector3AmmoToThree,
  convertQuaternionAmmoToThree,
} from "../ammo_and_three_utils.js";


export default class ControllerBase extends EventEmitter3{
  constructor({tags=[],reportTags=[],world,body,scene,object3d}={}){
    super();
    this.tags=tags;
    this.reportTags=reportTags;
    this.world=world;
    this.body=body;
    this.scene=scene;
    this.object3d=object3d;
    this.transform=new Ammo.btTransform();
    this.currentContactSet=new Set();
    this.previousContactSet=[];
    this.constraints=[];
    this.isRegistered=false;
  }
  registerUserPointer(){
    let {body}=this;
    var dummyObject=new Ammo.btVector3(0,0,0);
    dummyObject.controller=this;
    body.setUserPointer(dummyObject);
    this.isRegistered=true;
  }
  unregisterUserPointer(){
    if(!this.isRegistered){
      debugger;
      throw new Error("controller is not registered");
    }
    let {body}=this;
    let dummyObject=Ammo.castObject(body.getUserPointer(),Ammo.btVector3);
    dummyObject.controller=null;
    Ammo.destroy(dummyObject);
    this.isRegistered=false;
  }
  beginContact(){
    this.previousContactSet=this.currentContactSet;
    this.currentContactSet=new Set();
  }
  endContact(){
    let enterSet=difference(this.currentContactSet,this.previousContactSet);
    for(let other of enterSet.values()){
      this.emit("enter",other);
    }
    let leaveSet=difference(this.previousContactSet,this.currentContactSet);
    for(let other of leaveSet.values()){
      this.emit("leave",other);
    }
  }
  update(){
    let {body,object3d,transform}=this;
    body.getMotionState().getWorldTransform(transform);
    if(IS_DEBUG){
      let isActive=body.isActive();
      object3d.traverse((target)=>{
        if(!!target.material){
          target.material.wireframe=!isActive;
        }
      });
    }
    convertVector3AmmoToThree(transform.getOrigin(),object3d.position);
    convertQuaternionAmmoToThree(transform.getRotation(),object3d.quaternion)
    object3d.dispatchEvent({type:"updateanimation"});
  }
  register(){
    let {world,body,scene,object3d}=this;
    scene.add(object3d);
    world.addRigidBody(body);
    
    for(let constraint of this.constraints){
      world.addConstraint( constraint, true );
    }
    
    
    this.registerUserPointer();
    this.on("enter",this.onEnter,this);
    this.on("leave",this.onLeave,this);
  }
  unregister(){
    let {world,body,scene,object3d}=this;
    this.off("enter",this.onEnter,this);
    this.off("leave",this.onLeave,this);
    
    this.unregisterUserPointer();
    
    world.removeRigidBody(body);
    
    for(let constraint of this.constraints){
      world.removeConstraint(constraint);
    }
    
    scene.remove(object3d);
  }
  destroy(){
    let {world,body,scene,object3d}=this;
    
    Ammo.destroy(body);
    for(let constraint of this.constraints){
      Ammo.destroy(constraint);
    }
    Ammo.destroy(this.transform);
    
    object3d.traverse((target)=>{
      let {geometry,material}=target;
      if(!!geometry){
        geometry.dispose();
      }
      if(!!material){
        let {map}=material;
        if(!!map){
          map.dispose();
        }
        material.dispose();
      }
    })
  }
  
  addContact(other){
    for(let otherTag of other.tags){
      if(this.reportTags.includes(otherTag)){
        this.currentContactSet.add(other);
      }
    }
  }
  findContactsByTag(tag){
    let {currentContactSet}=this;
    return Array.from(currentContactSet)
    .filter((other)=>other.tags.includes(tag))
  }
  onEnter(other){
    //DO NOTHING
    //console.log("onEnter");
  }
  onLeave(other){
    //DO NOTHING
    //console.log("onLeave");
  }
  static getController(body){
    let rigidBody=Ammo.castObject(body,Ammo.btRigidBody);
    let {controller}=Ammo.castObject(rigidBody.getUserPointer(),Ammo.btVector3);
    return controller;
    
  }
}
