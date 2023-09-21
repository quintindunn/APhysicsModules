const Parser = require('expr-eval').Parser;


class PieceWiseFunction {
    constructor() {
        this.functions = [];
    }

    add_function(func, condition) {
        this.functions.push([func, condition]);
    }

    iterate(x) {
        for (let fi = 0; fi < this.functions.length; fi++)
        {
            let func_attrs = this.functions[fi];
            let func = func_attrs[0];
            let cond = func_attrs[1];

            // Check conditional.
            let res = Parser.evaluate(cond, { x: x });
            if (res)
                return Parser.evaluate(func, { x: x });
        }
    } 
}

let pwf = new PieceWiseFunction();
pwf.add_function("2*x+5", "x<5");
pwf.add_function("3*x+5", "x>=5");

let x_vals = [];
let y_vals = [];

for (let i = 0; i < 10; i += 0.1)
{
    x = +i.toFixed(2);
    y_vals.push(pwf.iterate(x));
    x_vals.push(x);
}

console.log(x_vals);
console.log(x_vals);