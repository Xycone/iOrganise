import React from 'react';

import { Typography, Box, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

const Header = ({ title, subtitle }) => {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    return (
        <Box>
            <Typography
                variant="h2"
                color={colours.grey[100]}
                sx={{ mb: "10px" }}
            >
                {title}
            </Typography>

            <Typography
                variant="h5"
                color={colours.greenAccent[300]}
            >
                {subtitle}
            </Typography>
        </Box>
    )
}

export default Header;