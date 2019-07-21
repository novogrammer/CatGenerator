
export default class App{
  constructor(){
    
    let noise=this.makeNoise();
    console.log(noise);
    let $img=$("<img>");
    $img.attr("src","/cat/"+noise);
    $("#Main").append($img);
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