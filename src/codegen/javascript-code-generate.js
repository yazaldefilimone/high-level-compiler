export class JavaScriptCodeGenerate {
  generate(expression) {
    return this.gen(expression);
  }

  gen(expression) {
    if (expression.type === null) {
      throw `Unexpected expression: ${expression.type}`;
    }
    return this[expression.type](expression);
  }

  NumberLiteral(expression) {
    return String(expression);
  }
}
