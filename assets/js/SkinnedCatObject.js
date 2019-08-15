import {
  IS_DEBUG,
  FPS,
  CAT_OBJECT_AABB,
} from "./constants.js";

import {
  map
} from "./math_utils.js";


import * as THREE from "./three/build/three.module.js";

import { BufferGeometryUtils } from './three/examples/jsm/utils/BufferGeometryUtils.js';
import { SkeletonUtils } from './three/examples/jsm/utils/SkeletonUtils.js';

let skinnedMeshCache=null;

export default class SkinnedCatObject extends THREE.Object3D{
  constructor({material}){
    super();
    this.currentTime=0;
    this.size=new THREE.Vector3();
    this.setupObject(material);
    this.setupEvent();
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
  setupObject(material){
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
    
    if(!skinnedMeshCache){
      let temporaryObject3d=new THREE.Object3D();
      let bones=[];
      let rootBone=new THREE.Bone();
      bones.push(rootBone);
      
      let bodyMesh=null;
      let faceMesh=null;
      
      let bodyBone=null;
      let faceBone=null;
      const FACE_SIZE=0.3;
      const EAR_SIZE=FACE_SIZE/3;
      {
        const name="body";
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(FACE_SIZE*-0.5,-0.075,-0.15,FACE_SIZE*0.5,0.075,0.15)});
        geometry=new THREE.BufferGeometry().fromGeometry(geometry);
        
        let mesh=new THREE.Mesh(geometry,material);
        mesh.name=name;
        temporaryObject3d.add(mesh);
        
        let bone=new THREE.Bone();
        bone.name=name;
        bone.position.copy(mesh.position);
        rootBone.add(bone);
        bones.push(bone);
        
        bodyMesh=mesh;
        bodyBone=bone;
      }
      {
        const name="face";
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(FACE_SIZE*-0.5,FACE_SIZE*-0.5+0.1,FACE_SIZE*0,FACE_SIZE*0.5,FACE_SIZE*0.5+0.1,FACE_SIZE*1)});
        geometry=new THREE.BufferGeometry().fromGeometry(geometry);
        
        let mesh=new THREE.Mesh(geometry,material);
        mesh.name=name;
        mesh.position.set(0,0,0.15);
        bodyMesh.add(mesh);
        
        let bone=new THREE.Bone();
        bone.name=name;
        bone.position.copy(mesh.position);
        bodyBone.add(bone);
        bones.push(bone);
        
