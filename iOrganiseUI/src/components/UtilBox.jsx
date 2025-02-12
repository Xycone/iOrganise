import React, { useState } from 'react';

import { Box, Typography, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// MUI Icons
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const UtilBox = ({ title, icon, menuItems = [] }) => {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box
        height="100px"
        width="170px"
        background="invisible"
        border="1px solid"
        borderColor={colours.grey[300]}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="5px"
        sx={{ cursor: "pointer", userSelect: "none" }}
        onClick={handleClick}
      >
        <Box p={3} width="100%">
          <Box display="flex" justifyContent="space-between">
            <Box>
              {icon}
              <Typography>
                {title}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ minWidth: "170px", display: "flex", justifyContent: "flex-start", pl: 1 }}>
          <IconButton onClick={handleClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
        {menuItems.map((item, index) => (
          <MenuItem sx={{ minWidth: "170px" }} key={index} onClick={item.onClick}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default UtilBox