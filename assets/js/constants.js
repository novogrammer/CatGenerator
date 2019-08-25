import * as THREE from "./three/build/three.module.js";
import {
  degToRad,
} from "./math_utils.js";

export const FPS=60;
export const IS_DEBUG=true;
export const GRAVITY_CONSTANT=9.8;

export const MAIN_CAMERA_NAME="MainCamera";

//calculated in CatObject
export const CAT_OBJECT_AABB=new THREE.Box3(new THREE.Vector3(-0.15,-0.275,-0.35),new THREE.Vector3(0.15,0.35,0.45));


export const CAT_MAX_VELOCITY=1;
export const CAT_WALK_FORCE=10;
export const CAT_MAX_ANGLULAR_VELOCITY=degToRad(90);
export const CAT_SCALE=1;
export const CAT_MASS=1;

export const MOM_CAT_MASS=1;

export const MOUSE_VELOCITY_TO_FORCE=MOM_CAT_MASS/100;

export const MOM_CAT_MAX_VELOCITY=10;
export const MOM_CAT_WALK_FORCE=MOM_CAT_MASS*100;
export const MOM_CAT_SCALE=10;

//size: Vector3 {x: 3, y: 6.25, z: 8}
//export const MOM_CAT_FORCE_POINT=new THREE.Vector3(0,-2,4);
export const MOM_CAT_FORCE_POINT=new THREE.Vector3(0,0,4);
