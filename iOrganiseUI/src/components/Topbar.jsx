import React, { useContext, useState } from 'react';
import { Box, IconButton, useTheme, Avatar, Menu, MenuItem } from '@mui/material';
import { ColourModeContext, tokens } from '../themes/MyTheme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import App from '../App';
import { useNavigate } from 'react-router-dom';

function Topbar() {
    const navigate = useNavigate();

    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const colorMode = useContext(ColourModeContext);

    // Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLoginRedirect = () => {
        navigate('/login');
        handleMenuClose();
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate('/login');
        handleMenuClose();
    };

    return (
        <Box display="flex" justifyContent="space-between" p={5}>
            <Box />

            <Box display="flex">
                <IconButton sx={{ mx: 1 }} onClick={colorMode.toggleColourMode} >
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>

                {/* Profile Picture Icon */}
                <IconButton
                    onClick={handleMenuOpen}
                    sx={{ mx: 1, width: 35, height: 35 }}
                >
                    <Avatar alt="Profile" src="/path/to/profile-pic.jpg" sx={{ width: 30, height: 30 }} />
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    sx={{ mt: 2}}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                    <MenuItem onClick={handleLoginRedirect}>Login/Register</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}

export default Topbar;