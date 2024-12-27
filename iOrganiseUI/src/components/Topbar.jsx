import React, { useContext } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { ColourModeContext, tokens } from '../themes/MyTheme';
import InputBase from '@mui/material/InputBase';

// MUI Icons
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SearchIcon from '@mui/icons-material/Search';

function Topbar() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const colorMode = useContext(ColourModeContext);

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            p={5}
        >
            {/* Search Bar */}
            {/* <Box
                display="flex"
                backgroundColor={colours.primary[400]}
                borderRadius="5px"
            >
                <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
                <IconButton type="button" sx={{ p: 1 }}>
                    <SearchIcon />
                </IconButton>
            </Box> */}
            <Box />

            <Box display="flex">
                <IconButton onClick={colorMode.toggleColourMode}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>

                <IconButton>
                    <SettingsOutlinedIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

export default Topbar