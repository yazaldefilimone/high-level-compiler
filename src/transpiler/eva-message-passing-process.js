import { JavaScriptCodeGenerate } from '../codegen';
import parser from '../parser/parser';
import { types } from '../utils';
import { writeFileSync } from 'fs';

const javaScriptCodeGenerate = new JavaScriptCodeGenerate();

export class EvaMessagePassingProcess {
  compile(program) {
    const evaAst = parser.parse(`(begin ${program})`);
    const javaScriptAst = this._generateProgram(evaAst);

    const target = javaScriptCodeGenerate.generate(javaScriptAst);
    this.saveToFile('./out.js', target);

    return { ast: javaScriptAst, target };
  }

  generate(expression) {
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

    if (expression[0] === 'begin') {
      const [_tag, ...expressions] = expression;
      const body = [];
      expressions.forEach((element) => {
        body.push(this._toStatement(this.generate(element)));
      });
      return {
        type: types.BlockStatement,
        body,
      };
    }

    throw `Unexpected implemented: ${JSON.stringify(expression)}`;
  }
  _generateProgram(expression) {
    const [_tag, expressions] = expression;
    return {
      type: 'Program',
      body: this.generate(expressions),
    };
  }

  _isNumber(expression) {
    return typeof expression === 'number';
  }

  _isString(expression) {
    return typeof expression === 'string' && expression.at(0) === '"' && expression.at(-1) === '"';
  }
  _toStatement(expression) {
    switch (expression.type) {
      case types.NumericLiteral:
      case types.StringLiteral:
        return { type: types.ExpressionStatement, expression };
      default:
        return expression;
    }
  }

  saveToFile(filename, code) {
    writeFileSync(filename, code);
  }
}
