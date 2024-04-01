import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { alpha, darken } from "@mui/material";
import { makeStyles } from "../../styles";

import OutletView, { IOutlet } from "../OutletView";
import PaperView from "../PaperView";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import LinearProgress from "@mui/material/LinearProgress";

import ITabsViewProps from "./model/ITabsViewProps";
import { OtherProps } from "./model/ITabsOutlet";
import IAnything from "../../model/IAnything";

import useLocalHistory from "../../hooks/useLocalHistory";
import useElementSize from "../../hooks/useElementSize";
import useSingleton from "../../hooks/useSingleton";

import classNames from "../../utils/classNames";

const HEADER_HEIGHT = 48;
const LOADER_HEIGHT = 4;

/**
 * Returns an object with CSS classes generated by the makeStyles function.
 *
 * @function
 * @name useStyles
 * @returns {Object} - Object with CSS classes
 */
const useStyles = makeStyles()((theme) => ({
  root: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    flexDirection: "column",
    width: "100%",
    minHeight: 365,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    marginLeft: 0,
    height: `${HEADER_HEIGHT}px`,
    width: "100%",
  },
  headerBg: {
    background:
      theme.palette.mode === "dark"
        ? darken(theme.palette.background.paper, 0.06)
        : alpha("#000", 0.05),
  },
  loader: {
    position: "absolute",
    top: HEADER_HEIGHT - LOADER_HEIGHT,
    height: `${LOADER_HEIGHT}px`,
    zIndex: 2,
    left: 0,
    width: "100%",
  },
  content: {
    flex: 1,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    "& > *:nth-of-type(1)": {
      flex: 1,
    },
  },
  adjust: {
    minHeight: HEADER_HEIGHT,
    maxHeight: HEADER_HEIGHT,
  },
  tabsRoot: {
    minHeight: HEADER_HEIGHT,
    height: HEADER_HEIGHT,
    marginLeft: "0 !important",
    marginRight: "0 !important",
  },
  tabRoot: {
    minHeight: HEADER_HEIGHT,
    height: HEADER_HEIGHT,
  },
  tabSelected: {},
  indicator: {
    height: "4px",
    background: `${theme.palette.primary.main} !important`,
  },
}));

/**
 * Represents a view component for rendering tabs and associated content.
 *
 * @template Data - The type of data associated with the tabs.
 * @template Payload - The type of payload associated with the tabs.
 * @param props - The props for the TabsView component.
 * @param [props.className] - The CSS class name.
 * @param [props.style] - The inline style object.
 * @param [props.sx] - The theme styling object.
 * @param [props.outlinePaper=false] - Whether to use outline paper.
 * @param [props.transparentPaper=false] - Whether the paper is transparent.
 * @param [props.transparentHeader=false] - Whether the header is transparent.
 * @param [props.history=upperHistory] - The history object for navigation.
 * @param [props.payload=upperPayload] - The payload associated with the tabs.
 * @param [props.pathname="/"] - The current pathname.
 * @param [props.tabs=upperTabs] - The array of tabs to render.
 * @param routes - The array of routes associated with the tabs.
 * @param onTabChange - The callback function fired when a tab is changed.
 * @param onLoadStart - The callback function fired when the loading starts.
 * @param onLoadEnd - The callback function fired when the loading ends.
 * @param BeforeTabs - The component to render before the tabs.
 * @param AfterTabs - The component to render after the tabs.
 * @param [props.otherProps=upperOtherProps] - The other props to pass to sub-components.
 * @returns - The rendered TabsView component.
 */
