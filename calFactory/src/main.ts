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
import { CalendarService, CalendarWithRules } from "./CalendarService";
import { SheetInterpreter } from "./SheetInterpreter";
import { Log } from './Log';
import { Drive } from './Drive';
declare const exports: typeof import('./CalendarService') & typeof import('./SheetInterpreter') & typeof import('./Log') & typeof import('./Drive');
exports.CalendarService;
exports.SheetInterpreter;
exports.Log;
exports.Drive;

const main = () => {
  const time01 = Date.now();
  const env = Env[Env.mode];
  const sheetInterpreter = new SheetInterpreter(env.SHEET_ID, env.SHEET_NAME, env.TERM_TABLE);
  const calendarService = new CalendarService();

  const initialState: string = calendarService.toJson();

  sheetInterpreter.getCalendarNamesInSheet().forEach(calName => {
    try {
      const cal = calendarService.getOrCreateCalendarWithName(calName);
      Log.message(`@main calender: ${calName}`);
      const givenRules = sheetInterpreter.getRuleTable();
      Log.log("@main givenRules: %s", { givenRules });

      givenRules[calName]?.forEach(rule => {
        const result = calendarService.createAclRule(cal, rule.mail, rule.role);
        Log.log("@main: new rule inserted. %s", { result });
      });
      Log.message(`@main Finished setting: ${calName} (${cal.id})`);
    } catch (err) {
      Log.log("Error caught @main :%s", { err });
    }
  });

  Log.message(`@main: Finished.\n\n||============|results|============||`);
  Log.message(`intput:`);
  Log.logLineByLine(initialState,{lines:6});
  calendarService.renew();
  const closingState = calendarService.toJson();
  Log.message(`output:`);
  Log.logLineByLine(closingState,{lines:6})
  Log.message(`Calender API call: ${calendarService.getCount()} times`);
  Drive.saveToDrive(env.DRIVE_FOLDER_ID, `log${new Date().toISOString()}_01before.log`, "before:\n\n" + initialState);
  Drive.saveToDrive(env.DRIVE_FOLDER_ID, `log${new Date().toISOString()}_02after.log`, "after:\n\n" + closingState);
  const time02 = Date.now();
  Log.message(`time: ${(time02 - time01) / 1000}s.`);
};

