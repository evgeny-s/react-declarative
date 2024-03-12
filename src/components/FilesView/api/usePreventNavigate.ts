import { useState, useEffect, useRef } from "react";

import { MemoryHistory, BrowserHistory, HashHistory } from "history";

import useConfirm from "../../../hooks/useConfirm";

import compose from "../../../utils/compose";

const LEAVE_MESSAGE = "The form contains unsaved changes. Continue?";

interface IParams {
  history: MemoryHistory | BrowserHistory | HashHistory;
  withConfirm?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
}

/**
 * Prevents navigation, displays confirmation prompt if specified,
 * and handles loading state changes.
 *
 * @param history - The history object from react-router-dom.
 * @param withConfirm - Determines if a confirmation prompt should be displayed before navigating.
 * @param onLoadStart - Callback function invoked when loading starts.
 * @param onLoadEnd - Callback function invoked when loading ends.
 * @returns
 * 
 * 
 * 
 * 
 * 
 *  - Object containing methods and state for preventing navigation and handling loading state.
 */
export const usePreventNavigate = ({
  history,
  withConfirm = false,
  onLoadStart,
  onLoadEnd,
}: IParams) => {
  const [loading, setLoading] = useState(0);
  const [unblocked, setUnblocked] = useState(false);

  const unsubscribeRef = useRef<Function | null>(null);

  const pickConfirm = useConfirm({
    title: "Continue?",
    msg: LEAVE_MESSAGE,
  });

  useEffect(() => {
    const handleNavigate = (retry: () => void) => {
      if (withConfirm) {
        pickConfirm().then((result) => {
          if (result) {
            unsubscribeRef.current && unsubscribeRef.current();
            retry();
          }
        });
      }
    };

    const createRouterBlocker = () =>
      history.block(({ retry }) => handleNavigate(retry));

    const createUnloadBlocker = () => {
      const handler = (e: any) => {
        e.preventDefault();
        return LEAVE_MESSAGE;
      };
      window.addEventListener("beforeunload", handler);
      return () => {
        window.removeEventListener("beforeunload", handler);
      };
    };

    if (loading && !unblocked) {
      unsubscribeRef.current && unsubscribeRef.current();
      unsubscribeRef.current = compose(
        createRouterBlocker(),
        createUnloadBlocker()
      );
    }
    return () => {
      unsubscribeRef.current && unsubscribeRef.current();
    };
  }, [loading, unblocked, withConfirm]);

  return {
    handleLoadStart: () => {
      onLoadStart && onLoadStart();
      setLoading((loading) => loading + 1);
    },
    handleLoadEnd: (isOk: boolean) => {
      onLoadEnd && onLoadEnd(isOk);
      setLoading((loading) => loading - 1);
    },
    unblock: () => {
      unsubscribeRef.current && unsubscribeRef.current();
      setUnblocked(true);
    },
    block: () => {
      setUnblocked(false);
    },
    loading: !!loading,
  } as const;
};

export default usePreventNavigate;
