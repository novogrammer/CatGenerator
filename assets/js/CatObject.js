import {
  IS_DEBUG,
} from "./constants.js";

import {
  map
} from "./math_utils.js";


import * as THREE from "./three/build/three.module.js";

export default class CatObject extends THREE.Object3D{
  constructor({material}){
    super();
    this.size=new THREE.Vector3();
    this.setup(material);
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
  setup(material){
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
    
    {
      let bodyMesh=(()=>{
        let geometry=new THREE.BoxGeometry(1,1,1);
        this.remapCubeGeometryUv({geometry});
        this.remapCubeGeometryVertex({geometry,bounds:makeBoundsXYZ(-0.15,-0.075,-0.15,0.15,0.075,0.15)});
        return new THREE.Mesh(geometry,material);
      })();
      this.add(bodyMesh);
      
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
    
    
    {
      let aabb=new THREE.Box3();
      aabb.setFromObject(this);
      let center=new THREE.Vector3();
      aabb.getCenter(center);
      for(let child of this.children){
        child.position.sub(center);
      }
      aabb.getSize(this.size);
    }
    
    
  }
}
