const { print } = require('../src/runtime');

function spawn(fn, ...args) {
  const gen = fn(...args);
  schedule(gen);
}
function handle(id) {
  print(id, 1);
  print(id, 2);
}
async function handleProcess(sc) {
  for await (let _ of sc) {
  }
}
const schedule_gen = [];
function schedule(gen) {
  schedule_gen.push(gen);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function schedulerLoop() {
  Promise.all(schedule_gen.map((sc) => handleProcess(sc)));
  return schedule_gen.length === 0;
}
async function* _handle(id, ms = 100) {
  print(id, 1);
  yield await sleep(ms);
  print(id, 2);
}

// const xgen = _handle('x');
// const ygen = _handle('y');
// 1nd interaction
// xgen.next();
// ygen.next();
// // 2nd interaction
// xgen.next();
// ygen.next();
spawn(_handle, 'x');
spawn(_handle, 'y');
//  algorithm: https://en.wikipedia.org/wiki/Round-robin_scheduling
schedulerLoop(); // paralelism
