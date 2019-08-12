import {
  IS_DEBUG,
} from "./constants.js";



export default class AmmoToThreeUpdater{
  constructor({world,body,scene,object3d}){
    this.world=world;
    this.body=body;
    this.scene=scene;
    this.object3d=object3d;
    this.transform=new Ammo.btTransform();
    scene.add(object3d);
    world.addRigidBody(body);
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
    
    object3d.position.set(transform.getOrigin().x(),transform.getOrigin().y(),transform.getOrigin().z());
    object3d.quaternion.set(
      transform.getRotation().x(),
      transform.getRotation().y(),
      transform.getRotation().z(),
      transform.getRotation().w()
    );
    object3d.dispatchEvent({type:"updateanimation"});
  }
  destroy(){
    let {world,body,scene,object3d}=this;
    world.removeRigidBody(body);
    Ammo.destroy(body);
    scene.remove(object3d);
    object3d.traverse((target)=>{
      let {geometry,material}=target;
      //share geometry
      //if(!!geometry){
      //  geometry.dispose();
      //}
      if(!!material){
        let {map}=material;
        if(!!map){
          map.dispose();
        }
        material.dispose();
      }
    })
  }
}

