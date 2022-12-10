import { Theme, useMediaQuery } from '@mui/material';

export const useMediaContext = () => {
    const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
    const isTablet = useMediaQuery((theme: Theme) => theme.breakpoints.between("sm", "lg"));
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
    return {
        isPhone,
        isTablet,
        isDesktop,
    };
};

export default useMediaContext;
