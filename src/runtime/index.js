const { Scheduler } = require('./scheduler');

const scheduler = new Scheduler();

scheduler.start();

function print(...args) {
  console.log(...args);
}

function spawn(fn, ...args) {
  return scheduler.spawn(fn, args);
}

async function sleep(ms = 100) {
  return await scheduler.sleep(ms);
}
module.exports = { print, spawn, sleep, scheduler };
