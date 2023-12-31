class JSCodeGen {
  constructor({ indent } = { indent: 2 }) {
    this._indent = indent;
    this._currentIndent = 0;
  }
  generate(expression) {
    return this._generate(expression);
  }

  _generate(expression) {
    if (!this[expression.type]) {
      throw `CodeGenerate - Unexpected expression: ${expression.type}`;
    }
    return this[expression.type](expression);
  }

  NumericLiteral(expression) {
    return String(expression.value);
  }

  StringLiteral(expression) {
    return String(expression.value);
  }
  VariableDeclaration(expression) {
    const { id, init } = expression.declarations[0];
    return `let ${this._generate(id)} = ${this._generate(init)};`;
  }

  FunctionDeclaration(expression) {
    const id = this._generate(expression.id);
    const params = expression.params.map((current) => this._generate(current)).join(', ');
    const body = this._generate(expression.body);
    const generator = expression.generator ? '*' : '';
    const async = expression.async ? 'async ' : '';
    return `\n${async}function${generator} ${id}(${params}) ${body}\n`;
  }
  ArrayExpression(expression) {
    const elements = expression.elements.map((current) => this._generate(current));
    return `[${elements.join(', ')}]`;
  }
  MemberExpression(expression) {
    const { object, property, computed } = expression;
    if (computed) {
      return `${this._generate(object)}[${this._generate(property)}]`;
    }
    return `${this._generate(object)}.${this._generate(property)}`;
  }

  ObjectExpression(expression) {
    const properties = expression.properties.map((current) => this._generate(current));
    return `{ ${properties.join(', ')} }`;
  }

  ObjectProperty(expression) {
    return `${this._generate(expression.key)}: ${this._generate(expression.value)}`;
  }
  ThisExpression(expression) {
    return `this`;
  }
  AwaitExpression(expression) {
    return `await ${this._generate(expression.argument)}`;
  }
  YieldExpression(expression) {
    const delegate = expression.delegate ? '*' : '';
    const argument = expression.argument ? `${this._generate(expression.argument)}` : '';
    return `yield${delegate}${argument}`;
  }
  CallExpression(expression) {
    const call = this._generate(expression.callee);
    const _arguments = expression.arguments.map((current) => this._generate(current)).join(', ');

    return `${call}(${_arguments})`;
  }
  AssignmentExpression(expression) {
    const { left, operator, right } = expression;
    return `${this._generate(left)} ${operator} ${this._generate(right)}`;
  }
  BinaryExpression(expression) {
    const { left, right } = expression;
    let operator = expression.operator;
    if (operator === '==') {
      operator = '===';
    }

    if (operator === '!=') {
      operator = '!==';
    }
    return `(${this._generate(left)} ${operator} ${this._generate(right)})`;
  }
  LogicalExpression(expression) {
    const { left, right, operator } = expression;
    return `(${this._generate(left)} ${operator} ${this._generate(right)})`;
  }

  UnaryExpression(expression) {
    return `${expression.operator}${this._generate(expression.argument)}`;
  }

  Identifier(expression) {
    return expression.name;
  }
  ThrowStatement(expression) {
    return `throw ${this._generate(expression.argument)}`;
  }
  TryStatement(expression) {
    return `try ${this._generate(expression.block)} ${this._generate(expression.handler)}`;
  }
  CatchClause(expression) {
    return `catch (${this._generate(expression.param)}) ${this._generate(expression.body)}`;
  }
  BlockStatement(expression) {
    this._currentIndent += this._indent;
    let code = '{\n' + expression.body.map((exp) => this._ind() + this._generate(exp)).join('\n') + '\n';
    this._currentIndent -= this._indent;
    code += this._ind() + '}';
    return code;
  }

  ReturnStatement({ argument }) {
    return `return ${this._generate(argument)};`;
  }

  ExpressionStatement({ expression }) {
    return `${this._generate(expression)};`;
  }

  IfStatement(exp) {
    const test = `${this._generate(exp.test)}`;
    const consequence = `${this._generate(exp.consequence)}`;
    const alternative = exp.alternative ? `else ${this._generate(exp.alternative)}` : '';
    return `if(${test}) ${consequence} ${alternative}`;
  }
  WhileStatement(exp) {
    const test = `${this._generate(exp.test)}`;
    const body = `${this._generate(exp.body)}`;
    return `while(${test}) ${body} `;
  }
  Program({ body }) {
    return body.map((current) => this._generate(current)).join('\n');
  }

  _ind() {
    return ' '.repeat(this._currentIndent);
  }
}

module.exports = { JSCodeGen };
