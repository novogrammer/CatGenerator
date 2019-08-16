

import ContactFilterBase from "./ContactFilterBase.js";

export default class ContactFilterCatSensor extends ContactFilterBase{
  constructor(updater){
    super({tags:["catsensor"],reportTags:["canwalk"],updater});
  }
  onEnter(other){
    super.onEnter(other);
    //console.log("ContactFilterCatSensor.prototype.onEnter");
  }
  onLeave(other){
    super.onLeave(other);
    //console.log("ContactFilterCatSensor.prototype.onLeave");
  }
  
}
