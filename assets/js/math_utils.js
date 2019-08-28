export function degToRad(deg){
  return deg/180*Math.PI;
}
export function radToDeg(rad){
  return rad*180/Math.PI;
}
export function random(min=null,max=null){
  if(min==null&&max&&null){
    return random(0,1);
  }
  if(max==null){
    return random(0,min);
  }
  return Math.random()*(max-min)+min;
}
export function map(inputValue,inputMin,inputMax,outputMin,outputMax,clamp=false){
  let outputValue=((inputValue-inputMin)/(inputMax-inputMin)*(outputMax-outputMin)+outputMin);
  if(clamp){
    if(outputMin<outputMax){
      outputValue=Math.min(outputValue,outputMax);
      outputValue=Math.max(outputValue,outputMin);
    }else{
      outputValue=Math.max(outputValue,outputMax);
      outputValue=Math.min(outputValue,outputMin);
    }
  }
  return outputValue;
}

export function coverRectRatio(rectOriginal,rectTarget){
  let aspectOriginal=rectOriginal.height/rectOriginal.width;
  let aspectTarget=rectTarget.height/rectTarget.width;
  let targetRatio=(aspectTarget<aspectOriginal)?(rectTarget.width/rectOriginal.width):(rectTarget.height/rectOriginal.height);
  return targetRatio;
}
export function coverRect(rectOriginal,rectTarget){
  let targetRatio=coverRectRatio(rectOriginal,rectTarget);
  let width=rectOriginal.width*targetRatio;
  let height=rectOriginal.height*targetRatio;
  let cx=rectTarget.x+rectTarget.width*0.5;
  let cy=rectTarget.y+rectTarget.height*0.5;
  let rect={
    x:cx-width*0.5,
    y:cy-height*0.5,
    width:width,
    height:height,
  };
  return rect;
}

//from https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Set
export function intersect(lhs,rhs){
  return new Set([...lhs].filter(x=>rhs.has(x)));
}
export function difference(lhs,rhs){
  return new Set([...lhs].filter(x=>!rhs.has(x)));
}