import type { role } from './common';
import { ParameterError, FetchError } from './Error';
declare const exports: typeof import('./Error') & typeof import('./common');
exports.FetchError;
exports.ParameterError;

type Sheet = GoogleAppsScript.Spreadsheet.Sheet;
const ROLE_LIST:role[] = ["none", "freeBusyReader", "reader", "writer", "owner"];

/**
 * A type that represents the data structure of the role table.
 * @typedef {{[calsenderName: string]:{ mail: string, role: role; }[]}}
 */
interface IRuleTable {
  [calsendarName: string]:
  { mail: string, role: role; }[];
}

/**
 *  This class is for reading GoogleSpreadSheet and convert it to string Arrays.
 * @method getRuleTable
 * @method getCalendarNamesInSheet
 */
export class SheetInterpreter {
  private table: IRuleTable;
  private calendarNamesInSheet: Array<string>;

  constructor(sheet_id: string, termTable: { [key: string]: role; }) {
    Object.entries(termTable).forEach(([key, value]) => { // param check
      if (!ROLE_LIST.includes(value)) { throw new ParameterError("termTable", "role", `${value}`); }
    });
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    if (!sheet) { throw new ParameterError("sheet_id", "valid Sheet Id", "invalid Sheet Id"); }

    const data = this.retrieveArrayFromSheet(sheet);
    this.calendarNamesInSheet = data[0].filter(i => i);
    this.table = data.map((row, i, sheet) => { // Iterates over the rows; Returns IRoleTable[][]
      let acc: IRuleTable = {};
      row.forEach((cell, j) => { // Iterates over the cell for each row.
        if (i === 0) { return; } // The first row of each cell is the header. i.e. calendar name.
        if (j === 0) { return; } // The first column of each cell is the user email address.
        const calendarName = sheet[0][j];
        const userMail = row[0]; // same as `sheet[i][0]`
        const role = cell in termTable ? `${termTable[cell]}` as const : "none";
        const existingRole = acc[calendarName] ?? [];
        acc = { ...acc, [calendarName]: [...existingRole as { mail: string, role: role; }[], { mail: userMail, role: role }] };
      });
      return acc;
    }).reduce((acc, ruleTable) => { // Iterates over IRoleTable[][]; Returns IRuleTable[].
      Object.entries(ruleTable).forEach(([calendarName, rules]) => {
        acc[calendarName] = [...(acc[calendarName] ?? []), ...rules];
      });
      return acc;
    });
    Logger.log("A new instance of SheetInterpreter is created. ruleTable: %s, calendarNamesInSheet: %s", JSON.stringify(this.table), JSON.stringify(this.calendarNamesInSheet));
  }

  /**
   * Retrieves the data from the spreadsheet and converts it into an array of arrays of cells.
   * @param {Sheet} sheet - The sheet to retrieve data from.
   * @returns {string[][]} An array of arrays of strings.
   */
  private retrieveArrayFromSheet(sheet: Sheet): string[][] {
    return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
      .getValues()
      .filter((i) => ~~i?.length > 1);
  }
  /**
   * Gets the permission table.
   * @returns {IRuleTable} The table used to store the user roles.
   */
  getRuleTable(): IRuleTable {
    return this.table;
  }
  /**
   * Gets the names of the calendars in the sheet.
   * @returns {Array<string>} The list of calendar names in the sheet.
   */
  getCalendarNamesInSheet(): Array<string> {
    return this.calendarNamesInSheet;
  }
}
