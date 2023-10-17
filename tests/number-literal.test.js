import { it, expect, describe } from 'vitest';
import { EvaMessagePassingProcess } from '../src/transpiler';

const evaMessagePassingProcess = new EvaMessagePassingProcess();

describe('Number literal', () => {
  it('generate number ast', () => {
    const { ast, target } = evaMessagePassingProcess.compile(40);
    expect(ast.type).toEqual('NumberLiteral');
    expect(ast.value).toEqual(40);
  });
});
