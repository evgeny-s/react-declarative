import { useMemo } from "react";

import IAnything from "../../../model/IAnything";
import IListProps from "../../../model/IListProps";
import IRowData from "../../../model/IRowData";

import useSearchState from "../../../hooks/useSearchState";
import useActualValue from "../../../hooks/useActualValue";
import useChange from "../../../hooks/useChange";

import removeEmptyFiltersDefault from "../helpers/removeEmptyFilters";

import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../config";

interface IQuery<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> {
    filterData: IListProps<FilterData, RowData>['filterData'];
    sortModel: IListProps<FilterData, RowData>['sortModel'];
    chipData: IListProps<FilterData, RowData>['chipData'];
    limit: IListProps<FilterData, RowData>['limit'];
    page: IListProps<FilterData, RowData>['page'];
    search: IListProps<FilterData, RowData>['search'];
}

interface IParams<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> {
    removeEmptyFilters: (data: FilterData) => Partial<FilterData>,
    onFilterChange: IListProps<FilterData, RowData>['onFilterChange'];
    onLimitChange: IListProps<FilterData, RowData>['onLimitChange'];
    onPageChange: IListProps<FilterData, RowData>['onPageChange'];
    onSortModelChange: IListProps<FilterData, RowData>['onSortModelChange'];
    onChipsChange: IListProps<FilterData, RowData>['onChipsChange'];
    onSearchChange: IListProps<FilterData, RowData>['onSearchChange'];
    onChange?: (pagination: string) => void;
    fallback?: (e: Error) => void;
}

interface IResult<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> extends IParams<FilterData, RowData>, IQuery<FilterData, RowData> {
    getFilterData: () => FilterDataT<FilterData, RowData>;
    getSortModel: () => SortModelT<FilterData, RowData>;
    getChipData: () => ChipDataT<FilterData, RowData>;
    getLimit: () => number;
    getPage: () => number;
    getSearch: () => string;
    setFilterData: (filterData: FilterDataT<FilterData, RowData>) => void;
    setSortModel: (sortModel: SortModelT<FilterData, RowData>) => void;
    setChipData: (chipData: ChipDataT<FilterData, RowData>) => void;
    setLimit: (limit: number) => void;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
};

type FilterDataT<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> = Exclude<IQuery<FilterData, RowData>['filterData'], undefined> 

type SortModelT<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> = Exclude<IQuery<FilterData, RowData>['sortModel'], undefined> 

type ChipDataT<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
> = Exclude<IQuery<FilterData, RowData>['chipData'], undefined> 

export const DEFAULT_QUERY: IQuery = {
    filterData: {},
    sortModel: [],
    chipData: {},
    limit: DEFAULT_LIMIT,
    page: DEFAULT_PAGE,
    search: "",
};

/**
 * A hook that provides pagination functionality for querying data.
 * @template FilterData The type of filter data.
 * @template RowData The type of row data.
 * @param {Partial<IQuery<FilterData, RowData>>} [initialValue=DEFAULT_QUERY] - The initial value for the query.
 * @param {Partial<IParams<FilterData, RowData>>} [options={}] - The options for the hook.
 * @param {Function} [options.onFilterChange=() => null] - The callback function to handle filter data changes.
 * @param {Function} [options.onLimitChange=() => null] - The callback function to handle limit changes.
 * @param {Function} [options.onPageChange=() => null] - The callback function to handle page changes.
 * @param {Function} [options.onSortModelChange=() => null] - The callback function to handle sort model changes.
 * @param {Function} [options.onChipsChange=() => null] - The callback function to handle chip data changes.
 * @param {Function} [options.onSearchChange=() => null] - The callback function to handle search changes.
 * @param {Function} [options.onChange=() => null] - The callback function to handle state changes.
 * @param {Function} [options.removeEmptyFilters=removeEmptyFiltersDefault] - The function to remove empty filters.
 * @param {Object} [options.fallback] - The fallback options.
 * @returns {Object} An object containing the pagination props and methods.
 */
