import React from "react";
import {
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";

export default function Dashboard() {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openView, setOpenView] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard!
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        You are logged in.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add New Expense
        </Button>
        <Button variant="outlined" onClick={() => setOpenView(true)}>
          View Expenses
        </Button>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      {/* Add Expense Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <AddExpenseForm onClose={() => setOpenAdd(false)} />
        </DialogContent>
      </Dialog>

      {/* View Expenses Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="md">
        <DialogTitle>Recent Expenses</DialogTitle>
        <DialogContent>
          <ExpenseList />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
