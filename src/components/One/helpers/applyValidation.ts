import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

import deepFlat from "../../../utils/deepFlat";

interface IValidationFn<Data extends IAnything = IAnything> {
    (data: Data): string | null;
}

export const applyValidation = <Data extends IAnything = IAnything, Field extends IField<Data> = IField<Data>>(fields: Field[]): Field[] => {
    for (const field of deepFlat(fields)) {
        const { name, validation } = field;
        const validations: IValidationFn<Data>[] = [];
        if (!name) {
            continue;
        }
        if (!validation) {
            continue;
        }
        const { required, pattern, minLength, maxLength } = validation;
        if (required) {
            validations.push((data) => {
                if (!data[name]) {
                    return "Required";
                }
                return null;
            });
        }
        if (pattern) {
            validations.push((data) => {
                const expr = new RegExp(pattern.source, pattern.flags);
                if (!expr.test(data[name])) {
                    return 'Pattern does not match';
                }
                return null;
            })
        }
        if (maxLength) {
            validations.push((data) => {
                const count = data[name]?.length || 0;
                if (count > maxLength) {
                    return "Maximum length reached";
                }
                return null;
            })
        }
        if (minLength) {
            validations.push((data) => {
                const count = data[name]?.length || 0;
                if (count < minLength) {
                    return "Minimum length reached";
                }
                return null;
            })
        }
        if (!field.isInvalid) {
            field.isInvalid = (data) => {
                for (const validation of validations) {
                    const result = validation(data);
                    if (result) {
                        return result;
                    }
                }
                return null;
            }
        }
    }
    return fields;
};


export default applyValidation;
