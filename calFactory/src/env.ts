type Env = "dev" | "prod";
type LogLevel = "debug" | "warn" | "error";

namespace env {
  export const ENV:Env="prod";

  export namespace prod {
    // set your sheet id here
    export const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
    export const TERM_TABLE = {
      "-": "none",
      "r": "freeBusyReader",
      "R": "reader",
      "RW": "writer",
      "RWS": "owner"
    } as const;
    export const LOG_LEVEL:LogLevel = "error";
    export const LOG_TO = Logger;
  };

  export namespace dev {
    // set your sheet id here
    export const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
    export const TERM_TABLE = {
      "-": "none",
      "r": "freeBusyReader",
      "R": "reader",
      "RW": "writer",
      "RWS": "owner"
    } as const;
    export const LOG_LEVEL:LogLevel = "debug";
    export const LOG_TO = Logger;
  };
};
