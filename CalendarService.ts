import { CreationError, FetchError } from './Error';
import { role } from './common';
declare const exports: typeof import('./Error')&typeof import('./common');
exports.FetchError;
exports.CreationError;

type Calendar = GoogleAppsScript.Calendar.Calendar;
type AclRule = GoogleAppsScript.Calendar.Schema.AclRule;
type CalendarWithRules = Calendar & { rules: AclRule[]; };

/* The `CalendarService` class is a wrapper for the Google Calendar API and other Calender related APIs.
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
  constructor() {
    try {
      this.count++;
      this.calendars = CalendarApp.getAllOwnedCalendars().map((calendar) => {
        this.count++;
        const aclItems = Calendar.Acl?.list(calendar.getId()).items ?? [];
        return Object.assign(calendar, { rules: aclItems });
      });
      Logger.log("A new instance of CalendarService has been created. calenders: %s", JSON.stringify(this.calendars));
    } catch (err) {
      throw new FetchError(
        `Failed to instantiate CalendarService. I may failed to get the calendars or AclRules; ${err}`
      );
    }
  }
  /**
   * Gets the calendar with given id string.
   * @param {string} id - The id of the calendar to be retrieved.
   * @returns {CalendarWithRules} The calendar object.
   * @throws {FetchError} If the calendar is not found.
   */
  getCalendarById(id: string): CalendarWithRules {
    for (const calendar of this.calendars) {
      if (calendar.getId() === id) {
        return calendar;
      }
    }
    throw new FetchError(`Failed to get the calendar; There seems no calender with ID ${id} in your scope.`);
  }
  /**
   * Gets the calendar with the given name.
   * @param {string} name - The name of the calendar to be retrieved.
   * @returns {CalendarWithRules} The calendar object.
   * @throws {FetchError} If the calendar is not found.
   */
  getCalendarByName(name: string): CalendarWithRules {
    for (const calendar of this.calendars) {
      if (calendar.getName() === name) {
        return calendar;
      }
    }
    throw new FetchError(`Failed to get the calendar; There seems no calender with name ${name} in this account's scope.`);
  }
  /**
   * Get the ACL rule for the specified user
   * @param {string} calendarId - The ID of the calendar to which the ACL rule belongs.
   * @param {string} userMailAddress - The email address of the target user.
   * @returns The ACL rule.
   * @throws {FetchError} If the ACL rule is not found.
   */
  getAclRule(calendar: string | CalendarWithRules, userMailAddress: string) {
    const calendarId = typeof calendar === "string" ? calendar : calendar.getId();
    const aclItems = Calendar.Acl!.list(calendarId).items;
    if (!aclItems || aclItems.length === 0) { return; }
    for (const item of aclItems) {
      if (item.scope?.value === userMailAddress) {
        return item;
      }
    }
    throw new FetchError("Failed to get the ACL rule.");
  }
  /**
 * Creates a calendar with the given name if it doesn't already exist
 * @param {string} calendarName - The name of the calendar to create.
 * @returns {Calendar} The newly created calendar OR the existing calendar.
 * @throws {CreationError} If the creation try failed.
 */
  createCalendarWithName(calendarName: string): CalendarWithRules {
    try {
      Logger.log("@setNewCalendar; calendar ${calenderName} exists. Skipping...");
      return this.getCalendarByName(calendarName);
    } catch (e) {
      const newCalendar = CalendarApp.createCalendar(calendarName);
      if (!!newCalendar) {
        Logger.log("Success @setNewCalendar; Calendar: %s", newCalendar);
        return Object.assign(newCalendar, { rules: [] as AclRule[] });
      } else {
        throw new CreationError(`Failed to create a new calendar: ${calendarName}`);
      }
    }
  }
  /**
 * Creates a new ACL rule for a user when the same rule doesn't exist.
 * @param {string|CalendarWithRules} calendar - The Calender object or calendarId to which the rule to insert.
 * @param {string} userMailAddress - The email address of the user to add to the ACL.
 * @param {role} role - The role of the user.
 * @returns The new ACL rule.
 * @throws {FetchError} If failed to create a new ACL rule.
 * @throws {Error} If other error occurred.
 *
 */
  createAclRule(calendar: string | CalendarWithRules, userMailAddress: string, role: role): AclRule {
    try {
      const calendarId = typeof calendar === "string" ? calendar : calendar.getId();
      const _role = this.getAclRule(calendarId, userMailAddress);
      if (_role?.role === role) {
        Logger.log("Notice @createAclRule; The exact Role already exists: { %s: %s }", userMailAddress, role);
        return _role;
      } else {
        const aclParam = {
        "scope": {
          "type": "user",
          "value": userMailAddress
        },
        "role": role
      };
        const newAcl = Calendar.Acl!.insert(aclParam, calendarId);
        Logger.log("Success @createAclRule; Acl: %s", newAcl);
        return newAcl;
      }} catch (err) {
        if(err instanceof Error) {
        throw err;
        }else{
        throw new Error(JSON.stringify(err))
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
