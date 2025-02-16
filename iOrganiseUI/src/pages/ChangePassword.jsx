import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, useTheme, Typography } from '@mui/material';
import { tokens } from '../themes/MyTheme';
import http from '../http';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChangePassword() {
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

    // Formik for Password Change
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },

        validationSchema: yup.object({
            currentPassword: yup.string().trim()
                .min(1, "Current Password must be at least 1 character")
                .max(255, "Current Password must be at most 255 characters")
                .required("Current Password is required"),
            newPassword: yup.string().trim()
                .min(1, "New Password must be at least 1 character")
                .max(255, "New Password must be at most 255 characters")
                .required("New Password is required"),
            confirmPassword: yup.string().trim()
                .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
                .required("Confirm Password is required"),
        }),

        onSubmit: async (data) => {
            console.log('Submitting data:', data); // Log form data
            try {
                const response = await http.put(`/update-setting/${userSetting.id}`, {
                    name: userSetting.name, // Keep existing name
                    email: userSetting.email, // Keep existing email
                    password: data.newPassword, // Update password
                    asr_model: userSetting.asr_model, // Keep existing ASR model
                    llm: userSetting.llm, // Keep existing LLM
                });

                console.log("Password change success response:", response);  // Check if response is successful

                toast.success("Password changed successfully!");
                passwordFormik.resetForm(); // Clear the form
                setTimeout(() => {
                    navigate('/settings'); // Redirect to settings page after 2 seconds
                }, 2000); // Delay the navigation to show the toast
            } catch (err) {
                console.error('Error:', err); // Log error for debugging
                const errorMessage = err.response?.data?.detail || err.message || "Failed to change password";
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
                <Typography variant="h3" sx={{ mb: 3 }}>Change Password</Typography>

                {/* Password Change Section */}
                <Box component="form" width="100%" maxWidth="400px">
                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={passwordFormik.values.currentPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                        helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                    />

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                        helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                    />

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                        helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                    />

                    <Button
                        sx={{ mt: 2 }}
                        fullWidth
                        type="submit"
                        variant="contained"
                        onClick={passwordFormik.handleSubmit}
                    >
                        Change Password
                    </Button>
                </Box>

                <ToastContainer />
            </Box>
        </Box>
    );
}

export default ChangePassword;
