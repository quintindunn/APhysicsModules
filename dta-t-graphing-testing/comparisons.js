const Parser = require('expr-eval').Parser;

const OPERATORS = ['<', '<=', '>', '>='];

const PATTERN = new RegExp('(' + OPERATORS.map(operator => operator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')');

const EXPR = "5<x<10";

function splitExpr(expr) {
    const result = expr.split(PATTERN);
    const comparisons = [];
    for (let i = 0; i < result.length; i += 3) {
        comparisons.push(result.slice(i, i + 3));
    }
    const processedComparisons = comparisons.map(comparison => {
        if (OPERATORS.includes(comparison[1])) {
            return comparison.join('');
        } else if (OPERATORS.includes(comparison[0])) {
            return 'x' + comparison.join('');
        }
    });
    return processedComparisons;
}

function evalExpr(expr, x) {
    const expressions = splitExpr(expr);
    for (const subExpr of expressions) {
        const evalExpr = subExpr.replace('x', x.toString());
        if (Parser.evaluate(evalExpr, { x: x }) === false) {
            return false;
        }
    }
    return true;
}


for (let i = 0; i <= 15; i += 2) {
    console.log(`x=${i}`, evalExpr(EXPR, i));
}

/*
OUTPUT:
x=0 false
x=2 false
x=4 false
x=6 true
x=8 true
x=10 false
x=12 false
x=14 false
*/
