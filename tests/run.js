const { EvaMPP } = require('../src/transpiler/eva-mpp.js');
const evaMPP = new EvaMPP();
const testLoop = `
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
`;

const funTest = `
(def square (x)
  (* x x)
)
(print (square 10))

(def fun () 
  (begin
    (var num 20)
    (+ num (* 1 2))
  )
)
(print (fun))

`;

const spanedProcess = `
(def handle (id) 
  (begin 
    (print id 1)
    (print id 2)
  )
)

(spawn handle "x")
(spawn handle "y")
`;
const { ast, target } = evaMPP.compile(spanedProcess);

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
