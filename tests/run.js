const { EvaMPP } = require('../src/transpiler/eva-mpp.js');
const evaMPP = new EvaMPP();
const { ast, target } = evaMPP.compile(`
(var x 10)


(if (== x 10)
  (begin 
    (print "x is iqual the 10")
  )
   (begin 
    (print "x is diferente the 10")
   )
)


(var index 10)

(while (> index 0) 
  (begin
    (print "index:" index)
    (set index (- index 1))
  )
)
`);

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
