import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Divider,
    Button,
    TextField,
    Select,
    Checkbox,
    MenuItem,
    InputBase,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogContent,
    DialogContentText,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// Form & Form Validation
import * as yup from 'yup';
import { useFormik } from 'formik';

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
    const [sharedFileList, setSharedFileList] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");

    const getFiles = () => {
        http.get("/get-files")
            .then((res) => {
                setFileList(res.data.files);
                setSharedFileList(res.data.shared_files)
            })
            .catch((err) => {
                console.error("Error fetching files:", err.response?.data?.detail || err.message);
            });
    };

    const onFilterChange = (e) => {
        setFilter(e.target.value);
        searchFiles(e.target.value, search);
    };

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        searchFiles(filter, e.target.value);
    };

    const searchFiles = (filter, search) => {
        http.get(`/get-files?name=${search}&subject=${filter}`)
            .then((res) => {
                setFileList(res.data.files);
                setSharedFileList(res.data.shared_files)
            })
            .catch((err) => {
                console.error("Error fetching files:", err.response?.data?.detail || err.message);
            });
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
    const [isSmart, setIsSmart] = useState(false);

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
                a.download = "iOrganise_export.zip";
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

    const handleExtractDialogClose = () => {
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

    // Share File
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareContent, setShareContent] = useState([]);
    const [shareUsers, setShareUsers] = useState([]);
    const [isSelectUsers, setIsSelectUsers] = useState(false);

    const handleShareDialogOpen = () => {
        setShareDialogOpen(true);
    };

    const handleShareDialogClose = () => {
        setShareDialogOpen(false);
        setShareContent([]);
        setShareUsers([]);
        formik.resetForm();
    };

    const handleCheckboxChange = (fileId) => {
        setShareContent((prevShareContent) => {
            if (prevShareContent.includes(fileId)) {
                return prevShareContent.filter(id => id !== fileId);
            } else {
                return [...prevShareContent, fileId];
            }
        });
    };

    const handleCheckboxReset = () => {
        setShareContent([]);
    };

    const handleSelectUsers = () => {
        setIsSelectUsers(true);
    };


    const handleUsersReset = () => {
        formik.resetForm();
        setShareUsers([]);
    };

    const formik = useFormik({
        // Default Form Values
        initialValues: {
            email: ""
        },

        // Validation Schema
        validationSchema: yup.object({
            email: yup.string().trim()
                .email("Enter a valid email")
                .min(1, "Email must be at least 1 character")
                .max(255, "Email must be at most 255 characters")
                .required("Email is required")
        }),

        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();

            setShareUsers((prevShareUsers) => {
                if (prevShareUsers.includes(data.email)) {
                    return [...prevShareUsers];
                } else {
                    return [...prevShareUsers, data.email];
                }
            });

            formik.resetForm();
        }
    });

    const handleRemoveUsers = (email) => {
        setShareUsers((prevShareUsers) => {
            if (prevShareUsers.includes(email)) {
                return prevShareUsers.filter(prev_email => prev_email !== email);
            } else {
                return [...prevShareUsers];
            }
        });
    };

    const shareFiles = async () => {
        setShareDialogOpen(false);

        console.log("shareContent:", shareContent, "\nshareUsers:", shareUsers);

        http.post("/share-files", {
            fileId_list: shareContent,
            userEmail_list: shareUsers
        })
            .then(response => {
                console.log(response.data.msg);
                toast.success(response.data.msg);
                getFiles();
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
                toast.error(errorMessage);
            });

        setShareContent([]);
        setShareUsers([]);
    };

    return (
        <Box px={5} pb={20}>
            <Box display="flex" flexDirection="column">
                <Header
                    title="Home"
                    subtitle="Welcome to iOrganise"
                />
                <Box mt={4}>
                    <Box mb={4} display="flex" gap={2}>
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
                                            sx={{ mx: 1, cursor: "pointer" }}
                                            onClick={onClickClear}
                                        />
                                    )
                                }
                                placeholder="Search by file name"
                                value={search}
                                onChange={onSearchChange}
                            />
                        </Box>

                        <Select
                            size="small"
                            value={filter}
                            onChange={onFilterChange}
                            displayEmpty
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="math">Math</MenuItem>
                            <MenuItem value="science">Science</MenuItem>
                            <MenuItem value="english">English</MenuItem>
                        </Select>
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
                            onClick={handleShareDialogOpen}
                        />
                    </Box>

                    <Box mb={10}>
                        <Typography mb={1}>
                            My Files:
                        </Typography>
                        {fileList.length === 0 ? (
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography color={theme.palette.text.disabled}>No matching files found</Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
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
                                                    FileType: {file.type} Size:{" "}
                                                    {file.size < 1024
                                                        ? `${file.size} Bytes`
                                                        : file.size < 1024 * 1024
                                                            ? `${(file.size / 1024).toFixed(1)} KB`
                                                            : file.size < 1024 * 1024 * 1024
                                                                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                                : `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`}
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

                    <Box>
                        <Typography mb={1}>
                            Shared With You:
                        </Typography>
                        {sharedFileList.length === 0 ? (
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography color={theme.palette.text.disabled}>No matching files found</Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                        ) : (
                            <List>
                                {sharedFileList.map((file, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText
                                            primary={
                                                <Typography>
                                                    {file.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography color={theme.palette.text.disabled}>
                                                    FileType: {file.type} Size:{" "}
                                                    {file.size < 1024
                                                        ? `${file.size} Bytes`
                                                        : file.size < 1024 * 1024
                                                            ? `${(file.size / 1024).toFixed(1)} KB`
                                                            : file.size < 1024 * 1024 * 1024
                                                                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                                : `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`}
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
            </Box>

            {/* File Select Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                TransitionProps={{
                    onExited: () => setIsSmart(),
                }}
                fullWidth
                maxWidth="md"
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
                                            Upload your files to iOrganise for AI processing.
                                        </DialogContentText>
                                    </>
                                )}
                                {isSmart === false && (
                                    <>
                                        <Typography variant="h5">
                                            Upload Files
                                        </Typography>
                                        <DialogContentText>
                                            Upload your files to iOrganise.
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
                                component="label"
                                minWidth="fit-content"
                                minHeight="300px"
                                border="2px dashed"
                                borderRadius="5px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                sx={{
                                    cursor: "pointer",
                                }}
                                style={{
                                    backgroundColor: "inherit",
                                    background: "repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 20px, rgba(255, 255, 255, 0.05) 20px, rgba(255, 255, 255, 0.05) 40px)"
                                }}
                            >
                                <Box textAlign="center">
                                    <Typography mb={2}>
                                        Click to choose a file or drag & drop it here
                                    </Typography>
                                    <DialogContentText mb={2}>
                                        mp3, mp4, mpeg, mpga, m4a, wav, webm, pdf, docx, txt and png formats
                                    </DialogContentText>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm, .pdf, .docx, .txt, .png"
                                        style={{ display: "none" }}
                                        onChange={handleFileSelect}
                                    />
                                </Box>
                            </Box>
                        </Box>


                        {/* Uploaded File Viewer */}
                        <Box mt={5}>
                            {selectedFiles.map((file, index) => (
                                <Box key={index}>
                                    <Box
                                        my={1}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Box>
                                            <Tooltip title={file.name} arrow>
                                                <Typography
                                                    maxWidth="300px"
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                    whiteSpace="nowrap"
                                                >
                                                    {file.name}
                                                </Typography>
                                            </Tooltip>
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
                        </Box>

                        {/* Upload Files Button */}
                        <Box mt={5}>
                            <Box display="flex" justifyContent="end" gap={2}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    type="submit"
                                    component="label"
                                    onClick={handleFileUpload}
                                >
                                    <Typography>Upload</Typography>
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmationOpen}
                onClose={handleCancelDelete}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <Box p={1}>
                        <Box mb={2}>
                            <Typography variant="h5">Delete Files Permanently</Typography>
                            <DialogContentText>
                                Are you sure you want to delete this file? This action cannot be undone.
                            </DialogContentText>
                        </Box>

                        <Box mt={5}>
                            <Box display="flex" justifyContent="end" gap={2}>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    onClick={handleCancelDelete}
                                >
                                    <Typography>
                                        Cancel
                                    </Typography>
                                </Button>
                                <Button
                                    size="large"
                                    variant="contained"
                                    onClick={handleConfirmDelete}
                                >
                                    <Typography>
                                        Remove
                                    </Typography>
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Extract View Dialog */}
            <Dialog
                open={extractDialogOpen}
                onClose={handleExtractDialogClose}
                fullWidth
                maxWidth="md"
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
                                <Typography variant="h5">View Extract</Typography>
                                <DialogContentText>
                                    File Content and Summary.
                                </DialogContentText>
                            </Box>

                            <IconButton onClick={handleExtractDialogClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box mt={5}>
                            {extractContent ? (
                                <>
                                    <Box mb={2}>
                                        <Typography>
                                            Subject:
                                        </Typography>
                                        <DialogContentText>
                                            {extractContent.subject ? extractContent.subject : "No subject classified"}
                                        </DialogContentText>
                                    </Box>
                                    <Box mb={2}>
                                        <Typography>
                                            Content:
                                        </Typography>
                                        <DialogContentText>
                                            {extractContent.content ? extractContent.content : "No content available"}
                                        </DialogContentText>
                                    </Box>
                                    <Box>
                                        <Typography>
                                            Summary:
                                        </Typography>
                                        <DialogContentText>
                                            {extractContent.summary ? extractContent.summary : "No summary available"}
                                        </DialogContentText>
                                    </Box>
                                </>
                            ) : (
                                <Box>
                                    <DialogContentText>Loading extract...</DialogContentText>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Share File Dialog */}
            <Dialog
                open={shareDialogOpen}
                onClose={handleShareDialogClose}
                TransitionProps={{
                    onExited: () => setIsSelectUsers(false),
                }}
                fullWidth
                maxWidth="md"
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
                                {isSelectUsers === true && (
                                    <>
                                        <Typography variant="h5">Select Users</Typography>
                                        <DialogContentText>
                                            Share the previously selected files with the following users.
                                        </DialogContentText>
                                    </>
                                )}
                                {isSelectUsers === false && (
                                    <>
                                        <Typography variant="h5">Share Files</Typography>
                                        <DialogContentText>
                                            Choose your files to share.
                                        </DialogContentText>
                                    </>
                                )}
                            </Box>

                            <IconButton onClick={handleShareDialogClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box mt={5}>
                            {isSelectUsers === true && (
                                <>
                                    <Box component="form" display="flex" alignItems="flex-start" gap={2}>
                                        <TextField
                                            size="small"
                                            label="Email"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                            helperText={formik.touched.email && formik.errors.email}
                                        >

                                        </TextField>

                                        <Button
                                            type="submit"
                                            component="label"
                                            size="large"
                                            variant="contained"
                                            onClick={formik.handleSubmit}
                                        >
                                            <Typography>
                                                Add
                                            </Typography>
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Box mt={5}>
                            {isSelectUsers === true && (
                                <>
                                    {shareUsers.map((email, index) => (
                                        <Box key={index}>
                                            <Box
                                                my={1}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                gap={2}
                                            >
                                                <Box>
                                                    <Typography
                                                        maxWidth="300px"
                                                        overflow="hidden"
                                                        textOverflow="ellipsis"
                                                        whiteSpace="nowrap"
                                                    >
                                                        {email}
                                                    </Typography>
                                                </Box>

                                                <IconButton onClick={() => handleRemoveUsers(email)}>
                                                    <DeleteOutlinedIcon />
                                                </IconButton>
                                            </Box>

                                            <Divider />
                                        </Box>
                                    ))}
                                </>
                            )}
                            {isSelectUsers === false && (
                                <>
                                    {fileList.map((file, index) => (
                                        <Box key={index}>
                                            <Box
                                                my={1}
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                            >
                                                <Box>
                                                    <Checkbox
                                                        checked={shareContent.includes(file.id)}
                                                        onChange={() => handleCheckboxChange(file.id)}
                                                    />
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        maxWidth="300px"
                                                        overflow="hidden"
                                                        textOverflow="ellipsis"
                                                        whiteSpace="nowrap"
                                                    >
                                                        {file.name}
                                                    </Typography>

                                                    <DialogContentText>
                                                        FileType: {file.type} Size:{" "}
                                                        {file.size < 1024
                                                            ? `${file.size} Bytes`
                                                            : file.size < 1024 * 1024
                                                                ? `${(file.size / 1024).toFixed(1)} KB`
                                                                : file.size < 1024 * 1024 * 1024
                                                                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                                    : `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`}
                                                    </DialogContentText>
                                                </Box>
                                            </Box>

                                            <Divider />
                                        </Box>
                                    ))}
                                </>
                            )}
                        </Box>

                        <Box mt={5}>
                            {isSelectUsers === true && (
                                <>
                                    <Box display="flex" justifyContent="end" gap={2}>
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            onClick={handleUsersReset}
                                        >
                                            <Typography>Reset</Typography>
                                        </Button>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            onClick={shareFiles}
                                        >
                                            <Typography>Share</Typography>
                                        </Button>
                                    </Box>
                                </>
                            )}
                            {isSelectUsers === false && (
                                <>
                                    <Box display="flex" justifyContent="end" gap={2}>
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            onClick={handleCheckboxReset}
                                        >
                                            <Typography>Reset</Typography>
                                        </Button>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            onClick={handleSelectUsers}
                                        >
                                            <Typography>Select</Typography>
                                        </Button>
                                    </Box>
                                </>
                            )}
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