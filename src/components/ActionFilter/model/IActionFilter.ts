/**
 * Represents an action filter.
 * @interface
 */
export interface IActionFilter {
    action: string;
    label: string;
    items: {
        value: string;
        label: string;
    }[];
}

export default IActionFilter;
