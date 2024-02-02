import * as React from "react";
import { useCallback } from "react";

import { makeStyles } from "../../styles";

import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import copyToClipboard from "../../utils/copyToClipboard";
import classNames from "../../utils/classNames";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ICopyProps extends BoxProps {
  fullWidth?: boolean;
  content: string;
  children?: React.ReactNode;
  onCopy?: () => void;
  onCopyClick?: () => void;
  fallback?: (e: Error) => void;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
  throwError?: boolean;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  content: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  stretch: {
    flex: 1,
  },
}));

const createCopyHandler = (content: React.ReactNode) => async () => {
  let isOk = false;
  isOk = isOk || typeof content === "string";
  isOk = isOk || typeof content === "number";
  isOk = isOk || typeof content === "boolean";
  isOk = isOk || content === undefined;
  isOk = isOk || content === null;
  if (!isOk) {
    return;
  }
  await copyToClipboard(String(content));
};

export const Copy = ({
  className,
  content,
  fullWidth,
  children = content,
  onCopy = createCopyHandler(content),
  onCopyClick,
  onLoadStart,
  onLoadEnd,
  fallback,
  throwError = false,
  ...otherProps
}: ICopyProps) => {
  const { classes } = useStyles();

  const handleClick = useCallback(
    async (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      let isOk = true;
      onLoadStart && onLoadStart();
      try {
        onCopyClick && onCopyClick();
        await Promise.resolve(onCopy());
      } catch (e: any) {
        isOk = false;
        if (!throwError) {
          fallback && fallback(e as Error);
        } else {
          throw e;
        }
      } finally {
        onLoadEnd && onLoadEnd(isOk);
      }
    },
    [onCopy, onLoadStart, onLoadEnd, fallback, throwError]
  );

  return (
    <Box className={classNames(className, classes.root)} {...otherProps}>
      <Typography className={classes.content} variant="body1">
        {children}
      </Typography>
      {!!fullWidth && <div className={classes.stretch} />}
      <IconButton className={classes.icon} onClick={handleClick} size="small">
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      {!fullWidth && <div className={classes.stretch} />}
    </Box>
  );
};

export default Copy;
