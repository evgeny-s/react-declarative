import * as React from 'react';
import { useEffect, useMemo } from 'react';

import IGridProps from './model/IGridProps';
import RowData from './model/RowData';

import Container from './components/Container';
import Header from './components/Header';
import Content from './components/Content';
import Loader from './components/Loader';

import createConstraintManager from './helpers/createConstraintManager';

import { ConstraintManagerProvider } from './hooks/useConstraintManager';
import { GridPropsProvider } from './hooks/useGridProps';

import useSingleton from '../../hooks/useSingleton';
import useSubject from '../../hooks/useSubject';
import throttle from '../../utils/hof/throttle';

import { DEFAULT_ROW_WIDTH, CELL_MARGIN } from './config';

const createDefaultWidthFn = (columnsLength: number) => (fullWidth: number) => {
  const pendingWidth = Math.floor(fullWidth / columnsLength);
  return Math.max(pendingWidth, DEFAULT_ROW_WIDTH);
};

export const Grid = <T extends RowData>(props: IGridProps<T>) => {

  const {
    className,
    style,
    sx,
    header,
    columns: upperColumns,
    data,
    errorMessage,
    hasMore,
    loading,
    rowActions,
    payload: upperPayload,
    rowKey,
    sort,
    minRowHeight,
    bufferSize,
    onButtonSkip,
    onClickHeaderColumn,
    onRowAction,
    onSkip,
    rowMark,
    onTableRowClick,
    onRowClick,
    recomputeSubject,
    shortHeight,
    scrollXSubject: upperScrollXSubject,
    scrollYSubject,
  } = props;

  const payload = useSingleton(upperPayload);

  const constraintManager = useSingleton(() => createConstraintManager());

  const scrollXSubject = useSubject<number>(upperScrollXSubject);

  const defaultWidthFn = useMemo(
    () => createDefaultWidthFn(upperColumns.length),
    [upperColumns],
  );

  const columns = useMemo(
    () =>
      upperColumns.map(
        ({ width: upperWidth = defaultWidthFn, minWidth = 0, ...other }) => {
          const width = (fullWidth: number) => {
            const dimension =
              typeof upperWidth === 'function'
                ? upperWidth(fullWidth)
                : upperWidth;
            const value =
              typeof dimension === 'string'
                ? parseFloat(dimension)
                : dimension;
            const adjust =
              typeof upperWidth === 'function'
                ? CELL_MARGIN
                : 0;
            return Math.max(value - adjust, minWidth, DEFAULT_ROW_WIDTH);
          };
          return {
            minWidth,
            width,
            ...other,
          };
        },
      ),
    [upperColumns, defaultWidthFn],
  );

  useEffect(() => {
    if (recomputeSubject) {
      return recomputeSubject.subscribe(() => {
        constraintManager.clear();
      });
    }
    return undefined;
  }, [recomputeSubject, constraintManager]);

  const handleScrollX = useMemo(
    () =>
      throttle(
        (scrollX: number) => {
          scrollXSubject.next(scrollX);
        },
        5,
      ),
    [scrollXSubject],
  );

  useEffect(
    () => () => {
      handleScrollX.clear();
    },
    [handleScrollX],
  );

  return (
    <ConstraintManagerProvider constraintManager={constraintManager}>
      <GridPropsProvider value={props}>
        <Container
          shortHeight={shortHeight}
          className={className}
          header={header}
          style={style}
          sx={sx}
        >
          <Header
            columns={columns}
            sort={sort}
            rowActions={rowActions}
            onClickHeaderColumn={onClickHeaderColumn}
            onScrollX={handleScrollX}
            scrollXSubject={scrollXSubject}
          />
          {!!loading && <Loader />}
          <Content
            rowMark={rowMark}
            columns={columns}
            data={data}
            errorMessage={errorMessage}
            hasMore={hasMore}
            loading={loading}
            rowActions={rowActions}
            payload={payload}
            rowKey={rowKey}
            minRowHeight={minRowHeight}
            bufferSize={bufferSize}
            onSkip={onSkip}
            onTableRowClick={(e, row) => {
              if (onTableRowClick) {
                onTableRowClick(e, row);
                return;
              }
              if (onRowClick) {
                onRowClick(row);
                return;
              }
            }}
            onRowAction={onRowAction}
            onButtonSkip={onButtonSkip}
            onScrollX={handleScrollX}
            scrollXSubject={scrollXSubject}
            scrollYSubject={scrollYSubject}
          />
        </Container>
      </GridPropsProvider>
    </ConstraintManagerProvider>
  );
};

export default Grid;
