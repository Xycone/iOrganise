import React, { useContext, useState, useEffect } from "react";
import { Box, IconButton, useTheme, Avatar, Menu, MenuItem, Button, Typography } from "@mui/material";
import { ColourModeContext, tokens } from "../themes/MyTheme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useNavigate } from "react-router-dom";

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
                const response = await fetch("http://localhost:8000/get-user", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error("Error Fetching User:", error);
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

    return (
        <Box display="flex" justifyContent="space-between" p={5}>
            <Box />

            <Box display="flex">
                {/* Dark Mode Toggle */}
                <IconButton sx={{ mx: 1 }} onClick={colorMode.toggleColourMode}>
                    {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>

                {/* Conditionally Show Login or Profile */}
                {user ? (
                    <>
                        {/* User's Name */}
                        <Box onClick={handleMenuOpen} sx={{ mx: 1, display: 'flex', alignItems: 'center', cursor: "pointer", userSelect: "none" }}>
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
                            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    // Show Login Button if User is NOT Logged In
                    <Button variant="contained" onClick={handleLoginRedirect}>
                        Login
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default Topbar;
