import * as React from "react";
import { useState, useRef, useLayoutEffect } from "react";

import Stack from "@mui/material/Stack";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";

import DragDropView, { ACCEPT_DEFAULT } from "../DragDropView";
import ActionStopIcon from "../ActionStopIcon";
import ActionIcon from "../ActionIcon";

import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";

import useActualValue from "../../hooks/useActualValue";
import useActualCallback from "../../hooks/useActualCallback";

import { SxProps } from "@mui/system";

interface IFilesViewProps {
  items?: string[];
  disabled?: boolean;
  onUpload?: (file: File) => string | Promise<string>;
  onRemove?: (item: string) => void | Promise<void>;
  onChange?: (items: string[]) => void | Promise<void>;
  onClick?: (item: string) => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps;
  accept?: string;
  multiple?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
  fallback?: (e: Error) => void;
  throwError?: boolean;
}

export const FilesView = ({
  items = [],
  className,
  style,
  sx,
  disabled: upperDisabled = false,
  onUpload = ({ name }) => name,
  onRemove = () => undefined,
  onChange = () => undefined,
  onClick = () => undefined,
  accept = ACCEPT_DEFAULT,
  multiple = false,
  onLoadStart,
  onLoadEnd,
  fallback,
  throwError = false,
}: IFilesViewProps) => {
  const [loading, setLoading] = useState(0);

  const disabled = !!loading || upperDisabled;

  const handleLoadStart = () => {
    setLoading((loading) => loading + 1);
    onLoadStart && onLoadStart();
  };

  const handleLoadEnd = (isOk: boolean) => {
    setLoading((loading) => Math.max(loading - 1, 0));
    onLoadEnd && onLoadEnd(isOk);
  };

  const isMounted = useRef(true);

  useLayoutEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  const [uploads, setUploads] = useState<String[]>([]);

  const items$ = useActualValue(items);
  const onChange$ = useActualCallback(onChange);

  const handleRemove = async (item: string) => {
    let isOk = true;
    try {
      handleLoadStart();
      await onRemove(item);
      await onChange$(items$.current.filter((it) => it !== item));
    } catch (e: any) {
      isOk = false;
      if (!throwError) {
        fallback && fallback(e as Error);
      } else {
        throw e;
      }
    } finally {
      handleLoadEnd(isOk);
    }
  };

  const handleData = async (files: File[]) => {
    let isOk = true;
    try {
      handleLoadStart();
      for (const file of files) {
        const fileName = new String(file.name);
        isMounted.current &&
          setUploads((prevUploads) => [...prevUploads, fileName]);
        const docName = await onUpload(file);
        isMounted.current &&
          setUploads((prevUploads) =>
            prevUploads.filter((item) => item !== fileName)
          );
        await onChange$([...items$.current, docName]);
      }
    } catch (e: any) {
      isOk = false;
      if (!throwError) {
        fallback && fallback(e as Error);
      } else {
        throw e;
      }
    } finally {
      handleLoadEnd(isOk);
    }
  };

  const handleClick = async (file: string) => {
    let isOk = true;
    try {
      handleLoadStart();
      await onClick(file);
    } catch (e: any) {
      isOk = false;
      if (!throwError) {
        fallback && fallback(e as Error);
      } else {
        throw e;
      }
    } finally {
      handleLoadEnd(isOk);
    }
  };

  return (
    <Stack
      className={className}
      style={style}
      sx={sx}
      overflow="hidden"
      direction="column"
      alignItems="stretch"
      justifyContent="stretch"
    >
      <DragDropView
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        onData={handleData}
      />
      <List dense disablePadding sx={{ mt: 1 }}>
        {uploads.map((item, idx) => (
          <ListItem
            disableGutters
            key={`${item}-${idx}`}
            secondaryAction={
              <ActionStopIcon disabled={disabled}>
                <ClearIcon />
              </ActionStopIcon>
            }
          >
            <ListItemButton>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
        {items.map((item, idx) => (
          <ListItem
            disableGutters
            key={`${item}-${idx}`}
            secondaryAction={
              <ActionIcon
                disabled={disabled}
                onClick={() => handleRemove(item)}
              >
                <DeleteIcon />
              </ActionIcon>
            }
          >
            <ListItemButton onClick={() => handleClick(item)}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
        {!items.length && !loading && (
          <ListItem sx={{ pointerEvents: 'none' }}>
            <ListItemButton>
              <ListItemText primary="Nothing found" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Stack>
  );
};

export default FilesView;
