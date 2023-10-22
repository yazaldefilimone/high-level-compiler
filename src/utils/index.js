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
};
const internalType = {
  spawn: `spawn`,
};
module.exports = { types, internalType };
