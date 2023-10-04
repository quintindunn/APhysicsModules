const Parser = require('expr-eval').Parser;

function preParseExpression(expressionString, variables) {
    var variables = variables.join('');
  
    // Build an object with replacement rules. (The order matters!)
    var re = {};
    // Turns 'x^xy' into 'x^(x*y)'.
    re.parenthesizeVariables = {
      expr : new RegExp('([0-9' + variables + ']+)([' + variables + ']+)'),
      repl : '($1*$2)',
    };
    // Turns '2(3+y)' into '2*(3+y)'.
    re.parenthesisCoefficients = {
      expr : /(\d+)([(])/i,
      repl : '$1*$2'
    };
    // Turns '(x^xy)(x-y)' into '(x^xy)*(x-y)'.
    re.parenthesisMultiplication = {
      expr : /([)])([(])/,
      repl : '$1*$2',
    };
    // Turns '2sin' into '2*sin'.
    re.functionCoefficients = {
      expr : /(\d+)([a-z]+)/i,
      repl : '$1*$2',
    };
  
    // Apply the replacement rules.
    for (var i in re) {
      while (expressionString.replace(re[i].expr, re[i].repl) != expressionString) {
        expressionString = expressionString.replace(re[i].expr, re[i].repl);
      }
    }
  
    return expressionString;
  }

let instr = "2sqrt(x)";

let pre_processed = preParseExpression(instr, ['x']);

console.log(pre_processed)

let y = Parser.evaluate(pre_processed, { x: 7 })

console.log(y);
