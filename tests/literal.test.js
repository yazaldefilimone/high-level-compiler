import { it, expect, describe } from "vitest";
import { EvaMessagePassingProcess } from "../src/transpiler";
import { types } from "../src/utils";

const evaMessagePassingProcess = new EvaMessagePassingProcess();

describe("literal", () => {
  it("generate number ast", () => {
    const { ast, target } = evaMessagePassingProcess.compile(40);
    expect(ast.type).toEqual(types.Program);
    expect(ast.body.type).toEqual(types.NumericLiteral);
    expect(ast.body.value).toEqual(40);
  });
  it("generate string ast", () => {
    const { ast, target } = evaMessagePassingProcess.compile('"hello"');
    expect(ast.type).toEqual(types.Program);
    expect(ast.body.type).toEqual(types.StringLiteral);
    expect(ast.body.value).toEqual('"hello"');
  });
});
