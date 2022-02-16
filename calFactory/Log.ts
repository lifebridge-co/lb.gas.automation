export class Log{
  private logLevel: "debug"|"warn"|"error";
  constructor(logLevel:"debug"|"warn"|"error",out=Logger){
    this.logLevel = logLevel;
  }
  log(message:string, ...targets:any[]){
    if(this.logLevel === "debug"){
      Logger.log(message, ...targets);
    } else if(this.logLevel === "warn" && (this.isWarnMessage(message) || this.isErrorMessage(message))){
      Logger.log(message, ...targets);
    } else if(this.logLevel === "error" && this.isErrorMessage(message)){
      Logger.log(message, ...targets);
    }
  }
  isWarnMessage(message:string){
    const warnRegex = /warn/gim;
    return warnRegex.test(message);
  }
  isErrorMessage(message:string){
    const errorRegex = /error/gim;
    return errorRegex.test(message);
  }
}
