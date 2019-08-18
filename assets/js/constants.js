import * as THREE from "./three/build/three.module.js";
import {
  degToRad,
} from "./math_utils.js";

export const FPS=60;
export const IS_DEBUG=true;
export const GRAVITY_CONSTANT=9.8;

//calculated in CatObject
export const CAT_OBJECT_AABB=new THREE.Box3(new THREE.Vector3(-0.15,-0.275,-0.35),new THREE.Vector3(0.15,0.35,0.45));


export const CAT_MAX_VELOCITY=1;
export const CAT_WALK_FORCE=10;
export const CAT_MAX_ANGLULAR_VELOCITY=degToRad(90);

