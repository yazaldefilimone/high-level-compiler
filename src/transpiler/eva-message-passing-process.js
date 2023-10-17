import { JavaScriptCodeGenerate } from '../codegen';

const javaScriptCodeGenerate = new JavaScriptCodeGenerate();

export class EvaMessagePassingProcess {
  compile(program) {
    const evaAst = program;

    const javaScriptAst = this.generate(evaAst);

    const target = javaScriptCodeGenerate.gen(javaScriptAst);

    this.saveToFile('./out.js', target);

    return { ast: javaScriptAst, target };
  }

  generate(expression) {
    // ------------
    // self-evaluator expression

    if (this._isNumber(expression)) {
      return {
        type: 'NumberLiteral',
        value: expression,
      };
    }

    throw `Unexpected implemented: ${JSON.stringify(expression)}`;
  }

  _isNumber(expression) {
    return typeof expression === 'number';
  }
  saveToFile(filename, target) {}
}
