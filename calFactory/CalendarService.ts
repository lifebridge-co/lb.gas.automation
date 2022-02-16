import { Log } from './Log';
import { CreationError, FetchError } from './Error';
import { role } from './common';
declare const exports: typeof import('./Error') & typeof import('./common') & typeof import('./Log');
exports.Log;
exports.CreationError;
exports.FetchError;
type Calendar = GoogleAppsScript.Calendar.Calendar;
type AclRule = GoogleAppsScript.Calendar.Schema.AclRule;
type CalendarWithRules = Calendar & { rules: AclRule[], name: string, id: string, toString: () => string; };

/* The `CalendarService` class is a wrapper for the Google Calendar API and other Calendar related APIs.
 *
 * @method getAllCalendars
 * @method getCalendarById
 * @method getCalendarByName
 * @method getAclRule
 * @method createCalendarWithName
 * @method createAclRule
 * @method getCount
 */
export class CalendarService {
  private count = 0;
  private calendars: CalendarWithRules[];
  private calendarToString = (name: string, id: string, ruleCnt: number) => (`calendar: { name: ${name}, id: ${id} } with ${ruleCnt}rules.`);
  constructor() {
    try {
      this.count++;
      this.calendars = CalendarApp.getAllOwnedCalendars().map((calendar) => {
        this.count++;
        const calId = calendar.getId();
        const calName = calendar.getName();
        const aclItems = Calendar.Acl!.list(calId).items ?? [];
        return Object.assign(
          calendar,
          {
            rules: aclItems,
            name: calName,
            id: calId,
            toString: this.calendarToString
          }
        );
      });
      Log.log("[Info] A new instance of CalendarService has been created. calendars: %s", this.calendars);
    } catch (err) {
      throw new FetchError(
        `Failed to instantiate CalendarService. I may failed to get the calendars or AclRules; ${err}`
      );
    }
  }
  getAllCalendars() {
    return this.calendars;
  }
  /**
   * Gets the calendar with given id string.
   * @param {string} id - The id of the calendar to be retrieved.
   * @returns {CalendarWithRules} The calendar object.
   * @throws {FetchError} If the calendar is not found.
   */
  getCalendarById(id: string): CalendarWithRules {
    for (const calendar of this.calendars) {
      if (calendar.id === id) {
        return calendar;
      }
    }
    throw new FetchError(`Failed to get the calendar; There seems no calendar with ID ${id} in your scope.`);
  }
  /**
   * Gets the calendar with the given name.
   * @param {string} name The name of the calendar to be retrieved.
   * @returns {CalendarWithRules} The calendar object.
   * @throws {FetchError} If the calendar is not found.
   */
  getCalendarByName(name: string): CalendarWithRules {
    for (const calendar of this.calendars) {
      if (calendar.name === name) {
        return calendar;
      }
    }
    throw new FetchError(`Failed to get the calendar; There seems no calendar with name ${name} in this account's scope.`);
  }
  /**
   * Get the ACL rule for the specified user
   * @param {string | CalendarWithRules} _calendar The ID of the calendar to which the ACL rule belongs.
   * @param {string} userMailAddress The email address of the target user.
   * @returns {AclRule | undefined} There's three cases.
   *  1. When the calendar has a rule for the user (AclRule object), this returns that rule.
   *  2. When not, it returns the rule (AclRule object) that says the user has no permission.
   *  3. In other case (like the calender is totally new and has no rules for any users), this returns `undefined`.
   */
  getAclRule(_calendar: string | CalendarWithRules, userMailAddress: string) {
    const calendar = (typeof _calendar === "string") ? this.getCalendarById(_calendar) : _calendar;
    const aclItems = calendar.rules;
    if (!aclItems) {
      Log.log("[Warning] Something is wrong. Failed to get the ACL rule of %s. @CalendarService.getAclRule", calendar.name);
      return undefined;
    }
    if (aclItems.length === 0) {
      Log.log("[Notice] Calendar %s does not have any Acl rules. @CalendarService.getAclRule", calendar.name);
      return undefined;
    }
    for (const item of aclItems) {
      if (item.scope?.value === userMailAddress) {
        return item;
      }
    }
    Log.log(`[Notice] Calendar ${calendar.name} does not have an Acl rule for ${userMailAddress}. Returns as "none" access role. @CalendarService.getAclRule`);
    return {
      id: `user:${userMailAddress}`,
      kind: "calendar#aclRule",
      role: "none",
      scope: { type: "user", value: userMailAddress }
    };
  }
  /**
 * Creates a calendar with the given name if it doesn't already exist.
 * @param {string} calendarName - The name of the calendar to create.
 * @returns {Calendar} The newly created calendar OR the existing calendar.
 * @throws {CreationError} If the creation try failed.
 */
  getOrCreateCalendarByName(calendarName: string): CalendarWithRules {
    try {
      const existingCal = this.getCalendarByName(calendarName);
      Log.log(`[Info] @setNewCalendar; calendar ${calendarName} exists. Skipping...`);
      return existingCal;
    } catch (e) { // If the calendar is not found.
      const _newCalendar = CalendarApp.createCalendar(calendarName);
      if (!!_newCalendar) {
        const newCalendar = Object.assign(_newCalendar,
          {
            rules: [] as AclRule[],
            name: _newCalendar.getName(),
            id: _newCalendar.getId(),
            toString: this.calendarToString
          }
        );
        this.calendars.push(newCalendar);
        Log.log("[Info] Success @setNewCalendar; Calendar: %s", newCalendar);
        return newCalendar;
      } else {
        throw new CreationError(`[Error] Failed to create a new calendar: ${calendarName}`);
      }
    }
  }
  /**
 * Creates a new ACL rule for a user when the same rule doesn't exist.
 * @param {string|CalendarWithRules} calendar - The Calendar object or calendarId to which the rule to insert.
 * @param {string} userMailAddress - The email address of the user to add to the ACL.
 * @param {role} role - The role of the user.
 * @returns The new ACL rule.
 * @throws {FetchError} If failed to create a new ACL rule.
 * @throws {Error} If other error occurred.
 *
 */
  createAclRule(calendar: string | CalendarWithRules, userMailAddress: string, role: role): AclRule {
    try {
      const calendarId = typeof calendar === "string" ? calendar : calendar.id;
      const rule = this.getAclRule(calendarId, userMailAddress);
      if (rule?.role === role) {
        Log.log("[Notice] @createAclRule; The exact Role already exists: { %s: %s }", userMailAddress, JSON.stringify(role));
        return rule;
      } else {
        const aclParam = {
          "scope": {
            "type": "user",
            "value": userMailAddress
          },
          "role": role
        };
        const newAcl = Calendar.Acl!.insert(aclParam, calendarId);
        if (!newAcl) { throw new FetchError(`Failed to create a new ACL rule for ${userMailAddress}`); }
        Log.log("[Info] Success @createAclRule; Acl: %s", { newAcl });
        return newAcl;
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error(err);
      }
    }
  }
  /**
   * Returns the value of the API count (**not so accurate**)
   * @returns The number of elements in the list.
   */
  getCount() {
    return this.count;
  }
}
