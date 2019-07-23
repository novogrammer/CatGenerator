
import * as THREE from "./three/build/three.module.js";
import {TeapotBufferGeometry} from "./three/examples/jsm/geometries/TeapotBufferGeometry.js"

//let THREE=Object.assign(Object.assign({},T),{TeapotBufferGeometry});

import Stats from "./stats/stats.module.js";

const IS_DEBUG=true;

export default class App{
  constructor(){
    this.setupThree();
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
    
    setInterval(()=>{
      let noise=this.makeNoise();
      var texture = new THREE.TextureLoader().load( '/cat/'+noise );
      mesh.material.map=texture;
    },1000)
    
    this.three.mesh=mesh;

    camera.position.set(0,2,5);
    camera.lookAt(new THREE.Vector3(0,0,0));

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
    //console.log(performance.now());

    //mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
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
}