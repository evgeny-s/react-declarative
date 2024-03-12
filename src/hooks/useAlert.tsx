import * as React from "react";
import { useEffect, useRef } from "react";

import { useModal } from "../components/ModalProvider";

import AlertPicker from "../components/common/AlertPicker";

import useActualCallback from "./useActualCallback";
import useActualRef from "./useActualRef";

import Subject from "../utils/rx/Subject";

type Fn = () => void;

interface IParams {
  title?: string;
  description?: string;
  large?: boolean;
}

interface IState {
  currentDescription: string;
  currentTitle: string;
  open: boolean;
}

/**
 * Function for displaying an alert modal.
 * @param {IParams} params - The alert parameters.
 * @param {string} params.title - The title of the alert. Default is "Alert".
 * @param {string} params.description - The description of the alert. Default is an empty string.
 * @param {boolean} params.large - Whether to display a large alert. Default is false.
 * @returns {function} - A function that, when called, displays the alert and returns a Promise.
 *                      The Promise resolves when the alert is closed.
 *
 * @example
 * const alert = useAlert();
 * alert({ title: "My Alert", description: "This is my alert message" })
 *   .then(() => {
 *     console.log("Alert closed");
 *   })
 *   .catch((error) => {
 *     console.error("Error occurred: ", error);
 *   });
 */
export const useAlert = ({
  title: defaultTitle = "Alert",
  description: defaultDescription = "",
  large = false,
}: IParams = {}) => {
  const changeRef = useRef<Fn>();

  const getInitialState = useActualCallback(
    (): IState => ({
      currentDescription: defaultDescription,
      currentTitle: defaultTitle,
      open: false,
    })
  );

  const [state$, setState] = useActualRef<IState>(getInitialState);

  useEffect(() => {
    if (!state$.current.open) {
      setState((prevState) => ({ ...prevState, currentTitle: defaultTitle }));
    }
  }, [defaultTitle]);

  useEffect(() => {
    if (!state$.current.open) {
      setState((prevState) => ({ ...prevState, currentDescription: defaultDescription }));
    }
  }, [defaultDescription]);

  const handleChange: Fn = () => {
    const { current } = changeRef;
    if (current) {
      current();
    }
    setState(getInitialState);
    hideModal();
  };

  const { showModal, hideModal } = useModal(
    () => (
      <AlertPicker
        open
        large={large}
        title={state$.current.currentTitle}
        description={state$.current.currentDescription}
        onOk={handleChange}
      />
    ),
    []
  );

  return ({ description, title }: Partial<IParams> = {}) =>
    new (class {
      constructor() {
        setState((prevState) => ({
          currentTitle: title !== undefined ? title : prevState.currentTitle,
          currentDescription: description !== undefined ? description : prevState.currentDescription,
          open: true,
        }));
        showModal();
      }
      then = (onData: Fn) => {
        changeRef.current = onData;
      };
      toPromise = async () => {
        const subject = new Subject<void>();
        this.then(subject.next);
        return await subject.toPromise();
      };
    })();
};

export default useAlert;
