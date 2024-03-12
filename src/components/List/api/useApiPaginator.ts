import { useMemo, useEffect } from 'react';

import { 
    ListHandler,
    ListHandlerChips,
    ListHandlerResult,
    ListHandlerSortModel,
    ListHandlerPagination,
} from "../../../model/IListProps";

import abortManager from '../../../helpers/abortManager';

import IAnything from "../../../model/IAnything";
import IRowData from "../../../model/IRowData";

import removeEmptyFiltersDefault from '../helpers/removeEmptyFilters';

import { CANCELED_SYMBOL } from '../../../utils/hof/cancelable';
import { FetchError } from '../../../utils/fetchApi';
import queued from '../../../utils/hof/queued';

export interface IApiPaginatorParams<FilterData extends {} = IAnything, RowData extends IRowData = IAnything> {
    origin?: string;
    fetch?: typeof window.fetch;
    requestMap?: (url: URL) => URL;
    removeEmptyFilters?: (data: FilterData) => Partial<FilterData>;
    filterHandler?: (url: URL, filterData: FilterData) => URL;
    chipsHandler?: (url: URL, chips: ListHandlerChips<RowData>) => URL;
    sortHandler?: (url: URL, sort: ListHandlerSortModel<RowData>) => URL;
    searchHandler?: (url: URL, search: string) => URL;
    paginationHandler?: (url: URL, pagination: ListHandlerPagination) => URL;
    onLoadBegin?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    withAbortSignal?: boolean;
    withPagination?: boolean;
    withFilters?: boolean;
    withChips?: boolean;
    withSearch?: boolean;
    withSort?: boolean;
    fetchParams?: () => RequestInit;
    fallback?: (e: Error) => void;
    abortSignal?: AbortSignal;
    responseMap?: <T extends IRowData>(json: RowData[]) => (ListHandlerResult<T> | Promise<ListHandlerResult<T>>);
}

const EMPTY_RESPONSE = {
    rows: [],
    total: null,
};

/**
 * Function that generates a list handler for API pagination.
 *
 * @param {string} path - The API endpoint path.
 * @param {Object} options - The options object.
 * @param {function} options.fetch - The fetch function to use for making API requests (default: window.fetch).
 * @param {string} options.origin - The origin of the API (default: window.location.origin).
 * @param {AbortSignal} options.abortSignal - The AbortSignal object to use for aborting API requests.
 * @param {function} options.removeEmptyFilters - The function to remove empty filters from the filter data (default: removeEmptyFiltersDefault).
 * @param {function} options.fetchParams - The function to generate fetch parameters (e.g. headers, method, body) (default: null).
 * @param {function} options.fallback - The function to handle error fallback (default: null).
 * @param {function} options.onLoadBegin - The function to call before the API request is made (default: null).
 * @param {function} options.onLoadEnd - The function to call after the API request is completed (default: null).
 * @param {function} options.requestMap - The function to map the request URL (default: (url) => url).
 * @param {function} options.responseMap - The function to map the API response (default: (data) => data).
 * @param {function} options.filterHandler - The function to handle filters in the URL (default: (url, filterData) => { ... }).
 * @param {function} options.chipsHandler - The function to handle chips in the URL (default: (url, chips) => { ... }).
 * @param {function} options.sortHandler - The function to handle sorting in the URL (default: (url, sort) => { ... }).
 * @param {function} options.searchHandler - The function to handle search in the URL (default: (url, search) => { ... }).
 * @param {function} options.paginationHandler - The function to handle pagination in the URL (default: (url, pagination) => { ... }).
 * @param {boolean} options.withAbortSignal - A flag to enable/disable abort signal usage (default: true).
 * @param {boolean} options.withPagination - A flag to enable/disable pagination (default: true).
 * @param {boolean} options.withFilters - A flag to enable/disable filters (default: true).
 * @param {boolean} options.withSearch - A flag to enable/disable search (default: true).
 * @param {boolean} options.withChips - A flag to enable/disable chips (default: true).
 * @param {boolean} options.withSort - A flag to enable/disable sorting (default: true).
 * @returns {ListHandler} - The list handler function.
 */
export const useApiPaginator = <FilterData extends {} = IAnything, RowData extends IRowData = IAnything>(path: string, {
    fetch = window.fetch,
    origin = window.location.origin,
    abortSignal: signal = abortManager.signal,
    removeEmptyFilters = removeEmptyFiltersDefault,
    fetchParams,
    fallback,
    onLoadBegin,
    onLoadEnd,
    requestMap = (url) => url,
    responseMap = (data) => data as  never,
    filterHandler = (url, filterData) => {
        Object.entries(filterData).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach((v) => {
                    url.searchParams.append(`filter.${k}`, `$lte:${v}`);
                });
            } else if (v) {
                url.searchParams.append(`filter.${k}`, `$lte:${v}`);
            }
        });
        return url;
    },
    chipsHandler = (url, chips) => {
        Object.entries(chips).forEach(([chip, enabled]) => {
            if (enabled) {
                url.searchParams.append(`filter.${chip}`, `$eq:1`);
            }
        });
        return url;
    },
    sortHandler = (url, sort) => {
        sort.forEach(({
            field,
            sort,
        }) => {
            if (sort) {
                url.searchParams.append('sortBy', `${String(field)}:${sort.toUpperCase()}`)
            }
        });
        return url;
    },
    searchHandler = (url, search) => {
        url.searchParams.set('search', search);
        return url;
    },
    paginationHandler = (url, {
        limit,
        offset,
    }) => {
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('page', (offset / limit).toString());
        return url;
    },
    withAbortSignal = true,
    withPagination = true,
    withFilters = true,
    withSearch = true,
    withChips = true,
    withSort = true,
}: IApiPaginatorParams<FilterData, RowData> = {}): ListHandler<FilterData, RowData> => {

    const queuedFetch = useMemo(() => queued(fetch), []);

    const handler: ListHandler<FilterData, RowData> = useMemo(() => async (filterData, pagination, sort, chips, search) => {
        filterData = removeEmptyFilters(filterData) as FilterData;
        let url = new URL(path, origin);
        let isOk = true;
        if (withPagination) {
            url = paginationHandler(new URL(url), pagination);
        }
        if (withFilters) {
            url = filterHandler(new URL(url), filterData);
        }
        if (withChips) {
            url = chipsHandler(new URL(url), chips);
        }
        if (withSort) {
            url = sortHandler(new URL(url), sort);
        }
        if (withSearch) {
            url = searchHandler(new URL(url), search);
        }
        url = requestMap(new URL(url));
        onLoadBegin && onLoadBegin();
        try {
            const data = await queuedFetch(url.toString(), { signal, ...(fetchParams && fetchParams()) });
            if (data === CANCELED_SYMBOL) {
                return {
                    rows: [],
                    total: null,
                };
            }
            const json = await data.json();
            return await responseMap(json);
        } catch (e) {
            queuedFetch.clear();
            isOk = false;
            if (e instanceof FetchError) {
                e = e.originalError;
            }
            if (e instanceof DOMException && e.name == "AbortError") {
                return { ...EMPTY_RESPONSE };
            } else if (fallback) {
                fallback(e as Error);
                return { ...EMPTY_RESPONSE };
            } else {
                throw e;
            }
        } finally {
            onLoadEnd && onLoadEnd(isOk);
        }
    }, []);

    useEffect(() => () => {
        if (withAbortSignal) {
            abortManager.abort();
        }
    }, []);

    useEffect(() => () => {
        queuedFetch.clear()
    }, []);

    return handler;
};

export default useApiPaginator;
