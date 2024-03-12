import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";

import {
  BrowserHistory,
  HashHistory,
  Location,
  MemoryHistory,
  Update,
} from "history";
import { Key } from "path-to-regexp";

import { pathToRegexp } from "path-to-regexp";

import FetchView, { IFetchViewProps } from "../FetchView";

import ForbiddenDefault from "./components/Forbidden";
import NotFoundDefault from "./components/NotFound";
import LoaderDefault from "./components/Loader";
import ErrorDefault from "./components/Error";

import createWindowHistory from "../../utils/createWindowHistory";
import randomString from "../../utils/randomString";
import sleep from "../../utils/sleep";

export interface ISwitchItem {
  path: string;
  element?: React.ComponentType<any>;
  guard?: () => boolean | Promise<boolean>;
  prefetch?: (
    params: Record<string, any>
  ) => Record<string, any> | Promise<Record<string, any>>;
  unload?: (params: Record<string, any>) => Promise<void> | void;
  redirect?: string | ((params: Record<string, any>) => string | null);
}

export interface ISwitchProps {
  className?: string;
  style?: React.CSSProperties;
  items: ISwitchItem[];
  fallback?: (e: Error) => void;
  history?: BrowserHistory | MemoryHistory | HashHistory;
  Forbidden?: React.ComponentType<any>;
  NotFound?: React.ComponentType<any>;
  Loader?: React.ComponentType<any>;
  Error?: React.ComponentType<any>;
  animation?: IFetchViewProps["animation"];
  onLoadStart?: () => void;
  onLoadEnd?: (isOk?: boolean) => void;
  onInit?: () => void;
  onDispose?: () => void;
  throwError?: boolean;
  children?: (result: ISwitchResult) => React.ReactNode;
}

const canActivate = async (item: ISwitchItem) => {
  const { guard = () => true } = item;
  const isAvailable = guard();
  if (isAvailable instanceof Promise) {
    return await isAvailable;
  } else {
    return isAvailable;
  }
};

interface ISwitchResult {
  element: React.ComponentType<any>;
  key: string;
  path: string;
  params?: Record<string, any>;
}

const DEFAULT_HISTORY = createWindowHistory();

const DEFAULT_CHILD_FN = ({
  element: Element = Fragment,
  key,
  params,
}: ISwitchResult) => <Element key={key} {...params} />;

const Fragment = () => <></>;

/**
 * Represents a switch component that renders different elements based on the current location.
 * @param {Object} SwitchProps - The props for the Switch component.
 * @param {string} SwitchProps.className - The CSS class name for the component.
 * @param {Object} SwitchProps.style - The inline style object for the component.
 * @param {React.Component} SwitchProps.Loader - The loader component to render while initial loading.
 * @param {React.Component} SwitchProps.Forbidden - The component to render if access to a route is forbidden.
 * @param {React.Component} SwitchProps.NotFound - The component to render if the requested route is not found.
 * @param {React.Component} SwitchProps.Error - The component to render if an error occurs.
 * @param {string} SwitchProps.animation - The animation type for transitioning between elements.
 * @param {Object} SwitchProps.history - The history object to use for routing. Defaults to DEFAULT_HISTORY if not provided.
 * @param {Function} SwitchProps.children - The function that returns the child elements to render based on the current location.
 * @param {React.Component} SwitchProps.fallback - The component to render if an error occurs and throwError is set to false.
 * @param {Array} SwitchProps.items - The array of route items to match and render components for.
 * @param {Function} SwitchProps.onLoadStart - The callback function to invoke when the component starts loading.
 * @param {Function} SwitchProps.onLoadEnd - The callback function to invoke when the component finishes loading.
 * @param {Function} SwitchProps.onInit - The callback function to invoke when the component initializes. Defaults to an empty function.
 * @param {Function} SwitchProps.onDispose - The callback function to invoke when the component is disposed. Defaults to an empty function.
 * @param {boolean} SwitchProps.throwError - Indicates whether to throw an error if an exception occurs. Defaults to false.
 * @returns {React.Component} The Switch component.
 */
