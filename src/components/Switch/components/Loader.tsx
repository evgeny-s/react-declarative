import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Represents a Loader component.
 *
 * @returns The Loader component.
 */
export const Loader = () => (
    <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open
    >
        <CircularProgress color="primary" />
    </Backdrop>
);

export default Loader;
