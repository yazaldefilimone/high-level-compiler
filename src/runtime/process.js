// Light-weight process (green thread)
// https://en.wikipedia.org/wiki/Light-weight_process
class Process {
  constructor(handlerFn, ...args) {
    console.log({ handlerFn });
    this.handler = handlerFn.apply(this, args);
    this.pid = ++Process.pid;
    this.name = handlerFn.name || this.pid;
  }

  toString() {
    return `#${this.pid} (${this.name})`;
  }
}

Process.pid = 0;

module.exports = { Process };
