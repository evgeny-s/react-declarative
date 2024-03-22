import { useCallback } from "react";

import useSinglerunAction from "./useSinglerunAction";
import useActualCallback from "./useActualCallback";
import useActualState from "./useActualState";

import getErrorMessage from "../utils/getErrorMessage";
import sleep from "../utils/sleep";

import IAnything from "../model/IAnything";

/**
 * Represents the parameters for a function or method.
 * @interface
 * @template Data - The type of data to be processed.
 * @template Result - The type of result to be returned.
 */
interface IParams<Data extends IAnything, Result = void> {
  delay?: number;
  onBegin?: () => void;
  onEnd?: (isOk: boolean) => void;
  onFinish?: (
    data: Data[],
    errors: IError[],
    result: (Result | null)[]
  ) => void;
  onError?: (errors: IError[]) => void;
  onProgress?: (progress: number) => void;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
}

/**
 * Represents the interface for an Error object.
 * @interface
 */
interface IError {
  label: string;
  message: string;
  error: Error;
}

/**
 * Represents the state of a specific operation.
 * @interface
 */
interface IState {
  errors: IError[];
  progress: number;
}

/**
 * The `IProcess` interface represents a process with a label and associated data.
 * @template Data - The type of data associated with the process.
 */
interface IProcess<Data extends IAnything> {
  label: string;
  data: Data;
}

/**
 * Calculate the percentage of a value relative to a total.
 *
 * @param value - The value to calculate the percentage for.
 * @param total - The total value used as the denominator in the calculation.
 * @returns The calculated percentage value as a number.
 */
const getPercent = (value: number, total: number) =>
  Math.min(100, Math.round((Math.max(value, 0) / total) * 100));

/**
 * Executes a process asynchronously with progress tracking and error handling.
 *
 * @template Data - The type of data to be processed.
 * @template Result - The type of the process result.
 * @param process - The process function to be executed on each item.
 * @param options - Optional parameters for customizing the process behavior.
 * @param options.delay - The delay in milliseconds before each item processing. Default is 0.
 * @param options.onError - Callback function to be executed when an error occurs during processing. Default is an empty function.
 * @param options.onProgress - Callback function to be executed on each progress update. Default is an empty function.
 * @param options.onFinish - Callback function to be executed when all items are finished processing. Default is an empty function.
 * @param options.onBegin - Callback function to be executed when the process begins. Default is an empty function.
 * @param options.onEnd - Callback function to be executed when the process ends. Default is an empty function.
 * @returns An object containing the execute function, loading state, progress, and errors.
 *
 * @example
 * const items = [
 *   { label: 'Item 1', data: { id: 1 } },
 *   { label: 'Item 2', data: { id: 2 } },
 * ];
 *
 * const { execute, loading, progress, errors } = useAsyncProgress(
 *   async (item: IProcess<Data>) => {
 *     // Process the data here
 *   },
 *   {
 *     delay: 2000,
 *     onError: (error) => console.error(error),
 *     onProgress: (progress) => console.log(progress),
 *     onFinish: (data, errors, result) => console.log(data, errors, result),
 *     onBegin: () => console.log('Process started'),
 *     onEnd: (isOk) => console.log(`Process ended ${isOk ? 'successfully' : 'with errors'}`),
 *   }
 * );
 *
 * useEffect(() => {
 *   execute(items);
 * }, []);
 */
export const useAsyncProgress = <
  Data extends IAnything = IAnything,
  Result = void
>(
  process: (item: IProcess<Data>) => Result | Promise<Result>,
  {
    delay = 0,
    onError = () => undefined,
    onProgress = () => undefined,
    onFinish = () => undefined,
    onBegin = () => undefined,
    onEnd = () => undefined,
    ...otherParams
  }: IParams<Data, Result>
) => {
  const [state$, setState] = useActualState<IState>(() => ({
    errors: [],
    progress: 0,
  }));

  const onError$ = useActualCallback(onError);
  const onFinish$ = useActualCallback(onFinish);
  const onProgress$ = useActualCallback(onProgress);

  const onEnd$ = useActualCallback(onEnd);
  const onBegin$ = useActualCallback(onBegin);

  const setProgress = useCallback(
    (progress: number) =>
      setState((prevState) => ({
        ...prevState,
        progress,
      })),
    []
  );

  const setErrors = useCallback(
    (errors: IError[]) =>
      setState((prevState) => ({
        ...prevState,
        errors,
      })),
    []
  );

  const handleError = useCallback(
    (error: IError) =>
      setState((prevState) => ({
        ...prevState,
        errors: [...prevState.errors, error],
      })),
    []
  );

  const { execute, loading } = useSinglerunAction(
    async (items: IProcess<Data>[]) => {
      onBegin$();
      setProgress(0);
      setErrors([]);

      const execute = async (item: IProcess<Data>) => {
        const [result] = await Promise.all([process(item), sleep(delay)]);
        return result;
      };

      let count = 0;
      let isOk = true;
      const result: (Result | null)[] = [];
      for (const { label, data } of items) {
        try {
          result.push(
            await execute({
              label,
              data,
            })
          );
        } catch (error) {
          isOk = false;
          result.push(null);
          const e = {
            label,
            message: getErrorMessage(error),
            error: error as unknown as Error,
          };
          handleError(e);
          onError$([...state$.current.errors, e]);
        } finally {
          const progress = getPercent(++count, items.length);
          setProgress(progress);
          onProgress$(progress);
        }
      }
      onFinish$(
        items.map(({ data }) => data),
        state$.current.errors,
        result
      );
      onEnd$(isOk);
    },
    {
      ...otherParams,
      throwError: true,
    }
  );

  return {
    execute: useCallback((items: IProcess<Data>[]) => {
      execute(items);
    }, []),
    loading,
    ...state$.current,
  } as const;
};

export default useAsyncProgress;
