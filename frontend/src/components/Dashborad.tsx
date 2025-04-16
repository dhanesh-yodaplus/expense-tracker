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
import AddIncomeForm from "./AddIncomeForm";
import ExpenseList from "./ExpenseList";
import IncomeList from "./IncomeList"; // ✅ NEW IMPORT

export default function Dashboard() {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openAddIncome, setOpenAddIncome] = React.useState(false);
  const [openViewExpenses, setOpenViewExpenses] = React.useState(false);
  const [openViewIncomes, setOpenViewIncomes] = React.useState(false); // ✅ NEW STATE

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

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add New Expense
        </Button>
        <Button variant="contained" color="success" onClick={() => setOpenAddIncome(true)}>
          Add New Income
        </Button>
        <Button variant="outlined" onClick={() => setOpenViewExpenses(true)}>
          View Expenses
        </Button>
        <Button variant="outlined" onClick={() => setOpenViewIncomes(true)}>
          View Incomes
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

      {/* Add Income Dialog */}
      <Dialog open={openAddIncome} onClose={() => setOpenAddIncome(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Income</DialogTitle>
        <DialogContent>
          <AddIncomeForm onClose={() => setOpenAddIncome(false)} />
        </DialogContent>
      </Dialog>

      {/* View Expenses Dialog */}
      <Dialog open={openViewExpenses} onClose={() => setOpenViewExpenses(false)} fullWidth maxWidth="md">
        <DialogTitle>Recent Expenses</DialogTitle>
        <DialogContent>
          <ExpenseList />
        </DialogContent>
      </Dialog>

      {/* ✅ View Incomes Dialog */}
      <Dialog open={openViewIncomes} onClose={() => setOpenViewIncomes(false)} fullWidth maxWidth="md">
        <DialogTitle>Recent Incomes</DialogTitle>
        <DialogContent>
          <IncomeList />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
