const { JSCodeGen } = require('../codegen/codegen');
const parser = require('../parser/parser.js');
const { types, internalType } = require('../utils');
const { Transform } = require('../transform/transform');
const { writeFileSync } = require('fs');

const codeGen = new JSCodeGen();
const transform = new Transform();
// Eva Message Passing Process
class EvaMPP {
  constructor() {
    this._currentFunction = null;
  }
  compile(program, outFile) {
    this._mapFunctions$ = new Map();
    const evaAst = parser.parse(`(begin ${program})`);
    const javaScriptAst = this._generateProgram(evaAst);
    const target = codeGen.generate(javaScriptAst);
    this.saveToFile(outFile, target);
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
    // return  = (return 1)
    if (expression[0] === 'return') {
      const [_tag, args] = expression;
      return {
        type: types.ReturnStatement,
        argument: this._generate(args),
      };
    }
    // function  =  (def square (x) (* x x))
    if (expression[0] === 'def') {
      let [_tag, name, evaParams, evaBody] = expression;
      const params = evaParams.map((param) => this._generate(param));
      if (!this._hasBlock(evaBody)) {
        evaBody = ['begin', evaBody];
      }
      const lastIndex = evaBody.length - 1;
      const last = evaBody[lastIndex];
      if (!this._hasStatement(last) && last[0] !== 'return') {
        evaBody[lastIndex] = ['return', last];
      }
      const internalFunction = {
        type: types.FunctionDeclaration,
        id: this._generate(this._toVariableName(name)),
        params,
        body: null,
      };
      const previousFunction = this._currentFunction;
      this._currentFunction = internalFunction;
      let block = this._generate(evaBody);
      // console.log('internalFunction meu test', block);

      internalFunction.body = block;
      this._currentFunction = previousFunction;

      const storeFunction = {
        fn: internalFunction,
        block: this._currentBlock,
        index: this._currentBlock.length,
      };
      this._mapFunctions$.set(internalFunction.id.name, storeFunction);
      return internalFunction;
    }

    if (expression[0] === 'begin') {
      const [_tag, ...expressions] = expression;
      const previousBlock = this._currentBlock;
      const body = (this._currentBlock = new Array());
      for (const currentExpression of expressions) {
        body.push(this._toStatement(this._generate(currentExpression)));
      }
      this._currentBlock = previousBlock;
      return {
        type: types.BlockStatement,
        body,
      };
    }
    if (this._isBinary(expression)) {
      return {
        type: types.BinaryExpression,
        left: this._generate(expression[1]),
        operator: expression[0],
        right: this._generate(expression[2]),
      };
    }

    if (this._isLogicalBinary(expression)) {
      let operator;
      switch (expression[0]) {
        case 'or':
          operator = '||';
          break;
        case 'and':
          operator = '&&';
          break;

        default:
          throw `Unknown  logical binary operator: ${expression[0]}`;
      }
      return {
        type: types.LogicalExpression,
        left: this._generate(expression[1]),
        operator,
        right: this._generate(expression[2]),
      };
    }

    if (this._isUnary(expression)) {
      let operator;
      switch (expression[0]) {
        case 'not':
          operator = '!';
          break;
        default:
          throw `Unknown unary operator: ${expression[0]}`;
      }
      return {
        type: types.UnaryExpression,
        operator,
        argument: this._generate(expression[1]),
      };
    }

    if (expression[0] === 'if') {
      const [_, test, consequence, alternative] = expression;
      return {
        type: types.IfStatement,
        test: this._generate(test),
        consequence: this._toStatement(this._generate(consequence)),
        alternative: this._toStatement(this._generate(alternative)),
      };
    }
    if (expression[0] === 'while') {
      const [_, test, body] = expression;
      return {
        type: types.WhileStatement,
        test: this._generate(test),
        body: this._toStatement(this._generate(body)),
      };
    }
    // list(array): [list 1 2 "name"]
    if (expression[0] === 'list') {
      const elements = expression.slice(1).map((current) => this._generate(current));
      return {
        type: types.ArrayExpression,
        elements,
      };
    }
    // (idx data 0)
    if (expression[0] === 'idx') {
      const [_, object, property] = expression;
      return {
        type: types.MemberExpression,
        object: this._generate(object),
        property: this._generate(property),
        computed: true,
      };
    }

    // (rec (name "yazalde") (age 19))

    if (expression[0] === 'rec') {
      const [_, ...evaProperties] = expression;

      const buildProperty = (entry) => {
        if (Array.isArray(entry)) {
          const [key, value] = entry;
          return {
            type: types.ObjectProperty,
            key: this._generate(key),
            value: this._generate(value),
          };
        }
        const gen = this._generate(entry);
        return {
          type: types.ObjectProperty,
          key: gen,
          value: gen,
        };
      };

      const properties = evaProperties.map(buildProperty);
      return {
        type: types.ObjectExpression,
        properties,
      };
    }
    // (prop data name)
    if (expression[0] === 'prop') {
      const [_, object, property] = expression;
      return {
        type: types.MemberExpression,
        object: this._generate(object),
        property: this._generate(property),
        computed: false,
      };
    }

    // pattern match

    if (expression[0] === 'match') {
      const [_, match] = expression;
      const expressionMatch = this._generate(match);
      let topLevelTry;
      let insertBlock;
      let index = 2;
      do {
        const currentExpression = this._generate(expression[index]);
        const [pattern, IFNode] = transform.expressionToPatternMatch(currentExpression, expressionMatch);
        const middle = expression[index + 1];
        const handler = this._toStatement(this._generate(middle));
        const tryBodyStatement = handler.type === types.BlockStatement ? handler.body : [handler];

        if (!Boolean(pattern) && !Boolean(IFNode)) {
          insertBlock.body.push(handler);
          return topLevelTry;
        }

        if (Boolean(IFNode)) {
          tryBodyStatement.unshift(IFNode);
        }

        if (Boolean(pattern)) {
          const destructorVariable = {
            type: types.VariableDeclaration,
            declarations: [
              {
                type: types.VariableDeclarator,
                id: pattern,
                init: expressionMatch,
              },
            ],
          };
          tryBodyStatement.unshift(destructorVariable);
        }

        // catch(e){...}
        const catchParamExpression = {
          type: types.Identifier,
          name: 'e',
        };

        // if(e !== NextMatch) {..}
        const nextMatchExpression = {
          type: types.Identifier,
          name: internalType.NextMath,
        };

        const nextMatchIFExpression = {
          type: types.IfStatement,
          test: {
            type: types.BinaryExpression,
            left: catchParamExpression,
            operator: '!==',
            right: nextMatchExpression,
          },
          consequence: {
            type: types.ThrowStatement,
            argument: catchParamExpression,
          },
        };

        const tryNodeExpression = {
          type: types.TryStatement,
          block: {
            type: types.BlockStatement,
            body: tryBodyStatement,
          },
          handler: {
            type: types.CatchClause,
            param: catchParamExpression,
            body: {
              type: types.BlockStatement,
              body: [nextMatchIFExpression],
            },
          },
        };

        if (Boolean(insertBlock)) {
          insertBlock.body.push(tryNodeExpression);
        }

        if (!Boolean(topLevelTry)) {
          topLevelTry = tryNodeExpression;
        }

        // insert next block
        insertBlock = tryNodeExpression.handler.body;
        index += 2;
      } while (index < expression.length);

      return topLevelTry;
    }

    // -----
    // receive: (receive pattern match match match...)
    // syntax sugar for awaiting a message and call "ex: match ()"

    if (expression[0] === 'receive') {
      const [_tag, pattern] = expression;
      this._currentFunction.id.name = `_${this._currentFunction.id.name}`;
      this._currentFunction.async = true;
      this._currentFunction.generator = true;
      const awaitVariableInitialize = {
        type: types.AwaitExpression,
        argument: {
          type: types.CallExpression,
          callee: {
            type: types.Identifier,
            name: `receive`,
          },
          arguments: [
            {
              type: types.ThisExpression,
            },
          ],
        },
      };
      const id = this._generate(pattern);
      const awaitVariable = {
        type: types.VariableDeclaration,
        declarations: [
          {
            type: types.VariableDeclarator,
            id,
            init: awaitVariableInitialize,
          },
        ],
      };
      // converte `receive` to `match pattern`
      expression[0] = 'match';
      const matchExpression = this._generate(expression);
      const block = {
        type: types.BlockStatement,
        body: [awaitVariable, matchExpression],
      };
      return block;
    }

    // -----
    // functions call : [print x]
    if (Array.isArray(expression)) {
      const [name, ...args] = expression;
      let functionName = this._toVariableName(name);

      const isRecursiveCall = Boolean(
        this._currentFunction !== null &&
          this._currentFunction.generator &&
          this._currentFunction.id.name.slice(1) === functionName,
      );

      if (isRecursiveCall) {
        functionName = this._currentFunction.id.name;
      }

      const callee = this._generate(functionName);
      const _arguments = args.map((current) => this._generate(current));

      // dynamic allocate a process function if the original function is used spawn
      if (callee.name === internalType.spawn) {
        const originalFnName = _arguments[0].name;
        const processFnName = `_${originalFnName}`;
        if (!this._mapFunctions$.has(processFnName)) {
          const originalStoreFn = this._mapFunctions$.get(originalFnName);
          const processFn = transform.functionToAsyncGenerator(originalStoreFn.fn);
          const mapProcessFn = {
            ...originalStoreFn,
            fn: processFn,
            index: originalStoreFn.index + 1, // add a new process function underneath the original function
          };

          this._mapFunctions$.set(processFnName, mapProcessFn); // store a new process function

          // put under to original function a new process function
          const originalFnBlockWithProcessFn = originalStoreFn.block.splice(mapProcessFn.index, 0, processFn);

          // update the original block with new process function
          this._mapFunctions$.set(originalFnName, originalFnBlockWithProcessFn);
        }
        //  pointing the function call name to the  process function name
        _arguments[0].name = processFnName;
      }

      if (isRecursiveCall) {
        const yieldExpression = {
          type: types.YieldExpression,
          delegate: true,
          argument: {
            type: types.CallExpression,
            callee: {
              type: types.MemberExpression,
              object: callee,
              property: {
                type: types.Identifier,
                name: 'call',
              },
            },
            arguments: [{ type: types.ThisExpression }, ..._arguments],
          },
        };

        return yieldExpression;
      }
      // simple call func
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
    const previousBlock = this._currentBlock;
    const body = (this._currentBlock = new Array());
    for (const currentExpression of expressions) {
      body.push(this._toStatement(this._generate(currentExpression)));
    }
    this._currentBlock = previousBlock;
    return {
      type: 'Program',
      body: body,
    };
  }
  _toVariableName(exp) {
    if (exp === 'self') return 'this';
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
      case types.BinaryExpression:
      case types.LogicalExpression:
      case types.ArrayExpression:
      case types.YieldExpression:
      case types.ObjectExpression:
      case types.ThisExpression:
      case types.AwaitExpression:
        return { type: types.ExpressionStatement, expression };
      default:
        return expression;
    }
  }
  _isBinary(expression) {
    if (expression.length != 3) {
      return false;
    }
    const operator = expression[0];
    return Boolean(
      operator === '+' ||
        operator === '-' ||
        operator === '/' ||
        operator === '*' ||
        operator === '>' ||
        operator === '<' ||
        operator === '>=' ||
        operator === '<=' ||
        operator === '!=' ||
        operator === '==',
    );
  }
  _isUnary(expression) {
    if (expression.length !== 2) {
      return false;
    }
    return Boolean(expression[0] === 'not' || expression[0] === '-');
  }
  _isLogicalBinary(expression) {
    const operator = expression[0];
    return Boolean(operator === 'or' || operator === 'and');
  }
  _hasBlock(expression) {
    const tag = expression[0];
    return Boolean(tag === 'begin' || tag === 'receive');
  }
  _hasStatement(expression) {
    const exp = expression[0];
    return Boolean(exp === 'if' || exp === 'while' || exp === 'for' || exp === 'var');
  }
  saveToFile(filename, code) {
    const runtimeCode = `
// prologue
const  {print, spawn, send, receive, sleep, scheduler, NextMath } =  require('../src/runtime');
${code}
    `;
    writeFileSync(filename, runtimeCode);
  }
}

module.exports = { EvaMPP };
