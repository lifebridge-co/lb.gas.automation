/// <reference path='./setting.ts'>
type LogLevel = "debug" | "warn" | "error";
export class Log {
  static readonly logLevel: LogLevel = env[env.ENV].LOG_LEVEL;
  static readonly out: { log: (...args: any[]) => void; } = env[env.ENV].LOG_TO;
  static log(message: string, ...targets: any[]) {
    if (this.logLevel === "debug") {
      this.out.log(message, ...targets);
    } else if (this.logLevel === "warn" && (this.isNoticeMessage(message) || this.isWarnMessage(message) || this.isErrorMessage(message))) {
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
  static isNoticeMessage(message: string) {
    const noticeRegex = /notice/gim;
    return noticeRegex.test(message);
  }
  static isErrorMessage(message: string) {
    const errorRegex = /error/gim;
    return errorRegex.test(message);
  }
}
