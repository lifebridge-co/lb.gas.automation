/// <reference path='./env.ts'>
type LogLevel = "debug" | "warn" | "error";
export class Log {
  private logLevel: LogLevel;
  private out: { log: (...args) => void; };
  constructor(logLevel: LogLevel = env.LOG_LEVEL, out = env.LOG_TO) {
    this.logLevel = logLevel;
    this.out = out;
  }
  log(message: string, ...targets: any[]) {
    if (this.logLevel === "debug") {
      this.out.log(message, ...targets);
    } else if (this.logLevel === "warn" && (this.isWarnMessage(message) || this.isErrorMessage(message))) {
      this.out.log(message, ...targets);
    } else if (this.logLevel === "error" && this.isErrorMessage(message)) {
      this.out.log(message, ...targets);
    }
  }
  message(message: string) {
    this.out.log(`message: ${message}`);
  }
  isWarnMessage(message: string) {
    const warnRegex = /warn/gim;
    return warnRegex.test(message);
  }
  isErrorMessage(message: string) {
    const errorRegex = /error/gim;
    return errorRegex.test(message);
  }
}
