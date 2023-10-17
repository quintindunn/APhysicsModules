// export { Standard, Mult, Exp, Log, LN };

class Standard {
    constructor(array) {
        this.arr = array;
    }

    copy() {
        return new this.constructor(this.arr.map(e => e instanceof Standard ? e.copy() : e ));
    }

    equals(other) {
        if (
            this.arr.length !== other.arr.length ||
            this.constructor !== other.constructor
        )
        { return false; }

        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i] instanceof Standard) {
                if (other.arr[i] instanceof Standard && this.arr[i].equals(other.arr[i]))
                { continue; }

                return false;
            }

            if (this.arr[i] !== other.arr[i]) { return false; }
        }

        return true;
    }

    derivative() {
        return new Standard(
            this.arr.map(e => e instanceof Standard ? e.derivative() : 0)
        );
    }

    simplify() {
        let newArr = [];

        for (let i = 0; i < this.arr.length; i++) {
            let el = this.arr[i] instanceof Standard ? this.arr[i].simplify() : this.arr[i];
            console.log(this.toString() + ": " + this.arr[i] + " -> " + el);

            // adding 0 is pointless
            if (el === 0) { continue; }

            newArr.push(el);
        }

        return new this.constructor(newArr);
    }

    toString() {
        return this.arr.map(e => e.toString()).join(" + ");
    }
}

class X extends Standard {
    constructor() {
        super([]);
    }

    copy() { return new X(); }
    equals(other) { return other instanceof X; }
    derivative() { return 1; }
    simplify() { console.log("x is x"); return this.copy(); }
    toString() { return "x"; }
}

class Mult extends Standard {
    yAt(x) {
        let final = 0;

        for (let el of this.arr) {
            final += el instanceof Standard ? el.yAt(x) : el;
        }

        return final;
    }

    /*
        h(x) = fg
        h'(x) = (f')(g) + (g')(f)
    */
    derivative() {
        if (this.arr.length === 2) {

            if (this.arr[0] instanceof Standard) {
                if (this.arr[1] instanceof Standard) {
                    return new Standard([
                        new Mult([this.arr[0].derivative(), this.arr[1].copy()]),
                        new Mult([this.arr[1].derivative(), this.arr[0].copy()])
                    ]);
                }

                return new Mult([
                    this.arr[0].derivative(),
                    this.arr[1]
                ]);
            }

            if (this.arr[1] instanceof Standard) {
                return new Mult([
                    this.arr[1].derivative(),
                    this.arr[0]
                ]);
            }

            return 0;

        }

        let copyArr = this.arr.copy();
        let term = copyArr.pop();

        if (term instanceof Standard) {
            return new Standard([
                new Mult([copyArr, term.derivative()]),
                new Mult([(new Mult(copyArr)).derivative(), term])
            ]);
        }

        return new Mult([
            term,
            (new Mult(copyArr)).derivative()
        ]);
    }

    simplify() {
        let newArr = [];

        for (let i = 0; i < this.arr.length; i++) {
            let el = this.arr[i] instanceof Standard ? this.arr[i].simplify() : this.arr[i];
            console.log(this + ": " + this.arr[i] + " -> " + el);

            // any multiplication by 0 will result in 0
            if (el === 0) { return 0; }
            // multiplying by 1 is pointless
            if (el === 1) { continue; }

            newArr.push(el);
        }

        return new this.constructor(newArr);
    }

    toString() {
        return "(" + this.arr.map(e => e.toString()).join(")(") + ")";
    }
}

class Exp extends Standard {
    constructor(term1, term2) {
        super([term1, term2]);
        this.f = term1;
        this.g = term2;
    }

    copy() {
        return new this.constructor(this.f, this.g);
    }

    yAt(x) {
        return (
            this.f instanceof Standard ? this.f.yAt(x) : this.f)
            **
            (this.g instanceof Standard ? this.g.yAt(x) : this.g
        );
    }

