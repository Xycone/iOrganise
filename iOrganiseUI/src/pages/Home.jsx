import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// React Components
import Header from '../components/Header';

function Home() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    return (
        <Box px={5} pb={5}>
            <Box
                display="flex"
                flexDirection="column"
            >
                <Header
                    title="Home"
                    subtitle="Welcome to iOrganise"
                />
            </Box>
        </Box>
    )
}

export default Home