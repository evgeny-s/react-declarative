import * as React from "react";
import { forwardRef } from "react";
import { SxProps } from "@mui/material";

import { makeStyles } from "../../../styles";

import Box, { BoxProps } from "@mui/material/Box";

import classNames from "../../../utils/classNames";

interface IWizardContainerProps extends BoxProps {
  ref?: React.Ref<HTMLDivElement | undefined>;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<any>;
  Navigation?: React.ReactNode;
}

const useStyles = makeStyles()({
  root: {
    display: "flex",
    height: "100%",
    width: "100%",
    justifyContent: "stretch",
    alignItems: "stretch",
    flexDirection: "column",
  },
  container: {
    flex: 1,
  },
});

const WizardContainerInternal = (
  { className, Navigation, children, ...otherProps }: IWizardContainerProps,
  ref: React.Ref<HTMLDivElement | undefined>
) => {
  const { classes } = useStyles();
  return (
    <Box
      ref={ref}
      className={classNames(className, classes.root)}
      {...otherProps}
    >
      <div className={classes.container}>{children}</div>
      {Navigation}
    </Box>
  );
};

export const WizardContainer = forwardRef(
  WizardContainerInternal
) as unknown as React.FC<IWizardContainerProps>;

export default WizardContainer;
