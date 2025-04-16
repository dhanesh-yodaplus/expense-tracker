import React from 'react';
import {
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddExpenseForm from './AddExpenseForm';

export default function Dashboard() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container sx={{ mt: 6 }}>
      <h1>Welcome to the Dashboard!</h1>
      <p>You are logged in.</p>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleOpen}>
          Add New Expense
        </Button>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <AddExpenseForm onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
