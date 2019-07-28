import {
  FPS,
  IS_DEBUG,
  GRAVITY_CONSTANT,
} from "./constants.js";

import {
  map
} from "./math_utils.js";

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
    controls.target.set(0,1,0);
    camera.position.set(0,1,2);
    
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
      let halfSize=new Ammo.btVector3(5,1,5);
      let form=new Ammo.btTransform();
      form.setIdentity();
      form.setOrigin(pos);
      let ground=new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
        0,
        new Ammo.btDefaultMotionState(form),
        new Ammo.btBoxShape(halfSize),
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
    
    $(window).on("keydown.app",this.onKeydown.bind(this));
  }
  remapCubeGeometryUv({geometry,hasFace=false,bounds={min:{x:0,y:0},max:{x:1,y:1}}}){
    const INDEX_PX=0*2;
    const INDEX_NX=1*2;
    const INDEX_PY=2*2;
    const INDEX_NY=3*2;
    const INDEX_PZ=4*2;
    const INDEX_NZ=5*2;
    //px up down
    //nx up down
    //py up down
    //ny up down
    //pz up down
    //nz up down
    //02
    //1
    // 2
    //01
    let v=(x,y)=>({x:map(x,0,1,bounds.min.x,bounds.max.x),y:map(y,0,1,bounds.min.y,bounds.max.y)});
    
    geometry.faceVertexUvs[0][INDEX_PX+0][0].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_PX+0][1].copy(v(1,0));
    geometry.faceVertexUvs[0][INDEX_PX+0][2].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_PX+1][0].copy(v(1,0));
    geometry.faceVertexUvs[0][INDEX_PX+1][1].copy(v(1,0));
    geometry.faceVertexUvs[0][INDEX_PX+1][2].copy(v(1,1));

    geometry.faceVertexUvs[0][INDEX_NX+0][0].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_NX+0][1].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NX+0][2].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_NX+1][0].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NX+1][1].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NX+1][2].copy(v(0,1));
    
    geometry.faceVertexUvs[0][INDEX_PY+0][0].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_PY+0][1].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_PY+0][2].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_PY+1][0].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_PY+1][1].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_PY+1][2].copy(v(1,1));

    geometry.faceVertexUvs[0][INDEX_NY+0][0].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NY+0][1].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NY+0][2].copy(v(1,0));
    geometry.faceVertexUvs[0][INDEX_NY+1][0].copy(v(0,0));
    geometry.faceVertexUvs[0][INDEX_NY+1][1].copy(v(1,0));
    geometry.faceVertexUvs[0][INDEX_NY+1][2].copy(v(1,0));
    
    if(hasFace){
      geometry.faceVertexUvs[0][INDEX_PZ+0][0].copy(v(0,1));
      geometry.faceVertexUvs[0][INDEX_PZ+0][1].copy(v(0,0));
      geometry.faceVertexUvs[0][INDEX_PZ+0][2].copy(v(1,1));
      geometry.faceVertexUvs[0][INDEX_PZ+1][0].copy(v(0,0));
      geometry.faceVertexUvs[0][INDEX_PZ+1][1].copy(v(1,0));
      geometry.faceVertexUvs[0][INDEX_PZ+1][2].copy(v(1,1));
    }else{
      geometry.faceVertexUvs[0][INDEX_PZ+0][0].copy(v(0,1));
      geometry.faceVertexUvs[0][INDEX_PZ+0][1].copy(v(0,1));
      geometry.faceVertexUvs[0][INDEX_PZ+0][2].copy(v(1,1));
      geometry.faceVertexUvs[0][INDEX_PZ+1][0].copy(v(0,1));
      geometry.faceVertexUvs[0][INDEX_PZ+1][1].copy(v(1,1));
      geometry.faceVertexUvs[0][INDEX_PZ+1][2].copy(v(1,1));
    }
    
    geometry.faceVertexUvs[0][INDEX_NZ+0][0].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_NZ+0][1].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_NZ+0][2].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_NZ+1][0].copy(v(1,1));
    geometry.faceVertexUvs[0][INDEX_NZ+1][1].copy(v(0,1));
    geometry.faceVertexUvs[0][INDEX_NZ+1][2].copy(v(0,1));
    
    geometry.uvsNeedUpdate=true;
    
  }
  remapCubeGeometryVertex({geometry,bounds={min:{x:-0.5,y:-0.5,z:-0.5},max:{x:0.5,y:0.5,z:0.5}}}){
    const unitLength=new THREE.Vector3(1,1,1).length();
    for(let i=0;i<geometry.vertices.length;++i){
      let vertex=geometry.vertices[i];
      vertex.setLength(unitLength);
      vertex.x=map(vertex.x,-1,+1,bounds.min.x,bounds.max.x);
      vertex.y=map(vertex.y,-1,+1,bounds.min.y,bounds.max.y);
      vertex.z=map(vertex.z,-1,+1,bounds.min.z,bounds.max.z);
    }
    geometry.verticesNeedUpdate=true;
    
  }
  spawn(){
    let noise=this.makeNoise();
    let texture=new THREE.TextureLoader().load('/cat/'+noise);
    
    let object3d=new THREE.Object3D();
    
    let makeBoundsXY=(minX,minY,maxX,maxY)=>{
      return {
        min:{
          x:minX,
          y:minY,
        },
        max:{
          x:maxX,
          y:maxY,
        },
      };
    };
    let makeBoundsXYZ=(minX,minY,minZ,maxX,maxY,maxZ)=>{
      return {
        min:{
          x:minX,
          y:minY,
          z:minZ,
        },
        max:{
          x:maxX,
          y:maxY,
          z:maxZ,
        },
      };
    };
    let material=new THREE.MeshBasicMaterial({map:texture} );

    {
      let bodyMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.15,-0.075,-0.15,0.15,0.075,0.15)});
        return new THREE.Mesh(geometry,material);
      })();
      object3d.add(bodyMesh);
      
      let faceMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.15,-0.15+0.1,0,0.15,0.15+0.1,0.3)});
        return new THREE.Mesh(geometry,material);
      })();
      faceMesh.position.set(0,0,0.15);
      bodyMesh.add(faceMesh);
      setInterval(()=>{
        faceMesh.rotation.x=Math.sin(performance.now()*0.01)*0.2;
      },100);
      
      let leftEarMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true,bounds:makeBoundsXY(0.5,0.75,1,1)});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.075+0.01,-0,-0.04,0.075,0.1,0.04)});
        return new THREE.Mesh(geometry,material);
      })();
      leftEarMesh.position.set((0.15-0.075)*1,0.25,0.1);
      faceMesh.add(leftEarMesh);
      setInterval(()=>{
        leftEarMesh.rotation.y=Math.sin(performance.now()*0.01)*0.2;
      },100);
      
      let rightEarMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true,bounds:makeBoundsXY(0,0.75,0.5,1)});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.075,-0,-0.04,0.075-0.01,0.1,0.04)});
        return new THREE.Mesh(geometry,material);
      })();
      rightEarMesh.position.set((0.15-0.075)*-1,0.25,0.1);
      faceMesh.add(rightEarMesh);
      setInterval(()=>{
        rightEarMesh.rotation.y=Math.sin(performance.now()*0.01)*0.2;
      },100);
      
      let tailMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.05,-0.05,-0.2,0.05,0.05,0)});
        return new THREE.Mesh(geometry,material);
      })();
      tailMesh.position.set(0,0.075-0.05,-0.15);
      bodyMesh.add(tailMesh);
      setInterval(()=>{
        tailMesh.rotation.y=Math.sin(performance.now()*0.01)*0.2;
      },100);
      
      for(let iz=0;iz<2;++iz){
        let z=map(iz,0,1,-0.1,0.1);
        for(let ix=0;ix<2;++ix){
          let x=map(ix,0,1,-0.1,0.1);
          let legMesh=(()=>{
            let geometry=new THREE.BoxGeometry(1,1,1);
            this.remapCubeGeometryUv({geometry});
            this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.05,-0.2,-0.05,0.05,0,0.05)});
            return new THREE.Mesh(geometry,material);
          })();
          legMesh.position.set(x,-0.075,z);
          bodyMesh.add(legMesh);
          let b=(iz+ix)%2;
          setInterval(()=>{
            legMesh.rotation.x=Math.sin(performance.now()*0.01)*0.2*(b?1:-1);
          },100);
        }
      }
      
      
      
      
    }
    
    
    let size=new THREE.Vector3();
    {
      let aabb=new THREE.Box3();
      aabb.setFromObject(object3d);
      let center=new THREE.Vector3();
      aabb.getCenter(center);
      for(let child of object3d.children){
        child.position.sub(center);
      }
      aabb.getSize(size);
    }
    
    
    let pos=new Ammo.btVector3(Math.random()*10-5,5,0);
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
    
    let updater=new AmmoToThreeUpdater({world:physicsWorld,body:body,scene:scene,object3d:object3d});
    this.updaters.push(updater);
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
      for(let updater of this.updaters){
        updater.destroy();
      }
      this.updaters=[];
    }
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



