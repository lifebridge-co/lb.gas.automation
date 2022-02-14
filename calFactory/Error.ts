export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchError";
  }
}

export class ParameterError extends Error {
  constructor(paramName:string, paramType:string, givenType:string) {
    super(`The parameter ${paramName} should be type of ${paramType}, but given ${givenType}.`);
    this.name = "ParameterError";
  }
}

export class CreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreationError";
  }
}
