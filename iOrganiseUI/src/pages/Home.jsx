import React, { useEffect, useState } from 'react';

import { Box, Typography, Button, List, ListItem, ListItemText, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// MUI Icons
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';

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
                            title="Upload or drop"
                            icon={<FileUploadOutlinedIcon />}
                            menuItems={[
                                { icon: <UploadFileOutlinedIcon />, label: "Upload File", onClick: () => console.log("Uploading File") },
                                { icon: <DriveFolderUploadIcon />, label: "Upload Folder", onClick: () => console.log("Uploading Folder") },
                            ]}
                        />

                        <UtilBox
                            title="New folder"
                            icon={<CreateNewFolderOutlinedIcon />}
                        />

                        <UtilBox
                            title="New file"
                            icon={<NoteAddOutlinedIcon />}
                        />
                    </Box>
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

            <ToastContainer />
        </Box>
    );
}

export default Home