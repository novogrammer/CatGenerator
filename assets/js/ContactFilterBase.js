

import {
  difference,
} from "./math_utils.js";



export default class ContactFilterBase extends EventEmitter3{
  constructor({tags=[],reportTags=[],updater=null}={}){
    super();
    this.tags=tags;
    this.reportTags=reportTags;
    this.updater=updater;
    this.currentCollisionSet=new Set();
    this.previousCollisionSet=[];
    this.setupUserPointer();
    this.setupEvents();
  }
  setupUserPointer(){
    let {updater}=this;
    let {body}=updater;
    var dummyObject=new Ammo.btVector3(0,0,0);
    dummyObject.contactFilter=this;
    body.setUserPointer(dummyObject);
  }
  setupEvents(){
    this.on("enter",this.onEnter.bind(this));
    this.on("leave",this.onLeave.bind(this));
  }
  beginStep(){
    this.previousCollisionSet=this.currentCollisionSet;
    this.currentCollisionSet=new Set();
  }
  endStep(){
    let enterSet=difference(this.currentCollisionSet,this.previousCollisionSet);
    for(let other of enterSet.values()){
      this.emit("enter",other);
    }
    let leaveSet=difference(this.previousCollisionSet,this.currentCollisionSet);
    for(let other of leaveSet.values()){
      this.emit("leave",other);
    }
//    leaveSet.values().forEach(this.emit.bind(this,"leave"));
  }
  add(other){
    for(let otherTag of other.tags){
      if(this.reportTags.includes(otherTag)){
        this.currentCollisionSet.add(other);
      }
    }
  }
  onEnter(other){
    //DO NOTHING
    //console.log("onEnter");
  }
  onLeave(other){
    //DO NOTHING
    //console.log("onLeave");
  }
}
