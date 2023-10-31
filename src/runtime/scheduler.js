// Process Scheduler (Round robin scheduling algorithm)
//  https://en.wikipedia.org/wiki/Round-robin_scheduling

// Actor model
// https://en.wikipedia.org/wiki/Actor_model
const { Process } = require('./process');

class Scheduler {
  constructor() {
    this.processes = new Set();
    this.runQue = new Array();
    this.mailbox = new Array();
  }

  send(receiver, message) {
    if (!this.processes.has(receiver)) {
      console.log(`${receiver} not found in schedulers process...`);
      return;
    }
    receiver.mailbox.push(message);
  }
  async receive(receiver) {
    while (true) {
      if (!this.processes.has(receiver)) {
        break;
      }
      if (receiver.mailbox.length > 0) {
        return receiver.mailbox.shift();
      }
      await this.sleep(20);
    }

    console.log(`${receiver} stopped receiving messages.`);
  }
  spawn(handlerFunction, ...args) {
    const process = new Process(handlerFunction, args);
    this.processes.add(process);
    console.log(`* Spawning a new process ${process}`);
    this.schedule(process);
    return process;
  }

  schedule(process) {
    this.runQue.push(process);
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async handleProcess(process) {
    try {
      for await (let iterator of process.handler) {
      }
    } catch (error) {
      console.log(`* Process ${process} threw an exception "${error}, terminating.`);
    }

    this.terminate(process);
  }

  terminate(process) {
    console.log(`* Process ${process} is terminated.`);
    this.processes.delete(process);
  }
  // main run loop
  async run() {
    while (true) {
      if (this.runQue.length > 0) {
        Promise.all(this.runQue.map((process) => this.handleProcess(process)));
        // Flush the queue
        this.runQue.length = 0;
      }

      await this.sleep(100);
    }
  }

  start() {
    setTimeout(() => this.run(), 0);
  }
}

module.exports = { Scheduler };
