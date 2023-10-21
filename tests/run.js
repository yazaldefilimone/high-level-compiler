import { EvaMessagePassingProcess } from '../src/transpiler/eva-message-passing-process.js';
const evaMessagePassingProcess = new EvaMessagePassingProcess();
const { ast, target } = evaMessagePassingProcess.compile('(begin 30 "Hello")');

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
