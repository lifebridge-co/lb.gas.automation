import { ParameterError } from './Error';
/// <reference path='./setting.ts'>
type LogLevel = "debug" | "warn" | "error";
/**
 *
 * @property logLevel
 * @property logger
 * @method log
 * @method message
 * @method
 */
export class Log {
  static readonly logLevel: LogLevel = Env[Env.mode].LOG_LEVEL;
  static readonly logger: { log: (...args: any[]) => void; } = Env[Env.mode].LOG_TO;
  static log(message: string, ...targets: any[]) {
    if (this.logLevel === "debug") {
      this.logger.log(message, ...targets);
    } else if (this.logLevel === "warn" && (this.isNoticeMessage(message) || this.isWarnMessage(message) || this.isErrorMessage(message))) {
      this.logger.log(message, ...targets);
    } else if (this.logLevel === "error" && this.isErrorMessage(message)) {
      this.logger.log(message, ...targets);
    }
  }
  static message(message: string) {
    this.logger.log(`message: ${message}`);
  }
  /**
   * It splits the message into lines by line. And logs each line.
   * @param {string} message The message to log.
   * @param { lines=1, delimiters = ["\n"] }
   */
  static logLineByLine(message: string, options?: { lines?: number, delimiters?: string[]; }) {
    const { lines = 1, delimiters = ["\n"] } = options ?? {};
    if (~~lines <= 0 || lines !== ~~lines) { throw new ParameterError("lines", "integer gt zero", "not integer , a minus or the number of zero."); }
    const splitted = delimiters.flatMap(delim => [delim, ...message.split(delim)]); // Split
    (() => { // Log
      let accum = "";
      let delim = delimiters[0];
      splitted.forEach((str, i, arr) => {
        if (delimiters.includes(str)) { delim = str; return; }
        if ((i + 1) % lines === 0 || i === arr.length - 1) {
          console.log(accum + delim + str);
          accum = "";
        } else {
          accum += delim + str;
        }
      });
    })();
  }
  private static isWarnMessage(message: string) {
    const warnRegex = /warn/gim;
    return warnRegex.test(message);
  }
  private static isNoticeMessage(message: string) {
    const noticeRegex = /notice/gim;
    return noticeRegex.test(message);
  }
  private static isErrorMessage(message: string) {
    const errorRegex = /error/gim;
    return errorRegex.test(message);
  }
}
