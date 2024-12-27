import React from 'react'

import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// React Components
import Header from '../components/Header';

function SetupDocs() {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  return (
    <Box p={5}>
      <Box
        display="flex"
        flexDirection="column"
      >
        <Header
          title="Setup Documentation"
          subtitle="iOrganiseAPI Setup Process"
        />

        <Box m={4} p={5} backgroundColor={colours.primary[400]} borderRadius="10px">
          <Box mb={10}>
            <Box mb={5}>
              <Typography mb={3} variant="h3">
                Docker Desktop Setup
              </Typography>
              <Box mb={3}>
                <Typography variant="h5">Operating System:</Typography>
                <Typography>Windows 11 (21H2 or higher)</Typography>
              </Box>
              <Box>
                <Typography variant="h5">Prerequisites:</Typography>
                <Typography>Enable hardware virtualisation inside BIOS</Typography>
              </Box>
            </Box>

            <Box mb={5}>
              <Typography mb={3} variant="h5">
                Step 1:  Installing Windows Subsystem for Linux (WSL2)
              </Typography>

              <Box mb={2}>
                <Typography>
                  Run Windows Terminal as administrator
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Enter the following commands into the CLI
                </Typography>
                <Typography>
                  <code>wsl --install</code>
                </Typography>
              </Box>
            </Box>

            <Box mb={5}>
              <Typography mb={3} variant="h5">
                Step 2: Setting up Ubuntu WSL distro
              </Typography>

              <Box mb={2}>
                <Typography>
                  Install Ubuntu from the microsoft store and open it
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Follow the instructions and create a new UNIX user account
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography mb={3} variant="h5">
                Step 3: Setting up Docker Desktop
              </Typography>

              <Box mb={2}>
                <Typography>
                  Link to download the Docker Desktop Installer:
                </Typography>
                <Typography
                  component="a"
                  href="https://docs.docker.com/desktop/install/windows-install/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: colours.greenAccent[300] }}
                >
                  https://docs.docker.com/desktop/install/windows-install/
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Run the installer and open the app after installation is complete
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Select Ubuntu in <span style={{ fontWeight: "bold" }}>"Settings &gt; Resources &gt; WSL Integration"</span>
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Make sure to apply changes and restart
                </Typography>
              </Box>

            </Box>
          </Box>

          <Box>
            <Box mb={5}>
              <Typography variant="h3">
                iOrganiseAPI App Setup
              </Typography>
            </Box>

            <Box mb={5}>
              <Typography mb={3} variant="h5">
                Creating the Docker image
              </Typography>

              <Box mb={2}>
                <Typography>
                  Start the Docker Desktop app
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Open the Windows Terminal
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Replace &lt;file_path&gt; with the path to the project directory
                </Typography>
                <Typography>
                  <code>docker build -t iorganise-api-img &lt;file_path&gt;</code>
                </Typography>
              </Box>
            </Box>

            <Box mb={5}>
              <Typography mb={3} variant="h5">
                Running the image using CPU only
              </Typography>

              <Box mb={2}>
                <Typography>
                  Open the Windows Terminal
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Run the command in the CLI
                </Typography>
                <Typography>
                  <code>
                    docker create -p 8000:8000 --name iorganise-api-cpu iorganise-api-img
                  </code>
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Run the image either via the Docker Desktop GUI or the command
                </Typography>
                <Typography>
                  <code>
                    docker start iorganise-api-cpu
                  </code>
                </Typography>
              </Box>

            </Box>

            <Box>
              <Typography mb={3} variant="h5">
                Running the image with GPU acceleration
              </Typography>

              <Box mb={2}>
                <Typography>
                  Open up the Ubuntu app
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Follow instruction to install nvidia container toolkit using Apt
                </Typography>
                <Typography
                  component="a"
                  href="https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: colours.greenAccent[300] }}
                >
                  Installing the NVIDIA Container Toolkit
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Verify if installation is successfull
                </Typography>
                <Typography>
                  <code>
                    nvidia-ctk --version
                  </code>
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Configuring Docker to use Nvidia Container Runtime
                </Typography>
                <Typography>
                  <code>
                    sudo mkdir -p /etc/docker
                  </code>
                </Typography>
                <Typography>
                  <code>
                    sudo tee /etc/docker/daemon.json &lt;&lt;EOF <br />
                    {`{`} <br />
                    &nbsp;&nbsp;"runtimes": {`{`} <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"nvidia": {`{`} <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"path": "nvidia-container-runtime", <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"runtimeArgs": [] <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{`}`} <br />
                    &nbsp;&nbsp;{`}`} <br />
                    {`}`} <br />
                    EOF
                  </code>
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Make sure Docker Desktop is up to date and reboot Windows
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography>
                  Open up Ubuntu and run the command in the CLI
                </Typography>
                <Typography>
                  <code>
                    docker create --gpus all -p 8000:8000 --name iorganise-api-gpu iorganise-api-img
                  </code>
                </Typography>
              </Box>

              <Box>
                <Typography>
                  Run the image either via the Docker Desktop GUI or the command
                </Typography>
                <Typography>
                  <code>
                    docker start iorganise-api-gpu
                  </code>
                </Typography>
              </Box>

            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SetupDocs