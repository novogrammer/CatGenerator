import {
  FPS,
  IS_DEBUG,
  IS_ORBIT_CONTROLS,
  GRAVITY_CONSTANT,
  CAT_SCALE,
  CAT_MASS,
  MOM_CAT_SCALE,
  MOM_CAT_MASS,
  MAIN_CAMERA_NAME,
  ROOM_SIZE,
  BOX_SIZE,
  GOAL_BOX_SIZE,
  GOAL_BOX_POSITION,
  CAT_PARAMETERS_QTY,
  CAT_PARAMETER_VARIATION_RANGE,
  MAZE_PILLAR_QTY,
  MAZE_WALL_QTY,
} from "./constants.js";

import {
  degToRad,
  clamp,
} from "./math_utils.js";
import {
  convertVector3AmmoToThree,
  convertVector3ThreeToAmmo,
  convertQuaternionAmmoToThree,
  convertQuaternionThreeToAmmo,
} from "./ammo_and_three_utils.js";


import * as THREE from "./three/build/three.module.js";
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";
import CameraControls from "./CameraControls.js";

//let THREE=Object.assign(Object.assign({},T),{TeapotBufferGeometry});

import Stats from "./stats/stats.module.js";

import SkinnedCatObject from "./Object/SkinnedCatObject.js";
import CatObject from "./Object/CatObject.js";
import FloorObject from "./Object/FloorObject.js";
import WallObject from "./Object/WallObject.js";
import GoalObject from "./Object/GoalObject.js";


import ControllerManager from "./Controller/ControllerManager.js";
import GroundController from "./Controller/GroundController.js";
import MomCatController from "./Controller/MomCatController.js";
import CatController from "./Controller/CatController.js";
import CatSensorController from "./Controller/CatSensorController.js";
import EmptyController from "./Controller/EmptyController.js";
import GoalController from "./Controller/GoalController.js";
import MetalBoxController from "./Controller/MetalBoxController.js";


import GameStateStart from "./GameState/GameStateStart.js"


export default class App{
  constructor(){
    this.$View=$("#View");
    if(!IS_DEBUG){
      $("#DebugText").hide();
    }
    this.isPointerLocked=false;
    this.isFullscreen=false;
    this.three=null;
    this.ammo=null;
    this.stats=null;
    this.controllerManager=null;
    this.catControllers=[];//except MomCat
    this.momCatController=null;
    this.metalBoxControllers=[];
    
    this.setupThree();
    this.setupAmmo();
    this.setupScene();
    this.setupStats();
    this.setupEvents();
    
    this.gameState=null;
    this.setNextGameState(new GameStateStart(this));
    
  }
  setupThree(){
    let renderer=new THREE.WebGLRenderer({
      canvas:$("#View")[0],
    });
    renderer.shadowMap.enabled=true;
    renderer.sortObjects=false;
    let scene=new THREE.Scene();
    let camera=new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 100 );
    camera.position.set(0,10,10);
    camera.name=MAIN_CAMERA_NAME;
    
    let controls=null;
    if(IS_ORBIT_CONTROLS){
      controls = new OrbitControls( camera, renderer.domElement );
      controls.target.set(0,1,0);
      controls.update();
    }else{
      controls=new CameraControls(this);
    }
    scene.add(camera);
    
    let ambientLight=new THREE.AmbientLight(0x909090);
    scene.add(ambientLight);
    let directionalLight=new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(-5,10,5);
    directionalLight.castShadow=true;
    {
      let {shadow}=directionalLight;
      let {camera,mapSize}=shadow;
      const d=ROOM_SIZE.x*0.75;
      camera.left=-d;
      camera.right=d;
      camera.top=d;
      camera.bottom=-d;
      camera.near=2;
      camera.far=30;
      mapSize.x=256*4;
      mapSize.y=256*4;
      shadow.bias=-0.001;
    }
    scene.add(directionalLight);
    
    let metalMaterial=null;
    {
      const PATH_BASE="./assets/img/metal_plate_1k_jpg/";
      let textureLoader=new THREE.TextureLoader();
      let load=(filename)=>{
        let texture=textureLoader.load(PATH_BASE+filename);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
      };
      metalMaterial=new THREE.MeshStandardMaterial({
        map:load("metal_plate_diff_1k.jpg"),
        normalMap:load("metal_plate_Nor_1k.jpg"),
        aoMap:load("metal_plate_AO_1k.jpg"),
        roughnessMap:load("metal_plate_rough_1k.jpg"),
        metalnessMap:load("metal_plate_spec_1k.jpg"),
        displacementScale:0.01,
        displacementBias:-0.01,
      });
      
    }

    
    this.three={renderer,scene,camera,controls,metalMaterial};

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
    this.$View.on("mousedown.app",this.onMousedown.bind(this));
    $(document).on("pointerlockchange.app",this.onPointerlockchange.bind(this));
    $(document).on("fullscreenchange.app",this.onFullscreenchange.bind(this));
    
