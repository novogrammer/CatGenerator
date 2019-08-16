


export default class ContactFilterManager{
  constructor(dispatcher){
    this.dispatcher=dispatcher;
    this.contactFilters=[];
  }
  add(target){
    this.contactFilters.push(target);
  }
  remove(target){
    this.contactFilters=this.contactFilters.filter((contactFilter)=>contactFilter!=target);
  }
  update(){
    let {dispatcher}=this;
    let getContactFilter=(body)=>{
      let rigidBody=Ammo.castObject(body,Ammo.btRigidBody);
      let {contactFilter}=Ammo.castObject(rigidBody.getUserPointer(),Ammo.btVector3);
      return contactFilter;
    };
    
    for(let contactFilter of this.contactFilters){
      contactFilter.beginStep();
    }
    //see https://github.com/mrdoob/three.js/blob/r106/examples/webgl_physics_convex_break.html
    let qty=dispatcher.getNumManifolds();
    for(let i=0;i<qty;++i){
      let contactManifold=dispatcher.getManifoldByIndexInternal(i);
      let contactFilter0=getContactFilter(contactManifold.getBody0());
      let contactFilter1=getContactFilter(contactManifold.getBody1());
      if (!!contactFilter0 && !!contactFilter1){
        contactFilter0.add(contactFilter1);
        contactFilter1.add(contactFilter0);
      }
    }
    for(let contactFilter of this.contactFilters){
      contactFilter.endStep();
    }
  }
}
