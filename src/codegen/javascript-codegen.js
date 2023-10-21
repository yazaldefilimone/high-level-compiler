export class JavaScriptCodeGenerate {
  constructor({ indent } = { indent: 2 }) {
    this._indent = indent;
    this._currentIndent = 0;
  }
  generate(expression) {
    return this._generate(expression);
  }

  _generate(expression) {
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
    this._currentIndent += this._indent;
    let code = '{\n' + expression.body.map((exp) => this._ind() + this._generate(exp)).join('\n') + '\n';
    this._currentIndent -= this._indent;
    code += this._ind() + '}';
    return code;
  }

  ExpressionStatement({ expression }) {
    return `${this._generate(expression)};`;
  }
  Program({ body }) {
    return `${this._generate(body)}`;
  }

  _ind() {
    return ' '.repeat(this._currentIndent);
  }
}
