const { types } = require('../utils');

class Transform {
  functionToAsyncGenerator(ast) {
    const generatorFn = {
      type: types.FunctionDeclaration,
      generator: true,
      async: true,
      id: {
        type: types.Identifier,
        name: `_${ast.id.name}`,
      },
      params: ast.params,
    };

    const yieldExpression = {
      type: types.ExpressionStatement,
      expression: {
        type: types.YieldExpression,
      },
    };
    const { body } = ast.body; // statement body
    const generatorBody = [...body];

    for (let index = 1; index < generatorBody.length; index += 2) {
      generatorBody.splice(index, 0, yieldExpression);
    }
    generatorFn.body = {
      type: types.BlockStatement,
      body: generatorBody,
    };
    return generatorFn;
  }
}

module.exports = { Transform };
