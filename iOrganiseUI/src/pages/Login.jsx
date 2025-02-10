import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Box, Typography, Button, TextField, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

// Used for backend API call
import http from '../http';

// Form & Form Validation
import * as yup from 'yup';
import { useFormik } from 'formik';

// React Components
import Header from '../components/Header';

// Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
    const navigate = useNavigate();

    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const formik = useFormik({
        // Default Form Values
        initialValues: {
            username: "",
            password: ""
        },

        // Validation Schema
        validationSchema: yup.object({
            username: yup.string().trim()
                .email('Enter a valid email')
                .min(1, 'Password must be at least 1 character')
                .max(255, 'Email must be at most 255 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(1, 'Password must be at least 1 character')
                .max(255, 'Password must be at most 255 characters')
                .required('Password is required')
        }),

        onSubmit: (data) => {
            const formData = new FormData();

            formData.append('username', data.username.trim().toLowerCase());
            formData.append('password', data.password.trim());

            http.post("/login", formData)
                .then((res) => {
                    localStorage.setItem("accessToken", res.access_token);
                    navigate("/home")
                })
                .catch(function (err) {
                    const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
                    toast.error(errorMessage);
                });
        }
    });

    return (
        <Box px={5} pb={5}>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Header title="Login" />

                <Box component="form">
                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Email"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />

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

                    <Box my={3}>
                        <Button
                            fullWidth
                            type="submit"
                            component="label"
                            size="large"
                            onClick={formik.handleSubmit}
                        >
                            Sign In
                        </Button>
                    </Box>

                    <Typography
                        my={1}
                        textAlign="center"
                    >
                        New user? <Link to="/register" style={{ color: colours.greenAccent[300] }}>Create an account.</Link>
                    </Typography>

                    <ToastContainer />
                </Box>
            </Box>
        </Box>
    );
}

export default Login;