import * as React from "react";
import { useEffect, Fragment } from 'react';

import { makeStyles } from '../../../../../styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import TablePagination from '../../TablePagination';

import IListProps, { IListState, IListCallbacks } from '../../../../../model/IListProps';
import IAnything from '../../../../../model/IAnything';
import IRowData from '../../../../../model/IRowData';

import ConstraintView from "../../../../ConstraintView";

import DisplayMode from "../../../../../model/DisplayMode";

import BodyRow from "./components/BodyRow";
import HeadRow from "./components/HeadRow";

import useScrollManager from "../../../hooks/useScrollManager";
import useConstraintManager from "../../../hooks/useConstraintManager";

import Container from "../../Container";

const PAGINATION_HEIGHT = 52;

const ROWS_PER_PAGE = [10, 25, 50];

const useStyles = makeStyles()((theme, _, classes) => ({
  root: {
    position: 'relative',
    background: theme.palette.background.paper,
    [`& .${classes['noBorder']}`]: {
      paddingLeft: '0 !important',
      paddingRight: '0 !important',
    },
  },
  noBorder: {
    border: 'none !important',
  },
  tableHead: {
    position: 'sticky',
    top: -1,
    zIndex: 1,
    background: theme.palette.background.paper,
  },
}));

interface IGridViewProps<FilterData extends {} = IAnything, RowData extends IRowData = IAnything> extends
  Omit<IListProps<FilterData, RowData>, keyof {
    ref: never;
    limit: never;
    chips: never;
    search: never;
    filterData: never;
    isChooser: never;
    payload: never;
  }>,
  IListState<FilterData, RowData>,
  IListCallbacks<FilterData, RowData> {
  className?: string;
  style?: React.CSSProperties;
  listChips: IListProps['chips'];
}

export const GridView = <
  FilterData extends {} = IAnything,
  RowData extends IRowData = IAnything,
  >(props: IGridViewProps<FilterData, RowData>) => {

  const { classes } = useStyles();

  const scrollManager = useScrollManager();

  const { constraintManager } = useConstraintManager();

  const {
    limit,
    offset,
    loading,
    total,
    columns = [],
    withLoader = false,
    withInitialLoader = false,
  } = props;

  const {
    handleLimitChange,
    handlePageChange,
  } = props;

  const handleResize = () => constraintManager.clear();

  const handleDirtyLimitChange = (e: any) => handleLimitChange(e.target.value);

  const handleDirtyPageChange = (_: any, newPage: number) => handlePageChange(newPage);

  const renderPlaceholder = () => (
    <TableCell className={classes.noBorder} colSpan={(columns.length * 2)  || 999} align="center">
      <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
        {loading && <CircularProgress size={24} />}
        <Typography variant="body1">
          {loading ? "Loading" : "Nothing found"}
        </Typography>
      </Stack>
    </TableCell>
  );

  useEffect(() => () => {
    scrollManager.clear();
  }, []);

  return (
    <Container<FilterData, RowData>
      {...props}
      onResize={handleResize}
    >
      {(params) => {

        const { height, width, payload: { rows } } = params;

        const renderInner = (mode: DisplayMode) => (
          <>
            <TableHead className={classes.tableHead}>
              <HeadRow
                fullWidth={width}
                mode={mode}
              />
            </TableHead>
            <TableBody>
              {(withLoader && loading) || (withInitialLoader && loading && rows.length === 0) || (!loading && rows.length === 0) ? (
                <TableRow>
                  {renderPlaceholder()}
                </TableRow>
              ) : rows.map((row, index) => (
                <Fragment key={index}>
                  <BodyRow
                    fullWidth={width}
                    row={row}
                    mode={mode}
                  />
                </Fragment>
              ))}
            </TableBody>
          </>
        );

        return (
          <Box className={classes.root}>
            <TableContainer ref={scrollManager.provideRef} style={{ height: height - PAGINATION_HEIGHT, width }}>
              <Table stickyHeader>
                <ConstraintView
                  phoneView={() => renderInner(DisplayMode.Phone)}
                  tabletView={() => renderInner(DisplayMode.Tablet)}
                  desktopView={() => renderInner(DisplayMode.Desktop)}
                  onViewChanged={handleResize}
                  params={params}
                />
              </Table>
            </TableContainer>
            <TablePagination
              width={width}
              height={height}
              count={total || -1}
              rowsPerPage={limit}
              page={offset / limit}
              rowsPerPageOptions={ROWS_PER_PAGE}
              onPageChange={handleDirtyPageChange}
              onRowsPerPageChange={handleDirtyLimitChange}
            />
          </Box>
        );
      }}
    </Container>
  );
};

export default GridView;
