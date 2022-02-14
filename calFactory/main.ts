/**　CalFactory
 *
 * give a sheet with which the user permissions to set,
 * in the following format:
 * +-----------------+--------------------+--------------------+
 * |                 | calendarName01     | calendarName02     |
 * +-----------------+--------------------+--------------------+
 * | userMailAddress | permissionNotation | permissionNotation |
 * | userMailAddress | permissionNotation | permissionNotation |
 * | userMailAddress | permissionNotation | permissionNotation |
 * +-----------------+--------------------+--------------------+
 *
 * where `permissionNotation` is one of the following:
 * - "-"
 * - "r"
 * - "R"
 * - "RW"
 * - "RWS"
 *
 * You will need to allow this script to access the sheet and the Gooogle Calendar service.
 *
 * @version v0.0.3
 * @license Reserved
 * This script is to used by the person or organization the author acknowledges to do so.
 * 2022-02-12
 * @author Yoshinori Yokoyama (https://github.com/nominalrune)
 */

import { CalendarService } from "./CalendarService";
import { SheetInterpreter } from "./SheetInterpreter";
declare const exports: typeof import('./CalendarService') & typeof import('./SheetInterpreter');
exports.CalendarService;
exports.SheetInterpreter;

// set your sheet id here
const SHEET_ID = "1zYdz1_vGapDEvQxfM-AB3IBMZbcPDwuakfeKdYI4n7k";
const TERM_TABLE = {
  "-": "none",
  "r": "freeBusyReader",
  "R": "reader",
  "RW": "writer",
  "RWS": "owner"
} as const;

const main = () => {
  const sheetInterpreter = new SheetInterpreter(SHEET_ID, TERM_TABLE);
  const calendarService = new CalendarService();
  sheetInterpreter.getCalendarNamesInSheet().map(calName => {
    try {
      const cal = calendarService.createCalendarWithName(calName);
      Logger.log("@main calender: %s", cal.getName());
      const givenRules = sheetInterpreter.getRuleTable();
      Logger.log("@main givenRules: %s",{ givenRules });

      givenRules[calName]?.map(rule => {
        const result = calendarService.createAclRule(cal, rule.mail, rule.role);
        Logger.log("@main: new rule inserted. %s", { result });
      });
    } catch (err) {
      Logger.log("Error caught @main :%s", { err });
    }
  });
};

