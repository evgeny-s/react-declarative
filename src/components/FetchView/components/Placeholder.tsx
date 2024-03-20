import * as React from 'react';

import { SxProps } from '@mui/material';
import { red } from '@mui/material/colors';

import Box from '@mui/material/Box';

/**
 * Creates a placeholder component.
 *
 * @param text - The text to display in the placeholder.
 * @param [sx] - Additional styling properties for the placeholder component.
 * @returns A function that returns a placeholder component.
 */
const createPlaceholder = (text: string, sx?: SxProps) => () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 400,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: 'text.secondary',
            ...sx,
        }}
    >
        {text}
    </Box>
);

export const ErrorPlaceholder = createPlaceholder('An error acquired', {
    color: red[500],
    fontWeight: 500,
    fontSize: 24,
});

export const LoaderPlaceholder = createPlaceholder('Loading data');
