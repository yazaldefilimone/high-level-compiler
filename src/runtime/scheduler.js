// Process Scheduler (Round robin scheduling algorithm)
//  https://en.wikipedia.org/wiki/Round-robin_scheduling

const { Process } = require('./process');

class Scheduler {
  constructor() {
    this.processes = new Set();
    this.runQue = new Array();
  }

  spawn(handlerFn, ...args) {
    const process = new Process(handlerFn, args);
    this.processes.add(process);
    console.log(`* Spawning a new process ${process}`);
    this.schedule(process);
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
      if (this.runQue.length <= 0) {
        break;
      }
      Promise.all(this.runQue.map((process) => this.handleProcess(process)));
      // Flush the queue
      this.runQue.length = 0;
      await this.sleep(100);
    }
  }

  start() {
    setTimeout(() => this.run(), 0);
  }
}

module.exports = { Scheduler };
