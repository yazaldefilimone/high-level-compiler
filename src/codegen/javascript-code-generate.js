export class JavaScriptCodeGenerate {
  constructor(indent = 2) {
    this._indent = indent;
    this._currentIndent = indent;
  }
  generate(expression) {
    return this.gen(expression);
  }

  gen(expression) {
    if (!this[expression.type]) {
      throw `JavaScriptCodeGenerate - Unexpected expression: ${expression.type}`;
    }
    return this[expression.type](expression);
  }

  NumericLiteral(expression) {
    return String(expression.value);
  }

  StringLiteral(expression) {
    return String(expression.value);
  }

  BlockStatement(expression) {
    const code = expression.body.map((exp) => {
      return `\n${this._indenting() + this.gen(exp)}`;
    });
    return `{` + code.join('') + '\n' + `}`;
  }
  ExpressionStatement({ expression }) {
    return `${this.gen(expression)};`;
  }
  Program({ body }) {
    return `${this.gen(body)}`;
  }

  _indenting() {
    let spaces = '';
    for (let index = 0; index < this._currentIndent; index++) {
      spaces += ' ';
    }
    return spaces;
  }
}
