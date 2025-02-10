import React, { useState } from 'react';
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
    Link,
    TextField
} from '@mui/material';  // Make sure Link is imported from 'react-router-dom'
import Header from '../components/Header';
import { Link as RouterLink } from 'react-router-dom';
import { tokens } from '../themes/MyTheme';

function Register() {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here (e.g., validate credentials)
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%', maxWidth: 400, margin: 'auto', padding: 3 }}
        >
            <Header title="Register" />
            {/* Email Input */}
            <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                size='small'
                sx={{ mb: 1, borderRadius: 5 }}
            />

            {/* Password Input */}
            <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={handlePasswordChange}
                size='small'
                sx={{ borderRadius: 5 }}
            />

            {/* Submit Button (Smaller Size) */}
            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Register
                </Button>
            </Box>
        </Box >
    );
}

export default Register;
