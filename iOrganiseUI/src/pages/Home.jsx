import React from 'react';

import { Box, Typography, Grid, useTheme } from '@mui/material';
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
    <Box px={5} pb={5}>
      <Box
        display="flex"
        flexDirection="column"
      >
        <Header
          title="Dashboard"
          subtitle="Welcome to your dashboard"
        />

        <Box mt={4}>
          <Grid container spacing={4}>
            {/* Row 1 */}
            <Grid item xs={12} lg={8}>
              <InfoBox
                title="24"
                subtitle="Files Being Processed"
                icon={
                  <DescriptionIcon
                    sx={{ color: colours.greenAccent[600], fontSize: '26px' }}
                  />
                }
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <InfoBox
                title="24"
                subtitle="Files Being Processed"
                icon={
                  <DescriptionIcon
                    sx={{ color: colours.greenAccent[600], fontSize: '26px' }}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default Home