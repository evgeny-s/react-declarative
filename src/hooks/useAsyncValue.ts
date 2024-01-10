import { useState, useEffect } from 'react';

import useAsyncAction from './useAsyncAction';

interface IParams {
    fallback?: (e: Error) => void;
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    throwError?: boolean;
}

export const useAsyncValue = <Data extends any = any>(run: () => (Data | Promise<Data>), params: IParams = {}): Data | null => {

    const [result, setResult] = useState<Data | null>(null);

    const { execute } = useAsyncAction(async () => {
        const result = await run();
        setResult(result);
    }, params);

    useEffect(() => {
        execute();
    }, []);

    return result;
};

export default useAsyncValue;
