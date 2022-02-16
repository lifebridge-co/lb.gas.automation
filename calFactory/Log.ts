/// <reference path='./env.ts'>
type LogLevel = "debug" | "warn" | "error";
export class Log {
  static readonly logLevel: LogLevel= env.LOG_LEVEL;
  static readonly out: { log: (...args:any[]) => void; }= env.LOG_TO;
  static log(message: string, ...targets: any[]) {
    if (this.logLevel === "debug") {
      this.out.log(message, ...targets);
    } else if (this.logLevel === "warn" && (this.isWarnMessage(message) || this.isErrorMessage(message))) {
      this.out.log(message, ...targets);
    } else if (this.logLevel === "error" && this.isErrorMessage(message)) {
      this.out.log(message, ...targets);
    }
  }
  static message(message: string) {
    this.out.log(`message: ${message}`);
  }
  static isWarnMessage(message: string) {
    const warnRegex = /warn/gim;
    return warnRegex.test(message);
  }
  static isErrorMessage(message: string) {
    const errorRegex = /error/gim;
    return errorRegex.test(message);
  }
}
