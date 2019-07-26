import {
  FPS,
  IS_DEBUG,
  GRAVITY_CONSTANT,
} from "./constants.js";

import * as THREE from "./three/build/three.module.js";
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";

//let THREE=Object.assign(Object.assign({},T),{TeapotBufferGeometry});

import Stats from "./stats/stats.module.js";

import AmmoToThreeUpdater from "./AmmoToThreeUpdater.js";


export default class App{
  constructor(){
    this.updaters=[];
    this.setupThree();
    this.setupAmmo();
    this.setupStats();
    this.setupEvents();
    
    this.spawn();
    setInterval(()=>{
      this.spawn();
    },1000);
  }
  setupThree(){
    let renderer=new THREE.WebGLRenderer({canvas:$("#View")[0]});
    let scene=new THREE.Scene();
    let camera=new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.three={renderer,scene,camera};

    
    
    
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(0,2,0);
    camera.position.set(0,2,5);
    
    this.three.controls=controls;

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
    
    {
      let pos=new Ammo.btVector3(0,-1,0);
      let size=new Ammo.btVector3(5,1,5);
      let form=new Ammo.btTransform();
      form.setIdentity();
      form.setOrigin(pos);
      let ground=new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
        0,
        new Ammo.btDefaultMotionState(form),
        new Ammo.btBoxShape(size),
        new Ammo.btVector3(0,0,0),
      ));
      ground.setRestitution(1);
      ground.setFriction(1);
      physicsWorld.addRigidBody(ground);
    }
    
    
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
    
  }
  spawn(){
    let noise=this.makeNoise();
    var texture = new THREE.TextureLoader().load( '/cat/'+noise );
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //var geometry=new TeapotBufferGeometry(1);
    //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,2,0);
    
    let pos=new Ammo.btVector3(Math.random()*10-5,5,0);
    let size=new Ammo.btVector3(0.5,0.5,0.5);
    let mass=1;
    let transform=new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(pos);
    let shape=new Ammo.btBoxShape(size);
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
    
    let updater=new AmmoToThreeUpdater({world:physicsWorld,body:body,scene:scene,object3d:mesh});
    this.updaters.push(updater);
  }
  onResize(){
    let {renderer,scene,camera}=this.three;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  }
  onTick(){
    let {renderer,scene,camera,mesh,controls}=this.three;
    let {physicsWorld,body}=this.ammo;
    //console.log(performance.now());

    physicsWorld.stepSimulation( 1/FPS, 10 );
    
    for(let updater of this.updaters){
      updater.update();
    }
    let newUpdaters=[];
    for(let updater of this.updaters){
      if(0<updater.object3d.position.y){
        newUpdaters.push(updater);
      }else{
        updater.destroy();
      }
    }
    this.updaters=newUpdaters;
    
    controls.update();
    renderer.render( scene, camera );
  }
  makeNoise(){
    let noise="";
    for(let i=0;i<100;++i){
      let n=Math.floor(Math.random()*256);
      noise+=n.toString(16)
      noise+=n&0x0f;
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



