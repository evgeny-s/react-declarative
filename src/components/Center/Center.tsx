import * as React from 'react';

import { makeStyles } from '../../styles';

import Box, { BoxProps } from '@mui/material/Box';

import classNames from '../../utils/classNames';

interface ICenterProps extends BoxProps {
}

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/**
 * A functional component that renders a Box component with given className and otherProps.
 *
 * @param {ICenterProps} props - The properties to configure the Center component.
 * @param {string} props.className - The className for the Box component.
 * @param {React.ElementType} props.otherProps - The other properties to be spread onto the Box component.
 *
 * @returns {React.ReactNode} The rendered Center component.
 */
export const Center = ({
    className,
    ...otherProps
}: ICenterProps) => {
    const { classes } = useStyles();
    return (
        <Box
            className={classNames(className, classes.root)}
            {...otherProps}
        />
    );
}

export default Center;
