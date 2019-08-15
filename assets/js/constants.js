import * as THREE from "./three/build/three.module.js";

export const FPS=60;
export const IS_DEBUG=true;
export const GRAVITY_CONSTANT=9.8;

//calculated in CatObject
export const CAT_OBJECT_AABB=new THREE.Box3(new THREE.Vector3(-0.15,-0.275,-0.35),new THREE.Vector3(0.15,0.35,0.45));

