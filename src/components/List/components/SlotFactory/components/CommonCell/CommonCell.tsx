import * as React from 'react';
import { Fragment, createElement } from 'react';

import { makeStyles } from '../../../../../../styles';

import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';

import Async from '../../../../../Async';
import ActionMenu from '../../../../../ActionMenu';

import IAnything from '../../../../../../model/IAnything';
import IRowData from '../../../../../../model/IRowData';
import ColumnType from '../../../../../../model/ColumnType';

import { ICommonCellSlot } from '../../../../slots/CommonCellSlot';

import useProps from "../../../../hooks/useProps";
import usePayload from '../../../../hooks/usePayload';

const LOAD_SOURCE = 'list-item';

const useStyles = makeStyles()({
    stretch: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        '& > *:nth-of-type(1)': {
            flex: 1,
        },
    },
});

export const CommonCell = <RowData extends IRowData = IAnything>({
    column,
    row,
    disabled,
    onMenuToggle,
    onAction,
}: ICommonCellSlot<RowData>) => {

    const { classes } = useStyles();
    const _payload = usePayload();

    const {
        fallback,
        rowActions = [],
        onLoadStart,
        onLoadEnd,
        loading,
    } = useProps<RowData>();

    const handleLoadStart = () => onLoadStart && onLoadStart(LOAD_SOURCE);
    const handleLoadEnd = (isOk: boolean) => onLoadEnd && onLoadEnd(isOk, LOAD_SOURCE);

    if (column.type === ColumnType.Text) {
        return row[column.field!];
    } else if (column.type === ColumnType.Compute) {
        return (
            <Async
                payload={row}
                deps={[_payload]}
                fallback={fallback}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                throwError
            >
                {async (row) => {
                    const data = { ...row, _payload };
                    if (column.element) {
                        return createElement(column.element, data);
                    } else if (column.compute) {
                        return await column.compute(data, _payload);
                    } else {
                        return null;
                    }
                }}
            </Async>
        );
    } else if (column.type === ColumnType.CheckBox) {
        return (
            <Checkbox
                color="primary"
                disabled
                checked={row[column.field!]}
            />
        );
    } else if (column.type === ColumnType.Component) {
        const {
            element: Element = () => <Fragment />,
        } = column;
        return (
            <Box className={classes.stretch}>
                <Element {...{...row, _payload}} />
            </Box>
        );
    } else if (column.type === ColumnType.Action) {
        return (
            <ActionMenu
                transparent
                options={rowActions.map(({
                    isVisible = () => true,
                    isDisabled = () => false,
                    ...other
                }) => ({
                    ...other,
                    isVisible: () => isVisible(row, _payload),
                    isDisabled: () => isDisabled(row, _payload),
                }))}
                onToggle={onMenuToggle}
                onAction={onAction}
                fallback={fallback}
                payload={row}
                deps={[_payload]}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                disabled={loading || disabled}
                throwError
            />
        );
    } else {
        return null;
    }

};

export default CommonCell;
