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

import SkinnedCatObject from "./SkinnedCatObject.js";
import CatObject from "./CatObject.js";


import ControllerManager from "./ControllerManager.js";
import GroundController from "./GroundController.js";
import CatController from "./CatController.js";
import CatSensorController from "./CatSensorController.js";
import EmptyController from "./EmptyController.js";


export default class App{
  constructor(){
    this.mousePosition={x:0,y:0};
    this.mouseDeltaPosition={x:0,y:0};
    this.$View=$("#View");
    this.isPointerLocked=false;
    this.isFullscreen=false;
    this.three=null;
    this.ammo=null;
    this.stats=null;
    this.controllerManager=null;
    
    this.setupThree();
    this.setupAmmo();
    this.setupScene();
    this.setupStats();
    this.setupEvents();
    
    //this.spawn({});
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
    camera.position.set(0,1,5);
    
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
    this.controllerManager=new ControllerManager(dispatcher);
    this.ammo={physicsWorld,dispatcher};
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
    if(FPS==60){
      let animate=()=>{
        requestAnimationFrame(animate);
        this.stats.begin();
        this.onTick();
        this.stats.end();
      };
      requestAnimationFrame(animate);
    }else{
      setInterval(()=>{
        this.stats.begin();
        this.onTick();
        this.stats.end();
      },1/FPS*1000);
    }
    
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
  spawn({position={x:0,y:5,z:0},velocity={x:0,y:0,z:0}}){


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
    
    let positionForAmmo=new Ammo.btVector3(position.x,position.y,position.z);
    let velocityForAmmo=new Ammo.btVector3(velocity.x,velocity.y,velocity.z);
    
    let halfSize=new Ammo.btVector3(size.x*0.5,size.y*0.5,size.z*0.5);
    let mass=1;
    let transform=new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(positionForAmmo);
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
    body.setLinearVelocity(velocityForAmmo);
    let {scene}=this.three;
    let {physicsWorld}=this.ammo;
    
    let controller=new CatController({world:physicsWorld,body:body,scene:scene,object3d:cat});
    this.controllerManager.add(controller);
    
    
    const hasWeight=false;
    if(hasWeight){
      let weightController=this.makeBox({
        position:{x:position.x,y:position.y+size.y*-0.5+0.1*0.5,z:position.z},
        size:{x:0.1,y:0.1,z:0.1},
        mass:10,
        ControllerClass:EmptyController,
      });
      var frameInA=new Ammo.btTransform();
      frameInA.setIdentity();
      frameInA.setOrigin(new Ammo.btVector3(0,size.y*-0.5,0));
      var frameInB=new Ammo.btTransform();
      frameInB.setIdentity();
      //frameInB.setOrigin(new Ammo.btVector3(0,-0.1,0));
      frameInB.setOrigin(new Ammo.btVector3(0,-0.2,0));
      
      let anchor=new Ammo.btFixedConstraint(body,weightController.body,frameInA,frameInB);
      physicsWorld.addConstraint( anchor, true );
    }
    
    const hasSensor=true;
    if(hasSensor){
      let sensorController=this.makeBox({
        position:{x:position.x,y:position.y+size.y*-0.5+0.1*0.5,z:position.z},
        size:{x:0.1,y:0.1,z:0.1},
        mass:0.001,
        isSensor:true,
        ControllerClass:CatSensorController,
      });
      var frameInA=new Ammo.btTransform();
      frameInA.setIdentity();
      frameInA.setOrigin(new Ammo.btVector3(0,size.y*-0.5,0));
      var frameInB=new Ammo.btTransform();
      frameInB.setIdentity();
      frameInB.setOrigin(new Ammo.btVector3(0,0.1*0.5,0));
      
      //CF_NO_CONTACT_RESPONSE = 4
      sensorController.body.setCollisionFlags(sensorController.body.getCollisionFlags()|4);
      
      let anchor=new Ammo.btFixedConstraint(body,sensorController.body,frameInA,frameInB);
      physicsWorld.addConstraint( anchor, true );
    }
    
    
    
  }
  makeBox({
    position=new THREE.Vector3(),
    quaternion=new THREE.Quaternion(),
    size=new THREE.Vector3(1,1,1),
    mass=0,
    material=new THREE.MeshBasicMaterial({flatShading:true}),
    isSensor=false,
    ControllerClass=EmptyController,
  }){
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
    let controller=new ControllerClass({world:physicsWorld,body:body,scene:scene,object3d:mesh});
    this.controllerManager.add(controller);
    return controller;
    
  }
  setupScene(){
    let {controllerManager}=this;
    let {physicsWorld}=this.ammo;
    let ground=null;
    {
      ground=this.makeBox({
        position:new THREE.Vector3(0,-1,0),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(10*1.5,2,10*1.5),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
      });
      
    }
    if(false){
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
    if(false){
      let bar=this.makeBox({
        position:new THREE.Vector3(0,2,0),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(0.5,4,0.5),
        mass:100,
        material:new THREE.MeshLambertMaterial({
          color:0x00ff00,
          flatShading:true,
        }),
      });
      bar.body.setActivationState(4);//DISABLE_DEACTIVATION
      this.ammo.barBody=bar.body;
      /*
      var frameInA=new Ammo.btTransform();
      let directionX=new Ammo.btQuaternion();
      directionX.setRotation(new Ammo.btVector3(0,0,1),degToRad(0));
      frameInA.setRotation(directionX);
      frameInA.setOrigin(new Ammo.btVector3(0,1,0));
      var frameInB=new Ammo.btTransform();
      frameInB.setRotation(directionX);
      frameInB.setOrigin(new Ammo.btVector3(0,-2,0));
      
      let barSlider=new Ammo.btSliderConstraint(ground.body,bar.body,frameInA,frameInB,true);
      physicsWorld.addConstraint( barSlider, true );
      barSlider.setLowerLinLimit(-1);
      barSlider.setUpperLinLimit(1);
      this.ammo.barSlider=barSlider;
      */
    }
    
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
    if(e.key==" "){
      /*
      for(let ix=0;ix<5;++ix){
        let x=ix*-0.3+1
        for(let iy=0;iy<5;++iy){
          let y=iy*0.5+0.2;
          this.spawn({position:{x:x,y:y,z:0}});
        }
      }
      */
      this.spawn({position:{x:0,y:1,z:0}});

    }
    /*
    if(e.key.toUpperCase()=="Q"){
      for(let controller of this.controllerManager.controllers){
        controller.destroy();
      }
      this.controllerManager.controllers=[];
    }
    */
  }
  onMousemove(e){
    let {originalEvent}=e;
    let {movementX,movementY}=originalEvent;
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
    let {physicsWorld,dispatcher,blenderHinge,barSlider,barBody}=this.ammo;
    //console.log(performance.now());
    this.mousePosition.x+=this.mouseDeltaPosition.x;
    this.mousePosition.y+=this.mouseDeltaPosition.y;
    
    //blenderHinge.enableAngularMotor(true,1.5*1,50);
    //blenderHinge.enableAngularMotor(true,degToRad(this.mouseDeltaPosition.x*FPS),50);
    /*
    if(Math.floor(performance.now()/4000)%2==0){
      barBody.setLinearVelocity(new Ammo.btVector3(1,0,0));
    }else{
      barBody.setLinearVelocity(new Ammo.btVector3(-1,0,0));
    }
    */
    /*
    let deg=performance.now()/1000*360/4;
    if(Math.floor(deg/360)%2==0){
      deg=0;
    }
    {
      let x=Math.cos(degToRad(deg))*2;
      let transform=new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(x,2,0));
      barBody.setCenterOfMassTransform(transform);
      
    }
    */
    physicsWorld.stepSimulation( 1/FPS, 10 );
    this.controllerManager.updateContact();
    this.controllerManager.update();
    
    renderer.render( scene, camera );
    if(IS_DEBUG){
      let text="draw calls: "+renderer.info.render.calls;
      //console.log(text);
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



