
import * as THREE from "./three/build/three.module.js";

export function convertVector3AmmoToThree(ammoVector3,threeVector3=null){
  threeVector3=threeVector3||new THREE.Vector3();
  threeVector3.set(
    ammoVector3.x(),
    ammoVector3.y(),
    ammoVector3.z()
  );
  return threeVector3;
}

export function convertVector3ThreeToAmmo(threeVector3,ammoVector3=null){
  ammoVector3=ammoVector3||new Ammo.btVector3();
  ammoVector3.setValue(
    threeVector3.x,
    threeVector3.y,
    threeVector3.z
  );
  return ammoVector3;
}

export function convertQuaternionAmmoToThree(ammoQuaternion,threeQuaternion=null){
  threeQuaternion=threeQuaternion||new THREE.Quaternion();
  threeQuaternion.set(
    ammoQuaternion.x(),
    ammoQuaternion.y(),
    ammoQuaternion.z(),
    ammoQuaternion.w()
  );
  return threeQuaternion;
}

export function convertQuaternionThreeToAmmo(threeQuaternion,ammoQuaternion=null){
  ammoQuaternion=ammoQuaternion||new Ammo.btQuaternion();
  ammoQuaternion.setValue(
    threeQuaternion.x,
    threeQuaternion.y,
    threeQuaternion.z,
    threeQuaternion.w
  );
  return ammoQuaternion;
}
