const { types, internalType } = require('../utils');

class Transform {
  functionToAsyncGenerator(ast) {
    const generatorFunction = {
      type: types.FunctionDeclaration,
      generator: true,
      async: true,
      body: null,
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
    generatorFunction.body = {
      type: types.BlockStatement,
      body: generatorBody,
    };
    return generatorFunction;
  }

  expressionToPatternMatch(currentExpression, expressionMatch, checks = []) {
    // (x) (y 2) -> {x: 1, y:_y}
    // if(_y !== 2) throw NextMatch
    if (currentExpression.type === types.ObjectExpression) {
      currentExpression.properties.forEach((property) => {
        if (property.value.type === types.Identifier) {
          return;
        }

        if (property.value.type === types.StringLiteral || property.value.type === types.NumericLiteral) {
          checks.push(this._createPropertyCompare(property));
        }
        // recursion
        else if (property.value.type === types.ObjectExpression) {
          return this.expressionToPatternMatch(property.value, expressionMatch, checks);
        }
      });

      const IFNode = this._createIFTest(checks);

      return [currentExpression, IFNode];
    }

    if (currentExpression.type === types.StringLiteral || currentExpression.type === types.NumericLiteral) {
      checks.push(this._createValueCompare(currentExpression, expressionMatch));
      const IFNode = this._createIFTest(checks);
      return [null, IFNode];
    }
    // _ -> ...
    if (currentExpression.type === types.Identifier) {
      return [null, null];
    }
  }

  _createPropertyCompare(property) {
    const expected = property.value;

    const blinding = {
      type: types.Identifier,
      name: `_${property.key.name}`,
    };

    property.value = blinding;
    return this._createValueCompare(blinding, expected);
  }

  _createValueCompare(blinding, expected) {
    return {
      type: types.BinaryExpression,
      left: blinding,
      operator: '!==',
      right: expected,
    };
  }

  _createIFTest(checks) {
    let IFConditionExpression = checks[0];

    let index = 2;

    while (index < checks.length) {
      IFConditionExpression = {
        type: types.LogicalExpression,
        left: IFConditionExpression,
        operator: '||',
        right: checks[index],
      };
      index++;
    }

    const consequence = {
      type: types.ThrowStatement,
      argument: {
        type: types.Identifier,
        name: internalType.NextMath,
      },
    };

    return {
      type: types.IfStatement,
      test: IFConditionExpression,
      consequence,
    };
  }
}

module.exports = { Transform };
