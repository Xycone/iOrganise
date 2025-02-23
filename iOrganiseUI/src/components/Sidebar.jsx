import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// MUI Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import CameraAlt from '@mui/icons-material/CameraAlt';


const Item = ({ title, to, icon, selected }) => {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    return (
        <MenuItem
            active={selected === title}
            style={{ color: theme.palette.text.primary }}
            icon={icon}
        >
            <Typography>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    )
}

function Sidebar() {
    const location = useLocation();
    const { pathname } = location;
    const selected =
        pathname === '/home' ? 'Home' :
            pathname === '/transcribeaudio' ? 'Transcribe Audio' :
                pathname === '/categorisetext' ? 'Categorise Notes' :
                    pathname === '/OCR' ? 'Image To Text (OCR)' :
                        pathname === '/apidocs' ? 'API Documentation' : 'Home';

    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": {
                    background: `${colours.primary[400]} !important`
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important"
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important"
                },
                "& .pro-inner-item:hover": {
                    color: "#868DFB !important"
                },
                "& .pro-menu-item.active": {
                    color: "#6870FA !important"
                }
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    {/* Logo & Menu Icon */}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{
                            margin: '20px 0 20px 0',
                            color: colours.grey[100]
                        }}
                    >
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <Typography variant="h2" color={theme.palette.text.primary}>
                                    iOrganise
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {/* Menu Items */}
                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Typography
                            variant="h6"
                            color={theme.palette.text.primary}
                            sx={{ p: "25px 0 5px 20px" }}
                        >
                            Main
                        </Typography>
                        <Item
                            title="Home"
                            to="/home"
                            icon={<HomeOutlinedIcon />}
                            selected={selected}
                        />

                        <Typography
                            variant="h6"
                            color={theme.palette.text.primary}
                            sx={{ p: "25px 0 5px 20px" }}
                        >
                            Demo
                        </Typography>
                        <Item
                            title="Transcribe Audio"
                            to="/transcribeaudio"
                            icon={<AudioFileOutlinedIcon />}
                            selected={selected}
                        />
                        <Item
                            title="Image To Text (OCR)"
                            to="/OCR"
                            icon={<CameraAlt />}
                            selected={selected}
                        />
                        <Item
                            title="Categorise Notes"
                            to="/categorisetext"
                            icon={<NoteAltOutlinedIcon />}
                            selected={selected}
                        />

                        <Typography
                            variant="h6"
                            color={theme.palette.text.primary}
                            sx={{ p: "25px 0 5px 20px" }}
                        >
                            Docs
                        </Typography>
                        <Item
                            title="API Documentation"
                            to="/apidocs"
                            icon={<DataObjectOutlinedIcon />}
                            selected={selected}
                        />
                    </Box>
                </Menu>
            </ProSidebar>
        </Box >
    )
}

export default Sidebar