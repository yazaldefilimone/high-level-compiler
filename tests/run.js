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
// green thread
const spanedProcess = `
(def handle (id) 
  (begin 
    (print id 1)
    (print id 2)
    (print id 3)
    (print id 4)
    (print id 5)
    (print id 6)
  )
)

(spawn handle "x")
(spawn handle "y")
`;

const data_structure = `
(var arr (list 1 2 3 "Yazalde" "Filimone"))
(var name "Yazalde Filimone")
(var obect (rec (age 19) name))
(print (idx arr 4))
(print (prop obect name))

`;
const pattern_match = `
(var pattern (rec (x 1) (y 2)))

(match pattern
  (rec (x 1) y) (print "x match x y is" y)
  1 (print "1")
  _ (print "no match")
)

`;

const message_process = `
(def success (param)
  (print "param = " param)
)

(def not-found (url)
  (print "not-found:" url)
)

(def handle-connection (data)
    (receive request
      "hello" (success 20)
      (rec (code 200) len) 
        (begin 
          (success len)
          (handle-connection data)
        )
      
      (rec (code 204) url) (not-found url) 
    
      _ (print data)
    )
)

(var handler (spawn handle-connection "default"))


(var index 0)


(def send-message () 
  (begin
    (set index (+ index 1))

    (if (<= index 5) 
      (send handler (rec (code 200) (len index)))
      (send handler "hello")
    )
  )
)

(set-interval send-message 100)
`;

const case_study = `
(prop self name)
(match (rec (x 10))
  (rec x) (print self)
  _ (print "not found")
)
`;

const web = `
(def handle-process (el)
  (while (< (get-width el) RACE_LENGTH)
    (receive request
      (rec sender delay delta)
        (begin
          (inc-width el delta)
          (var receiver (get-random-process))

          (send receiver 
            (rec 
              (sender self)
              (delay (random 50 200))
              (delta (random 5 50))
            )
          )

          (sleep delay)
        )
    )
  )
)
`;
const { ast, target } = evaMPP.compile(web);

console.log('---- ast ----');
console.log(JSON.stringify(ast, null, 2));
console.log('---- code ----');
console.log(target);
console.log('---- output ----');
