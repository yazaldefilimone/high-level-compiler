
// prologue
const  {print, spawn, send, receive, sleep, scheduler, NextMath } =  require('../src/runtime');
let index = 0;
while((index < 10)) {
  print("current index: ", index);
  ++index
} 
    