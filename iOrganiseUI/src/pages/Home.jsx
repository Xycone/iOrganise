import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// React Components
import Header from '../components/Header';

function Home() {
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