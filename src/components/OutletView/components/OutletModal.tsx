import * as React from "react";
import { useState, useEffect } from "react";

import { makeStyles } from "../../../styles";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import useActualState from "../../../hooks/useActualState";

import ActionButton from "../../ActionButton";
import FetchView, { IFetchViewProps } from "../../FetchView";
import LoaderView from "../../LoaderView";
import OutletView from "../OutletView";

import IOutletViewProps from "../model/IOutletViewProps";
import IAnything from "../../../model/IAnything";
import TSubject from "../../../model/TSubject";
import Id from "../model/Id";

import flatArray from "../../../utils/flatArray";

const Loader = LoaderView.createLoader(24);

export interface IOutletModalProps<
  Data extends {} = Record<string, any>,
  Payload = IAnything,
  Params = IAnything
> extends Omit<
    IOutletViewProps<Data, Payload, Params>,
    keyof {
      onSubmit: never;
      initialData: never;
      payload: never;
      params: never;
      data: never;
      id: never;
    }
  > {
  id: Id | null;
  title?: string;
  fetchState: IFetchViewProps<Id>["state"];
  reloadSubject?: TSubject<void>;
  onSubmit?: (id: Id, data: Data | null) => Promise<boolean> | boolean;
  AfterTitle?: React.ComponentType<{
    onClose?: () => void;
    data: Data | null;
  }>;
  data?: Data | null;
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
  fallback?: (e: Error) => void;
  throwError?: boolean;
  hidden?: boolean;
  submitLabel?: string;
  mapPayload?: (id: Id, data: Record<string, any>[]) => (Payload | Promise<Payload>);
  mapParams?: (id: Id, data: Record<string, any>[]) => (Params | Promise<Params>);
  mapInitialData?: (id: Id, data: Record<string, any>[]) => (Data | Promise<Data>);
}

const useStyles = makeStyles()((theme) => ({
  root: {
    position: "absolute",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    flexDirection: "column",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "calc(100vw - 50px)",
    height: "calc(100vh - 50px)",
    backgroundColor: theme.palette.background.paper,
    padding: 20,
    overflowY: "auto",
    borderRadius: 5,
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    color: theme.palette.text.primary,
  },
  content: {
    flex: 1,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    "& > *": {
      flex: 1,
    },
  },
  submit: {
    paddingTop: 15,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

export const OutletModal = <
  Data extends {} = Record<string, any>,
  Payload = IAnything,
  Params = IAnything
>({
  hidden = false,
  onSubmit = () => true,
  onChange = () => undefined,
  mapParams = () => ({ id }) as unknown as Params,
  mapInitialData = () => ({}) as unknown as Data,
  mapPayload = () => ({}) as unknown as Payload,
  onLoadStart,
  onLoadEnd,
  fallback,
  reloadSubject,
  id,
  fetchState,
  AfterTitle,
  title,
  data: upperData = null,
  throwError = false,
  submitLabel = "Submit",
  readonly,
  ...outletProps
}: IOutletModalProps<Data, Payload, Params>) => {
  const { classes } = useStyles();

  const [data, setData] = useState<Data | null>(upperData);
  const [loading, setLoading] = useActualState(0);

  useEffect(() => {
    setData(upperData);
  }, [open]);

  const handleChange = (data: Data, initial: boolean, source: string) => {
    setData(data);
    onChange(data, initial, source);
  };

  const handleLoadStart = () => {
    setLoading((loading) => loading + 1);
    onLoadStart && onLoadStart();
  };

  const handleLoadEnd = (isOk: boolean) => {
    setLoading((loading) => loading - 1);
    onLoadEnd && onLoadEnd(isOk);
  };

  const handleAccept = async () => {
    if (loading.current) {
      return;
    }
    let isOk = true;
    try {
      handleLoadStart();
      if (id) {
        await onSubmit(id, data);
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

  const handleClose = async () => {
    if (loading.current) {
      return;
    }
    let isOk = true;
    try {
      handleLoadStart();
      if (id) {
        await onSubmit(id, null);
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

  return (
    <Modal
      open={!!id}
      sx={{
        ...(hidden && {
          visibility: "hidden",
          opacity: 0,
        }),
      }}
      onClose={handleClose}
    >
      <Box className={classes.root}>
        {title && (
          <div className={classes.title}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {AfterTitle && (
              <AfterTitle data={data} onClose={handleClose} />
            )}
          </div>
        )}
        <Box className={classes.content}>
          {!!id && (
            <FetchView
              animation="none"
              payload={id}
              state={fetchState}
              reloadSubject={reloadSubject}
              fallback={fallback}
              onLoadStart={onLoadStart}
              onLoadEnd={onLoadEnd}
              Loader={Loader}
            >
              {async (...args) => (
                <OutletView
                  {...outletProps}
                  fallback={fallback}
                  onLoadStart={onLoadStart}
                  onLoadEnd={onLoadEnd}
                  initialData={await mapInitialData(id, flatArray(args))}
                  payload={await mapPayload(id, flatArray(args))}
                  params={await mapParams(id, flatArray(args))}
                  readonly={readonly}
                  onChange={handleChange}
                />
              )}
            </FetchView>
          )}
        </Box>
        {!readonly && (
          <ActionButton
            className={classes.submit}
            disabled={!!loading.current || !data}
            size="large"
            variant="contained"
            color="info"
            fullWidth
            onClick={handleAccept}
          >
            {submitLabel}
          </ActionButton>
        )}
      </Box>
    </Modal>
  );
};

export default OutletModal;
