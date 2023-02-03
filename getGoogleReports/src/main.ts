/// <reference path='./env.ts'>
import { CalendarService } from './services/CalendarService';
import { SheetInterpreter } from './services/SheetInterpreter';
import { Log } from './utils/Log';
import {Drive} from './services/Drive';
import * as u from './utils/deepEqual';
const { deepEqual } = u;
declare const exports: typeof import('./services/CalendarService') &
  typeof import('./services/SheetInterpreter') &
  typeof import('./utils/Log') &
  typeof import('./services/Drive') & typeof deepEqual;


exports.CalendarService;
exports.SheetInterpreter;
exports.Log;
exports.Drive;
// @ts-ignore
exports.deepEqual;
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
 * @author Yoshinori Yokoyama (https://github.com/nominalrune)
 */
const main = async () => {
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
      Log.log('@main givenRules: %s', { givenRules });

      givenRules[calName]?.forEach(rule => {
        const result = calendarService.createAclRule(cal, rule.mail, rule.role);
        Log.log('@main: new rule inserted. %s', { result });
      });
      Log.message(`@main Finished setting: ${calName} (${cal.id})`);
    } catch (err) {
      Log.log('Error caught @main :%s', { err });
    }
  });

  Log.message('@main: Finished.\n\n||============|results|============||');
  calendarService.renew();
  const closingState = calendarService.toJson();
  const asExpected = deepEqual(initialState, closingState);
  if (asExpected) {
    Log.message('@main: SUCCESS.');
    Log.logLineByLine(closingState, { lines: 6 });
    Drive.saveToDrive(env.DRIVE_FOLDER_ID, `log${new Date().toISOString()}.log`, closingState);
  } else {
    Log.message('@main: ERROR. The result is different from expected');
    Log.message('intput:');
    Log.logLineByLine(initialState, { lines: 6 });
    Log.message('output:');
    Log.logLineByLine(closingState, { lines: 6 });
    Drive.saveToDrive(env.DRIVE_FOLDER_ID, `log${new Date().toISOString()}.log`, 'before:\n\n' + initialState+'after:\n\n' + closingState);
  }
  Log.message(`Calender API call: ${calendarService.getCount()} times`);
  const time02 = Date.now();
  Log.message(`time: ${(time02 - time01) / 1000}s.`);
};
