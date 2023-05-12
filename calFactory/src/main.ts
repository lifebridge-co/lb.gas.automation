/// <reference path='./env.ts'>
import { CalendarService } from './services/CalendarService';
import { SheetInterpreter } from './services/SheetInterpreter';
import { Log } from './utils/Log';
import { Drive } from './services/Drive';
declare const exports: typeof import('./services/CalendarService') &
  typeof import('./services/SheetInterpreter') &
  typeof import('./utils/Log') &
  typeof import('./services/Drive');


exports.CalendarService;
exports.SheetInterpreter;
exports.Log;
exports.Drive;
/**
 * @file  CalFactory
 * @description a sheet with which the user permissions to set,\
 * in the following format:
 * ```
 * +-----------------+--------------------+--------------------+
 * |                 | calendarName01     | calendarName02     |
 * +-----------------+--------------------+--------------------+
 * | userMailAddress | permissionNotation | permissionNotation |
 * | userMailAddress | permissionNotation | permissionNotation |
 * | userMailAddress | permissionNotation | permissionNotation |
 * +-----------------+--------------------+--------------------+
 * ```
 * where `permissionNotation` is one of the following:
 * - "-"
 * - "r"
 * - "R"
 * - "RW"
 * - "RWS"
 * Set any options at `env.ts` file.
 *
 * @version v0.0.4
 * @license Reserved
 * This script is to used by the person or organization the author acknowledges to do so.
 * 2022-02-12
 * @author Yoshinori Yokoyama @lb-yokoyama
 */
const main = async () => {
  const time01 = Date.now();
  const env = Env[Env.mode];
  const sheetInterpreter = new SheetInterpreter(env.SHEET_ID, env.SHEET_NAME, env.TERM_TABLE);
  let wait = 300;

  const calendarService = new CalendarService();
  Utilities.sleep(wait);
  // const initialState: string = calendarService.toJson();

  sheetInterpreter.getCalendarNamesInSheet().forEach(calName => {
    try {

      const cal = calendarService.getOrCreateCalendarWithName(calName);
      Log.message(`@main calender: ${calName}`);
      const givenRules = sheetInterpreter.getRuleTable();
      Log.log('@main givenRules: %s', { givenRules });

      givenRules[calName]?.forEach(rule => {
        let retry = 0, newRule = undefined;
        while (!newRule && retry < 6) {
          try {
            const { rule: _rule, created } = calendarService.createAclRule(cal, rule.mail, rule.role);
            newRule=_rule;
            if (created) {
              Utilities.sleep(wait);
              Log.message(`@main: new rule inserted. ${newRule.id}, ${newRule.role}`);
            }
            break;
          } catch (e) {
            retry++;
            wait += 500;
            const waitForRetry = 3000 + 1000 * (retry ** retry);
            Log.message(`@main: err. retrying to insert acl in next ${waitForRetry / 1000} seconds. (retry count:${retry}) ${e}`)
            Utilities.sleep(waitForRetry);
          }
        }
        if (!newRule) throw new Error(`failed to insert acl rule after 5 retries.`);

      });
      Log.message(`@main Finished setting: ${calName} (${cal.id})`);
    } catch (err) {
      Log.log('Error caught @main :%s', err);
      return;
    }
  });

  Log.message('@main: Finished.\n\n============results============');
  calendarService.renew();
  const closingState = calendarService.toJson();
  Log.message(`intput:`);
  Log.message(JSON.stringify(sheetInterpreter.getRuleTable()));
  Log.message(`output:`);
  Log.logLineByLine(closingState, { lines: 10 });
  Log.message(`Calender API call: ${calendarService.getCount()} times`)
  Drive.saveToDrive(env.DRIVE_FOLDER_ID, `log${new Date().toISOString()}.log`, closingState);
  const time02 = Date.now();
  Log.message(`time: ${(time02 - time01) / 1000}s.`);
};
