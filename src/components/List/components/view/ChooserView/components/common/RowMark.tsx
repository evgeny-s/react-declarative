import * as React from 'react';

import { makeStyles } from '../../../../../../../styles';

import IAnything from '../../../../../../../model/IAnything';
import IRowData from '../../../../../../../model/IRowData';

import Box from '@mui/material/Box';

import useRowMark from '../../../../../hooks/useRowMark';

/**
 * Interface representing the props for an individual row component.
 *
 * @template RowData - The type of data representing the row.
 */
interface IRowMarkProps<RowData extends IRowData = IAnything> {
    row: RowData,
}

const useStyles = makeStyles()({
    mark: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 4,
    },
});

/**
 * Function that renders a row mark component.
 *
 * @template RowData - The type of data for the row.
 * @param props - The props for the row mark component.
 * @returns The row mark component.
 */
const RowMark = <RowData extends IRowData = IAnything>({
    row
}: IRowMarkProps<RowData>) => {

    const { classes } = useStyles();

    const background = useRowMark({ row });

    return (
        <Box
            className={classes.mark}
            style={{ background }}
        />
    );
};

export default RowMark;
