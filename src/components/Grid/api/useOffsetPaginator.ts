import { useEffect } from 'react';

import useActualCallback from '../../../hooks/useActualCallback';
import useQueuedAction from "../../../hooks/useQueuedAction";
import useActualState from "../../../hooks/useActualState";
import useActualValue from '../../../hooks/useActualValue';
import useSubject from "../../../hooks/useSubject";

import RowData from "../model/RowData";
import TSubject from "../../../model/TSubject";

const DEFAULT_LIMIT = 25;

interface IParams<Data = RowData> {
    reloadSubject?: TSubject<void>;
    initialData?: Data[];
    handler: (limit: number, offset: number, initial: boolean) => Data[];
    limit?: number;
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    fallback?: (error: Error) => void;
    throwError?: boolean;
}

interface IState<Data = RowData> {
    data: Data[];
    prevOffset: number;
    hasMore: boolean;
}

export const useOffsetPaginator = <Data extends RowData = RowData>({
    reloadSubject: upperReloadSubject,
    initialData = [],
    handler,
    limit = DEFAULT_LIMIT,
    ...queryProps
}: IParams<Data>) => {

    const reloadSubject = useSubject(upperReloadSubject);

    const [state, setState] = useActualState<IState<Data>>(() => ({
        data: initialData,
        prevOffset: -limit,
        hasMore: true,
    }));

    const initialData$ = useActualValue(initialData);
    const handler$ = useActualCallback(handler);

    const { execute: fetchData } = useQueuedAction(async (initial: boolean) => {
        return await handler$(limit, state.current.prevOffset + limit, initial);
    });

    const { execute: onSkip, loading, error } = useQueuedAction(async (initial: boolean) => {
        const nextData = await fetchData(initial);
        if (!nextData) {
            return;
        }
        setState({
            prevOffset: state.current.prevOffset + limit,
            data: [...state.current.data, ...nextData.slice(0, limit)],
            hasMore: nextData.length >= limit,
        });
    }, queryProps);

    useEffect(() => reloadSubject.subscribe(() => {
        fetchData.cancel();
        setState({
            data: initialData$.current,
            hasMore: true,
            prevOffset: 0,
        });
        onSkip(true);
    }), []);

    return {
        data: state.current.data,
        setData: setState,
        offset: state.current.prevOffset + limit,
        hasMore: state.current.hasMore,
        loading,
        error,
        onSkip,
    };
}

export default useOffsetPaginator;
