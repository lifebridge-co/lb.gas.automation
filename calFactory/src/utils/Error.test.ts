import { FetchError, ParameterError, CreationError } from './Error';
describe('FetchError', () => {
  const inst = new FetchError('test');
  test('its name should be "FetchError"', () => {
    expect(inst.name).toBe('FetchError');
  });
  test('its message should be "test"', () => {
    expect(inst.message).toBe('test');
  });
  test('has the property of stack', () => {
    expect(inst.stack).toBeDefined();
  });
  test("the property of stack is to be 'no stack recorded' if the executor doesn't support error stack.", () => { // TODO
    const inst = (() => {
      // Error.prototype.stack = undefined;
      return new FetchError('test');
    })();
    // expect(inst.stack).toBe("(no stack recorded)");
    expect(inst.stack).toBeDefined();
  });
  test('toString should return string matches for /FetchError: test\nstack:\n.*?/s', () => {
    expect(inst.toString()).toMatch(
      /FetchError: test\nstack:.*?/s
    );
  });
});

describe('Error.ParameterError.toString', () => {
  const inst = new ParameterError('hello', 'string', 'number');
  test('toString should return string matches to /ParameterError: The parameter hello should be type of string, but given number.\nstack:.*?/s', () => {
    expect(inst.toString()).toMatch(
      /ParameterError: The parameter hello should be type of string, but given number.\nstack:.*?/s
    );
  });
});

describe('CreationError', () => {
  const inst = new CreationError("test");
  test("its name should be 'CreationError'", () => {
    expect(inst.name).toBe("CreationError");
  });
  test("its message should be 'test'", () => {
    expect(inst.message).toBe("test");
  });
  test("has property of `stack`", () => {
    expect(inst.stack).toBeDefined();
  });
  test("toString should return string maches for /CreationError: test\nstack:\n.*?/s", () => {
    expect(inst.toString()).toMatch(/CreationError: test\nstack:\n.*?/s);
  });

});
