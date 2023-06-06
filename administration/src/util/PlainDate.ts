import { add, differenceInCalendarDays, format, isValid, parse } from 'date-fns'

type DateDuration = { years?: number; months?: number; days?: number }

/**
 * A PlainDate represents a calendar date.
 * "Calendar date" refers to the concept of a date as expressed in everyday usage, independent of any time zone.
 * For example, it could be used to represent an event on a calendar which happens during the whole day no matter which
 * time zone it's happening in.
 *
 * (Above description from https://tc39.es/proposal-temporal/docs/plaindate.html)
 * Until the official Temporal API has shipped (or until a polyfill can be used in production),
 * we introduce the PlainDate class here with a similar API
 */
class PlainDate {
  // A year.
  readonly isoYear: number
  // A month, ranging from 1 and 12 inclusive
  readonly isoMonth: number
  readonly day: number

  /**
   * @param isoYear A year.
   * @param isoMonth A month, ranging from 1 and 12 inclusive.
   * @param day A day of the month, ranging between 1 and 31 inclusive.
   */
  constructor(isoYear: number, isoMonth: number, day: number) {
    {
      // Check if parameters are valid, otherwise throw RangeError
      const date = new Date(Date.UTC(isoYear, isoMonth - 1, day))
      if (!isValid(date)) {
        throw RangeError('Parameters do not form a valid PlainDate.')
      }
    }
    this.isoYear = isoYear
    this.isoMonth = isoMonth
    this.day = day
  }

  /**
   * Returns a PlainDate for a given ISO 8601 string.
   * This function is a subset of Temporal.PlainDate.from.
   * @param valueISO8601: The date in ISO 8601 format. Must be of the form yyyy-MM-dd
   * @throws RangeError, if the given value does not represent a valid date.
   */
  static from(valueISO8601: string): PlainDate {
    const date = parse(valueISO8601, 'yyyy-MM-dd', new Date(0))
    return PlainDate.fromLocalDate(date)
  }

  /**
   * Returns a PlainDate by parsing a string using some custom format
   * @param value The string to be parsed.
   * @param format A custom format as used by date-fns
   * @example
   */
  static fromCustomFormat(value: string, format: 'dd.MM.yyyy') {
    const date = parse(value, format, new Date(0))
    return PlainDate.fromLocalDate(date)
  }

  /**
   * Returns a Date object representing the beginning of the corresponding date in UTC timezone.
   * @example new PlainDate(1900, 1, 1).toUTCDate().toISOString() == "1900-01-01T00:00:00.000Z"
   */
  toUTCDate(): Date {
    return new Date(Date.UTC(this.isoYear, this.isoMonth - 1, this.day))
  }

  static fromUTCDate(date: Date): PlainDate {
    return new PlainDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
  }

  /**
   * Returns a Date object representing the beginning of the corresponding date in local timezone.
   * @example If you are in UTC+1:
   *          new PlainDate(1900, 1, 1).toLocalDate().toISOString() // "1899-12-31T23:00:00.000Z"
   */
  toLocalDate(): Date {
    return new Date(this.isoYear, this.isoMonth - 1, this.day)
  }

  static fromLocalDate(date: Date): PlainDate {
    return new PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  /**
   * Returns a new PlainDate corresponding to `this` plus `duration`.
   * @param duration
   */
  add(duration: DateDuration): PlainDate {
    // date-fns/add alters the date in local time zone.
    return PlainDate.fromLocalDate(add(this.toLocalDate(), duration))
  }

  /**
   * Returns a new PlainDate corresponding to the result of adding `days` days to 1970-01-01
   * @param days
   */
  static fromDaysSinceEpoch(days: number): PlainDate {
    return new PlainDate(1970, 1, 1).add({ days })
  }

  /**
   * Returns the number of days since 1970-01-01.
   */
  toDaysSinceEpoch(): number {
    return differenceInCalendarDays(this.toLocalDate(), new PlainDate(1970, 1, 1).toLocalDate())
  }

  /**
   * Formats the date in ISO 8601 format yyyy-MM-dd (without time part).
   */
  toString(): string {
    return format(this.toLocalDate(), 'yyyy-MM-dd')
  }

  /**
   * Formats the date in a custom format. `formatString` must comply to date-fns requirements.
   * @param formatString
   */
  format(formatString: 'dd.MM.yyyy'): string {
    return format(this.toLocalDate(), formatString)
  }

  /**
   * Compares two PlainDate objects `one` and `two`.
   * Returns:
   *  * -1 if `one` comes before `two`
   *  * 0 if `one` and two are the same PlainDates
   *  * 1 if `one` comes after `two`.
   */
  static compare(one: PlainDate, two: PlainDate): -1 | 0 | 1 {
    if (one.isoYear < two.isoYear) {
      return -1
    } else if (one.isoYear > two.isoYear) {
      return 1
    }
    if (one.isoMonth < two.isoMonth) {
      return -1
    } else if (one.isoMonth > two.isoMonth) {
      return 1
    }
    if (one.day < two.day) {
      return -1
    } else if (one.day > two.day) {
      return 1
    }
    return 0
  }

  isBefore(other: PlainDate): boolean {
    return PlainDate.compare(this, other) < 0
  }

  isAfter(other: PlainDate): boolean {
    return PlainDate.compare(this, other) > 0
  }

  equals(other: PlainDate): boolean {
    return PlainDate.compare(this, other) === 0
  }
}

export default PlainDate