export const useQueryPagination = <
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
>(initialValue: Partial<IQuery<FilterData, RowData>> = DEFAULT_QUERY, {
    onFilterChange: handleFilterChange = () => null,
    onLimitChange: handleLimitChange = () => null,
    onPageChange: handlePageChange = () => null,
    onSortModelChange: handleSortModelChange = () => null,
    onChipsChange: handleChipsChange = () => null,
    onSearchChange: handleSeachChange = () => null,
    onChange: handleChange = () => null,
    removeEmptyFilters = removeEmptyFiltersDefault,
    fallback,
}: Partial<IParams<FilterData, RowData>> = {}) => {

    const defaultValue = useMemo((): IQuery => ({
        chipData: initialValue.chipData || DEFAULT_QUERY.chipData,
        filterData: initialValue.filterData || DEFAULT_QUERY.filterData,
        limit: initialValue.limit || DEFAULT_QUERY.limit,
        page: initialValue.page || DEFAULT_QUERY.page,
        search: initialValue.search || DEFAULT_QUERY.search,
        sortModel: initialValue.sortModel || DEFAULT_QUERY.sortModel,
    }), []);

    const [state, setState] = useSearchState(() => ({
        filterData: JSON.stringify(defaultValue.filterData) || "{}",
        sortModel: JSON.stringify(defaultValue.sortModel) || "[]",
        chipData: JSON.stringify(defaultValue.chipData) || "{}",
        limit: defaultValue.limit || DEFAULT_LIMIT,
        page: defaultValue.page || DEFAULT_PAGE,
        search: defaultValue.search || "",
    }));

    const state$ = useActualValue(state);

    const query = useMemo<IQuery<FilterData, RowData>>(() => ({
        filterData: JSON.parse(state.filterData || "{}"),
        sortModel: JSON.parse(state.sortModel || "[]"),
        chipData: JSON.parse(state.chipData || "{}"),
        limit: state.limit || DEFAULT_LIMIT,
        page: state.page || DEFAULT_PAGE,
        search: state.search || "",
    }), [state]);

    const query$ = useActualValue(query);

    useChange(() => {
        handleChange(JSON.stringify(state$.current));
    }, [state]);

    const onFilterChange: IResult<FilterData, RowData>['onFilterChange'] = (filterData) => {
        filterData = removeEmptyFilters(filterData) as FilterData;
        setState((prevState) => ({
            ...prevState,
            filterData: JSON.stringify(filterData || "{}"),
        }));
        handleFilterChange(filterData)
    };
    
    const onLimitChange: IResult<FilterData, RowData>['onLimitChange'] = (limit) => {
        setState((prevState) => ({
            ...prevState,
            limit
        }));
        handleLimitChange(limit);
    };

    const onPageChange: IResult<FilterData, RowData>['onPageChange'] = (page) => {
        setState((prevState) => ({
            ...prevState,
            page
        }));
        handlePageChange(page);
    };

    const onSortModelChange: IResult<FilterData, RowData>['onSortModelChange'] = (sortModel) => {
        setState((prevState) => ({
            ...prevState,
            sortModel: JSON.stringify(sortModel || "[]"),
        }));
        handleSortModelChange(sortModel);
    };

    const onChipsChange: IResult<FilterData, RowData>['onChipsChange'] = (chipData) => {
        setState((prevState) => ({
            ...prevState,
            chipData: JSON.stringify(chipData || "{}"),
        }));
        handleChipsChange(chipData);
    };

    const onSearchChange: IResult<FilterData, RowData>['onSearchChange'] = (search) => {
        setState((prevState) => ({
            ...prevState,
            search
        }));
        handleSeachChange(search);
    };

    const getQueryMap = {
        getFilterData: (): FilterDataT<FilterData, RowData> => {
            const { current: query } = query$;
            return query.filterData || {}; 
        },
        getSortModel: (): SortModelT<FilterData, RowData> => {
            const { current: query } = query$;
            return query.sortModel || []; 
        },
        getChipData: (): ChipDataT<FilterData, RowData> => {
            const { current: query } = query$;
            return query.chipData || {}; 
        },
        getLimit: () => {
            const { current: query } = query$;
            return query.limit || DEFAULT_LIMIT; 
        },
        getPage: () =>{
            const { current: query } = query$;
            return query.page || DEFAULT_PAGE; 
        },
        getSearch: () => {
            const { current: query } = query$;
            return query.search || ""; 
        },
    };

    const setQueryMap = {
        setFilterData: onFilterChange,
        setSortModel: onSortModelChange,
        setChipData: onChipsChange,
        setLimit: onLimitChange,
        setPage: onPageChange,
        setSearch: onSearchChange,
    };

    return {
        listProps: {
            onFilterChange,
            onLimitChange,
            onPageChange,
            onSortModelChange,
            onChipsChange,
            onSearchChange,
            ...fallback && { fallback },
            ...query,
        },
        ...getQueryMap,
        ...setQueryMap,
    };
};

/*
console.log({filterData: (new URL(location.href).searchParams.get('filterData'))});
console.log({sortModel: (new URL(location.href).searchParams.get('sortModel'))});
console.log({chipData: (new URL(location.href).searchParams.get('chipData'))});
console.log({limit: (new URL(location.href).searchParams.get('limit'))});
console.log({page: (new URL(location.href).searchParams.get('page'))});
console.log({search: (new URL(location.href).searchParams.get('search'))});
*/

export default useQueryPagination;
