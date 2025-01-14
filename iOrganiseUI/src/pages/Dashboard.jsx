import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// MUI Icons
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';

// React Components
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';

function Dashboard() {
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
          subtitle="File Upload Management Status & Insights"
        />

        <Box
          mt={4}
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="200px"
          gap={4}
        >
          {/* Row 1 */}
          <Box
            gridColumn={{ xs: "span 12", md: "span 6", lg: "span 3" }}
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="5px"
          >
            <InfoBox
              title="15th January 2025"
              subtitle="Last Activity"
              icon={
                <CalendarMonthOutlinedIcon
                  sx={{ color: colours.greenAccent[300], fontSize: '32px' }}
                />
              }
            />
          </Box>

          <Box
            gridColumn={{ xs: "span 12", md: "span 6", lg: "span 3" }}
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="5px"
          >
            <InfoBox
              title="24"
              subtitle="Total Uploads"
              icon={
                <CloudUploadOutlinedIcon
                  sx={{ color: colours.greenAccent[300], fontSize: '32px' }}
                />
              }
            />
          </Box>

          <Box
            gridColumn={{ xs: "span 12", md: "span 6", lg: "span 3" }}
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="5px"
          >
            <InfoBox
              title="15.2GB / 20GB"
              subtitle="Storage Used"
              icon={
                <StorageOutlinedIcon
                  sx={{ color: colours.greenAccent[300], fontSize: '32px' }}
                />
              }
            />
          </Box>

          <Box
            gridColumn={{ xs: "span 12", md: "span 6", lg: "span 3" }}
            backgroundColor={colours.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="5px"
          >
            <InfoBox
              title="75%"
              subtitle="Storage Breakdown"
              icon={
                <DonutLargeOutlinedIcon
                  sx={{ color: colours.greenAccent[300], fontSize: '32px' }}
                />
              }
            />
          </Box>

          {/* Row 2 */}
          <Box
            p={5}
            gridColumn={{ xs: "span 12", md: "span 12", lg: "span 8" }}
            gridRow="span 2"
            backgroundColor={colours.primary[400]}
            borderRadius="5px"
            display="flex"
            flexDirection="column"
          >
            <Box>
              <Typography variant="h5">
                Current Batch
              </Typography>
              <Typography variant="h3" color={colours.greenAccent[300]}>
                Transcribing Audio
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexGrow="1"
            >
              <Typography>Insert Timeline here</Typography>
            </Box>
          </Box>

          <Box
            gridColumn={{ xs: "span 12", md: "span 12", lg: "span 4" }}
            gridRow="span 2"
            backgroundColor={colours.primary[400]}
            borderRadius="5px"
            overflow="auto"
          >
            <Box
              p={4}
              display="flex"
              borderBottom={`4px solid ${theme.palette.background.default}`}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h5"
              >
                Processing Queue
              </Typography>
            </Box>


          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard