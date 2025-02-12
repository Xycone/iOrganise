import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, TextField, useTheme } from '@mui/material';
import { tokens } from '../themes/MyTheme';

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

function Register() {
    const navigate = useNavigate();

    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const formik = useFormik({
        // Default Form Values
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirm_password: ""
        },

        // Validation Schema
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
                .required("Password is required"),
            confirm_password: yup.string().trim()
                .oneOf([yup.ref('password'), null], 'Passwords must match')
                .required("Confirm Password is required")
        }),

        onSubmit: (data) => {
            data.name = data.name.trim();
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();

            http.post("/register", data)
                .then(() => {
                    navigate("/login");
                })
                .catch(function (err) {
                    const errorMessage = err.response?.data?.detail || err.message || "An error occurred";
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
                <Header title="Register" />

                <Box component="form" width="100%" maxWidth="400px">
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

                    <TextField
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                        label="Confirm Password"
                        name="confirm_password"
                        type="password"
                        value={formik.values.confirm_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                        helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                    />

                    <Box my={3}>
                        <Button
                            sx={{ mb: 2 }}
                            fullWidth
                            type="submit"
                            component="label"
                            size="large"
                            onClick={formik.handleSubmit}
                        >
                            Sign Up
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            type="submit"
                            component="label"
                            size="large"
                            onClick={() => navigate("/login")}
                        >
                            Sign In
                        </Button>
                    </Box>

                    <ToastContainer />
                </Box>
            </Box>
        </Box>
    );
}

export default Register;