    $("#LockPointer").on("click",()=>{
      this.lockPointer();
    });
    $("#Fullscreen").on("click",()=>{
      this.fullscreen();
    });
  }
  grow({cat=null}={}){
    
    if(!cat){
      return;
    }
    let {object3d,catParameters}=cat;
    
    let temporaryGrownCat=this.spawn({
      position:object3d.position,
      rotation:object3d.quaternion,
      scale:MOM_CAT_SCALE,
      mass:MOM_CAT_MASS,
      isTemporary:true,
      catParameters,
    });
    this.cleanCats();
    let momCatController=new MomCatController(temporaryGrownCat);
    let {catSensorController}=temporaryGrownCat;
    momCatController.assign({
      catSensorController,
      catParameters,
    });
    //anchor was already assigned
    catSensorController.catController=momCatController;
    
    this.controllerManager.register(momCatController);
    this.controllerManager.register(momCatController.catSensorController);
    this.momCatController=momCatController;

    
  }
  spawn({
    position=new THREE.Vector3(0,5,0),
    velocity=new THREE.Vector3(0,0,0),
    rotation=new THREE.Quaternion(),
    scale=CAT_SCALE,
    mass=CAT_MASS,
    isTemporary=false,
    catParameters=this.makeNoise(),
  }={}){

    let {momCatController}=this;

    
    let catUrl=this.getCatUrl(catParameters);
    let texture=new THREE.TextureLoader().load(catUrl);
    
    let material=new THREE.MeshLambertMaterial({
      map:texture,
      flatShading:true,
    });
    
    //let cat=new CatObject({material});
    let cat=new SkinnedCatObject({material});
    
    let {size}=cat;
    
    cat.scale.set(scale,scale,scale)
    size.x*=scale;
    size.y*=scale;
    size.z*=scale;
    
    let transform=new Ammo.btTransform();
    transform.setRotation(convertQuaternionThreeToAmmo(rotation));
    transform.setOrigin(convertVector3ThreeToAmmo(position));
    let shape=new Ammo.btBoxShape(convertVector3ThreeToAmmo(size.clone().multiplyScalar(0.5)));
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
    body.setLinearVelocity(convertVector3ThreeToAmmo(velocity));
    let {scene}=this.three;
    let {physicsWorld}=this.ammo;
    
    let catController=new CatController({world:physicsWorld,body:body,scene:scene,object3d:cat});
    if(!isTemporary){
      this.controllerManager.register(catController);
      this.catControllers.push(catController);
    }
    
    {
      
      let offsetY=0.05*0.5*scale;
      let catSensorController=this.makeBox({
        position:position.clone().add({x:0,y:size.y*-0.5-offsetY,z:0}),
        size:new THREE.Vector3(0.05,0.05,0.05).multiplyScalar(scale),
        mass:mass*0.001,
        isSensor:true,
        ControllerClass:CatSensorController,
        isTemporary:true,//register later
      });
      var frameInA=new Ammo.btTransform();
      frameInA.setIdentity();
      frameInA.setOrigin(new Ammo.btVector3(0,size.y*-0.5,0));
      var frameInB=new Ammo.btTransform();
      frameInB.setIdentity();
      frameInB.setOrigin(new Ammo.btVector3(0,offsetY,0));
      
      //CF_NO_CONTACT_RESPONSE = 4
      catSensorController.body.setCollisionFlags(catSensorController.body.getCollisionFlags()|4);
      let anchor=new Ammo.btFixedConstraint(body,catSensorController.body,frameInA,frameInB);
      
      //assign
      catController.assign({catSensorController,momCatController,catParameters});
      catSensorController.assign({catController,anchor});
      
      if(!isTemporary){
        this.controllerManager.register(catSensorController);
      }
    }
    
    
    return catController;
  }
  spawnFromMom(){
    let {momCatController}=this;
    if(!momCatController){
      return null;
    }
    let catParameters=momCatController.catParameters;
    let rotate180=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),degToRad(180));
    let catController=this.spawn({
      position:momCatController.getSpawnPoint(),
      rotation:momCatController.getRotation().clone().multiply(rotate180),
      catParameters:this.makeVariation(catParameters),
    });
    return catController;
  }
  cleanCats(){
    for(let catController of this.catControllers){
      let {catSensorController}=catController;
      this.controllerManager.unregister(catController);
      catController.destroy();
      this.controllerManager.unregister(catSensorController);
      catSensorController.destroy();
    }
    this.catControllers=[];
    let {momCatController}=this;
    if(!!momCatController){
      let {catSensorController}=momCatController;
      this.controllerManager.unregister(momCatController);
      momCatController.destroy();
      this.controllerManager.unregister(catSensorController);
      catSensorController.destroy();
      this.momCatController=null;
    }
  }
  cleanMetalBoxes(){
    for(let metalBoxController of this.metalBoxControllers){
      this.controllerManager.unregister(metalBoxController);
      metalBoxController.destroy();
    }
    this.metalBoxControllers=[];
  }
  makeBox({
    position=new THREE.Vector3(),
    quaternion=new THREE.Quaternion(),
    size=new THREE.Vector3(1,1,1),
    mass=0,
    material=new THREE.MeshBasicMaterial({flatShading:true}),
    isSensor=false,
    ControllerClass=EmptyController,
    isTemporary=false,
  }={}){
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
      let transform=new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(convertVector3ThreeToAmmo(position));
      transform.setRotation(convertQuaternionThreeToAmmo(quaternion));
      
      let shape=new Ammo.btBoxShape(convertVector3ThreeToAmmo(size.clone().multiplyScalar(0.5)));
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
    if(!isTemporary){
      this.controllerManager.register(controller);
    }
    return controller;
    
  }
  makeMetalBox(position=new THREE.Vector3(0,0,0)){
    let {metalMaterial}=this.three;
    let box=this.makeBox({
      position:position,
      size:BOX_SIZE,
      mass:0,
      material:metalMaterial,
      ControllerClass:MetalBoxController,
    });
    this.metalBoxControllers.push(box);
    
  }
  generateMaze(){
    this.cleanMetalBoxes();
    //棒倒し法の簡易版。多分大丈夫。
    for(let iz=0;iz<MAZE_PILLAR_QTY;++iz){
      let bz=((MAZE_PILLAR_QTY-1)*-0.5*MAZE_WALL_QTY-1+iz*(MAZE_WALL_QTY+1));
      for(let ix=0;ix<MAZE_PILLAR_QTY;++ix){
        let bx=((MAZE_PILLAR_QTY-1)*-0.5*MAZE_WALL_QTY-1+ix*(MAZE_WALL_QTY+1));
        let pillarPosition=new THREE.Vector3(bx*BOX_SIZE.x,BOX_SIZE.y*0.5,bz*BOX_SIZE.z);
        let deg=90*Math.floor(Math.random()*4);
        let wallVector=new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),degToRad(deg)).multiply(BOX_SIZE);
        for(let iw=0;iw<=MAZE_WALL_QTY;++iw){
          this.makeMetalBox(pillarPosition.clone().add(wallVector.clone().multiplyScalar(iw)));
        }
      }
    }
  }
  setupScene(){
    let {controllerManager}=this;
    let {physicsWorld}=this.ammo;
    let ground=null;
    {
      const GROUND_HEIGHT=2;
      ground=this.makeBox({
        position:new THREE.Vector3(0,GROUND_HEIGHT*-0.5,0),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(ROOM_SIZE.x,GROUND_HEIGHT,ROOM_SIZE.z),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
        ControllerClass:GroundController,
      });
      
    }
    {
      const WALL_DEPTH=2;
      let eastWall=this.makeBox({
        position:new THREE.Vector3((ROOM_SIZE.x+WALL_DEPTH)*0.5,ROOM_SIZE.y*0.5,0),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(WALL_DEPTH,ROOM_SIZE.y+WALL_DEPTH*2,ROOM_SIZE.z+WALL_DEPTH*2),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
        ControllerClass:GroundController,
      });
      let westWall=this.makeBox({
        position:new THREE.Vector3((ROOM_SIZE.x+WALL_DEPTH)*-0.5,ROOM_SIZE.y*0.5,0),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(WALL_DEPTH,ROOM_SIZE.y+WALL_DEPTH*2,ROOM_SIZE.z+WALL_DEPTH*2),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
        ControllerClass:GroundController,
      });
      let southWall=this.makeBox({
        position:new THREE.Vector3(0,ROOM_SIZE.y*0.5,(ROOM_SIZE.z+WALL_DEPTH)*0.5),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(ROOM_SIZE.x+WALL_DEPTH*2,ROOM_SIZE.y+WALL_DEPTH*2,WALL_DEPTH),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
        ControllerClass:GroundController,
      });
      let northWall=this.makeBox({
        position:new THREE.Vector3(0,ROOM_SIZE.y*0.5,(ROOM_SIZE.z+WALL_DEPTH)*-0.5),
        quaternion:new THREE.Quaternion(),
        size:new THREE.Vector3(ROOM_SIZE.x+WALL_DEPTH*2,ROOM_SIZE.y+WALL_DEPTH*2,WALL_DEPTH),
        mass:0,
        material:new THREE.MeshLambertMaterial({
          flatShading:true,
        }),
        ControllerClass:GroundController,
      });
    }
    {
      let goal=this.makeBox({
        position:GOAL_BOX_POSITION,
        quaternion:new THREE.Quaternion(),
        size:GOAL_BOX_SIZE,
        mass:0,
        material:new THREE.MeshLambertMaterial({
          color:0xff0000,
          flatShading:true,
        }),
        ControllerClass:GoalController,
      });
    }
    {
      let {scene}=this.three;
      let floorObject=new FloorObject();
      scene.add(floorObject);
    }
    {
      let {scene}=this.three;
      let wallObject=new WallObject();
      scene.add(wallObject);
    }
    {
      let {scene}=this.three;
      let goalObject=new GoalObject();
      let center=new THREE.Vector3();
      goalObject.position.set(GOAL_BOX_POSITION.x,0,GOAL_BOX_POSITION.z);
      scene.add(goalObject);
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
      this.setNextGameState(new GameStateStart(this));
    }
    if(e.key.toUpperCase()=="Z"){
      document.exitPointerLock();
    }
  }
  onMousemove(e){
    let {originalEvent}=e;
    if(!!this.gameState){
      this.gameState.onMousemove(originalEvent);
    }

  }
  onMousedown(e){
    let {originalEvent}=e;
    const LEFT_BIT=1<<0;
    const RIGHT_BIT=1<<1;
    if(originalEvent.buttons==LEFT_BIT+RIGHT_BIT){
      this.setNextGameState(new GameStateStart(this));
    }
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
    let {momCatController}=this;
    let {renderer,scene,camera,controls}=this.three;
    let {physicsWorld,dispatcher}=this.ammo;
    
    if(!!this.gameState){
      this.gameState.onUpdate();
    }
    
    
    this.controllerManager.updateContact();
    this.controllerManager.update();
    physicsWorld.stepSimulation( 1/FPS, 10 );
    TWEEN.update();
    controls.update();
    renderer.render( scene, camera );
    if(IS_DEBUG){
      let text="draw calls: "+renderer.info.render.calls;
      //console.log(text);
      $("#DebugText").text(text);
    }
    renderer.info.reset();
  }
  makeNoise(){
    let noise=[];
    //let myRandom=()=>(Math.random() + Math.random())/2;
    let myRandom=()=>Math.random();
    for(let i=0;i<CAT_PARAMETERS_QTY;++i){
      let n=myRandom();
      noise.push(n);
    }
    return noise;
  }
  makeVariation(parameters){
    let newParameters=parameters.map((n)=>{
      let variation=(Math.random()-0.5)*CAT_PARAMETER_VARIATION_RANGE*2;
      return clamp(n+variation,0,1);
    })
    return newParameters;
  }
  toHexString(valueArray){
    let hexString=valueArray.reduce((hexString,n)=>{
      let eightBits=clamp(n*256,0,255);
      hexString+=((eightBits&0xf0)>>4).toString(16);
      hexString+=(eightBits&0x0f).toString(16);
      return hexString;
    },"");
    return hexString;
    
  }
  getCatUrl(catParameters){
    let catParametersString=this.toHexString(catParameters);
    
    let url='/cat/'+catParametersString;
    return url;
  }
  displayCatIcon($dom,catParameters){
    let catUrl=this.getCatUrl(catParameters);
    $dom.css({
      "backgroundImage":"url('"+catUrl+"')",
    });
  }
  setNextGameState(nextGameState){
    if(!!this.gameState){
      this.gameState.onEnd();
    }
    this.gameState=nextGameState;
    if(!!this.gameState){
      this.gameState.onBegin();
    }
  }
  static load(){
    let promises=[];
    promises.push(new Promise((resolve,reject)=>{
      Ammo().then(()=>resolve());
    }));
    return Promise.all(promises);
  }
}



