import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// MUI Icons
import DescriptionIcon from '@mui/icons-material/Description';

// React Components
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';

function Home() {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  return (
    <Box p={5}>
      <Box
        display="flex"
        flexDirection="column"
      >
        <Header
          title="Dashboard"
          subtitle="Welcome to your dashboard"
        />

        <Box
          m={4}
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {/* Row 1 */}
          <Box
            gridColumn="span 3"
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox
              title="24"
              subtitle="Files Being Processed"
              icon={
                <DescriptionIcon
                  sx={{ color: colours.greenAccent[600], fontSize: '26px' }}
                />
              }
            />
          </Box>

          <Box
            gridColumn="span 9"
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox
              title="24"
              subtitle="Files Being Processed"
              icon={
                <DescriptionIcon
                  sx={{ color: colours.greenAccent[600], fontSize: '26px' }}
                />
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Home