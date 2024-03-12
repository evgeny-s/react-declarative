import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { makeStyles } from "../../styles";

import { Reveal } from "../FetchView";

import useChangeSubject from "../../hooks/useChangeSubject";
import useRenderWaiter from "../../hooks/useRenderWaiter";
import useActualValue from "../../hooks/useActualValue";
import useSingleton from "../../hooks/useSingleton";
import useConfirm from "../../hooks/useConfirm";
import useSubject from "../../hooks/useSubject";

import IOutletViewProps from "./model/IOutletViewProps";
import IOutletProps from "./model/IOutletProps";
import IAnything from "../../model/IAnything";

import sleep from "../../utils/sleep";
import classNames from "../../utils/classNames";
import queued from "../../utils/hof/queued";
import IOtherProps from "./model/IOtherProps";

const LEAVE_MESSAGE = "The form contains unsaved changes. Continue?";

const WAIT_FOR_CHANGES_DELAY = 1_000;

const Fragment = () => <></>;

const useStyles = makeStyles()({
  root: {
    width: "100%",
  },
});

interface IState {
  component: React.ComponentType<any>;
  activeOption: string;
}


/**
 * OutletView component documentation
 *
 * @description Use `history.replace` to navigate between subviews
 *
 * @param className - The class name of the component
 * @param readonly - Flag indicating if the component should be in read only mode
 * @param waitForChangesDelay - Delay in milliseconds for waiting for changes before submit
 * @param initialData - Initial data object for the component
 * @param animation - Animation type for the component
 * @param routes - Array of route objects for the component
 * @param params - Parameters object for the component
 * @param upperPayload - Payload object for the component
 * @param history - History object for the component
 * @param fallback - Fallback function for error handling
 * @param onChange - Change event handler function
 * @param onSubmit - Submit event handler function
 * @param onLoadStart - Load start event handler function
 * @param onLoadEnd - Load end event handler function
 * @param upperChangeSubject - Change subject for the component
 * @param otherProps - Other properties for the component
 * @returns The rendered component
 */
export const OutletView = <
  Data extends {} = Record<string, any>,
  Payload = IAnything,
  Params = IAnything,
  OtherProps = IOtherProps,
