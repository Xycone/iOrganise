import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Grid,
    Divider,
    Button,
    Select,
    Checkbox,
    MenuItem,
    FormControl,
    Dialog,
    DialogContent,
    DialogContentText,
    IconButton,
    TextField,
    useTheme
} from '@mui/material';

import { tokens } from '../themes/MyTheme';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Used for backend API call
import http from '../http';

// Form & Form Validation
import * as yup from 'yup';
import { useFormik } from 'formik';

// React Components
import Header from '../components/Header';

// Toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CategoriseText() {

    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    // File Selection
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

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

    const handleDrop = (event) => {
        event.preventDefault();

        const files = Array.from(event.dataTransfer.files);
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
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDeleteFile = (index) => {
        setSelectedFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1);
            return updatedFiles;
        });
    };

    const [textInput, setTextInput] = useState('');

    const handleTextSubmit = () => {
        const formData = new FormData();

        // Prioritize text input over file uploads
        if (textInput.trim()) {
            formData.append('text', textInput);
            setSelectedFiles([]); // Clear files if text is used
        } else {
            // Use file uploads if no text
            for (const file of selectedFiles) {
                formData.append("files", file);
            }
        }

        if (!textInput.trim() && selectedFiles.length === 0) {
            toast.error('Please provide text or upload a file');
            return;
        }

        setResponse();
        setLoading(true);

        http.post("http://localhost:8000/predict", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((res) => {
                setResponse(res.data);
                setLoading(false);
            })
            .catch((error) => {
                setResponse(error.response);
                setLoading(false);
                toast.error(error.response?.data?.detail || 'An error occurred');
            });
    };



    return (
        <Box px={5} pb={5}>
            <Box display="flex" flexDirection="column">
                <Header title="Categorise Text" subtitle="[POST]: /predict/{text}" />

                <Box component="form" mt={4}>
                    {/* File Format Information */}

                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box display="flex" alignItems="center" height="100%">
                                <Typography variant="h6">File Format:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9.5}>
                            <Typography>txt, pdf, docx</Typography>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box
                                display="flex"
                                alignItems="center"
                                height="100%"
                            >
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
                    <Box my={2}>
                        <Typography variant="h6" gutterBottom>
                            Categorise plain text:
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            placeholder="Type your text here..."
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value);
                                // Clear selected files when text is entered
                                if (e.target.value.trim()) {
                                    setSelectedFiles([]);
                                }
                            }}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Box my={3}>
                        <Divider sx={{ mb: 2 }} />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTextSubmit}
                        >
                            Submit
                        </Button>
                    </Box>
                    <Typography my={2} mt={10} >API Response:</Typography>
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
                                Predicted Label: {
                                    response.predicted_label === 0 ? 'Math' :
                                        response.predicted_label === 1 ? 'English' :
                                            response.predicted_label === 2 ? 'Science' :
                                                response.predicted_label
                                }
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
            </Box>
            {/* File Select Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <Box p={1}>
                        <Box
                            mb={2}
                            display="flex"
                            alignItems="start"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography variant="h5">
                                    Upload Files
                                </Typography>
                                <DialogContentText>
                                    Upload & attach text based files to the API request.
                                </DialogContentText>
                            </Box>

                            <IconButton onClick={handleDialogClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box>
                            <Typography>{selectedFiles.length} file(s) selected</Typography>

                            {/* File Dropzone */}
                            <Box
                                p={5}
                                minWidth="fit-content"
                                border="2px dashed"
                                borderRadius="5px"
                                textAlign="center"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                style={{
                                    backgroundColor: "inherit",
                                    background: "repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 40px)"
                                }}
                            >
                                <Typography mb={2}>
                                    Choose a file or drag & drop it here
                                </Typography>
                                <DialogContentText mb={2}>
                                    txt, pdf, docx formats
                                </DialogContentText>
                                <Button
                                    variant="contained"
                                    component="label"
                                >
                                    <Typography>Browse</Typography>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".txt, .pdf, .docx"
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Box>
                        </Box>


                        {/* Uploaded File Viewer */}
                        {selectedFiles.map((file, index) => (
                            <Box mt={5} key={index}>
                                <Box
                                    my={1}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
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

export default CategoriseText;
