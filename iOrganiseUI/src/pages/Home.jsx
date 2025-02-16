import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Divider,
    Button,
    InputBase,
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
import SearchIcon from '@mui/icons-material/Search';
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
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

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
    const [search, setSearch] = useState("");

    const getFiles = () => {
        http.get("/get-files")
            .then((res) => {
                setFileList(res.data.files);
            })
            .catch((err) => {
                console.error("Error fetching files:", err.response?.data?.detail || err.message);
            });
    };

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const searchFiles = () => {
        http.get(`/get-files?name=${search}`)
            .then((res) => {
                setFileList(res.data.files);
            })
            .catch((err) => {
                console.error("Error fetching files:", err.response?.data?.detail || err.message);
            });
    };

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchFiles();
        }
    };

    const onClickSearch = () => {
        searchFiles();
    };

    const onClickClear = () => {
        setSearch("");
        getFiles();
    };

    useEffect(() => {
        getFiles();
    }, []);

    // File Upload
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSmart, setIsSmart] = useState();

    const handleDialogOpen = () => {
        setIsSmart(false);
        setDialogOpen(true);
    };

    const handleSmartDialogOpen = () => {
        setIsSmart(true);
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

        event.target.value = "";
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

    const handleRemoveFile = (index) => {
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

        const endpoint = isSmart ? "/smart-upload" : "/upload-files";

        const toastId = toast.loading("Uploading files...");

        handleDialogClose();

        // POST Request, /upload-files
        http.post(endpoint, formData)
            .then((res) => {
                console.log("API Response:", res.data);
                setSelectedFiles([]);
                getFiles();

                toast.update(toastId, {
                    render: "Upload successful!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            })
            .catch((error) => {
                console.error("API Error:", error);

                toast.update(toastId, {
                    render: "Error uploading files",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            })
    };

    // File Download
    const downloadFile = async (fileId, fileName) => {
        http.get(`/download-file/${fileId}`, { responseType: "blob" })
            .then(response => {
                const url = window.URL.createObjectURL(response.data);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
                toast.error(errorMessage);
            });
    };

    const downloadAll = async () => {
        http.get("/download-all", { responseType: "blob" })
            .then(response => {
                const url = window.URL.createObjectURL(response.data);
                const a = document.createElement("a");
                a.href = url;
                a.download = "export.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => {
                console.error("Error downloading files:", error);
                toast.error("Failed to download files");
            });
    };

    // File Delete
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState();

    const handleDeleteClick = (fileId) => {
        setFileToDelete(fileId);
        setDeleteConfirmationOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (fileToDelete) {
            http.delete(`/delete-file/${fileToDelete}`)
                .then(response => {
                    console.log(response.data.msg);
                    toast.success(response.data.msg);
                    setDeleteConfirmationOpen(false);
                    setFileToDelete();
                    getFiles();
                })
                .catch((err) => {
                    const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
                    toast.error(errorMessage);
                });
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
        setFileToDelete();
    };

    // View Extract
    const [extractContent, setExtractContent] = useState();
    const [extractDialogOpen, setExtractDialogOpen] = useState(false);

    const handleCloseExtractDialog = () => {
        setExtractDialogOpen(false);
        setExtractContent();
    };

    const viewExtract = async (fileId) => {
        setExtractDialogOpen(true);
        http.post(`/view-extract/${fileId}`)
            .then(response => {
                console.log(response);
                setExtractContent(response.data);
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
                    <Box mb={4} display="flex">
                        <Box
                            p={1}
                            flexGrow={1}
                            background="invisible"
                            border="1px solid"
                            borderColor={theme.palette.divider}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="5px"
                        >
                            <InputBase
                                sx={{ flex: 1 }}
                                startAdornment={
                                    <SearchIcon sx={{ mx: 1, color: theme.palette.text.disabled }} />
                                }
                                endAdornment={
                                    search && (
                                        <CloseIcon
                                            sx={{ mx: 1, color: theme.palette.text.disabled, cursor: "pointer" }}
                                            onClick={onClickClear}
                                        />
                                    )
                                }
                            placeholder="Search by file name"
                            value={search}
                            onChange={onSearchChange}
                            onKeyDown={onSearchKeyDown}
                            />
                        </Box>
                    </Box>

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
                                { icon: <AutoAwesomeOutlinedIcon sx={{ color: theme.palette.text.primary }} />, label: "Smart Upload", onClick: handleSmartDialogOpen }
                            ]}
                        />

                        <UtilBox
                            title="Migrate data"
                            icon={<DriveFileMoveOutlinedIcon />}
                            menuItems={[
                                { icon: <BrowserUpdatedIcon sx={{ color: theme.palette.text.primary }} />, label: "Local Download", onClick: () => downloadAll() },
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
                        <Typography>No matching files found</Typography>
                    ) : (
                        <List>
                            {fileList.map((file, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={
                                            <Typography>
                                                {file.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography color={theme.palette.text.disabled}>
                                                FileType: {file.type} Size: {file.size} MB
                                            </Typography>
                                        }
                                    />
                                    {/* Buttons*/}
                                    <Box>
                                        <IconButton onClick={() => viewExtract(file.id)}>
                                            <SummarizeOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={() => downloadFile(file.id, file.name)}>
                                            <FileDownloadOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(file.id)}>
                                            <DeleteForeverOutlinedIcon />
                                        </IconButton>
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
                TransitionProps={{
                    onExited: () => setIsSmart(),
                }}
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
                                {isSmart === true && (
                                    <>
                                        <Typography variant="h5">
                                            Smart Upload
                                        </Typography>
                                        <DialogContentText>
                                            Upload and attach your files to iOrganise for AI processing.
                                        </DialogContentText>
                                    </>
                                )}
                                {isSmart === false && (
                                    <>
                                        <Typography variant="h5">
                                            Upload Files
                                        </Typography>
                                        <DialogContentText>
                                            Upload and attach your files to iOrganise.
                                        </DialogContentText>
                                    </>
                                )}
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
                                        style={{ display: "none" }}
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

                                    <IconButton onClick={() => handleRemoveFile(index)}>
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

            {/* Extract View Dialog */}
            <Dialog
                open={extractDialogOpen}
                onClose={handleCloseExtractDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <Box p={1}>
                        <Box mb={2}>
                            {extractContent ? (
                                <Box>
                                    <Typography>
                                        Content:
                                    </Typography>
                                    <DialogContentText mb={4}>
                                        {extractContent.content ? extractContent.content : "No content available"}
                                    </DialogContentText>
                                    <Typography>
                                        Summary:
                                    </Typography>
                                    <DialogContentText>
                                        {extractContent.summary ? extractContent.summary : "No summary available"}
                                    </DialogContentText>
                                </Box>
                            ) : (
                                <DialogContentText>Loading extract...</DialogContentText>
                            )}
                        </Box>

                        <Box display="flex" justifyContent="end">
                            <Button variant="contained" color="inherit" onClick={handleCloseExtractDialog}>
                                Close
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmationOpen}
                onClose={handleCancelDelete}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <Box p={1}>
                        <Box mb={2}>
                            <Typography>Delete Files Permanently</Typography>
                            <DialogContentText>
                                Are you sure you want to delete this file? This action cannot be undone.
                            </DialogContentText>
                        </Box>

                        <Box display="flex" justifyContent="end" gap={2}>
                            <Button variant="contained" color="inherit"
                                onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="error"
                                onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>


            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Box>
    );
}

export default Home