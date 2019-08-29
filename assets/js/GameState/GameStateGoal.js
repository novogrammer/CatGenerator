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
    context.setNextGameState(new GameStateStart(context));
  }
  onEnd(){
    if(IS_DEBUG){
      console.log("GameStateGoal onEnd()");
    }
    super.onEnd();
  }
}