    /*
        h(x) = f^g

        h'(x) = (f^g)(g'ln(f) + gf'/f)
    */
    derivative() {
        if (this.f instanceof Standard) {
            if (this.g instanceof Standard) {
                return new Mult([
                    this.copy(),
                    new Standard([
                        new Mult([
                            this.g.derivative(),
                            new LN(this.f.copy())
                        ]),
                        new Mult([
                            this.f.derivative(),
                            this.g.copy(),
                            new Exp(this.f.copy(), -1)
                        ])
                    ])
                ]);
            }

            return new Mult([
                this.g,
                new Exp(this.f.copy(), this.g - 1),
                this.f.derivative()
            ]);
        }

        if (this.g instanceof Standard) {
            return new Mult([
                this.copy(),
                new LN(this.f),
                this.g.derivative()
            ]);
        }

        return 0;
    }

    simplify() {
        let newArr = [
            this.f instanceof Standard ? this.f.simplify() : this.f,
            this.g instanceof Standard ? this.g.simplify() : this.g
        ];
        console.log(this.toString() + ": " + this.arr + " -> " + newArr);

        if (newArr[0] === 0 || newArr[0] === 1 || newArr[1] === 1)
        { return newArr[0]; }

        if (newArr[1] === 0) { return 1; }

        return new this.constructor(newArr);
    }

    toString() {
        return "(" + this.f.toString() + ")^(" + this.g.toString() + ")";
    }
}

class Log extends Standard {
    constructor(term1, term2) {
        super([term1, term2]);
        this.f = term1;
        this.g = term2;
    }

    copy() {
        return new this.constructor(this.f, this.g);
    }

    yAt(x) {
        return (
            Math.log(this.f instanceof Standard ? this.f.yAt(x) : this.f))
            /
            (Math.log(this.g instanceof Standard ? this.g.yAt(x) : this.g)
        );
    }

    /*
        h(x) = log[f](g)

        h'(x) = (fg' - hgf') / fgln(f)
    */
    derivative() {
        if (this.f instanceof Standard) {
            if (this.g instanceof Standard) {
                 // ( fg' + -hgf' ) / ( fgln(f) )
                return new Mult([
                    new Standard([
                        new Mult( [this.f.copy(), this.g.derivative()] ),
                        new Mult( [-1, this.copy(), this.g.copy(), this.f.derivative()] )
                ]),
                    new Exp(
                        new Mult( [this.f.copy(), this.g.copy(), new LN(this.f.copy())] ),
                        -1
                    )
                ]);
            }

            return new Mult([
                -1,
                this.copy(),
                this.f.derivative(),
                new Exp(
                    new Mult( [this.f, new LN(this.f)] ),
                    -1
                )
            ]);
        }

        if (this.g instanceof Standard) {
            return new Mult([
                this.g.derivative(),
                new Exp(
                    new Mult( [this.g, new LN(this.f)] ),
                    -1
                )
            ]);
        }

        return 0;
    }

    simplify() {
        let newArr = [
            this.f instanceof Standard ? this.f.simplify() : this.f,
            this.g instanceof Standard ? this.g.simplify() : this.g
        ];
        console.log(this.toString() + ": " + this.arr + " -> " + newArr);

        if (this.g === 1) { return 0; }

        if (this.f.equals(this.g)) { return 1; }

        return new this.constructor(newArr);
    }

    toString() {
        return "log[" + this.f.toString() + "](" + this.g.toString() + ")";
    }
}

class LN extends Standard {
    constructor(term) {
        super([Math.E, term]);
        this.term = term;
    }

    copy() {
        return new this.constructor(this.term);
    }

    yAt(x) {
        return Math.log(this.term instanceof Standard ? this.term.yAt(x) : this.term);
    }

    derivative() {
        if (this.term instanceof Standard) {
            return new Mult([
                this.term.derivative(),
                new Exp(this.term.copy(), -1)
            ]);
        }

        return 0;
    }

    simplify() {
        let newArr = [
            Math.E,
            this.term instanceof Standard ? this.term.simplify() : this.term
        ];
        console.log(this.toString() + ": " + this.arr + " -> " + newArr);

        if (this.term === 1) { return 0; }
        if (this.term === Math.E) { return 1; }

        return new this.constructor(newArr);
    }

    toString() {
        return "ln(" + this.term + ")";
    }
}