>({
  className,
  readonly,
  waitForChangesDelay = WAIT_FOR_CHANGES_DELAY,
  initialData = {} as Data,
  animation,
  routes,
  params = {} as Params,
  payload: upperPayload = {} as Payload,
  history,
  fallback,
  onChange,
  onSubmit = () => true,
  onLoadStart,
  onLoadEnd,
  changeSubject: upperChangeSubject,
  otherProps = {} as OtherProps,
  ...revealProps
}: IOutletViewProps<Data, Payload, Params, OtherProps>) => {
  const { classes } = useStyles();

  const changeSubject = useSubject(upperChangeSubject);

  const [data, setData] = useState(() => ({
    ...routes.reduce<Data>(
      (acm, { id }) => ({ ...acm, [id]: null }),
      {} as Data
    ),
    ...initialData,
  }));

  const [invalid, setInvalid] = useState(() => new Set<string>());
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(0);
  const [pathname, setPathname] = useState(history.location.pathname);

  useEffect(
    () =>
      changeSubject.subscribe(([key, value]) => {
        setData((prevData) => ({
          ...prevData,
          [key]: value,
        }));
        setInvalid((prevInvalid) => {
          prevInvalid.delete(key);
          return new Set(prevInvalid);
        });
      }),
    []
  );

  const [state, setState] = useState<IState>(() => ({
    component: Fragment,
    activeOption: "",
  }));

  const { component, activeOption } = state;

  const [appear, setAppear] = useState(false);

  const payload = useSingleton(upperPayload);

  const pickConfirm = useConfirm({
    title: "Continue?",
    msg: LEAVE_MESSAGE,
  });

  const confirmSubject = useSubject<boolean>();
  const confirmRef = useRef<boolean>(false);
  const changeRef = useRef<string>("unknown");

  const hasChanged = changed && !loading && !invalid.size;
  const hasInvalid = !!invalid.size;
  const hasLoading = !!loading;

  const hasChanged$ = useActualValue(hasChanged);
  const hasLoading$ = useActualValue(hasLoading);
  const hasInvalid$ = useActualValue(hasInvalid);
  const pathname$ = useActualValue(pathname);
  const data$ = useActualValue(data);

  const leaveSubject = useSubject<void>();
  const dataChangeSubject = useChangeSubject(data);

  useEffect(
    () => () => {
      leaveSubject.next();
    },
    []
  );

  useEffect(
    () =>
      dataChangeSubject.subscribe((data) => {
        const { current: changed } = hasChanged$;
        onChange && onChange(data, !changed, payload, changeRef.current);
        changeRef.current = "unknown";
      }),
    [onChange]
  );

  const handleLoadStart = () => {
    onLoadStart && onLoadStart();
    setLoading((loading) => loading + 1);
  };

  const handleLoadEnd = (isOk: boolean) => {
    onLoadEnd && onLoadEnd(isOk);
    setLoading((loading) => loading - 1);
  };

  const unsubscribeRef = useRef<Function | null>();

  const waitForElement = useRenderWaiter([component, activeOption], 10);
  const waitForRender = useRenderWaiter([data, changed], 10);
  const waitForLeave = () => leaveSubject.toPromise();

  const afterSave = async () => {
    unsubscribeRef.current && unsubscribeRef.current();
    setChanged(false);
    await Promise.race([waitForRender(), waitForLeave()]);
  };

  const waitForChanges = async () => {
    const unblock = history.block(() => {});
    handleLoadStart();
    try {
      await Promise.race([waitForRender(), sleep(waitForChangesDelay)]);
    } finally {
      handleLoadEnd(false);
      unblock();
    }
  };

  const beginSave = async () => {
    if (!hasChanged$.current) {
      return false;
    }
    if (hasLoading$.current) {
      return false;
    }
    if (hasInvalid$.current) {
      return false;
    }
    await waitForChanges();
    const unblock = history.block(() => {});
    const { current: data } = data$;
    if (data) {
      let isOk = true;
      handleLoadStart();
      try {
        let isSkipped = false;
        const result = await Promise.resolve(
          onSubmit(data, payload, {
            async afterSave() {
              unblock();
              await afterSave();
              isSkipped = true;
            },
          })
        );
        if (result && !isSkipped) {
          await afterSave();
        }
        isOk = !!result;
      } catch (e) {
        isOk = false;
        unsubscribeRef.current && unsubscribeRef.current();
        if (fallback) {
          fallback(e as Error);
        } else {
          throw e;
        }
      } finally {
        handleLoadEnd(isOk);
        unblock();
      }
      return isOk;
    } else {
      return false;
    }
  };

  useEffect(
    () =>
      history.listen(({ location, action }) => {
        if (action === "PUSH") {
          return;
        }
        setPathname(location.pathname);
      }),
    []
  );

  useEffect(() => {
    const { location } = history;
    setPathname(location.pathname);
  }, []);

  useEffect(() => {
    const waitForConfirm = () => {
      if (confirmRef.current) {
        return confirmSubject.toPromise();
      }
      return new Promise<boolean>((res) => {
        confirmRef.current = true;
        pickConfirm({
          msg: LEAVE_MESSAGE,
        }).then((isOk) => {
          confirmRef.current = false;
          confirmSubject.next(isOk);
          res(isOk);
        });
      });
    };

    const handleNavigate = async (retry: () => void) => {
      const isOk = await waitForConfirm();
      isOk && unsubscribe();
      isOk && retry();
    };

    const createRouterSubject = () =>
      history.block(({ retry, location }) => {
        if (
          routes.some(({ isActive, isAvailable = isActive }) =>
            isAvailable(location.pathname)
          )
        ) {
          unsubscribeRef.current && unsubscribeRef.current();
          retry();
          return;
        }
        handleNavigate(retry);
      });

    const createUnloadSubject = () => {
      const handler = (e: any) => {
        e.preventDefault();
        return LEAVE_MESSAGE;
      };
      window.addEventListener("beforeunload", handler);
      return () => {
        window.removeEventListener("beforeunload", handler);
      };
    };

    let unsubscribeRouter: ReturnType<typeof createRouterSubject>;
    let unsubscribeUnload: ReturnType<typeof createUnloadSubject>;

    const unsubscribe = () => {
      unsubscribeRouter && unsubscribeRouter();
      unsubscribeUnload && unsubscribeUnload();
      unsubscribeRef.current = null;
    };

    const subscribe = () => {
      unsubscribeRouter = createRouterSubject();
      unsubscribeUnload = createUnloadSubject();
      unsubscribeRef.current = unsubscribe;
    };

    if (!!data && !!changed) {
      subscribe();
    }

    return unsubscribe;
  }, [data, changed, pathname]);

  const handleChange = (
    id: string,
    pendingData: Data[keyof Data],
    initial: boolean
  ) => {
    setInvalid((prevInvalid) => {
      prevInvalid.delete(id);
      return new Set(prevInvalid);
    });
    setData((prevData) => ({
      ...prevData,
      [id]: pendingData,
    }));
    if (!initial) {
      setChanged(true);
    }
    changeRef.current = id;
  };

  const renderHandler = useMemo(
    () =>
      queued(async () => {
        const { current: pathname } = pathname$;
        setAppear(true);
        const target = routes.find(({ isActive }) => isActive(pathname));
        if (target) {
          const { id, element } = target;
          setState({
            component: element,
            activeOption: id,
          });
        } else {
          setState({
            component: Fragment,
            activeOption: "",
          });
        }
        await Promise.race([waitForElement(), sleep(500)]);
        setAppear(false);
      }),
    []
  );

  useEffect(() => {
    renderHandler();
  }, [pathname]);

  const formState = useMemo(
    () => ({
      data,
      hasChanged,
      hasLoading,
      hasInvalid,
      id: (params && params["id"]) || "create",
      change: (data: Data) => {
        setData((prevData) => ({
          ...prevData,
          ...data,
        }));
        setChanged(true);
      },
      payload,
    }),
    [
      data,
      hasChanged,
      hasLoading,
      hasInvalid,
      (params && params["id"]) || "create",
    ]
  );

  const outletProps: IOutletProps<Data> = {
    dirty: hasInvalid || hasChanged,
    history,
    activeOption,
    readonly: readonly || hasChanged,
    hasChanged,
    hasLoading,
    hasInvalid,
    beginSave,
    afterSave,
    formState,
    data: typeof data[activeOption] === "undefined" ? {} : data[activeOption],
    params,
    onChange: (data: Data[keyof Data], initial = false) =>
      handleChange(activeOption, data, initial),
    onInvalid: () =>
      setInvalid((prevInvalid) => {
        prevInvalid.add(activeOption);
        return new Set(prevInvalid);
      }),
    payload,
  };

  return (
    <Reveal
      className={classNames(className, classes.root)}
      {...revealProps}
      animation={animation}
      appear={appear}
    >
      {React.createElement(component, {
        key: activeOption,
        ...outletProps,
        ...otherProps
      })}
    </Reveal>
  );
};

export default OutletView;
