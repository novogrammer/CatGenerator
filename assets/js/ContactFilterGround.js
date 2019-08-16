

import ContactFilterBase from "./ContactFilterBase.js";

export default class ContactFilterGround extends ContactFilterBase{
  constructor(updater){
    super({tags:["ground","canwalk"],reportTags:[],updater});
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("ContactFilterGround.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("ContactFilterGround.prototype.onLeave");
  }
  
}
