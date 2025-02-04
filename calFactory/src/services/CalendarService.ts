import {Log} from '../utils/Log';
import {CreationError, FetchError} from '../utils/Error';
import {Role} from '../types';
declare const exports: typeof import('../utils/Error') & typeof import('../types') & typeof import('../utils/Log');
exports.Log;
exports.CreationError;
exports.FetchError;
export type Calendar = GoogleAppsScript.Calendar.Calendar;
export type AclRule = GoogleAppsScript.Calendar.Schema.AclRule;
export interface CalendarWithRules{rules: AclRule[]; name: string; id: string; toString: () => string};
// export type CalendarWithRules =  {rules: AclRule[]; name: string; id: string; toString: () => string};

class _Calendar implements CalendarWithRules{
    rulesCnt:number|undefined;
    __rules:AclRule[]|undefined;
    get rules(){
      if(!this.__rules){
        this.__rules = Calendar.Acl!.list(this.id).items ?? [];
        this.rulesCnt = this.__rules.length;
      }
      return this.__rules;
    }
    name;
    id ;
    toString(){
      return `"calendar": { "name":"${this.name}", "id":"${this.id}" } with ${this.rulesCnt??'?'} rules.`
    }
        constructor(calendar: Calendar){
        this.id = calendar.getId();
        this.name = calendar.getName();
        Object.getOwnPropertyNames(calendar)
        }
}


/**
 * @class
 * @classdesc The `CalendarService` class is a wrapper service for Google Calendar API. Handles Calendar , CalendarApp and AclRule class.
 */
export class CalendarService {
  private count = 0;
  private calendars: CalendarWithRules[];
  private calendarToString = (name: string, id: string, ruleCnt: number) => () => `"calendar": { "name":"${name}", "id":"${id}" } with ${ruleCnt} rules.`;

