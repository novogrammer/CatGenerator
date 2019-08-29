import {
  IS_DEBUG,
} from "../constants.js";

import GameStateBase from "./GameStateBase.js";
import GameStateStart from "./GameStateStart.js";
export default class GameStateGoal extends GameStateBase{
  constructor(context){
    super(context);
  }
  onBegin(){
    if(IS_DEBUG){
      console.log("GameStateGoal onBegin()");
    }
    super.onBegin();
    let {context}=this;
    $("#Goal").show();
    setTimeout(()=>{
      $("#Goal").fadeOut(1000,()=>{
        context.setNextGameState(new GameStateStart(context));
      });
    },1000*3);
  }
  onEnd(){
    if(IS_DEBUG){
      console.log("GameStateGoal onEnd()");
    }
    super.onEnd();
  }
}
