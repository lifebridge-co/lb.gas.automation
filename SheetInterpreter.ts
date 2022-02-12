import { role } from './common';
import { ParameterError, FetchError } from './Error';
declare const exports: typeof import('./Error') & typeof import('./common');
exports.FetchError;
exports.ParameterError;
type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * A type that represents the data structure of the role table.
 * @typedef {{[calsenderName: string]:{ mail: string, role: role; }[]}} RoleTable
 */
interface IRoleTable {
  [calsenderName: string]:
  { mail: string, role: role; }[];
}

/**
 *  retrieve the data from the spreadsheet and convert it into an array of arrays of cells
 * @method getRoleTable
 * @method getCalendarNamesInSheet
 */
export class SheetInterpreter {
  private table: IRoleTable;
  private calendarNamesInSheet: Array<string>;

  constructor(sheet_id: string, termTable: { [key: string]: role; }) {
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    if (!sheet) { throw new ParameterError("sheet_id", "valid Sheet Id", "invalid Sheet Id"); }
    const data = this.retrieveArrayFromSheet(sheet);
    this.calendarNamesInSheet = data[0].filter(i => i);
    this.table = Object.assign({} as IRoleTable, ...((): IRoleTable[] => (
      data.map((row, i, sheet) => { // Iterates over the rows.
        let acc: IRoleTable = {};
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
      })
    ))());
    Logger.log("A new instance of SheetInterpreter is created. roleTable: %s, calenderNamesInSheet: %s", JSON.stringify(this.table), JSON.stringify(this.calendarNamesInSheet));
  }

  /**
   * Retrieves the data from the spreadsheet and converts it into an array of arrays of cells.
   * @param {Sheet} sheet - The sheet to retrieve data from.
   * @returns {string[][]} An array of arrays of strings.
   */
  private retrieveArrayFromSheet(sheet: Sheet): string[][] {
    return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
      .getValues().map(items => items.map(item => JSON.stringify(item)))
      .filter((i) => ~~i?.length > 1);
  }
  /**
   * Gets the permission table.
   * @returns {IRoleTable} The table used to store the user roles.
   */
  getRoleTable(): IRoleTable {
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
