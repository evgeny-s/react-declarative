import * as React from 'react';
import { useMemo, useCallback } from 'react';

import { makeStyles } from '../../../../../../styles';

import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import useProps from '../../../../hooks/useProps';

import IColumn from '../../../../../../model/IColumn';
import IRowData from '../../../../../../model/IRowData';
import IAnything from '../../../../../../model/IAnything';

import ColumnType from '../../../../../../model/ColumnType';
import DisplayMode from '../../../../../../model/DisplayMode';
import SelectionMode from '../../../../../../model/SelectionMode';

import computeWidth from '../../../../helpers/computeWidth';
import sortColumns from '../../../../helpers/sortColumns';

import useSortModel from '../../../../hooks/useSortModel';

export interface IHeadRowProps {
    onSortModelChange: () => void;
    fullWidth: number;
    mode: DisplayMode;
}

const useStyles = makeStyles((theme) => ({
    cell: {
        paddingLeft: '0 !important',
        paddingRight: '0 !important',
        background: `${theme.palette.background.paper} !important`,
    },
}));

export const HeadRow = <RowData extends IRowData = IAnything>({
    onSortModelChange,
    fullWidth,
    mode,
}: IHeadRowProps) => {

    const classes = useStyles();

    const props = useProps<RowData>();
    const { sortModel, setSortModel } = useSortModel();

    const {
        columns = [],
        selectionMode,
    } = props;

    const renderCheckbox = () => {
        if (selectionMode === SelectionMode.Single) {
            return (
                <Radio
                    color="primary"
                    disabled
                />
            );
        } else {
            return (
                <Checkbox
                    color="primary"
                    disabled
                />
            );
        }
    };

    const handleSortToggle = useCallback((id: string) => {
        const sortTarget = sortModel.get(id);
        if (sortTarget) {
            if (sortTarget.sort === 'asc') {
                sortModel.set(id, {
                    field: id,
                    sort: 'desc',
                })
                
            } else if (sortTarget.sort === 'desc') {
                sortModel.delete(id);
            }
        } else {
            sortModel.set(id, {
                field: id,
                sort: 'asc',
            });
        }
        setSortModel(sortModel);
        onSortModelChange();
    }, [sortModel]);


    const content = useMemo(() => {

        const renderColumn = (column: IColumn, idx: number) => {
            const sortTarget = sortModel.get(column.field || '');
            const sortDirection = sortTarget?.sort || undefined;
    
            let isSortable = !!column.field;
            isSortable = isSortable && column.sortable !== false;
            isSortable = isSortable && column.type !== ColumnType.Action;
    
            const handleClick = () => {
                if (isSortable) {
                    handleSortToggle(column.field!);
                }
            };
    
            const minWidth = computeWidth({
                column,
                mode,
                fullWidth,
                idx,
            });
        
            const maxWidth = minWidth;
    
            const align = column.type === ColumnType.Action ? 'center' : 'left';
    
            return (
                <TableCell
                    className={classes.cell}
                    key={idx}
                    align={align}
                    style={{ minWidth, maxWidth }}
                    sortDirection={sortDirection}
                >
                    {isSortable ? (
                        <TableSortLabel
                            active={!!sortTarget}
                            direction={sortDirection}
                            onClick={handleClick}
                        >
                            {column.headerName}
                        </TableSortLabel>
                    ) : column.headerName}
                </TableCell>
            );
        };
    
        const content = sortColumns({
            mode,
            columns,
            fullWidth,
        }).map(renderColumn);

        return content;

    }, [fullWidth]);

    return (
        <TableRow>
            <TableCell className={classes.cell} padding="checkbox">
                {renderCheckbox()}
            </TableCell>
            {content}
        </TableRow>
    );
};

export default HeadRow;
