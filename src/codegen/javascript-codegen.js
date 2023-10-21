export class JavaScriptCodeGenerate {
  constructor({ indent } = { indent: 2 }) {
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
    this._currentIndent += this.indent;
    let code = '{\n' + expression.body.map((exp) => this._indenting() + this.gen(exp)).join('\n') + '\n';
    this._currentIndent -= this.indent;
    code += this._indenting() + '}';
    return code;
  }

  ExpressionStatement({ expression }) {
    return `${this.gen(expression)};`;
  }
  Program({ body }) {
    return `${this.gen(body)}`;
  }

  _indenting() {
    return ' '.repeat(this._currentIndent);
  }
}
