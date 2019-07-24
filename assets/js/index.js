
import App from "./App.js";

$(function(){
  App.load().then(function(){
    window.app=new App();
  });
});