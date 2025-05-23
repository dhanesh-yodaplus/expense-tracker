import React from "react";
import {
  Container,
  Typography,
  Card,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import {
  Visibility,
  Logout,
  MonetizationOn,
  Savings,
  PieChart,
  Receipt,
  TrendingUp,
  CloudUpload,
  BarChart,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useThemeMode } from "../components/ThemeContext";
import VisualInsights from "./VisualInsights";
import BarChartIcon from "@mui/icons-material/BarChart";

import AddExpenseForm from "./AddExpenseForm";
import AddIncomeForm from "./AddIncomeForm";
import ExpenseList from "./ExpenseList";
import IncomeList from "./IncomeList";
import ExpenseBulkUpload from "./ExpenseBulkUpload";
import BudgetForm from "./BudgetForm";
import BudgetSummary from "./BudgetSummary";
import BudgetAnalyticsCard from "./BudgetAnalyticsCard";

export default function Dashboard(): JSX.Element {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openAddIncome, setOpenAddIncome] = React.useState(false);
  const [openViewExpenses, setOpenViewExpenses] = React.useState(false);
  const [openViewIncomes, setOpenViewIncomes] = React.useState(false);
  const [openBulkUpload, setOpenBulkUpload] = React.useState(false);
  const [openBudgetForm, setOpenBudgetForm] = React.useState(false);
  const [openBudgetSummary, setOpenBudgetSummary] = React.useState(false);
  const [openBudgetAnalytics, setOpenBudgetAnalytics] = React.useState(false);
  const [openVisualInsights, setOpenVisualInsights] = React.useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const renderCard = (
    label: string,
    icon: JSX.Element,
    action: () => void,
    color?: string
  ) => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        variant="outlined"
        sx={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          transition: "all 0.3s ease",
          boxShadow: 1,
          borderLeft: `4px solid ${color || theme.palette.primary.main}`,
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 4,
            borderLeft: `4px solid ${theme.palette.secondary.main}`,
          },
          background: theme.palette.background.paper,
        }}
      >
        <CardActionArea
          onClick={action}
          sx={{
            height: "100%",
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.action.hover,
              }}
            >
              {React.cloneElement(icon, { fontSize: "medium" })}
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              textAlign="center"
              sx={{ color: theme.palette.text.primary }}
            >
              {label}
            </Typography>
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  );

  return (
    <>

      <Container
        maxWidth="xl"
        sx={{ mt: isMobile ? 2 : 4, mb: 6, px: isMobile ? 2 : 4 }}
      >
        <Box mb={isMobile ? 3 : 6}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Financial Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive overview of your financial health
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {renderCard(
            "Add Expense",
            <Receipt color="primary" />,
            () => setOpenAdd(true),
            theme.palette.primary.main
          )}
          {renderCard(
            "Add Income",
            <TrendingUp color="success" />,
            () => setOpenAddIncome(true),
            theme.palette.success.main
          )}
          {renderCard(
            "Set Budget",
            <PieChart color="secondary" />,
            () => setOpenBudgetForm(true),
            theme.palette.secondary.main
          )}
          {renderCard(
            "Expense Report",
            <Visibility color="info" />,
            () => setOpenViewExpenses(true),
            theme.palette.info.main
          )}
          {renderCard(
            "Income Report",
            <MonetizationOn color="warning" />,
            () => setOpenViewIncomes(true),
            theme.palette.warning.main
          )}
          {renderCard(
            "Budget Summary",
            <Savings color="primary" />,
            () => setOpenBudgetSummary(true),
            theme.palette.primary.main
          )}
          {renderCard(
            "Bulk Upload",
            <CloudUpload color="inherit" />,
            () => setOpenBulkUpload(true),
            theme.palette.text.secondary
          )}
          {renderCard(
            "Budget Insights",
            <BarChart color="secondary" />,
            () => setOpenBudgetAnalytics(true),
            theme.palette.secondary.main
          )}
          {renderCard(
            "Visual Insights",
            <BarChartIcon color="info" />,
            () => setOpenVisualInsights(true),
            theme.palette.info.main
          )}
        </Grid>
        <Dialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Record New Expense
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <AddExpenseForm onClose={() => setOpenAdd(false)} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAddIncome}
          onClose={() => setOpenAddIncome(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Record New Income
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <AddIncomeForm onClose={() => setOpenAddIncome(false)} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openBudgetForm}
          onClose={() => setOpenBudgetForm(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Configure Budget
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
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
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
              height: "80vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Expense Transactions
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <ExpenseList />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openViewIncomes}
          onClose={() => setOpenViewIncomes(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
              height: "80vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Income Transactions
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <IncomeList />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openBulkUpload}
          onClose={() => setOpenBulkUpload(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Bulk Expense Upload
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <ExpenseBulkUpload onClose={() => setOpenBulkUpload(false)} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openBudgetSummary}
          onClose={() => setOpenBudgetSummary(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
              height: "80vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Budget Performance
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <BudgetSummary />
          </DialogContent>
        </Dialog>
        <Dialog
          open={openBudgetAnalytics}
          onClose={() => setOpenBudgetAnalytics(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Monthly Budget Insights
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <BudgetAnalyticsCard />
          </DialogContent>
        </Dialog>
        <Dialog
          open={openVisualInsights}
          onClose={() => setOpenVisualInsights(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme.palette.background.paper,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
            }}
          >
            Visual Insights – Charts by Category
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <VisualInsights />
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}


