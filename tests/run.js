const { EvaMPP } = require('../src/transpiler/eva-mpp.js');
const evaMPP = new EvaMPP();
const { ast, target } = evaMPP.compile(`
(var user-name 10)
(print "user-name:" user-name)
(set user-name 100)
(print "user-name updated:" user-name)
(print (Number "10"))
`);

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
