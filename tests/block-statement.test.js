import { it, expect, describe } from "vitest";
import { EvaMessagePassingProcess } from "../src/transpiler";
import { types } from "../src/utils";

const evaMessagePassingProcess = new EvaMessagePassingProcess();

describe("Block statement", () => {
  it("block", () => {
    const { ast, target } = evaMessagePassingProcess.compile('(begin 30 "Hello")');
    console.log(target);
    expect(ast.type).toEqual(types.Program);
    const blockStatement = ast.body;
    expect(blockStatement.type).toEqual(types.BlockStatement);
    expect(blockStatement.body).toBeDefined();
    expect(blockStatement.body[0].type).toEqual(types.ExpressionStatement);
    expect(blockStatement.body[0].expression.type).toEqual(types.NumericLiteral);
    expect(blockStatement.body[0].expression.value).toEqual(30);
    expect(blockStatement.body[1].type).toEqual(types.ExpressionStatement);
    expect(blockStatement.body[1].expression.type).toEqual(types.StringLiteral);
    expect(blockStatement.body[1].expression.value).toEqual(`"Hello"`);
  });
});
``;
