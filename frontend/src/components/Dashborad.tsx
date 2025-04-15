// import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You are logged in.
      </Typography>
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
}
