import React, { useContext, useState } from 'react';
import { Box, IconButton, useTheme, Avatar, Menu, MenuItem } from '@mui/material';
import { ColourModeContext, tokens } from '../themes/MyTheme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import App from '../App';
import { useNavigate } from 'react-router-dom';

function Topbar() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const colorMode = useContext(ColourModeContext);
    const navigate = useNavigate();

    // State for managing the dropdown menu
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLoginRedirect = () => {
        navigate('/login');
        handleMenuClose(); // Close the menu after redirecting
    };

    return (
        <Box display="flex" justifyContent="space-between" p={5}>
            {/* Search Bar */}
            <Box />

            <Box display="flex">
                <IconButton onClick={colorMode.toggleColourMode}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>

                {/* Profile Picture Icon */}
                <IconButton
                    onClick={handleMenuOpen}
                    sx={{ width: 35, height: 35, ml: 1 }} // Fix the size of the IconButton
                >
                    <Avatar alt="Profile" src="/path/to/profile-pic.jpg" sx={{ width: 30, height: 30 }} />
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                    <MenuItem onClick={handleLoginRedirect}>Login/Register</MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}

export default Topbar;
