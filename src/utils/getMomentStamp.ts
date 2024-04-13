import dayjs from "dayjs";

import getGenesisStamp from "./getGenesisStamp";

export const DIMENSION = "day";
export const GENESIS = getGenesisStamp();

export type stamp = number;

/**
 * Calculates the moment stamp based on the given end date and dimension.
 * The moment stamp represents the difference between the end date and the start date in the specified dimension.
 *
 * @param [end=dayjs()] - The end date. Defaults to the current date and time.
 * @param [dimension=DIMENSION] - The dimension to calculate the difference in. Defaults to DIMENSION.
 * @returns - The moment stamp representing the difference between the end date and the start date.
 */
export const getMomentStamp = (end = getGenesisStamp(), dimension: dayjs.ManipulateType = DIMENSION): stamp => {
  const start = dayjs(GENESIS);
  return Math.floor(end.set('hour', 0).diff(start, dimension, true));
};

/**
 * Converts a timestamp to a moment in time.
 *
 * @param stamp - The timestamp to convert.
 * @param dimension - The dimension to add to the timestamp. Defaults to `DIMENSION`.
 * @returns - The moment in time corresponding to the timestamp.
 */
export const fromMomentStamp = (stamp: number, dimension: dayjs.ManipulateType = DIMENSION) => {
  return dayjs(GENESIS).add(stamp, dimension);
};

export default getMomentStamp;
