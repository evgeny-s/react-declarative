import { useLayoutEffect, useRef, useState, useMemo } from 'react';

import singlerun from '../utils/hof/singlerun';

import useActualCallback from './useActualCallback';

interface IParams {
    fallback?: (e: Error) => void;
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    throwError?: boolean;
}

interface IResult<Data extends any = any, Payload extends any = object> {
    loading: boolean;
    error: boolean;
    execute: IExecute<Data, Payload>;
}

export interface IExecute<Data extends any = any, Payload extends any = object> {
    (payload?: Payload): Promise<Data | null>;
    clear(): void;
}

export const useSinglerunAction = <Data extends any = any, Payload extends any = any>(run: (p: Payload) => (Data | Promise<Data>), {
    onLoadStart,
    onLoadEnd,
    fallback,
    throwError,
}: IParams = {}): IResult<Data, Payload> => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const isMounted = useRef(true);

    const run$ = useActualCallback(run);

    useLayoutEffect(() => () => {
      isMounted.current = false;
    }, []);

    const execute = useMemo(() => singlerun(async (payload?: Payload) => {

        const execution = async () => {
            let isOk = true;
            onLoadStart && onLoadStart();
            try {
                const result = run$(payload!);
                if (result instanceof Promise) {
                    return (await result) || null;
                } else {
                    return result || null;
                }
            } catch (e) {
                isOk = false;
                throw e;
            } finally {
                onLoadEnd && onLoadEnd(isOk);
            }
        };

        isMounted.current && setLoading(true);
        isMounted.current && setError(false);

        let isCanceled = false;

        try {
            return await execution();
        } catch (e) {
            isMounted.current && setError(true);
            if (!throwError) {
                fallback && fallback(e as Error);
            } else {
                throw e;
            }
        } finally {
            if (!isCanceled) {
                isMounted.current && setLoading(false);
            }
        }
        return null;
    }), []);

    return {
        loading,
        error,
        execute,
    };
};

export default useSinglerunAction;
