/**
 * @class
 * @classdesc an error on fetching something.
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name "FetchError".
 */
export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
    this.stack=this.stack??"(no stack recorded)";
  }
  override toString() {
    return `${this.name}: ${this.message}\nstack:\n${this.stack}`;
  }
}

/**
 *
 * @export
 * @class ParameterError
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name "ParameterError".
 */
export class ParameterError extends Error {
  constructor(paramName: string, paramType: string, givenType: string) {
    super(`The parameter ${paramName} should be type of ${paramType}, but given ${givenType}.`);
    this.name = 'ParameterError';
    this.stack=this.stack||"(no stack recorded)";
  }
  override toString(): string {
    return `${this.name}: ${this.message}\nstack:\n${this.stack}`;
  }
}

/**
 *
 * @export
 * @class CreationError
 * @extends {Error}
 * @property {string} message - The error message.
 * @property {string} name - The error name "CreationError".
 */
export class CreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreationError';
    this.stack=this.stack||"(no stack recorded)";
  }
  override toString() {
    return `${this.name}: ${this.message}\nstack:\n${this.stack}`;
  }
}
