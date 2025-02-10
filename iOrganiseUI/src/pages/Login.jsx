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
    TextField,
} from '@mui/material';  // Make sure Link is imported from 'react-router-dom'
import Header from '../components/Header';
import { Link as RouterLink } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { tokens } from '../themes/MyTheme';

function Login() {
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

    const handleGoogleLogin = () => {
        // Handle Google sign-in here (could use Firebase or other services)
        console.log('Sign in with Google');
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%', maxWidth: 400, margin: 'auto', padding: 3 }}
        >
            <Header title="Login" />
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
                sx={{ mb: 2, borderRadius: 5 }}
            />
            <Typography>
                Don't have an account?{' '}
                <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    sx={{ color: colours.greenAccent[500] }}
                >
                    Register here
                </Link>
            </Typography>

            {/* Submit Button (Smaller Size) */}
            <Box mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Login
                </Button>
            </Box>
        </Box >
    );
}

export default Login;
