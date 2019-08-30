import * as THREE from "./three/build/three.module.js";
import {
  degToRad,
} from "./math_utils.js";

export const FPS=60;
export const IS_DEBUG=true;
export const IS_ORBIT_CONTROLS=false;
export const GRAVITY_CONSTANT=9.8;

export const MAIN_CAMERA_NAME="MainCamera";

export const ROOM_SIZE=new THREE.Vector3(10,2,10);
export const GOAL_BOX_SIZE=new THREE.Vector3(2,1,2);
export const GOAL_BOX_POSITION=new THREE.Vector3(-4,GOAL_BOX_SIZE.y*-0.5,-4);

export const CAT_PARAMETERS_QTY=100;
export const CAT_PARAMETER_VARIATION_RANGE=0.4;

export const CAMERA_LOOKAT=new THREE.Vector3(0,1,0);
export const CAMERA_POSITION=new THREE.Vector3(0,1,-5);


//calculated in CatObject
//export const CAT_OBJECT_AABB=new THREE.Box3(new THREE.Vector3(-0.15,-0.275,-0.35),new THREE.Vector3(0.15,0.35,0.45));
//trim max.y
export const CAT_OBJECT_AABB=new THREE.Box3(new THREE.Vector3(-0.15,-0.275,-0.35),new THREE.Vector3(0.15,0.1,0.45));


export const CAT_MAX_VELOCITY=1;
export const CAT_WALK_FORCE=10;
export const CAT_MAX_ANGLULAR_VELOCITY=degToRad(90);
export const CAT_SCALE=1;
export const CAT_MASS=1;

export const CAT_SPAWN_RATE=1;
export const CAT_MAX_QTY=100;

export const MOM_CAT_MASS=8;

export const MOUSE_VELOCITY_TO_FORCE=MOM_CAT_MASS/100;

export const MOM_CAT_MAX_VELOCITY=10;
export const MOM_CAT_WALK_FORCE=MOM_CAT_MASS*20;
export const MOM_CAT_SCALE=2;
//size: Vector3 {x: 0.3, y: 0.625, z: 0.8} 
export const MOM_CAT_FORCE_POINT=new THREE.Vector3(0,0,0.2).multiplyScalar(MOM_CAT_SCALE);
export const MOM_CAT_SPAWN_POINT=new THREE.Vector3(0,0,-0.3).multiplyScalar(MOM_CAT_SCALE);
