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
 * Set any options at `env.ts` file.
 *
 * @version v0.0.4
 * @license Reserved
 * This script is to used by the person or organization the author acknowledges to do so.
 * 2022-02-12
 * @author Yoshinori Yokoyama (https://github.com/nominalrune)
 */

/// <reference path='./env.ts'>
import { CalendarService } from "./CalendarService";
import { SheetInterpreter } from "./SheetInterpreter";
import { Log } from './Log';
declare const exports: typeof import('./CalendarService') & typeof import('./SheetInterpreter') & typeof import('./Log');
exports.CalendarService;
exports.SheetInterpreter;
exports.Log;


const main = () => {
  const sheetInterpreter = new SheetInterpreter(env.SHEET_ID, env.TERM_TABLE);
  const calendarService = new CalendarService();
  sheetInterpreter.getCalendarNamesInSheet().forEach(calName => {
    try {
      const cal = calendarService.getOrCreateCalendarByName(calName);
      Log.message(`@main calender: ${calName} (${cal.getName()})`);
      const givenRules = sheetInterpreter.getRuleTable();
      Log.log("@main givenRules: %s", { givenRules });

      givenRules[calName]?.forEach(rule => {
        const result = calendarService.createAclRule(cal, rule.mail, rule.role);
        Log.log("@main: new rule inserted. %s", { result });
      });
    } catch (err) {
      Log.log("Error caught @main :%s", { err });
    }
  });
  Log.message(`@main: Finished. \n\n------results------\ninput:${sheetInterpreter.getRuleTable()}\n\noutput:${calendarService.getAllCalendars().map(cal => cal.toString()+"\n{ "+cal.rules.map(rule => rule.scope?.value+":"+rule.role).join(","))} }`);
};

