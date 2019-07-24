import {
  FPS,
  IS_DEBUG,
  GRAVITY_CONSTANT,
} from "./constants.js";

import * as THREE from "./three/build/three.module.js";
import {TeapotBufferGeometry} from "./three/examples/jsm/geometries/TeapotBufferGeometry.js"
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";

//let THREE=Object.assign(Object.assign({},T),{TeapotBufferGeometry});

import Stats from "./stats/stats.module.js";

export default class App{
  constructor(){
    this.setupThree();
    this.setupAmmo();
    this.setupStats();
    this.setupEvents();
    /*
    let noise=this.makeNoise();
    console.log(noise);
    let $img=$("<img>");
    $img.attr("src","/cat/"+noise);
    $("#Main").append($img);
    */
  }
  setupThree(){
    let renderer=new THREE.WebGLRenderer({canvas:$("#View")[0]});
    let scene=new THREE.Scene();
    let camera=new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.three={renderer,scene,camera};

    let noise=this.makeNoise();
    var texture = new THREE.TextureLoader().load( '/cat/'+noise );
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //var geometry=new TeapotBufferGeometry(1);
    //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    /*
    setInterval(()=>{
      let noise=this.makeNoise();
      var texture = new THREE.TextureLoader().load( '/cat/'+noise );
      mesh.material.map=texture;
    },1000)
    */
    
    this.three.mesh=mesh;

    camera.position.set(0,2,5);
    camera.lookAt(new THREE.Vector3(0,0,0));

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
    let sphere=null;
    {
      let pos=new Ammo.btVector3(0,15,0);
      let radius=1;
      let mass=1;
      let form=new Ammo.btTransform();
      form.setIdentity();
      form.setOrigin(pos);
      let sphereShape=new Ammo.btSphereShape(radius);
      let localInertia=new Ammo.btVector3(0,0,0);
      sphereShape.calculateLocalInertia(mass,localInertia);
      
      
      sphere=new Ammo.btRigidBody(
        new Ammo.btRigidBodyConstructionInfo(
          mass,
          new Ammo.btDefaultMotionState(form),
          sphereShape,
          localInertia
        )
      );
      physicsWorld.addRigidBody(sphere);
    }
    
    
    this.ammo={physicsWorld,sphere};
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
  onResize(){
    let {renderer,scene,camera}=this.three;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  }
  onTick(){
    let {renderer,scene,camera,mesh}=this.three;
    let {physicsWorld,sphere}=this.ammo;
    //console.log(performance.now());

    //mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    physicsWorld.stepSimulation( 1/FPS, 10 );
    let trans=new Ammo.btTransform();
    sphere.getMotionState().getWorldTransform(trans);
    /*
    console.log("sphere pos = " + 
        [trans.getOrigin().x().toFixed(2), 
         trans.getOrigin().y().toFixed(2), 
         trans.getOrigin().z().toFixed(2)]
    );
    */
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



