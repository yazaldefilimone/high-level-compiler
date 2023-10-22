const types = {
  NumericLiteral: 'NumericLiteral',
  StringLiteral: 'StringLiteral',
  BlockStatement: 'BlockStatement',
  ExpressionStatement: `ExpressionStatement`,
  Program: `Program`,
  VariableDeclaration: `VariableDeclaration`,
  VariableDeclarator: `VariableDeclarator`,
  Identifier: `Identifier`,
  AssignmentExpression: `AssignmentExpression`,
  CallExpression: `CallExpression`,
  BinaryExpression: `BinaryExpression`,
  LogicalExpression: `LogicalExpression`,
  UnaryExpression: `UnaryExpression`,
  IfStatement: `IfStatement`,
  WhileStatement: `WhileStatement`,
  FunctionDeclaration: `FunctionDeclaration`,
  ReturnStatement: `ReturnStatement`,
  YieldExpression: `YieldExpression`,
  ArrayExpression: `ArrayExpression`,
  MemberExpression: `MemberExpression`,
  ObjectExpression: `ObjectExpression`,
  ObjectProperty: `ObjectProperty`,
};
const internalType = {
  spawn: `spawn`,
};
module.exports = { types, internalType };
