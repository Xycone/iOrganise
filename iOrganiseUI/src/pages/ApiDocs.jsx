import React from 'react'

import { Box, Typography, useTheme } from '@mui/material'
import { tokens } from '../themes/MyTheme';

// React Components
import Header from '../components/Header';

function ApiDocs() {
  const theme = useTheme();
  const colours = tokens(theme.palette.mode);

  return (
    <Box p={5}>
      <Box
        display="flex"
        flexDirection="column"
      >
        <Header
          title="API Documentation (Work In Progress...)"
          subtitle="iOrganiseAPI Endpoint Information"
        />

        <Box m={4} p={5} backgroundColor={colours.primary[400]} borderRadius="10px">
          <Box mb={10}>
            <Box>
              <Box mb={3}>
                <Typography variant="h3">
                  Transcribe Files
                </Typography>
                <Typography>
                  [POST]: /transcribe-files
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="h5">API Endpoint</Typography>
                <Typography>{import.meta.env.VITE_API_BASE_URL}transcribe-files</Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="h5">Params:</Typography>
                <Box mb={2}>
                  <Typography>
                    model_size: <code>string (see ModelSizes)</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    transcription_method: <code>string (see TranscriptionMethods)</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    diarisation: <code>boolean</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    diarisation_method: <code>string (see DiarisationMethods)</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    num_speakers: <code>integer</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    audit: <code>boolean</code>
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography>
                    criteria: <code>string</code>
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="h5">Enums:</Typography>
                <Box mb={2}>
                  <Typography>ModelSizes:</Typography>
                  <Box ml={2}>
                    <Typography><code>"base"</code></Typography>
                    <Typography><code>"small"</code></Typography>
                    <Typography><code>"medium"</code></Typography>
                    <Typography><code>"large"</code></Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography>TranscriptionMethods:</Typography>
                  <Box ml={2}>
                    <Typography><code>"whisper"</code></Typography>
                    <Typography><code>"whisperX"</code></Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography>DiarisationMethods:</Typography>
                  <Box ml={2}>
                    <Typography><code>"clustering"</code></Typography>
                    <Typography><code>"whisperX_pipeline"</code></Typography>
                  </Box>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="h5">Body:</Typography>
                <Typography>
                  files: <code>array</code> (of file objects)
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5">Example Response:</Typography>
                <Typography mb={2}>Example of the response the API will provide with diarisation enabled and with the second file encountering an error.</Typography>
                <Typography component="pre">
                  {`{
  "1": {
    "filename": "audio1.wav",
    "language": "en",
    "segments": [
      {
        "start": 0.0,
        "end": 3.0,
        "text": "Hello, this is a test.",
        "speaker": "Speaker 1"
      },
      {
        "start": 3.0,
        "end": 6.0,
        "text": "This is the second segment.",
        "speaker": "Speaker 2"
      }
    ],
    "results": "This is the audit result from the LLM"
  },
  "2": {
    "filename": "audio2.mp3",
    "error": "Diarisation cannot be performed on stereo audio."
  }
}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box mb={3}>
              <Typography variant="h3">
                Get Device
              </Typography>
              <Typography>
                [GET]: /get-device
              </Typography>
            </Box>

            <Box mb={3}>
              <Typography variant="h5">API Endpoint</Typography>
              <Typography>{import.meta.env.VITE_API_BASE_URL}get-device</Typography>
            </Box>

            <Box>
              <Typography variant="h5">Example Response:</Typography>
              <Typography mb={2}>Example response which shows the device your models are loaded on.</Typography>
              <Typography component="pre">
                {`{
  "cuda"
}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ApiDocs