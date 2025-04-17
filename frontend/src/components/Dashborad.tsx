import React from "react";
import {
  Container,
  Typography,
  Card,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LogoutIcon from "@mui/icons-material/Logout";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SavingsIcon from "@mui/icons-material/Savings";
import { useNavigate } from "react-router-dom";

import AddExpenseForm from "./AddExpenseForm";
import AddIncomeForm from "./AddIncomeForm";
import ExpenseList from "./ExpenseList";
import IncomeList from "./IncomeList";
import ExpenseBulkUpload from "./ExpenseBulkUpload";
import BudgetForm from "./BudgetForm";
import BudgetSummary from "./BudgetSummary";

type DashboardAction = {
  label: string;
  icon: JSX.Element;
  action: () => void;
};

export default function Dashboard(): JSX.Element {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openAddIncome, setOpenAddIncome] = React.useState(false);
  const [openViewExpenses, setOpenViewExpenses] = React.useState(false);
  const [openViewIncomes, setOpenViewIncomes] = React.useState(false);
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [openBudgetForm, setOpenBudgetForm] = React.useState(false);
  const [openBudgetSummary, setOpenBudgetSummary] = React.useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const dashboardActions: DashboardAction[] = [
    {
      label: "Add Expense",
      icon: <AddIcon fontSize="large" color="primary" />,
      action: () => setOpenAdd(true),
    },
    {
      label: "Add Income",
      icon: <MonetizationOnIcon fontSize="large" color="success" />,
      action: () => setOpenAddIncome(true),
    },
    {
      label: "Add Budget",
      icon: <SavingsIcon fontSize="large" color="secondary" />,
      action: () => setOpenBudgetForm(true),
    },
    {
      label: "Bulk Upload",
      icon: <UploadFileIcon fontSize="large" />,
      action: () => setOpenBulkUpload(true),
    },
    {
      label: "View Expenses",
      icon: <VisibilityIcon fontSize="large" color="info" />,
      action: () => setOpenViewExpenses(true),
    },
    {
      label: "View Incomes",
      icon: <SavingsIcon fontSize="large" color="secondary" />,
      action: () => setOpenViewIncomes(true),
    },
    {
      label: "Logout",
      icon: <LogoutIcon fontSize="large" color="error" />,
      action: handleLogout,
    },
    {
      label: "View Budget Summary",
      icon: <VisibilityIcon fontSize="large" color="primary" />,
      action: () => setOpenBudgetSummary(true),
    },
  ];

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Expense Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: "gray" }}>
        Track, manage, and visualize your spending like a pro.
      </Typography>

      <Grid container spacing={3}>
        {dashboardActions.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardActionArea onClick={item.action} sx={{ p: 2 }}>
                <Grid
                  container
                  spacing={1}
                  direction="column"
                  alignItems="center"
                >
                  <Grid item>{item.icon}</Grid>
                  <Grid item>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.label}
                    </Typography>
                  </Grid>
                </Grid>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogs */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <AddExpenseForm onClose={() => setOpenAdd(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openAddIncome}
        onClose={() => setOpenAddIncome(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Income</DialogTitle>
        <DialogContent>
          <AddIncomeForm onClose={() => setOpenAddIncome(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBudgetForm}
        onClose={() => setOpenBudgetForm(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Budget</DialogTitle>
        <DialogContent>
          <BudgetForm
            open={openBudgetForm}
            onClose={() => setOpenBudgetForm(false)}
            initialData={null}
            onSuccess={() => setOpenBudgetForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openViewExpenses}
        onClose={() => setOpenViewExpenses(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Recent Expenses</DialogTitle>
        <DialogContent>
          <ExpenseList />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openViewIncomes}
        onClose={() => setOpenViewIncomes(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Recent Incomes</DialogTitle>
        <DialogContent>
          <IncomeList />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBulkUpload}
        onClose={() => setOpenBulkUpload(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bulk Upload Expenses</DialogTitle>
        <DialogContent>
          <ExpenseBulkUpload onClose={() => setOpenBulkUpload(false)} />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openBudgetSummary}
        onClose={() => setOpenBudgetSummary(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Budget Summary</DialogTitle>
        <DialogContent>
          <BudgetSummary />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
