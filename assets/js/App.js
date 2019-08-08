import {
  FPS,
  IS_DEBUG,
  GRAVITY_CONSTANT,
} from "./constants.js";

import {
  degToRad,
} from "./math_utils.js";


import * as THREE from "./three/build/three.module.js";
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";

//let THREE=Object.assign(Object.assign({},T),{TeapotBufferGeometry});

import Stats from "./stats/stats.module.js";

import AmmoToThreeUpdater from "./AmmoToThreeUpdater.js";

import SkinnedCatObject from "./SkinnedCatObject.js";
import CatObject from "./CatObject.js";


export default class App{
  constructor(){
    this.updaters=[];
    this.mousePosition={x:0,y:0};
    this.mouseDeltaPosition={x:0,y:0};
    this.$View=$("#View");
    this.isPointerLocked=false;
    this.isFullscreen=false;
    this.setupThree();
    this.setupAmmo();
    this.setupScene();
    this.setupStats();
    this.setupEvents();
    
    this.spawn();
    /*
    setInterval(()=>{
      this.spawn();
    },1000);
    */
  }
  setupThree(){
    let renderer=new THREE.WebGLRenderer({
      canvas:$("#View")[0],
    });
    renderer.shadowMap.enabled=true;
    renderer.sortObjects=false;
    let scene=new THREE.Scene();
    let camera=new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 100 );
    
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(0,1,0);
    camera.position.set(0,1,2);
    
    let ambientLight=new THREE.AmbientLight(0x707070);
    scene.add(ambientLight);
    let directionalLight=new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(10,10,10);
    directionalLight.castShadow=true;
    {
      let {shadow}=directionalLight;
      let {camera,mapSize}=shadow;
      const d=5;
      camera.left=-d;
      camera.right=d;
      camera.top=d;
      camera.bottom=-d;
      camera.near=2;
      camera.far=30;
      mapSize.x=512;
      mapSize.y=512;
    }
    scene.add(directionalLight);
    

    
    this.three={renderer,scene,camera,controls};

