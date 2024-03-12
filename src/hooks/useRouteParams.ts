import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { BrowserHistory, HashHistory, MemoryHistory } from "history";

import { RouteManager, ISwitchItem } from "../helpers/routeManager";

import useSingleton from "./useSingleton";

/**
 * The `useRouteParams` hook is used to retrieve the parameters of the currently active route.
 *
 * @template T - The type of the route parameters.
 * @template I - The type of the switch items.
 *
 * @param {Array<I>} routes - Array of route items.
 * @param {MemoryHistory | BrowserHistory | HashHistory} history - The history object to track route changes.
 *
 * @returns {T} - The parameters of the currently active route.
 */
export const useRouteParams = <T extends Record<string, any> = Record<string, any>, I extends ISwitchItem = ISwitchItem>(routes: I[], history: MemoryHistory | BrowserHistory | HashHistory) => {

    const routeManager = useSingleton(() => new RouteManager<T, I>(routes, history));

    const isMounted = useRef(true);

    const [params, setParams] = useState(routeManager.params);

    useEffect(() => routeManager.subscribe(() => {
        isMounted.current && setParams(routeManager.params);
    }), []);

    useEffect(() => () => {
        routeManager.dispose();
    }, []);

    useLayoutEffect(() => () => {
      isMounted.current = false;
    }, []);

    return params;
};

export default useRouteParams;
