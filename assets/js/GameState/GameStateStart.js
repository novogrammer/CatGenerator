import {
  IS_DEBUG,
} from "../constants.js";

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
    let catController=context.spawn({position:new THREE.Vector3(0,1,0)});
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
