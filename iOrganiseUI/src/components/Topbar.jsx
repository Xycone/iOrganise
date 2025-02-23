import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, IconButton, useTheme, Menu, MenuItem, Button, Typography, ListItemIcon, ListItemText } from "@mui/material";
import { ColourModeContext, tokens } from "../themes/MyTheme";

// Used for backend API call
import http from '../http';

// MUI Icons
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

function Topbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const colorMode = useContext(ColourModeContext);

    // User state
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
    
            if (!token) {
                setUser(null);
                return;
            }
    
            try {
                // Fetch user data using Axios
                const response = await http.get("/get-user", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                if (response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error Fetching User:", error.response?.data?.detail || error.message);
                setUser(null);
            }
        };
    
        fetchUser();
    }, [localStorage.getItem("accessToken")]);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLoginRedirect = () => {
        navigate("/login");
        handleMenuClose();
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
        navigate("/home");
        handleMenuClose();
    };

    const handleSettingsRedirect = () => {
        navigate('/settings'); // Link to the Account Management Settings page
        handleMenuClose();
    };

    return (
        <Box display="flex" justifyContent="space-between" p={5}>
            <Box />

            <Box display="flex">
                {/* Dark Mode Toggle */}
                <IconButton sx={{ mx: 2 }} onClick={colorMode.toggleColourMode}>
                    {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>

                {/* Conditionally Show Login or Profile */}
                {user ? (
                    <>
                        {/* User's Name */}
                        <Box onClick={handleMenuOpen} sx={{ mx: 2, display: 'flex', alignItems: 'center', cursor: "pointer", userSelect: "none" }}>
                            <Typography>{user.name}</Typography>
                        </Box>


                        {/* Dropdown Menu */}
                        <Menu
                            sx={{ mt: 2 }}
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <MenuItem onClick={() => navigate("/settings")}>
                                <ListItemIcon><PersonOutlineOutlinedIcon /></ListItemIcon>
                                <ListItemText>Profile</ListItemText>
                            </MenuItem >
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon><LogoutOutlinedIcon /></ListItemIcon>
                                <ListItemText>Logout</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    // Show Login Button if User is NOT Logged In
                    <Button variant="contained" onClick={handleLoginRedirect} sx={{ mx: 2 }}>
                        Login
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default Topbar;
