import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    useTheme,
    TextField
} from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// Form & Form Validation
import * as yup from 'yup';
import { useFormik } from 'formik';

// Toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Settings() {
    const navigate = useNavigate();
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const [userSetting, setUserSetting] = useState(null);

    // Fetch user and settings data on component mount
    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            const response = await http.get('/get-setting');
            setUserSetting(response.data.setting);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch user settings";
            toast.error(errorMessage);
        }
    };

    // Formik for Profile and Settings Update
    const formik = useFormik({
        enableReinitialize: true, // Reinitialize form when user settings data changes
        initialValues: {
            name: userSetting?.name || '',
            email: userSetting?.email || '',
            password: '', // Password field for updating profile
            asr_model: userSetting?.asr_model || '',
            llm: userSetting?.llm || '',
        },

        validationSchema: yup.object({
            name: yup.string().trim()
                .min(1, "Name must be at least 1 character")
                .max(100, "Name must be at most 100 characters")
                .required("Name is required"),
            email: yup.string().trim()
                .email("Enter a valid email")
                .min(1, "Email must be at least 1 character")
                .max(255, "Email must be at most 255 characters")
                .required("Email is required"),
            password: yup.string().trim()
                .min(1, "Password must be at least 1 character")
                .max(255, "Password must be at most 255 characters")
                .required("Password is required"), // Password is required for profile updates
            asr_model: yup.string().trim()
                .required("ASR Model is required"),
            llm: yup.string().trim()
                .required("LLM is required"),
        }),

        onSubmit: async (data) => {
            try {
                const response = await http.put(`/update-setting/${userSetting.id}`, {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    asr_model: data.asr_model,
                    llm: data.llm,
                });

                if (response.data.user_msg.status === "User updated successfully" && response.data.setting_msg.status === "UserSetting updated successfully") {
                    toast.success("Profile and settings updated successfully!");
                    fetchUserSettings(); // Refresh user settings data
                    formik.resetForm(); // Clear the form
                } else {
                    toast.error("Failed to update profile or settings");
                }
            } catch (err) {
                const errorMessage = err.response?.data?.detail || err.message || "Failed to update profile and settings";
                toast.error(errorMessage);
            }
        },
    });

    return (
        <Box px={5} pb={5}>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Typography variant="h3" sx={{ mb: 3 }}>Account Settings</Typography>

                {/* Profile and Settings Update Section */}
                <Box component="form" width="100%" maxWidth="400px" mb={5}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Update Profile and Settings</Typography>

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    {/* ASR Model */}
                    <Grid container my={2}>
                        <Grid item xs={12} md={4} lg={2.5}>
                            <Box
                                display="flex"
                                alignItems="center"
                                height="100%"
                            >
                                <Typography>ASR Model:</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8} lg={9.5}>
                            <Box
                                display="flex"
                                alignItems="center"
                                height="100%"
                            >
                                <Select
                                    autoWidth
                                    size="small"
                                    name="asr_model"
                                    value={formik.values.asr_model}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.asr_model && Boolean(formik.errors.asr_model)}
                                >
                                    <MenuItem value={"small"}>Small</MenuItem>
                                    <MenuItem value={"small_sg"}>Small (Finetuned for SG)</MenuItem>
                                    <MenuItem value={"medium"}>Medium</MenuItem>
                                </Select>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box>
                        {/* Audit Criteria */}
                        <Grid container my={2}>
                            <Grid item xs={12} md={4} lg={2.5}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    height="100%"
                                >
                                    <Typography>LLM:</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={8} lg={9.5}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    height="100%"
                                >
                                    <Select
                                        autoWidth
                                        size="small"
                                        name="llm"
                                        value={formik.values.llm}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.llm && Boolean(formik.errors.llm)}
                                    >
                                        <MenuItem value={"mistral_7b"}>Mistral 7B</MenuItem>
                                        <MenuItem value={"deepseek_14b"}>Deepseek 14B</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Password"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Button
                        sx={{ mt: 2 }}
                        fullWidth
                        type="submit"
                        variant="contained"
                        onClick={formik.handleSubmit}
                    >
                        Update Profile and Settings
                    </Button>

                    {/* Change Password Button */}
                    <Button
                        sx={{ mt: 2 }}
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/changepassword')} // Redirect to Change Password page
                    >
                        Change Password
                    </Button>
                </Box>



                <ToastContainer />
            </Box>
        </Box>
    );
}

export default Settings;