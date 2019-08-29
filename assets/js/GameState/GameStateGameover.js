import {
  IS_DEBUG,
} from "../constants.js";

import GameStateBase from "./GameStateBase.js";
import GameStateStart from "./GameStateStart.js";
export default class GameStateGameover extends GameStateBase{
  constructor(context){
    super(context);
  }
  onBegin(){
    if(IS_DEBUG){
      console.log("GameStateGameover onBegin()");
    }
    super.onBegin();
    let {context}=this;
    $("#Gameover").fadeIn(1000);
    setTimeout(()=>{
      $("#Gameover").fadeOut(1000,()=>{
        context.setNextGameState(new GameStateStart(context));
      });
    },1000*3);


  }
  onEnd(){
    if(IS_DEBUG){
      console.log("GameStateGameover onEnd()");
    }
    super.onEnd();
  }
}
