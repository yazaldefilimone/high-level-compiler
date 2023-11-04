// Light-weight process (green thread)
// https://en.wikipedia.org/wiki/Light-weight_process
class Process {
  constructor(handlerFunction, ...args) {
    this.handler = handlerFunction.apply(this, args);
    this.pid = ++Process.pid;
    this.name = handlerFunction.name || this.pid;
    this.mailbox = new Array();
  }

  toString() {
    return `#${this.pid} (${this.name})`;
  }
}

Process.pid = 0;

module.exports = { Process };
