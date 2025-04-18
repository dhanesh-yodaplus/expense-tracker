import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  LinearProgress,
  Stack,
  Alert,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  Chip,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import axiosInstance from "../services/axios";
import dayjs from "dayjs";
import {
  MonetizationOn,
  Savings,
  Warning,
  CheckCircle,
  Error,
  CalendarMonth
} from "@mui/icons-material";

interface SummaryItem {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: "under_budget" | "near_limit" | "over_budget" | "perfect_match";
}

const getStatusDetails = (status: SummaryItem["status"]) => {
  switch (status) {
    case "under_budget":
      return { color: "success", icon: <CheckCircle fontSize="small" />, label: "Under Budget" };
    case "near_limit":
      return { color: "warning", icon: <Warning fontSize="small" />, label: "Near Limit" };
    case "perfect_match":
      return { color: "info", icon: <Savings fontSize="small" />, label: "Perfect Match" };
    case "over_budget":
      return { color: "error", icon: <Error fontSize="small" />, label: "Over Budget" };
    default:
      return { color: "primary", icon: null, label: "" };
  }
};

export default function BudgetSummary(): JSX.Element {
  const theme = useTheme();
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, incomeRes] = await Promise.all([
        axiosInstance.get(`/budgets/summary/?month=${month}`),
        axiosInstance.get(`/incomes/summary/?month=${month}`)
      ]);
      setSummary(summaryRes.data);
      setIncome(incomeRes.data.total_income || 0);
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = summary.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = summary.reduce((sum, item) => sum + item.spent, 0);
  const overallPercentage = income > 0 ? (totalSpent / income) * 100 : 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Budget Overview
        </Typography>
        <TextField
          label="Select Month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonth color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Income
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    ₹{income.toLocaleString()}
                  </Typography>
                  <MonetizationOn color="success" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Budget
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    ₹{totalBudget.toLocaleString()}
                  </Typography>
                  <Savings color="primary" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                {/* <CardContent> */}
                  {/* <Typography variant="subtitle2" color="text.secondary">
                    Total Spent
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    ₹{totalSpent.toLocaleString()}
                  </Typography> */}
                  {/* <LinearProgress
                    variant="determinate"
                    value={overallPercentage}
                    color={totalBudget > income ? "error" : "primary"}
                    sx={{ mt: 1, height: 6 }}
                  />
                </CardContent> */}
              </Card>
            </Grid>
          </Grid>

          {totalBudget > income && (
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
              <Typography fontWeight={600}>
                Budget Exceeds Income
              </Typography>
              Your total budget (₹{totalBudget.toLocaleString()}) is {Math.round((totalBudget / income) * 100)}% of your income (₹{income.toLocaleString()}) for {dayjs(month).format('MMMM YYYY')}.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h6" fontWeight={600} mb={2}>
            Category Breakdown
          </Typography>

          <Stack spacing={3}>
            {summary.map((item, idx) => {
              const status = getStatusDetails(item.status);
              return (
                <Paper key={idx} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.category}
                    </Typography>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">
                      Spent: ₹{item.spent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Budget: ₹{item.budget.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Remaining: ₹{item.remaining.toLocaleString()}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(item.percentage_used, 100)}
                    color={status.color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />

                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      0%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(item.percentage_used)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      100%
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}