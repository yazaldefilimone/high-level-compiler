
// prologue
const  {print, spawn, send, receive, sleep, scheduler, NextMath } =  require('../src/runtime');

function success(param) {
  return print("param = ", param);
}


function notFound(url) {
  return print("not-found:", url);
}


async function* _handleConnection(data) {
  let request = await receive(this);
  try {
    if(("hello" !== request)) throw NextMath 
    success(20);
  } catch (e) {
    if((e !== NextMath)) throw e 
    try {
      let { code: _code, len: len } = request;
      if((_code !== 200)) throw NextMath 
      success(len);
      yield*_handleConnection.call(this, data);
    } catch (e) {
      if((e !== NextMath)) throw e 
      try {
        let { code: _code, url: url } = request;
        if((_code !== 204)) throw NextMath 
        notFound(url);
      } catch (e) {
        if((e !== NextMath)) throw e 
        return print(data);
      }
    }
  }
}

let handler = spawn(_handleConnection, "default");
let index = 0;

function sendMessage() {
  index = (index + 1);
  if((index <= 5)) send(handler, { code: 200, len: index }); else send(handler, "hello");
}

setInterval(sendMessage, 100);
    