        faceMesh=mesh;
        faceBone=bone;
      }
      {
        const name="leftEar";
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true,bounds:makeBoundsXY(2/3,2/3,3/3,3/3)});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(EAR_SIZE*-0.5,0,-0.04,EAR_SIZE*0.5,EAR_SIZE,0.04)});
        geometry=new THREE.BufferGeometry().fromGeometry(geometry);
        
        let mesh=new THREE.Mesh(geometry,material);
        mesh.name=name;
        mesh.position.set(EAR_SIZE*1,0.25,0.1);
        faceMesh.add(mesh);
        
        let bone=new THREE.Bone();
        bone.name=name;
        bone.position.copy(mesh.position);
        faceBone.add(bone);
        bones.push(bone);
      }
      
      {
        const name="rightEar";
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry,hasFace:true,bounds:makeBoundsXY(0/3,2/3,1/3,3/3)});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(EAR_SIZE*-0.5,0,-0.04,EAR_SIZE*0.5,EAR_SIZE,0.04)});
        geometry=new THREE.BufferGeometry().fromGeometry(geometry);
        
        let mesh=new THREE.Mesh(geometry,material);
        mesh.name=name;
        mesh.position.set(EAR_SIZE*-1,0.25,0.1);
        faceMesh.add(mesh);
        
        let bone=new THREE.Bone();
        bone.name=name;
        bone.position.copy(mesh.position);
        faceBone.add(bone);
        bones.push(bone);
      }
      
      {
        const name="tail";
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.05,-0.05,-0.2,0.05,0.05,0)});
        geometry=new THREE.BufferGeometry().fromGeometry(geometry);
        
        let mesh=new THREE.Mesh(geometry,material);
        mesh.name=name;
        mesh.position.set(0,0.075-0.05,-0.15);
        bodyMesh.add(mesh);
        
        let bone=new THREE.Bone();
        bone.name=name;
        bone.position.copy(mesh.position);
        bodyBone.add(bone);
        bones.push(bone);
      }
      
      
      for(let iz=0;iz<2;++iz){
        let z=map(iz,0,1,-0.1,0.1);
        for(let ix=0;ix<2;++ix){
          let x=map(ix,0,1,-0.1,0.1);
          
          const name="leg["+iz+","+ix+"]";
          let geometry=new THREE.BoxGeometry(1,1,1);
          this.remapCubeGeometryUv({geometry});
          this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.05,-0.2,-0.05,0.05,0,0.05)});
          geometry=new THREE.BufferGeometry().fromGeometry(geometry);
          
          let mesh=new THREE.Mesh(geometry,material);
          mesh.name=name;
          mesh.position.set(x,-0.075,z);
          bodyMesh.add(mesh);
          
          let bone=new THREE.Bone();
          bone.name=name;
          bone.position.copy(mesh.position);
          bodyBone.add(bone);
          bones.push(bone);

        }
      }
      
      let geometries=[];
      temporaryObject3d.traverse((target)=>{
        if(!!target.geometry){
          let geometry=target.geometry.clone();
          //target.updateMatrixWorld(true);
          //let matrix=target.matrixWorld;
          //geometry.applyMatrix(matrix);
          geometries.push(geometry);
        }
      });
      let geometry=BufferGeometryUtils.mergeBufferGeometries(geometries,true);
      
      var skinIndices = [];
      var skinWeights = [];
      for(let i=0;i<geometry.attributes.position.count;++i){
        let skinIndex=0;
        for(let j=0;j<geometry.groups.length;++j){
          let group=geometry.groups[j];
          if(group.start<=i && i<group.start+group.count){
            skinIndex=j+1;
          }
        }
        
        skinIndices.push(skinIndex,0,0,0);
        skinWeights.push(1,0,0,0);
      }

      geometry.addAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
      geometry.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );
      
      let skeleton=new THREE.Skeleton(bones);
      
      
      let skinnedMesh=new THREE.SkinnedMesh(geometry,material);
      skinnedMesh.castShadow=true;
      skinnedMesh.receiveShadow=true;
      //skinnedMesh.matrixAutoUpdate=false;
      
      
      skinnedMesh.bind(skeleton);
      skinnedMesh.add(skeleton.bones[0]);
      
      skinnedMeshCache=skinnedMesh;
      
    }
    {
      let skinnedMesh=SkeletonUtils.clone(skinnedMeshCache);
      material.skinning=true;
      skinnedMesh.material=material;
      this.add(skinnedMesh);
      this.skinnedMesh=skinnedMesh;
      
    }
    
    
    {
      let aabb=CAT_OBJECT_AABB;
      let center=new THREE.Vector3();
      aabb.getCenter(center);
      for(let child of this.children){
        child.position.sub(center);
      }
      aabb.getSize(this.size);
    }
    
  }
  setupEvent(){
    this.addEventListener("updateanimation",this.onUpdateAnimation.bind(this));
  }
  onUpdateAnimation(event){
    let previousTime=this.currentTime;
    let dt=1/FPS;
    this.currentTime+=dt;
    let t=this.currentTime;
    let findAndCallback=(name,cb)=>{
      let skeleton=this.skinnedMesh.skeleton;
      if(!skeleton){
        return;
      }
      let obj=skeleton.getBoneByName(name);
      if(!!obj){
        cb.call(this,obj);
      }
    }
    findAndCallback("face",(bone)=>{
      bone.rotation.x=Math.sin(t*10)*0.2;
    });
    findAndCallback("leftEar",(bone)=>{
      bone.rotation.y=Math.sin(t*10)*0.2;
    });
    findAndCallback("rightEar",(bone)=>{
      bone.rotation.y=Math.sin(t*10)*0.2;
    });
    findAndCallback("tail",(bone)=>{
      bone.rotation.y=Math.sin(t*10)*0.2;
    });
    findAndCallback("leg[0,0]",(bone)=>{
      bone.rotation.x=Math.sin(t*10)*0.2*1;
    });
    findAndCallback("leg[0,1]",(bone)=>{
      bone.rotation.x=Math.sin(t*10)*0.2*-1;
    });
    findAndCallback("leg[1,0]",(bone)=>{
      bone.rotation.x=Math.sin(t*10)*0.2*-1;
    });
    findAndCallback("leg[1,1]",(bone)=>{
      bone.rotation.x=Math.sin(t*10)*0.2*1;
    });
    /*
    this.traverse((target)=>{
      target.updateMatrix();
    });
    */

    //console.log(event);
  }
}
