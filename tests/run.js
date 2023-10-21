const { EvaMPP } = require('../src/transpiler/eva-mpp.js');
const evaMPP = new EvaMPP();
const { ast, target } = evaMPP.compile(`
(var x 10)

(var y (* 10 (+ x 10)))
 (and 10 (+ x 10))
 (not 10)

(print (not y))
`);

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
