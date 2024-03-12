import dayjs from 'dayjs';

export const DATE_PLACEHOLDER = 'DD/MM/YYYY';
export const TIME_PLACEHOLDER = 'HH:MM';

export const DATE_EXPR = /(?:\d\d\/\d\d\/\d\d\d\d)/g;
export const TIME_EXPR = /(?:\d\d:\d\d)/g;

export class Time {
    constructor(
        public readonly hour: number,
        public readonly minute: number
    ) { }
    toString = () => {
        return serializeTime(this);
    };
    toStamp = () => {
        return this.hour * 60 + this.minute;
    };
    static fromStamp = (stamp: number) => {
        const source = dayjs("1970-01-01").set("hour", 0).set("minute", 0).add(stamp, "minute");
        const hour = source.get('hour');
        const minute = source.get('minute');
        return new Time(hour, minute);
    };
};

export class Date {
    constructor(
        public readonly day: number,
        public readonly month: number,
        public readonly year: number,
    ) { }
    toString = () => {
        return serializeDate(this);
    };
    toStamp = () => {
        const start = dayjs('1970-01-01');
        let now = dayjs();
        now = now.set('date', this.day);
        now = now.set('month', this.month - 1);
        now = now.set('year', this.year);
        if (now.isValid()) {
            return Math.max(now.diff(start, 'day'), -1);
        } else {
            return -1;
        }
    };
    static fromStamp = (stamp: number) => {
        const now = dayjs('1970-01-01').add(stamp, 'days').toDate();
        return new Date(now.getDate(), now.getMonth() + 1, now.getFullYear());
    };
};

/**
 * Parses a string representation of a date in "dd/mm/yyyy" format and returns a Date object.
 * If the input is not in the correct format or is null, returns null.
 *
 * @param {string | null} date - The string representation of the date to parse.
 * @returns {Date | null} - The parsed Date object or null if the input is not valid.
 */
export const parseDate = (date: string | null): Date | null => {
    if (!date) {
        return null;
    }
    const [day = '', month = '', year = ''] = date.split('/');
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) {
        return null;
      }
      return new Date(d, m, y);
    }
    return null;
};

/**
 * Serialize a given date to a string representation in the format "dd/MM/yyyy".
 *
 * @param {Date} date - The date to serialize.
 * @returns {string|null} The serialized date or null if the input is not a valid Date object.
 */
export const serializeDate = (date: Date) => {
    let day = '';
    let month = '';
    let year = '';
    if (date instanceof Date) {
        day = date.day.toString();
        month = date.month.toString();
        year = date.year.toString();
    } else {
        return null;
    }
    day = day.length === 1 ? '0' + day : day;
    month = month.length === 1 ? '0' + month : month;
    return `${day}/${month}/${year}`;
};

/**
 * Parses a string representation of time into a Time object.
 *
 * @param {string | null} time - The string representation of time to parse.
 * @returns {Time | null} - The parsed Time object or null if input is null or invalid.
 */
export const parseTime = (time: string | null): Time | null => {
    if (!time) {
        return null;
    }
    const [hour, minute] = time.split(':')
    if (hour && minute) {
        const h = parseInt(hour);
        const m = parseInt(minute);
        if (isNaN(h) || isNaN(m)) {
            return null;
        }
        return new Time(h, m);
    }
    return null;
};

/**
 * Serializes the given time object into a string representation.
 *
 * @param {Time} time - The time object to be serialized.
 * @returns {string|null} - The serialized time string, or null if the input is invalid.
 */
export const serializeTime = (time: Time) => {
    let hour = '';
    let minute = '';
    if (time instanceof Time) {
        hour = time.hour.toString();
        minute = time.minute.toString();
    } else {
        return null;
    }
    hour = hour.length === 1 ? '0' + hour : hour;
    minute = minute.length === 1 ? '0' + minute : minute;
    return `${hour}:${minute}`;
};

/**
 * Retrieves the current date.
 *
 * @returns {string} The current date in serialized format.
 */
export const currentDate = () => {
    const now = new window.Date();
    const date = new Date(now.getDate(), now.getMonth() + 1, now.getFullYear());
    return serializeDate(date)!;
};

/**
 * Generates the current time.
 *
 * @returns {string} The current time as a serialized string.
 */
export const currentTime = () => {
    const now = new window.Date();
    const time = new Time(now.getHours(), now.getMinutes());
    return serializeTime(time)!;
};

/**
 * Converts a string representation of a time to a timestamp.
 *
 * @param {string} [str] - The time string to convert. Defaults to the current time.
 * @returns {number} - The timestamp representation of the given time or -1 if conversion fails.
 */
export const timeStamp = (str = currentTime()) => {
    const time = parseTime(str);
    if (time) {
        return time.toStamp();
    } else {
        return -1;
    }
};

/**
 * Converts a date string to a timestamp.
 *
 * @param {string} [str=currentDate()] - The date string to convert.
 * @returns {number} - The timestamp if the conversion is successful, -1 otherwise.
 */
export const dateStamp = (str = currentDate()) => {
    const date = parseDate(str);
    if (date) {
        return date.toStamp();
    } else {
        return -1;
    }
};