export const Switch = ({
  className,
  style,
  Loader = LoaderDefault,
  Forbidden = ForbiddenDefault,
  NotFound = NotFoundDefault,
  Error = ErrorDefault,
  animation,
  history = DEFAULT_HISTORY,
  children = DEFAULT_CHILD_FN,
  fallback,
  items: upperItems,
  onLoadStart,
  onLoadEnd,
  onInit = () => undefined,
  onDispose = () => undefined,
  throwError = false,
}: ISwitchProps) => {
  const items = useMemo(() => {
    return [...upperItems].sort(
      ({ path: path_a = "" }, { path: path_b = "" }) => {
        const a_dot = path_a.match(/\:/g)?.length || 0;
        const b_dot = path_b.match(/\:/g)?.length || 0;
        const a_slash = path_a.match(/\\/g)?.length || 0;
        const b_slash = path_b.match(/\\/g)?.length || 0;
        const a = Math.max(a_slash - a_dot, 0);
        const b = Math.max(b_slash - b_dot, 0);
        return b - a;
      }
    );
  }, []);

  const [initComplete, setInitComplete] = useState(false);

  const unloadRef = useRef<(() => Promise<void>) | null>(null);

  const [location, setLocation] = useState<Location>({
    ...history.location,
  });

  const handleInit = async () => {
    let isOk = true;
    onLoadStart && onLoadStart();
    try {
      await onInit();
    } catch (e) {
      isOk = false;
      if (!throwError) {
        fallback && fallback(e as Error);
      } else {
        throw e;
      }
    } finally {
      onLoadEnd && onLoadEnd(isOk);
      setInitComplete(true);
    }
  };

  const handleDispose = async () => {
    let isOk = true;
    onLoadStart && onLoadStart();
    try {
      await onDispose();
    } catch (e) {
      isOk = false;
      if (!throwError) {
        fallback && fallback(e as Error);
      } else {
        throw e;
      }
    } finally {
      onLoadEnd && onLoadEnd(isOk);
    }
  };

  useEffect(() => {
    handleInit();
    return () => {
      handleDispose();
    };
  }, []);

  useEffect(() => {
    const handleLocation = (update: Update) => {
      if (update.action === 'REPLACE') {
        return;
      }
      if (update.location.pathname !== location.pathname) {
        const newLocation = { ...update.location };
        setLocation(newLocation);
      }
    };
    return history.listen(handleLocation);
  }, [history, location]);

  const handleState = useMemo(
    () => async (): Promise<ISwitchResult> => {
      const { pathname: url = "/" } = location;
      unloadRef.current && (await unloadRef.current());
      for (const item of items) {
        const { element = Fragment, redirect, prefetch, unload, path } = item;

        const params: Record<string, unknown> = {};

        const keys: Key[] = [];
        const reg = pathToRegexp(path, keys);
        const match = reg.test(url);

        const buildParams = () => {
          const tokens = reg.exec(url);
          tokens &&
            keys.forEach((key, i) => {
              params[key.name] = tokens[i + 1];
            });
        };

        const provideUnloadRef = () => {
          if (unload) {
            unloadRef.current = async () => {
              await Promise.resolve(unload(params));
              unloadRef.current = null;
            };
          }
        };

        if (match) {
          if (await canActivate(item)) {
            buildParams();
            prefetch && Object.assign(params, await prefetch(params));
            provideUnloadRef();
            if (typeof redirect === "string") {
              setLocation((location) => ({
                ...location,
                pathname: redirect,
              }));
              return {
                element: Fragment,
                key: randomString(),
                path,
              };
            }
            if (typeof redirect === "function") {
              const result = redirect(params) || null;
              if (result !== null) {
                setLocation((location) => ({
                  ...location,
                  pathname: result,
                }));
                return {
                  element: Fragment,
                  key: randomString(),
                  path,
                };
              }
            }
            return {
              element,
              key: randomString(),
              params,
              path,
            };
          }
          return {
            element: Forbidden,
            key: randomString(),
            path,
          };
        }
      }
      return {
        element: NotFound,
        key: randomString(),
        path: url,
      };
    },
    [location]
  );

  if (!initComplete) {
    return <Loader />;
  }

  return (
    <FetchView<Location, ISwitchResult>
      className={className}
      style={style}
      state={handleState}
      Loader={Loader}
      Error={Error}
      animation={animation}
      payload={location}
      fallback={fallback}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      throwError={throwError}
    >
      {async (data) => {
        /* delay to prevent sync execution for appear animation */
        await sleep(0);
        return children(data);
      }}
    </FetchView>
  );
};

export default Switch;
