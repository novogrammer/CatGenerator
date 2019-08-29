import {
  IS_DEBUG,
  FPS,
  CAT_SPAWN_RATE,
  CAT_MAX_QTY,
} from "../constants.js";

import * as THREE from "../three/build/three.module.js";

import GameStateBase from "./GameStateBase.js";
import GameStateGoal from "./GameStateGoal.js";
import GameStateGameover from "./GameStateGameover.js";

export default class GameStateExecuting extends GameStateBase{
  constructor(context){
    super(context);
    this.gameTime=0;
  }
  onBegin(){
    if(IS_DEBUG){
      console.log("GameStateExecuting onBegin()");
    }
    super.onBegin();
  }
  onEnd(){
    if(IS_DEBUG){
      console.log("GameStateExecuting onEnd()");
    }
    super.onEnd();
  }
  onMousemove(e){
    super.onMousemove(e);
    let {context}=this;
    if(!!context.momCatController){
      context.momCatController.onMousemove(e);
    }
  }
  onUpdate(){
    super.onUpdate();
    let {context}=this;
    let {momCatController}=context;

    let dt=1/FPS;
    let previousGameTime=this.gameTime;
    this.gameTime+=dt;

    let previousCatCount=Math.floor(previousGameTime*CAT_SPAWN_RATE);
    let currentCatCount=Math.floor(this.gameTime*CAT_SPAWN_RATE);
    
    if(momCatController.isGoal()){
      context.setNextGameState(new GameStateGoal(context));
    }else{
      if(previousCatCount!=currentCatCount){
        if(CAT_MAX_QTY<currentCatCount){
          context.setNextGameState(new GameStateGameover(context));
          return;
        }else{
          context.spawnFromMom();
        }
      }
    }

  }
}