  constructor() {
    this.calendars = this.fetchAllCalendars();
    Log.log('[Info] A new instance of CalendarService has been created. calendars: %s', this.calendars);
  }
  /**
   * To json
   * @returns {string} The json string.
   */
  toJson(): string {
    return `{\n${this.calendars
      .map(
        cal =>
          `\t"${cal.name}":{\n\t\t"id":"${cal.id}",\n\t\t"rules":{${cal.rules
            .map(rule => `\n\t\t\t"${rule.scope?.value}":"${rule.role}"`)
            .join(',')}},\n\t}`
      )
      .join(',\n')}\n}`;
  }
  /**
   * Returns all the calendars from the Google Calendar API.
   * @returns {CalendarWithRules[]} An array of calendars.
   * @throws {FetchError} When failed to fetch calendar data.
   */
  private fetchAllCalendars(): CalendarWithRules[] {
    try {
      this.count++;
      const _calendars = CalendarApp.getAllOwnedCalendars()?.map(calendar => {
        this.count++;
        Utilities.sleep(100);
        return new _Calendar(calendar);
      });
      if (!_calendars?.length) {
        // if undefined or 0.
        throw new FetchError('Failed to fetch calenders from Calender API.');
      }
      return _calendars;
    } catch (err) {
      throw new FetchError(`Failed to fetch calenders (or AclRules) from Calender API. details: ${err}`);
    }
  }
  /**
   * Fetches all the calendars from the Google Calendar API.
   * @returns {CalendarWithRules[]} The calendars array.
   */
  renew(): CalendarWithRules[] {
    this.calendars = this.fetchAllCalendars();
    return this.calendars;
  }
  /**
   * Returns all the calendars from the Google Calendar API.
   * Note that they're in memory cashed.
   * To get the newest online state, use `renew` method.
   * @returns {CalendarWithRules[]} An array of calendars.
   */
  getAllCalendars(): CalendarWithRules[] {
    return this.calendars;
  }
  /**
   * Gets the calendar with given id string.
   * @param {string} id  The id of the calendar to get.
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
   * @param {string} name The name of the calendar to get.
   * @returns {CalendarWithRules} The calendar object.
   * @throws {FetchError} If the calendar is not found.
   */
  getCalendarByName(name: string): CalendarWithRules {
    for (const calendar of this.calendars) {
      if (calendar.name === name) {
        return calendar;
      }
    }
    throw new FetchError(
      `Failed to get the calendar; There seems no calendar with name ${name} in this account's scope.`
    );
  }
  /**
   * Get the ACL rule for the specified user
   * @param {string | CalendarWithRules} _calendar The ID of the calendar to which the ACL rule belongs.
   * @param {string} userMailAddress The email address of the target user.
   * @returns {AclRule | undefined} There're three cases.
   *  1. When the calendar has a rule for the user (AclRule object), returns that rule.
   *  2. When not, it returns the rule (AclRule object) that says the user has no permission.
   *  3. In other case (like the calender is totally new and has no rules for any users), this returns `undefined`.
   */
  getAclRule(_calendar: string | CalendarWithRules, userMailAddress: string): AclRule | undefined {
    const calendar = typeof _calendar === 'string' ? this.getCalendarById(_calendar) : _calendar;
    const aclItems = calendar.rules;
    if (!aclItems) {
      Log.log(
        '[Error] Something is wrong. Failed to get the ACL rule of %s. @CalendarService.getAclRule',
        calendar.name
      );
      return undefined;
    }
    if (aclItems.length === 0) {
      Log.log('[Notice] Calendar %s does not have any Acl rules. @CalendarService.getAclRule', calendar.name);
      return undefined;
    }
    for (const item of aclItems) {
      if (item.scope?.value === userMailAddress) {
        return item;
      }
    }
    Log.log(
      `[Notice] Calendar ${calendar.name} does not have an Acl rule for ${userMailAddress}. Returns as "none" access role. @CalendarService.getAclRule`
    );
    return {
      id: `user:${userMailAddress}`,
      kind: 'calendar#aclRule',
      role: 'none',
      scope: {type: 'user', value: userMailAddress},
    };
  }
  /**
   * Ges a calendar by name. If not exist.
   * @param {string} calendarName - The name of the calendar to create.
   * @returns {Calendar} The newly created calendar.
   * @throws {CreationError} If the creation try failed.
   */
  createCalendarWithName(calendarName: string): CalendarWithRules {
    this.count++;
    const _newCalendar = CalendarApp.createCalendar(calendarName);
    Utilities.sleep(100);
    if (_newCalendar) {
      const newCalendar =new _Calendar(_newCalendar);
      this.calendars.push(newCalendar);
      Log.log('[Info] Success @setNewCalendar; Calendar: %s', newCalendar);
      return newCalendar;
    } else {
      throw new CreationError(`Failed to create a new calendar: ${calendarName}`);
    }
  }
  /**
   * Creates a calendar with the given name if it doesn't already exist.
   * @param {string} calendarName - The name of the calendar to create.
   * @returns {Calendar} The newly created calendar OR the existing calendar.
   * @throws {CreationError} If the creation try failed.
   */
  getOrCreateCalendarWithName(calendarName: string): CalendarWithRules {
    try {
      const existingCal = this.getCalendarByName(calendarName);
      Log.log(`[Info] @setNewCalendar; calendar ${calendarName} exists. Skipping...`);
      return existingCal;
    } catch (e) {
      // If the calendar is not found.
      this.count++;
      const _newCalendar = CalendarApp.createCalendar(calendarName);
      if (_newCalendar) {
        const newCalendar = Object.assign(_newCalendar, {
          rules: [] as AclRule[],
          name: _newCalendar.getName(),
          id: _newCalendar.getId(),
          toString: this.calendarToString(_newCalendar.getName(), _newCalendar.getId(), 0),
        });
        this.calendars.push(newCalendar);
        Log.log('[Info] Success @setNewCalendar; Calendar: %s', newCalendar);
        return newCalendar;
      } else {
        throw new CreationError(`Failed to create a new calendar: ${calendarName}`);
      }
    }
  }
  /**
   * Creates a new ACL rule for a user when the same rule doesn't exist.
   * @param {string|CalendarWithRules} calendar - The Calendar object or calendarId to which the rule to insert.
   * @param {string} userMailAddress - The email address of the user to add to the ACL.
   * @param {Role} role - The role of the user.
   * @returns {AclRule} The new ACL rule.
   * @throws {FetchError} If failed to create a new ACL rule.
   * @throws {Error} If other error occurred.
   *
   */
  createAclRule(calendar: string | CalendarWithRules, userMailAddress: string, role: Role): {rule:AclRule,created:boolean} {
    try {
      const calendarId = typeof calendar === 'string' ? calendar : calendar.id;
      const rule = this.getAclRule(calendarId, userMailAddress);
      if (rule?.role === role) {
        Log.log(
          '[Notice] @createAclRule; The exact Role already exists: { %s: %s }',
          userMailAddress,
          JSON.stringify(role)
        );
        return {rule, created: false};
      } else {
        const aclParam = {
          scope: {
            type: 'user',
            value: userMailAddress,
          },
          role: role,
        };
        this.count++;
        const newAcl = Calendar.Acl!.insert(aclParam, calendarId);
        if (!newAcl) {
          throw new FetchError(`Failed to create a new ACL rule for ${userMailAddress}`);
        }
        Log.log('[Info] Success @createAclRule; Acl: %s', {newAcl});
        return {rule:newAcl, created: true};
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error(JSON.stringify({err}));
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
