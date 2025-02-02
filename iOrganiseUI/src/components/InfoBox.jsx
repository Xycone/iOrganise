import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

const InfoBox = ({ title, subtitle, icon, progress }) => {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    return (
        <Box width="100%" p={5}>
            <Box display="flex" justifyContent="space-between">
                <Box>
                    {icon}
                    <Typography variant="h3">
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Box display="flex" justifyContent="space-between">
                <Typography
                    sx={{ color: colours.greenAccent[300] }}
                >
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    )
}

export default InfoBox