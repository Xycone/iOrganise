import React, { useState } from 'react';

import { Box, Typography, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';

const UtilBox = ({ title, icon, menuItems = [], onClick }) => {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (menuItems.length > 0) {
      setAnchorEl(event.currentTarget);
    } else {
      if (onClick) {
        onClick();
      }
    }
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
        borderColor={theme.palette.divider}
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
      {menuItems.length > 0 && (
        <Menu
          sx={{ mt: 2 }}
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
              <CloseIcon sx={{ color: theme.palette.text.primary}}/>
            </IconButton>
          </Box>
          {menuItems.map((item, index) => (
            <MenuItem sx={{ py: 2, minWidth: "170px" }} key={index} onClick={item.onClick}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}
    </Box>
  )
}

export default UtilBox