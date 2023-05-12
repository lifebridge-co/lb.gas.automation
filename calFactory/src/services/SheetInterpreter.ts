import type {Role} from '../types';
import {ParameterError, FetchError} from '../utils/Error';
import {Log} from '../utils/Log';
declare const exports: typeof import('../utils/Error') & typeof import('../types') & typeof import('../utils/Log');
exports.FetchError;
exports.ParameterError;
exports.Log;
export type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * A type that represents the data structure of the role table.
 */
interface IRuleTable {
  [calendarName: string]: {mail: string; role: Role}[];
}

/**
 * @class
 * @classdesc Interpreter for GoogleSpreadSheet. Converts the data to string Arrays.
 */
export class SheetInterpreter {
  private readonly ROLE_LIST: Role[] = ['none', 'freeBusyReader', 'reader', 'writer', 'owner'];
  private table: IRuleTable;
  private calendarNamesInSheet: Array<string>;

  constructor(sheetId: string, sheetName: string, termTable: {[key: string]: Role}) {
    Object.entries(termTable).forEach(([key, value]) => {
      // param check
      if (!this.ROLE_LIST.includes(value)) {
        throw new ParameterError('termTable', 'role', `${value}`);
      }
    });
    const spreadSheet = SpreadsheetApp.openById(sheetId);
    if (!spreadSheet) {
      throw new ParameterError('sheet_id', 'valid SpreadSheet Id', 'invalid SpreadSheet Id');
    }
    const sheet = spreadSheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new FetchError(`There is no sheet named "${sheetName}" . Sheet not found.`);
    }

    const data = this.retrieveArrayFromSheet(sheet);
    this.calendarNamesInSheet = data[0].filter((item,i) => item&&i>0);
    this.table = data
      .map((row, i, sheet) => { // Iterate over the rows; Returns IRoleTable[][]
        let acc: IRuleTable = {};
        row.forEach((cell, j) => {
          // Iterate over the cell for each row.
          if (i === 0) {
            return;
          } // The first row of each cell is the header. i.e. calendar name.
          if (j === 0) {
            return;
          } // The first column of each cell is the user email address.
          const calendarName = sheet[0][j];
          const userMail = row[0]; // same as `sheet[i][0]`
          const role = cell in termTable ? (`${termTable[cell]}` as const) : 'none';
          const existingRole = acc[calendarName] ?? [];
          acc = {
            ...acc,
            [calendarName]: [...(existingRole as {mail: string; role: Role}[]), {mail: userMail, role: role}],
          };
        });
        return acc;
      })
      .reduce((acc, ruleTable) => {
        // Iterates over IRoleTable[][]; Returns IRuleTable[].
        Object.entries(ruleTable).forEach(([calendarName, rules]) => {
          acc[calendarName] = [...(acc[calendarName] ?? []), ...rules];
        });
        return acc;
      });
    Log.log(
      '[Info] A new instance of SheetInterpreter is created. ruleTable: %s, calendarNamesInSheet: %s',
      JSON.stringify(this.table),
      JSON.stringify(this.calendarNamesInSheet)
    );
  }

  /**
   * Retrieves the data from the spreadsheet and converts it into an array of arrays of cells.
   * @param {Sheet} sheet - The sheet to retrieve data from.
   * @returns {string[][]} An array of arrays of strings.
   * @memberof SheetInterpreter
   */
  private retrieveArrayFromSheet(sheet: Sheet): string[][] {
    return sheet
      .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
      .getValues()
      .filter(i => ~~i?.length > 1); // not `false`, `null`, `NaN`, `""`, `0`, `Infinit`, `[]`, `{}`, nor `undefined`
  }
  /**
   * Gets the permission table.
   * @returns {IRuleTable} The table used to store the user roles.
   * @memberof SheetInterpreter
   */
  getRuleTable(): IRuleTable {
    return this.table;
  }
  /**
   * Gets the names of the calendars in the sheet.
   * @memberof SheetInterpreter
   * @returns {Array<string>} The list of calendar names in the sheet.
   */
  getCalendarNamesInSheet(): Array<string> {
    return this.calendarNamesInSheet;
  }
}
