import * as React from "react";
import { useState, useRef, useEffect } from "react";

import { makeStyles } from "../../../styles";

import { debounce } from "@mui/material";

import classNames from "../../../utils/classNames";

import DefaultFade from "./DefaultFade";

const FADE_ANIMATION_DELAY = 50;
const FADE_MARK = "react-declarative__fadeMark";
export const SCROLL_VIEW_TARGER = "react-declarative__scrollViewTarget";

const useStyles = makeStyles()({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
  },
  container: {
    flex: 1,
  },
  bottomFade: {
    position: "absolute",
    pointerEvents: "none",
    height: 75,
    bottom: 0,
    right: 0,
    left: 0,
  },
  rightFade: {
    position: "absolute",
    pointerEvents: "none",
    width: 75,
    bottom: 0,
    right: 0,
    top: 0,
  },
});

/**
 * Represents the properties for the FadeContainer component.
 */
export interface IFadeContainerProps {
  className?: string;
  Fade?: typeof DefaultFade;
  style?: React.CSSProperties;
  children: React.ReactNode;
  color?: string;
  selector?: string;
  zIndex?: number;
  disableBottom?: boolean;
  disableRight?: boolean;
}

/**
 * Interface representing a fade state.
 *
 * @interface
 */
interface IFadeState {
  visible: boolean;
  none: boolean;
}

declare var ResizeObserver: any;

/**
 * Represents a container component that fades out its content on certain scroll and resize events.
 *
 * @typedef {Object} FadeContainer
 * @property {string} className - The CSS class names to apply to the root element.
 * @property {Object} style - The inline CSS styles to apply to the root element.
 * @property {string} color - The color of the fade effect.
 * @property {ReactNode} children - The content to be rendered inside the container.
 * @property {boolean} disableBottom - Whether or not to disable the bottom fade effect. Default is false.
 * @property {boolean} disableRight - Whether or not to disable the right fade effect. Default is false.
 * @property {number} zIndex - The z-index of the fade effect. Default is 9.
 * @property {ReactComponent} Fade - The fade effect component to use. Default is DefaultFade.
 * @property {string} selector - The CSS selector to find the scroll view element. Default is `.${SCROLL_VIEW_TARGER}`.
 *
 * @returns - The rendered FadeContainer component.
 */
export const FadeContainer = ({
  className,
  style,
  color,
  children,
  disableBottom = false,
  disableRight = false,
  zIndex = 9,
  Fade = DefaultFade,
  selector = `.${SCROLL_VIEW_TARGER}`,
}: IFadeContainerProps) => {
  const { classes } = useStyles();

  const [elementRef, setElementRef] = useState<HTMLDivElement>();

  const [bottomState, setBottomState] = useState<IFadeState>({
    visible: false,
    none: true,
  });

  const [rightState, setRightState] = useState<IFadeState>({
    visible: false,
    none: true,
  });

  const lastBottomStateRef = useRef<IFadeState>(bottomState);

  const lastRightStateRef = useRef<IFadeState>(bottomState);

  useEffect(() => {
    lastBottomStateRef.current = bottomState;
    lastRightStateRef.current = rightState;
  }, [bottomState, rightState]);

  useEffect(() => {
    if (elementRef) {
      const scrollViewRef = elementRef.querySelector(selector);
      if (scrollViewRef) {
        const bottomCopy = Object.assign({}, lastBottomStateRef.current);
        const rightCopy = Object.assign({}, lastRightStateRef.current);
        const updateBottom = debounce(
          () => setBottomState({ ...bottomCopy }),
          FADE_ANIMATION_DELAY
        );
        const updateRight = debounce(
          () => setRightState({ ...rightCopy }),
          FADE_ANIMATION_DELAY
        );
        let lastScrollHeight = -1,
          lastScrollWidth = -1;
        let lastScrollTop = -1,
          lastScrollLeft = -1;
        const handleScroll = () => {
          const { scrollTop, scrollLeft } = scrollViewRef;
          if (scrollTop !== lastScrollTop) {
            bottomCopy.visible = scrollTop === 0;
            bottomCopy.none = false;
            updateBottom();
          }
          if (scrollLeft !== lastScrollLeft) {
            rightCopy.visible = scrollLeft === 0;
            rightCopy.none = false;
            updateRight();
          }
          lastScrollLeft = scrollLeft;
          lastScrollTop = scrollTop;
        };
        const handleResize = () => {
          const { scrollHeight, scrollWidth } = scrollViewRef;
          if (scrollHeight !== lastScrollHeight) {
            const { clientHeight } = scrollViewRef;
            bottomCopy.none = clientHeight >= scrollHeight;
            updateBottom();
          }
          if (scrollWidth !== lastScrollWidth) {
            const { clientWidth } = scrollViewRef;
            rightCopy.none = clientWidth >= scrollWidth;
            updateRight();
          }
          lastScrollHeight = scrollHeight;
          lastScrollWidth = scrollWidth;
        };
        const observer = new ResizeObserver(handleResize);
        observer.observe(scrollViewRef);
        handleScroll();
        handleResize();
        scrollViewRef.addEventListener("scroll", handleScroll, {
          passive: true,
        });
        window.addEventListener("resize", handleResize, { passive: true });
        return () => {
          scrollViewRef.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleResize);
          observer.unobserve(scrollViewRef);
          updateBottom.clear();
          updateRight.clear();
        };
      }
      return () => null;
    }
    return () => null;
  }, [selector, elementRef]);

  const handleElementRef = (elementRef: HTMLDivElement) =>
    setElementRef(elementRef);

  return (
    <div className={classNames(classes.root, className)} style={style}>
      <div className={classes.container} ref={handleElementRef}>
        {children}
      </div>
      {!disableBottom && (
        <Fade
          className={classNames(classes.bottomFade, FADE_MARK)}
          position="bottom"
          visible={bottomState.visible}
          none={bottomState.none}
          color={color}
          zIndex={zIndex}
        />
      )}
      {!disableRight && (
        <Fade
          className={classNames(classes.rightFade, FADE_MARK)}
          position="right"
          visible={rightState.visible}
          none={rightState.none}
          color={color}
          zIndex={zIndex}
        />
      )}
    </div>
  );
};

export default FadeContainer;
