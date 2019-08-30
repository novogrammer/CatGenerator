import {
  IS_DEBUG,
  START_POSITION,
  START_ROTATION,
  BOX_SIZE,
} from "../constants.js";
import {
  degToRad,
  random,
} from "../math_utils.js";


import GameStateBase from "./GameStateBase.js";
import GameStateExecuting from "./GameStateExecuting.js";
import * as THREE from "../three/build/three.module.js";

export default class GameStateStart extends GameStateBase{
  constructor(context){
    super(context);
  }
  onBegin(){
    if(IS_DEBUG){
      console.log("GameStateStart onBegin()");
    }
    super.onBegin();
    $("#Start").show();
    
    let {context}=this;
    
    context.cleanMetalBoxes();
    for(let i=0;i<10;++i){
      context.makeMetalBox(new THREE.Vector3(random(-4,4),BOX_SIZE.y*0.5,random(-4,4)));
      
    }
    
    let catController=context.spawn({
      position:START_POSITION,
      rotation:START_ROTATION,
    });
    catController.update();//apply transform
    let momCatController=context.grow({cat:catController});
    
    context.displayCatIcon($("#MomCat"),catController.catParameters);
    $("#Cats").empty();
    
    setTimeout(()=>{
      context.setNextGameState(new GameStateExecuting(context));
    },1000);
  }
  onEnd(){
    if(IS_DEBUG){
      console.log("GameStateStart onEnd()");
    }
    super.onEnd();
    $("#Start").fadeOut();
  }
}
