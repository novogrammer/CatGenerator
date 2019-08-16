

import ContactFilterBase from "./ContactFilterBase.js";

export default class ContactFilterCat extends ContactFilterBase{
  constructor(updater){
    super({tags:["cat","canwalk"],reportTags:[],updater});
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("ContactFilterCat.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("ContactFilterCat.prototype.onLeave");
  }
  
}
