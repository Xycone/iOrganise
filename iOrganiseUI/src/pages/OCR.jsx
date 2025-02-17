import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Divider,
    Button,
    useTheme,
    Dialog,
    DialogContent,
    DialogContentText,
    IconButton,
    Link
} from '@mui/material';
import { tokens } from '../themes/MyTheme';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

function OCR() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const [selectedFile, setSelectedFile] = useState(null); // Store only one file
    const [imagePreview, setImagePreview] = useState(null); // Store the image preview URL
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0]; // Get the first file only

        if (!file) {
            return; // No file selected
        }

        if (file.size > 25 * 1024 * 1024) {
            toast.error('File size exceeds the 25MB limit');
            return;
        }

        setSelectedFile(file); // Set the selected file
        setImagePreview(URL.createObjectURL(file)); // Generate and set the image preview URL
        event.target.value = ''; // Reset the file input
    };

    const handleDeleteFile = () => {
        setSelectedFile(null); // Clear the selected file
        setImagePreview(null); // Clear the image preview
    };

    const handleSubmit = async () => {
        // Check if a file is provided
        if (!selectedFile) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile); // Append the file to FormData

        setLoading(true);
        setResponse(null);

        try {
            // Hugging Face API endpoint
            const HUGGING_FACE_URL = "https://fiamenova-aap.hf.space/predict/";

            // Send the image to Hugging Face API
            const res = await fetch(HUGGING_FACE_URL, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data); // Set the response from Hugging Face
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'An error occurred while processing the image');
        } finally {
            setLoading(false);
        }
    };

    // Handle download of the response
    const handleDownload = () => {
        if (response) {
            const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <Box px={5} pb={5}>
            <Box display="flex" flexDirection="column">
                <Header title="Image to Text OCR" subtitle="[POST]: /predict/" />

                <Box mt={4}>
                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box display="flex" alignItems="center" height="100%">
                                <Typography variant="h6">File Format:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9.5}>
                            <Typography>png</Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box display="flex" alignItems="center" height="100%">
                                <Typography variant="h6">Link to Huggingface API:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9.5}>
                            <Typography><Link
                                href="https://huggingface.co/spaces/FIamenova/AAP"
                                target="_blank" // Opens the link in a new tab
                                rel="noopener noreferrer" // Recommended for security
                                color="inherit" // Optional: Inherit the text color
                                underline="none" // Optional: Remove the underline
                            >
                                https://huggingface.co/spaces/FIamenova/AAP
                            </Link></Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box display="flex" alignItems="center" height="100%">
                                <Typography>File Selected:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9.5}>
                            <Box>
                                <Typography
                                    display="inline"
                                    onClick={handleDialogOpen}
                                    sx={{
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        "&:hover": {
                                            color: colours.greenAccent[300],
                                        }
                                    }}
                                >
                                    Manage File
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Divider />

                    {/* Display the uploaded image */}
                    {imagePreview && (
                        <Box my={3} display="flex" justifyContent="left">
                            <img
                                src={imagePreview}
                                alt="Uploaded Preview"
                                style={{
                                    maxWidth: '50%',
                                    maxHeight: '100px',
                                    borderRadius: '5px',
                                    border: `2px solid ${colours.greenAccent[300]}`,
                                }}
                            />
                        </Box>
                    )}

                    <Box my={3}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        borderRadius="5px"
                    >
                        <Typography my={2}>API Response:</Typography>

                        <Box style={{ flexGrow: 1 }} />

                        <Box>
                            <IconButton onClick={handleDownload}>
                                <FileDownloadOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Divider />
                    <Box
                        my={2}
                        p={5}
                        minHeight="30vh"
                        backgroundColor={colours.primary[400]}
                        borderRadius="5px"
                    >
                        {loading ? (
                            <Typography>Processing...</Typography>
                        ) : response ? (
                            <Box>
                                <Typography>
                                    {JSON.stringify(response)}
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>
                </Box>
            </Box>

            {/* File Select Dialog */}
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
                <DialogContent>
                    <Box p={1}>
                        <Box mb={2} display="flex" alignItems="start" justifyContent="space-between">
                            <Box>
                                <Typography variant="h5">Upload File</Typography>
                                <DialogContentText>
                                    Upload & attach an image file for OCR.
                                </DialogContentText>
                            </Box>
                            <IconButton onClick={handleDialogClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box>
                            <Typography>{selectedFile ? '1 file selected' : 'No file selected'}</Typography>
                            <Box
                                p={5}
                                minWidth="fit-content"
                                border="2px dashed"
                                borderRadius="5px"
                                textAlign="center"
                                style={{
                                    background: "repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 40px)"
                                }}
                            >
                                <Typography mb={2}>
                                    Choose a file or drag & drop it here
                                </Typography>
                                <DialogContentText mb={2}>png format</DialogContentText>
                                <Button variant="contained" component="label">
                                    <Typography>Browse</Typography>
                                    <input
                                        type="file"
                                        accept=".png"
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Box>
                        </Box>

                        {selectedFile && (
                            <Box mt={5}>
                                <Box my={1} display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography>{selectedFile.name}</Typography>
                                        <DialogContentText>
                                            {selectedFile.size < 1024 * 1024
                                                ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                                                : `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                                        </DialogContentText>
                                    </Box>
                                    <IconButton onClick={handleDeleteFile}>
                                        <DeleteOutlinedIcon />
                                    </IconButton>
                                </Box>
                                <Divider />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Toast Container for Notifications */}
            <ToastContainer />
        </Box>
    );
}

export default OCR;