    //camera.position.set(0,2,5);
    //camera.lookAt(new THREE.Vector3(0,2,0));

  }
  setupAmmo(){
    let collisionConfiguration=new Ammo.btDefaultCollisionConfiguration();
    let dispatcher=new Ammo.btCollisionDispatcher(collisionConfiguration);
    let broadphase=new Ammo.btDbvtBroadphase();
    let solver=new Ammo.btSequentialImpulseConstraintSolver();

    let physicsWorld=new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -GRAVITY_CONSTANT, 0));
    
    this.ammo={physicsWorld};
  }
  setupStats(){
    this.stats=new Stats();
    let $dom=$(this.stats.dom);
    $dom.attr("id","Stats");
    $("body").append($dom);
    $("#Stats").css({left:"auto",right:0});
    $("#Stats").toggle(IS_DEBUG);
  }
  setupEvents(){
    let animate=()=>{
      requestAnimationFrame(animate);
      this.stats.begin();
      this.onTick();
      this.stats.end();
    };
    requestAnimationFrame(animate);
    $(window).on("resize.app",this.onResize.bind(this));
    this.onResize();
    
    $(window).on("keydown.app",this.onKeydown.bind(this));
    this.$View.on("mousemove.app",this.onMousemove.bind(this));
    $(document).on("pointerlockchange.app",this.onPointerlockchange.bind(this));
    $(document).on("fullscreenchange.app",this.onFullscreenchange.bind(this));
    
    $("#LockPointer").on("click",()=>{
      this.lockPointer();
    });
    $("#Fullscreen").on("click",()=>{
      this.fullscreen();
    });
  }
  spawn(){
    let noise=this.makeNoise();
    let texture=new THREE.TextureLoader().load('/cat/'+noise);
    
    let object3d=new THREE.Object3D();
    
    let material=new THREE.MeshLambertMaterial({
      map:texture,
      flatShading:true,
    });
    
    //let cat=new CatObject({material});
    let cat=new SkinnedCatObject({material});
    
    let {size}=cat;
    
    let pos=new Ammo.btVector3(Math.random()*2-1,5,0);
    //let pos=new Ammo.btVector3(0,5,0);
    let halfSize=new Ammo.btVector3(size.x*0.5,size.y*0.5,size.z*0.5);
    let mass=1;
    let transform=new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(pos);
    let shape=new Ammo.btBoxShape(halfSize);
    let localInertia=new Ammo.btVector3(0,0,0);
    shape.calculateLocalInertia(mass,localInertia);
    
    
    let body=new Ammo.btRigidBody(
      new Ammo.btRigidBodyConstructionInfo(
        mass,
        new Ammo.btDefaultMotionState(transform),
        shape,
        localInertia
      )
    );
    let {scene}=this.three;
    let {physicsWorld}=this.ammo;
    
    let updater=new AmmoToThreeUpdater({world:physicsWorld,body:body,scene:scene,object3d:cat});
    this.updaters.push(updater);
    
    if(IS_DEBUG){
      let text="updaters.length: "+this.updaters.length;
      console.log(text);
    }
  }
  makeBox({position=new THREE.Vector3(),quaternion=new THREE.Quaternion(),size=new THREE.Vector3(1,1,1),mass=0,material=new THREE.MeshBasicMaterial({flatShading:true})}){
    let {scene}=this.three;
    let mesh=null;
    {
      let geometry=new THREE.BoxGeometry(size.x,size.y,size.z);
      mesh=new THREE.Mesh(geometry,material);
      mesh.castShadow=true;
      mesh.receiveShadow=true;
    }
    
    let {physicsWorld}=this.ammo;
    let body=null;
    {
      let positionForAmmo=new Ammo.btVector3(position.x,position.y,position.z);
      let quaternionForAmmo=new Ammo.btQuaternion(quaternion.x,quaternion.y,quaternion.z,quaternion.w);
      let halfSize=new Ammo.btVector3(size.x*0.5,size.y*0.5,size.z*0.5);
      let transform=new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(positionForAmmo);
      transform.setRotation(quaternionForAmmo);
      
      let shape=new Ammo.btBoxShape(halfSize);
      let localInertia=new Ammo.btVector3(0,0,0);
      shape.calculateLocalInertia(mass,localInertia);
      
      body=new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
        mass,
        new Ammo.btDefaultMotionState(transform),
        shape,
        localInertia,
      ));
      body.setRestitution(1);
      body.setFriction(1);
    }
    let updater=new AmmoToThreeUpdater({world:physicsWorld,body:body,scene:scene,object3d:mesh});
    this.updaters.push(updater);
    return updater;
    
  }
  setupScene(){
    let {physicsWorld}=this.ammo;
    let ground=this.makeBox({
      position:new THREE.Vector3(0,-1,0),
      quaternion:new THREE.Quaternion(),
      size:new THREE.Vector3(10*1.5,2,10*1.5),
      mass:0,
      material:new THREE.MeshLambertMaterial({
        flatShading:true,
      }),
    });
    let blender=this.makeBox({
      position:new THREE.Vector3(0,0.5,0),
      quaternion:new THREE.Quaternion(),
      size:new THREE.Vector3(10,1,1),
      mass:1,
      material:new THREE.MeshLambertMaterial({
        color:0xff0000,
        flatShading:true,
      }),
    });
    var localPivotA=new Ammo.btVector3(0,1,0);
    var localPivotB=new Ammo.btVector3(0,-0.5,0);
    var axis=new Ammo.btVector3(0,1,0);    
    
    let blenderHinge=new Ammo.btHingeConstraint(ground.body,blender.body,localPivotA,localPivotB,axis,axis,true);
    physicsWorld.addConstraint( blenderHinge, true );

    this.ammo.blenderHinge=blenderHinge;
    
  }
  lockPointer(){
    this.$View[0].requestPointerLock();
  }
  fullscreen(){
    $("html")[0].requestFullscreen();
  }
  onResize(){
    let {renderer,scene,camera}=this.three;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  }
  onKeydown(e){
    const KEYCODE_SPACE=0x20;
    if(e.keyCode==KEYCODE_SPACE){
      /*
      for(let updater of this.updaters){
        updater.destroy();
      }
      this.updaters=[];
      */
      this.spawn();

    }
  }
  onMousemove(e){
    let {originalEvent}=e;
    let {movementX,movementY}=originalEvent;
    let {blenderHinge}=this.ammo;
    //console.log(movementX,movementY);
    this.mouseDeltaPosition.x+=movementX;
    this.mouseDeltaPosition.y+=movementY;

  }
  onPointerlockchange(e){
    this.isPointerLocked=!!document.pointerLockElement;
    $("#LockPointer").toggle(!this.isPointerLocked);
  }
  onFullscreenchange(e){
    this.isFullscreen=!!document.fullscreenElement;
    $("#Fullscreen").toggle(!this.isFullscreen);
  }
  onTick(){
    let {renderer,scene,camera,mesh,controls}=this.three;
    let {physicsWorld,blenderHinge}=this.ammo;
    //console.log(performance.now());
    this.mousePosition.x+=this.mouseDeltaPosition.x;
    this.mousePosition.y+=this.mouseDeltaPosition.y;
    
    //blenderHinge.enableAngularMotor(true,1.5*1,50);
    //blenderHinge.enableAngularMotor(true,degToRad(this.mouseDeltaPosition.x*FPS),50);
    

    physicsWorld.stepSimulation( 1/FPS, 10 );
    
    for(let updater of this.updaters){
      updater.update();
    }
    let newUpdaters=[];
    for(let updater of this.updaters){
      if(-2<updater.object3d.position.y){
        newUpdaters.push(updater);
      }else{
        updater.destroy();
        console.log("DESTROY!");
      }
    }
    this.updaters=newUpdaters;
    
    controls.update();
    renderer.render( scene, camera );
    if(IS_DEBUG){
      let text="draw calls: "+renderer.info.render.calls;
      console.log(text);
      $("#DebugText").text(text);
    }
    renderer.info.reset();
    this.mouseDeltaPosition.x=0;
    this.mouseDeltaPosition.y=0;
  }
  makeNoise(){
    let noise="";
    //let myRandom=()=>(Math.random() + Math.random())/2;
    let myRandom=()=>Math.random();
    for(let i=0;i<100;++i){
      let n=Math.floor(myRandom()*256);
      noise+=((n&0xf0)>>4).toString(16)
      noise+=(n&0x0f).toString(16);
    }
    return noise;
    
  }
  static load(){
    let promises=[];
    promises.push(new Promise((resolve,reject)=>{
      Ammo().then(()=>resolve());
    }));
    return Promise.all(promises);
  }
}



