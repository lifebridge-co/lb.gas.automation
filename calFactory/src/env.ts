type EnvironmentSelector = "dev" | "prod";
type LogLevel = "debug" | "warn" | "error";

namespace Env {
  // Set the environment here!
  export const mode: EnvironmentSelector = "prod";

  export namespace prod {
    // set your sheet id
    export const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
    export const SHEET_NAME = "prod";
    export const DRIVE_FOLDER_ID="1xSS56Rti8x60rqTpaJnP5ojCgmbCFLy8";
    export const LOG_LEVEL: LogLevel = "error";
    export const LOG_TO = Logger;
    export const TERM_TABLE = {
      "-": "none",
      "ー": "none",
      "r": "freeBusyReader",
      "R": "reader",
      "RW": "writer",
      "RWS": "owner"
    } as const;
  };

  export namespace dev {
    export const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
    export const SHEET_NAME = "test";
    export const DRIVE_FOLDER_ID="1xSS56Rti8x60rqTpaJnP5ojCgmbCFLy8";
    export const LOG_LEVEL: LogLevel = "debug";
    export const LOG_TO = Logger;
  export const TERM_TABLE = {
    "-": "none",
    "ー": "none",
    "r": "freeBusyReader",
    "R": "reader",
    "RW": "writer",
    "RWS": "owner"
  } as const;
  };
};
