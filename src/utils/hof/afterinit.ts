export interface IWrappedFn<T extends any = any, P extends any[] = any> {
    (...args: P): Promise<T>;
    clear(): void;
};

/**
 * Creates a wrapped function that only executes the provided function after the initial call has completed.
 * The wrapped function can be cleared to allow subsequent calls to execute the provided function again.
 *
 * @template T The type of the promise resolved by the provided function.
 * @template P The type of the arguments passed to the provided function.
 * @param run The function to be wrapped.
 * @returns The wrapped function.
 */
export const afterinit = <T extends any = any, P extends any[] = any[]>(run: (...args: P) => Promise<T>): IWrappedFn<T, P> => {

    let hasComplete = false;

    const wrappedFn = (...args: P) => {
        if (!hasComplete) {
            hasComplete = true;
            return Promise.resolve() as never;
        }
        return run(...args);
    };

    wrappedFn.clear = () => {
        hasComplete = false;
    };

    return wrappedFn;
};

export default afterinit;
