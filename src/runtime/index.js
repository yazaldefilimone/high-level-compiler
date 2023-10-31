const { Scheduler } = require('./scheduler');

const scheduler = new Scheduler();

scheduler.start();

function print(...args) {
  console.log(...args);
}

function spawn(internalFunction, ...args) {
  return scheduler.spawn(internalFunction, args);
}

async function sleep(ms = 20) {
  return await scheduler.sleep(ms);
}

function send(receiver, message) {
  return scheduler.send(receiver, message);
}

async function receive(receiver) {
  return await scheduler.receive(receiver);
}

const NextMath = {};
module.exports = { print, spawn, send, receive, sleep, scheduler, NextMath };
