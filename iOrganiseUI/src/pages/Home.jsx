import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Divider,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogContent,
    DialogContentText,
    IconButton,
    useTheme
} from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined';
import AttachEmailOutlinedIcon from '@mui/icons-material/AttachEmailOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';

// React Components
import Header from '../components/Header';
import UtilBox from '../components/UtilBox';

// Toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    // Retrieve uploaded files
    const [fileList, setFileList] = useState([]);

    const getFiles = () => {
        http.get('/get-files')
            .then((res) => {
                setFileList(res.data.files);
            })
            .catch((err) => {
                console.error("Error fetching files:", err.response?.data?.detail || err.message);
            });
    };

    useEffect(() => {
        getFiles();
    }, []);

    // File Upload
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedFiles([]);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);

        files.forEach((file) => {
            setSelectedFiles((prevFiles) => [...prevFiles, file]);
        });

        event.target.value = '';
    };

    const handleDrop = (event) => {
        event.preventDefault();

        const files = Array.from(event.dataTransfer.files);

        files.forEach((file) => {
            setSelectedFiles((prevFiles) => [...prevFiles, file]);
        });
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

    const handleFileUpload = async () => {
        const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append("files", file);
        }

        // POST Request, /upload-files
        http.post("/upload-files", formData)
            .then((res) => {
                console.log("API Response:", res.data);
                setSelectedFiles([]);
                handleDialogClose();
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    };

    const downloadFile = async (fileId) => {
        http.get(`/download-file/${fileId}`, { responseType: "blob" })
            .then(response => {
                const url = window.URL.createObjectURL(response.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = "downloads";
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
                toast.error(errorMessage);
            });
    };

    return (
        <Box px={5} pb={5}>
            <Box display="flex" flexDirection="column">
                <Header
                    title="Home"
                    subtitle="Welcome to iOrganise"
                />
                <Box mt={4}>
                    <Box
                        mb={10}
                        display="flex"
                        flexDirection="row"
                        gap={4}
                    >
                        <UtilBox
                            title="Upload items"
                            icon={<FileUploadOutlinedIcon />}
                            menuItems={[
                                { icon: <UploadFileOutlinedIcon sx={{ color: theme.palette.text.primary }} />, label: "Upload Files", onClick: handleDialogOpen },
                                { icon: <AutoAwesomeOutlinedIcon sx={{ color: theme.palette.text.primary }} />, label: "Smart Upload", onClick: () => console.log("Uploading Folder") }
                            ]}
                        />

                        <UtilBox
                            title="Migrate data"
                            icon={<DriveFileMoveOutlinedIcon />}
                            menuItems={[
                                { icon: <BrowserUpdatedIcon sx={{ color: theme.palette.text.primary }} />, label: "Local Download", onClick: () => console.log("Downloading all items") },
                                { icon: <AddToDriveOutlinedIcon sx={{ color: theme.palette.text.primary }} />, label: "Export to Drive", onClick: () => console.log("Transferring all items") },
                                { icon: <AttachEmailOutlinedIcon sx={{ color: theme.palette.text.primary }} />, label: "Send to Mail", onClick: () => console.log("Sending to email") }
                            ]}
                        />

                        <UtilBox
                            title="Share items"
                            icon={<IosShareOutlinedIcon />}
                            onClick={() => console.log("Sharing Items")}
                        />
                    </Box>


                    {fileList.length === 0 ? (
                        <Typography>No files uploaded yet.</Typography>
                    ) : (
                        <List>
                            {fileList.map((file, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={
                                            <Typography variant="body2" component="span">
                                                Id: {file.id}, Type: {file.type}, Size: {file.size} MB
                                            </Typography>
                                        }
                                    />
                                    {/* Download Button */}
                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => downloadFile(file.id)}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )}
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
                                    Upload and attach your files to iOrganise.
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
                                    common audio, video, image & document formats accepted
                                </DialogContentText>
                                <Button
                                    variant="contained"
                                    component="label"
                                >
                                    <Typography>Browse</Typography>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm, .pdf, .docx, .txt"
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
                        <Box mt={5}>
                            <Button
                                size="large"
                                fullWidth
                                component="label"
                                onClick={handleFileUpload}
                            >
                                <Typography>Upload Files</Typography>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            <ToastContainer />
        </Box>
    );
}

export default Home