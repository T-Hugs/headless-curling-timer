/**
 * This function converts a number of seconds to a string
 * representation of the number of hours, minutes, and seconds.
 * The string is formatted as "hh:mm:ss" and is prefixed with
 * a minus sign if the number of seconds is negative.
 * If allowNegative is true, then a negative number of seconds
 * is allowed and will be converted to a negative string.
 * If allowNegative is false, then a negative number of seconds
 * is treated as zero and will be converted to "00:00:00".
 * @param seconds
 * @param allowNegative
 */
export declare function secondsToStr(seconds: number, allowNegative?: boolean): string;
/**
 * Returns the number of seconds represented by the given string
 * Examples:
 *   strToSeconds("1s") == 1
 *   strToSeconds("1:02:03") == 3723
 *   strToSeconds("1 hour 2 minutes 3 seconds") == 3723
 * @param str
 */
export declare function strToSeconds(str: string): number | null;
