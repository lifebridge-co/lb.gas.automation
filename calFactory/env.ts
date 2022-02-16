namespace env {
  // set your sheet id here
  export const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
  export const TERM_TABLE = {
    "-": "none",
    "r": "freeBusyReader",
    "R": "reader",
    "RW": "writer",
    "RWS": "owner"
  } as const;
  export const LOG_LEVEL = "error";
  export const LOG_TO = Logger;
}
