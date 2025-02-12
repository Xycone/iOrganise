import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

const UtilBox = ({ title, icon }) => {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  return (
    <Box
      height="100px"
      width="170px"
      background="invisible"
      border="2px solid"
      borderColor={colours.grey[300]}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="5px"
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
  )
}

export default UtilBox