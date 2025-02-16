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
    IconButton
} from '@mui/material';
import { tokens } from '../themes/MyTheme';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';

function OCR() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        let exceededFiles = [];
        files.forEach((file) => {
            if (file.size <= 25 * 1024 * 1024) {
                setSelectedFiles((prevFiles) => [...prevFiles, file]);
            } else {
                exceededFiles.push(file.name);
            }
        });
        if (exceededFiles.length > 0) {
            toast.error(`Files exceeding the 25MB size limit: ${exceededFiles.join(', ')}`);
        }
        event.target.value = '';
    };

    const handleDeleteFile = (index) => {
        setSelectedFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1);
            return updatedFiles;
        });
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        // Add image files if provided
        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });
        }

        // Check if file is provided
        if (selectedFiles.length === 0) {
            toast.error('Please upload an image file');
            return;
        }

        setLoading(true);
        setResponse(null);

        try {
            const res = await http.post("/ocr", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse(res.data);
        } catch (error) {
            setResponse(error.response);
            toast.error(error.response?.data?.detail || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box px={5} pb={5}>
            <Box display="flex" flexDirection="column">
                <Header title="Image to Text OCR" subtitle="[POST]: /ocr" />

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
                                <Typography>Files Selected:</Typography>
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
                                    Manage Files
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Divider />

                    <Box my={3}>
                        <Divider sx={{ mb: 2 }} />
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                    <Typography my={2} mt={10}>API Response:</Typography>
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
                            <Typography>
                                Extracted Text: {response.extracted_text}
                            </Typography>
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
                                <Typography variant="h5">Upload Files</Typography>
                                <DialogContentText>
                                    Upload & attach image files for OCR.
                                </DialogContentText>
                            </Box>
                            <IconButton onClick={handleDialogClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box>
                            <Typography>{selectedFiles.length} file(s) selected</Typography>
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
                                        multiple
                                        accept=".png"
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Box>
                        </Box>

                        {selectedFiles.map((file, index) => (
                            <Box mt={5} key={index}>
                                <Box my={1} display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography>{file.name}</Typography>
                                        <DialogContentText>
                                            {file.size < 1024 * 1024
                                                ? `${(file.size / 1024).toFixed(0)} KB`
                                                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                                        </DialogContentText>
                                    </Box>
                                    <IconButton onClick={() => handleDeleteFile(index)}>
                                        <DeleteOutlinedIcon />
                                    </IconButton>
                                </Box>
                                <Divider />
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default OCR;