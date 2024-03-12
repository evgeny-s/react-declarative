import { nbsp } from "./typo";

/**
 * Formats the given value to a specific scale and separates the thousands with a separator.
 *
 * @param value - The value to be formatted.
 * @param [scale=2] - The number of decimal places to round to.
 * @param [separator=','] - The separator for thousands.
 * @returns The formatted value.
 */
export const formatAmount = (
    value: number | string,
    scale = 2,
    separator = ','
) => {
    const str = Number(value).toFixed(scale);
    const formatted =
        Number(value) < 10000 ? str : str.replace(/(\d)(?=(\d{3})+(\.|$))/g, `$1${nbsp}`)
    return formatted.replace(/.00$/, '').replace('.', separator)
};

export default formatAmount;
