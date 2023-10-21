const { JSCodeGen } = require('../codegen/codegen.js');
const parser = require('../parser/parser.js');
const { types } = require('../utils/types.js');
const { writeFileSync } = require('fs');

const codeGen = new JSCodeGen();
// Eva Message Passing Process
class EvaMPP {
  compile(program) {
    const evaAst = parser.parse(`(begin ${program})`);
    const javaScriptAst = this._generateProgram(evaAst);
    const target = codeGen.generate(javaScriptAst);
    this.saveToFile('./tests/out.js', target);

    return { ast: javaScriptAst, target };
  }

  _generate(expression) {
    // ------------
    // self-evaluator expression

    if (this._isNumber(expression)) {
      return {
        type: types.NumericLiteral,
        value: expression,
      };
    }

    if (this._isString(expression)) {
      return {
        type: types.StringLiteral,
        value: expression,
      };
    }
    if (this._isVariableName(expression)) {
      return {
        type: types.Identifier,
        name: this._toVariableName(expression),
      };
    }
    // variable declaration = [var x 10]
    if (expression[0] === 'var') {
      const [_tag, id, init] = expression;
      return {
        type: types.VariableDeclaration,
        declarations: [
          {
            type: types.VariableDeclarator,
            id: this._generate(this._toVariableName(id)),
            init: this._generate(init),
          },
        ],
      };
    }
    // assignment  =  [set x 11]
    if (expression[0] === 'set') {
      const [_tag, left, right] = expression;
      return {
        type: types.AssignmentExpression,
        operator: '=',
        left: this._generate(this._toVariableName(left)),
        right: this._generate(right),
      };
    }
    if (expression[0] === 'begin') {
      const [_tag, ...expressions] = expression;
      const body = expressions.map((element) => this._toStatement(this._generate(element)));
      return {
        type: types.BlockStatement,
        body,
      };
    }

    // functions call : [print x]
    if (Array.isArray(expression)) {
      const [name, ...args] = expression;
      const jsName = this._toVariableName(name);
      const callee = this._generate(jsName);
      const _arguments = args.map((current) => this._generate(current));

      return {
        type: types.CallExpression,
        callee,
        arguments: _arguments,
      };
    }

    throw `Unexpected implemented: ${JSON.stringify(expression)}`;
  }
  _generateProgram(expression) {
    const [_tag, ...expressions] = expression;
    const body = expressions.map((element) => this._toStatement(this._generate(element)));
    return {
      type: 'Program',
      body: body,
    };
  }
  _toVariableName(exp) {
    return this._toJsName(exp);
  }
  _toJsName(name) {
    return name.replace(/-([a-z])/g, (math, latter) => latter.toUpperCase());
  }

  _isNumber(expression) {
    return typeof expression === 'number';
  }
  _isVariableName(exp) {
    return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
  }
  _isString(expression) {
    return typeof expression === 'string' && expression.at(0) === '"' && expression.at(-1) === '"';
  }
  _toStatement(expression) {
    switch (expression.type) {
      case types.NumericLiteral:
      case types.StringLiteral:
      case types.AssignmentExpression:
      case types.CallExpression:
      case types.Identifier:
        return { type: types.ExpressionStatement, expression };
      default:
        return expression;
    }
  }

  saveToFile(filename, code) {
    const runtimeCode = `
// prologue
const {print} =  require('../src/runtime');
${code}
    `;
    writeFileSync(filename, runtimeCode);
  }
}

module.exports = { EvaMPP };