export const TabsView = <Data extends {} = IAnything, Payload = IAnything>({
  className,
  style,
  sx,
  outlinePaper = false,
  transparentPaper = false,
  transparentHeader = false,
  history: upperHistory,
  payload: upperPayload = {} as Payload,
  pathname = "/",
  tabs: upperTabs,
  routes,
  onTabChange,
  onLoadStart,
  onLoadEnd,
  onSubmit = () => true,
  BeforeTabs,
  AfterTabs,
  otherProps: upperOtherProps = {},
  ...outletProps
}: ITabsViewProps<Data, Payload>) => {
  const { elementRef, size } = useElementSize();

  const { classes } = useStyles();

  const payload = useSingleton(upperPayload);

  /**
   * A memoized value representing an array of upper tabs based on the provided payload.
   *
   * @type {Array} Array of upper tabs
   */
  const tabs = useMemo(
    () => upperTabs.filter(({ isVisible = () => true }) => isVisible(payload)),
    []
  );

  const { history } = useLocalHistory({
    history: upperHistory,
    pathname,
  });

  const [path, setPath] = useState(history.location.pathname);
  const [loading, setLoading] = useState(0);
  const [progress, setProgress] = useState(0);

  const lastActiveStep = useRef(-1);

  /**
   * @typedef {Object} OtherProps
   * @property {number} size - The size of the props
   * @property {boolean} loading - Indicates if the props are currently loading
   * @property {number} progress - The progress of the props loading
   * @property {function} setLoading - Function to set the loading state
   * @property {function} setProgress - Function to set the progress of the props loading
   * @property {object} upperOtherProps - Additional props to be included
   */
  const otherProps = useMemo(
    (): OtherProps => ({
      size,
      loading: !!loading,
      progress,
      setLoading: (isLoading) => {
        setLoading((loading) => Math.max(loading + (isLoading ? 1 : -1), 0));
        setProgress(0);
      },
      setProgress: (progress) => {
        setLoading(0);
        setProgress(progress);
      },
      ...upperOtherProps,
    }),
    [size.height, size.width]
  );

  useEffect(
    () =>
      history.listen(({ location, action }) => {
        if (action === "REPLACE") {
          setPath(location.pathname);
          setLoading(0);
          setProgress(0);
        }
      }),
    []
  );

  /**
   * Computes the active step index based on the current route and tabs.
   *
   * @function
   * @name activeStep
   * @returns {number} The index of the active step. Returns -1 if no active step is found.
   * @param {string} path - The current route path.
   *
   */
  const activeStep = useMemo(() => {
    const route = routes.find(({ isActive }) => isActive(path));
    if (!route) {
      return -1;
    }
    const activeStep = tabs.findIndex(
      ({ isMatch = () => false, id }) => id === route.id || isMatch(route.id)
    );
    if (activeStep === -1) {
      return lastActiveStep.current;
    }
    return (lastActiveStep.current = activeStep);
  }, [path]);

  /**
   * Renders a loader component based on the state of loading and progress.
   *
   * @returns {React.ReactNode} - The loader component to be rendered.
   */
  const renderLoader = useCallback(() => {
    if (progress === 100) {
      return null;
    }
    if (progress) {
      return (
        <LinearProgress
          className={classes.loader}
          value={progress}
          variant="determinate"
        />
      );
    }
    if (loading) {
      return (
        <LinearProgress className={classes.loader} variant="indeterminate" />
      );
    }
    return null;
  }, [loading, progress]);

  /**
   * Handles the form submit action.
   *
   * @param data - The form data.
   * @param payload - The additional payload.
   * @param config - The configuration object.
   * @param config.afterSave - A function called after the form is submitted successfully.
   * @returns - A promise that resolves to a boolean indicating if the form submission is successful.
   */
  const handleSubmit = useCallback(
    async (
      data: Data,
      payload: Payload,
      config: { afterSave: () => Promise<void> }
    ) => {
      if (loading) {
        return false;
      }
      if (progress && progress !== 100) {
        return false;
      }
      return await onSubmit(data, payload, config);
    },
    [onSubmit, loading, progress]
  );

  return (
    <PaperView
      outlinePaper={outlinePaper}
      transparentPaper={transparentPaper}
      className={classNames(classes.root, className)}
      style={style}
      sx={sx}
    >
      <Tabs
        variant="standard"
        className={classNames(classes.header, {
          [classes.headerBg]: !transparentHeader,
        })}
        classes={{ root: classes.tabsRoot, indicator: classes.indicator }}
        value={activeStep}
        sx={{ background: outlinePaper || transparentPaper ? "transparent !important" : "inherit" }}
        onChange={(_, idx) => {
          onTabChange(tabs[idx].id!, history, payload);
        }}
      >
        {BeforeTabs && <BeforeTabs />}
        {tabs.map(({ label, icon: Icon }, idx) => (
          <Tab
            key={idx}
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            label={label}
            icon={Icon && <Icon />}
          />
        ))}
        {AfterTabs && <AfterTabs />}
      </Tabs>
      {renderLoader()}
      <div className={classes.adjust} />
      <Box ref={elementRef} className={classes.content}>
        <OutletView<Data, Payload>
          history={history}
          routes={routes as IOutlet<Data, Payload>[]}
          otherProps={otherProps}
          payload={payload}
          onSubmit={handleSubmit}
          {...outletProps}
        />
      </Box>
    </PaperView>
  );
};

export default TabsView;
