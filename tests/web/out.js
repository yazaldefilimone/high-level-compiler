
// prologue
const  {print, spawn, send, receive, sleep, scheduler, NextMath } =  require('../src/runtime');

async function* _handlerProcess(el) {
  while((getWidth(el) < RACE_LENGTH)) {
    let request = await receive(this);
    try {
      let { sender: sender, delay: delay, delta: delta } = request;
      incWidth(el, delta);
      let receiver = getRandomProcess();
      send(receiver, { sender: this, delay: random(50, 200), delta: random(5, 50) });
      await sleep(delay);
    } catch (e) {
      if((e !== NextMath)) throw e 
    }
  } 
}

    