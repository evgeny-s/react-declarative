import * as React from "react";
import { useState, useEffect, useCallback } from "react";

import { makeStyles } from "../../../../../styles";

import Box from "@mui/material/Box";
import MatListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import NotInterested from "@mui/icons-material/NotInterested";

import IListProps, {
  IListState,
  IListCallbacks,
} from "../../../../../model/IListProps";
import IAnything from "../../../../../model/IAnything";
import IRowData from "../../../../../model/IRowData";

import useSubject from "../../../../../hooks/useSubject";
import useElementSize from "../../../../../hooks/useElementSize";
import useRenderWaiter from "../../../../../hooks/useRenderWaiter";
import useSinglerunAction from "../../../../../hooks/useSinglerunAction";

import ModalLoader from "./components/ModalLoader";
import ListItem from "./components/ListItem";

import Container from "../../Container";
import VirtualView from "../../../../VirtualView";

const DEFAULT_ITEM_SIZE = 75;

export const MOBILE_LIST_ROOT = "react-declarative__mobileListRoot";

const useStyles = makeStyles()((theme) => ({
  root: {
    position: "relative",
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    background: theme.palette.background.paper,
  },
  empty: {
    position: "absolute",
    zIndex: 999,
    top: 0,
    left: 0,
    right: 0,
  },
}));

interface IChooserProps<
  FilterData extends {} = IAnything,
  RowData extends IRowData = IAnything
> extends Omit<
      IListProps<FilterData, RowData>,
      keyof {
        ref: never;
        limit: never;
        chips: never;
        search: never;
        filterData: never;
        isChooser: never;
        payload: never;
      }
    >,
    IListState<FilterData, RowData>,
    IListCallbacks<FilterData, RowData> {
  className?: string;
  style?: React.CSSProperties;
  listChips: IListProps["chips"];
}

interface IChooserState<
  FilterData extends {} = IAnything,
  RowData extends IRowData = IAnything
> {
  rows: IChooserProps<FilterData, RowData>["rows"];
  filterData: IChooserProps<FilterData, RowData>["filterData"];
}

export const Chooser = <
  FilterData extends {} = IAnything,
  RowData extends IRowData = IAnything
>(
  props: IChooserProps<FilterData, RowData>
) => {
  const { classes } = useStyles();

  const scrollYSubject = useSubject<number>();

  const {
    rows: upperRows,
    filterData: upperFilterData,
    offset,
    limit,
    total,
    loading,
    withLoader = false,
  } = props;

  const { size: { width: dialogWidth } } = useElementSize({
    target: document.body,
    selector: '.MuiDialog-container > .MuiPaper-root'
  });

  const { elementRef, size: { height: rootHeight } } = useElementSize();

  const { handlePageChange } = props;

  const [state, setState] = useState<IChooserState>({
    rows: upperRows,
    filterData: upperFilterData,
  });

  const handleCleanRows = useCallback(() => {
    setState(() => ({
      rows: upperRows,
      filterData: upperFilterData,
    }));
    scrollYSubject.next(0);
  }, [upperRows, upperFilterData]);

  const handleAppendRows = useCallback(
    () =>
      setState(({ rows, ...state }) => {
        const rowIds = new Set(rows.map(({ id }) => id));
        return {
          ...state,
          rows: [...rows, ...upperRows.filter(({ id }) => !rowIds.has(id))],
        };
      }),
    [state, upperRows]
  );

  useEffect(() => handleAppendRows(), [upperRows]);
  useEffect(() => handleCleanRows(), [upperFilterData]);

  const pendingPage = Math.floor(offset / limit) + 1;
  const hasMore = !total || pendingPage * limit < total;

  const waitForRequest = useRenderWaiter([loading]);

  const { execute: handleDataRequest } = useSinglerunAction(async () => {
    let isOk = true;
    isOk = isOk && hasMore;
    isOk = isOk && !loading;
    if (isOk) {
      handlePageChange(pendingPage);
      await waitForRequest();
    }
  });

  return (
    <Container<FilterData, RowData> {...props} {...state}>
      <Box ref={elementRef} className={classes.root}>
        <Box className={classes.container}>
          <Box position="relative" style={{ height: rootHeight, width: dialogWidth }}>
            <VirtualView
              scrollYSubject={scrollYSubject}
              minRowHeight={DEFAULT_ITEM_SIZE}
              onDataRequest={async () => void await handleDataRequest()}
              sx={{ height: rootHeight, width: dialogWidth }}
            >
              {!loading && state.rows.length === 0 && (
                <MatListItem className={classes.empty}>
                  <ListItemIcon>
                    <NotInterested />
                  </ListItemIcon>
                  <ListItemText primary="Empty" secondary="Nothing found" />
                </MatListItem>
              )}
              {state.rows.map((row, idx) => (
                <ListItem key={`${row.id}-${idx}`} row={row} />
              ))}
            </VirtualView>
            <ModalLoader open={withLoader && loading} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Chooser;
