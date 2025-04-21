import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Box,
  Chip,
  CircularProgress,
  useTheme,
  Paper,
} from "@mui/material";
// import Grid from "@mui/material/Grid";
import Grid from "../components/SafeGrid";
import InputAdornment from "@mui/material/InputAdornment"; //  MUI adornment wrapper
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; //  MUI icon
import axiosInstance from "../services/axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import {
  Warning,
  CheckCircle,
} from "@mui/icons-material";

type OverBudgetCategory = {
  category: string;
  budget: number;
  spent: number;
  excess: number;
};

type AnalyticsData = {
  total_budget: number;
  total_spent: number;
  total_income: number;
  savings: number;
  top_over_budget_categories: OverBudgetCategory[];
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function BudgetAnalyticsCard() {
  const theme = useTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());

  // Fetch monthly budget analytics from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedMonth) return;
      setLoading(true);

      try {
        const monthParam = format(selectedMonth, "yyyy-MM");
        const res = await axiosInstance.get(
          `/budgets/analytics/?month=${monthParam}`
        );
        setData(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedMonth]);

  if (!data && !loading) return null;

  const {
    total_budget = 0,
    total_spent = 0,
    total_income = 0,
    savings = 0,
    top_over_budget_categories = [],
  } = data || {};

  const overBudgetAmount = Math.max(total_spent - total_budget, 0);
  const isOverBudget = overBudgetAmount > 0;
  const budgetUtilization =
    total_budget > 0 ? (total_spent / total_budget) * 100 : 0;

  return (
    <Card elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Budget Analytics Dashboard
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={["year", "month"]}
            label="Select Month"
            value={selectedMonth}
            onChange={setSelectedMonth}
            maxDate={new Date()}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                sx={{ width: 200 }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Box>

      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3} >
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Budget
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatCurrency(total_budget)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Spent
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatCurrency(total_spent)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Income
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatCurrency(total_income)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Savings
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  color={savings >= 0 ? "success.main" : "error.main"}
                >
                  {formatCurrency(savings)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Budget Status */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              backgroundColor: isOverBudget
                ? theme.palette.error.dark // Using darker red for better contrast
                : theme.palette.success.light,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {isOverBudget ? (
                <>
                  <Warning sx={{ color: "white" }} /> 
                  <Typography fontWeight={600} color="white">
                    {" "}
                    Over Budget by{" "}
                    {formatCurrency(overBudgetAmount)}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircle color="success" />
                  <Typography fontWeight={600} color="success.dark">
                    Within Budget
                  </Typography>
                </>
              )}
            </Box>
            <Box width="100%" mt={1}>
              <Box
                width={`${Math.min(budgetUtilization, 100)}%`}
                height={8}
                bgcolor={isOverBudget ? "error.light" : "success.main"}
                borderRadius={4}
              />
              <Typography
                variant="caption"
                color={isOverBudget ? "white" : "text.secondary"} // White text when over budget
              >
                {budgetUtilization.toFixed(0)}% of budget utilized
              </Typography>
            </Box>
          </Box>

          {/* Over Budget Categories */}
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Over-Budget Categories
          </Typography>

          {top_over_budget_categories.length > 0 ? (
            <List disablePadding>
              {top_over_budget_categories.map((item, idx) => (
                <ListItem
                  key={idx}
                  divider={idx < top_over_budget_categories.length - 1}
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={500}>
                          {item.category}
                        </Typography>
                        <Chip
                          label={`+${formatCurrency(item.excess)}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box display="flex" gap={2} mt={0.5}>
                        <Typography variant="caption">
                          Budget: {formatCurrency(item.budget)}
                        </Typography>
                        <Typography variant="caption">
                          Spent: {formatCurrency(item.spent)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.action.hover,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                All categories are within budget
              </Typography>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}
