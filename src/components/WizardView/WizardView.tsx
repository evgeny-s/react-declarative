import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { alpha, darken } from "@mui/material";
import { makeStyles } from "../../styles";

import OutletView, { IOutlet } from "../OutletView";
import PaperView from "../PaperView";

import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import LinearProgress from "@mui/material/LinearProgress";

import IWizardViewProps from "./model/IWizardViewProps";
import { OtherProps } from "./model/IWizardOutlet";
import IAnything from "../../model/IAnything";

import useLocalHistory from "../../hooks/useLocalHistory";
import useElementSize from "../../hooks/useElementSize";
import useSingleton from "../../hooks/useSingleton";

import classNames from "../../utils/classNames";

const HEADER_HEIGHT = 65;
const LOADER_HEIGHT = 4;

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
    overflowX: "auto",
    top: 0,
    left: 0,
    height: `${HEADER_HEIGHT}px`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    background:
      theme.palette.mode === "dark"
        ? darken(theme.palette.background.paper, 0.06)
        : alpha("#000", 0.05),
    width: "100%",
  },
  loader: {
    position: "absolute",
    top: HEADER_HEIGHT - LOADER_HEIGHT,
    height: "4px",
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
}));

/**
 * WizardView component.
 *
 * @template Data - The type of data object passed to the WizardView.
 * @template Payload - The type of payload object passed to the WizardView.
 *
 * @param {Object} props - The props object.
 * @param {string} props.className - The class name of the WizardView.
 * @param {Object} props.style - The inline styles of the WizardView.
 * @param {Object} props.sx - The sx prop for custom styling.
 * @param {Payload} props.payload - The payload object for the WizardView.
 * @param {boolean} props.outlinePaper - If true, the PaperView displays an outline.
 * @param {boolean} props.transparentPaper - If true, the PaperView displays as transparent.
 * @param {Object} props.history - The history object for the WizardView.
 * @param {string} props.pathname - The pathname for the WizardView.
 * @param {Object[]} props.steps - The steps array for the WizardView.
 * @param {Object[]} props.routes - The routes array for the WizardView.
 * @param {function} props.onLoadStart - The function to be called when loading starts.
 * @param {function} props.onLoadEnd - The function to be called when loading ends.
 * @param {Object} props.otherProps - The other props object for the WizardView.
 * @param {Object} outletProps - The outlet props object for the WizardView.
 *
 * @returns {ReactNode} The rendered WizardView component.
 */
export const WizardView = <Data extends {} = IAnything, Payload = IAnything>({
  className,
  style,
  sx,
  payload: upperPayload = {} as Payload,
  outlinePaper = false,
  transparentPaper = false,
  history: upperHistory,
  pathname = "/",
  steps: upperSteps,
  routes,
  onLoadStart,
  onLoadEnd,
  otherProps: upperOtherProps = {},
  ...outletProps
}: IWizardViewProps<Data, Payload>) => {
  const { elementRef, size } = useElementSize();

  const payload = useSingleton(upperPayload);

  const steps = useMemo(
    () => upperSteps.filter(({ isVisible = () => true }) => isVisible(payload)),
    []
  );

  const { classes } = useStyles();

  const { history } = useLocalHistory({
    history: upperHistory,
    pathname,
  });

  const [path, setPath] = useState(history.location.pathname);
  const [loading, setLoading] = useState(0);
  const [progress, setProgress] = useState(0);

  const lastActiveStep = useRef(-1);

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
    [size.height, size.width, loading]
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

  const activeStep = useMemo(() => {
    const route = routes.find(({ isActive }) => isActive(path));
    if (!route) {
      return -1;
    }
    const activeStep = steps.findIndex(
      ({ isMatch = () => false, id }) => id === route.id || isMatch(route.id)
    );
    if (activeStep === -1) {
      return lastActiveStep.current;
    }
    return (lastActiveStep.current = activeStep);
  }, [path]);

  const renderLoader = useCallback(() => {
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

  return (
    <PaperView
      outlinePaper={outlinePaper}
      transparentPaper={transparentPaper}
      className={classNames(classes.root, className)}
      style={style}
      sx={sx}
    >
      <Stepper
        className={classes.header}
        activeStep={activeStep}
        sx={{ background: outlinePaper || transparentPaper ? "transparent !important" : "inherit" }}
      >
        {steps.map(({ label, icon: Icon }, idx) => (
          <Step key={idx} completed={activeStep > idx}>
            <StepLabel StepIconComponent={Icon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderLoader()}
      <div className={classes.adjust} />
      <Box ref={elementRef} className={classes.content}>
        <OutletView<Data, Payload>
          history={history}
          routes={routes as IOutlet<Data, Payload>[]}
          otherProps={otherProps}
          payload={payload}
          {...outletProps}
        />
      </Box>
    </PaperView>
  );
};

export default WizardView;
