import * as React from "react";
import { SxProps } from "@mui/material";

import { makeStyles } from "../../../styles";

import Box, { BoxProps } from "@mui/material/Box";

import ActionButton, { usePreventAction } from "../../ActionButton";

import classNames from "../../../utils/classNames";

interface IWizardNavigationProps extends BoxProps {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps;
  disabled?: boolean;
  fallback?: (e: Error) => void;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => (void | Promise<void>);
  onNext?: () => (void | Promise<void>);
  throwError?: boolean;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    justifyContent: "stretch",
    alignItems: 'center',
    flexDirection: "row",
    padding: theme.spacing(1),
  },
  stretch: {
    flex: 1,
  },
}));

export const WizardNavigation = ({
  className,
  style,
  sx,
  disabled,
  fallback,
  onLoadStart,
  onLoadEnd,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  throwError,
  ...otherProps
}: IWizardNavigationProps) => {
  const { classes } = useStyles();

  const {
    handleLoadStart,
    handleLoadEnd,
    loading,
  } = usePreventAction({
    onLoadStart,
    onLoadEnd,
    disabled,
  });

  return (
    <Box
      className={classNames(className, classes.root)}
      style={style}
      sx={sx}
      {...otherProps}
    >
      <ActionButton
        disabled={loading || !hasPrev}
        onClick={onPrev}
        variant="contained"
        fallback={fallback}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        throwError={throwError}
      >
        Prev
      </ActionButton>
      <div className={classes.stretch} />
      <ActionButton
        disabled={loading || !hasNext}
        onClick={onNext}
        variant="contained"
        fallback={fallback}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        throwError={throwError}
      >
        Next
      </ActionButton>
    </Box>
  );
};

export default WizardNavigation;
