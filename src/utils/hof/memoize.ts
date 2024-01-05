export interface IClearable<K = string> {
    clear: (key?: K) => void;
}

export interface IRef<T = any> {
    current: T;
}

interface Function {
    (...args: any): any;
}

export const GET_VALUE_MAP = Symbol('get-value-map');

export const memoize = <T extends (...args: A) => any, A extends any[], K = string>(key: (args: A) => K, run: T): T & IClearable<K> => {

    const valueMap = new Map<K, IRef<ReturnType<T>>>();

    const clear = (key?: K) => {
        if (key) {
            valueMap.delete(key);
            return;
        }
        valueMap.clear();
    };

    const executeFn: Function & IClearable<any> = (...args: A) => {
        const k = key(args);
        let value = valueMap.get(k)?.current;
        if (value === undefined) {
            const ref = { current: undefined };
            valueMap.set(k, ref as unknown as IRef<ReturnType<T>>);
            value = ref.current = run(...args);
        }
        return value;
    };

    executeFn[GET_VALUE_MAP] = () => valueMap;

    executeFn.clear = clear;

    return executeFn as T & IClearable<K>;
};

export default memoize;
