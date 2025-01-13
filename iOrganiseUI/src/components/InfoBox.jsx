import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

import ProgressCircle from './ProgressCircle';

const InfoBox = ({ title, subtitle, icon, progress }) => {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    return (
        <Box width="100%" p={5}>
            <Box display="flex" justifyContent="space-between">
                <Box>
                    {icon}
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: colours.grey[100] }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Box>
                    <ProgressCircle progress={progress} />
                </Box>
            </Box>

            <Box display="flex" justifyContent="space-between">
                <Typography
                    variant="h5"
                    sx={{ color: colours.greenAccent[500] }}
                >
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    )
}

export default InfoBox