import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  LinearProgress,
  Stack,
  Alert,
  TextField,
  Paper,
} from "@mui/material";
import axiosInstance from "../services/axios";
import dayjs from "dayjs";
import axios from "../services/axios"; 

interface SummaryItem {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: "under_budget" | "near_limit" | "over_budget" | "perfect_match";
}

export default function BudgetSummary(): JSX.Element {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchSummary();
    fetchIncome();
  }, [month]);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get(`/budgets/summary/?month=${month}`);
      setSummary(res.data);
    } catch {
      setSummary([]);
    }
  };

  const fetchIncome = async () => {
    try {
      const res = await axiosInstance.get(`/incomes/summary/?month=${month}`);

      setIncome(res.data.total_income || 0);
    } catch {
      setIncome(0);
    }
  };

  const getBarColor = (status: SummaryItem["status"]) => {
    switch (status) {
      case "under_budget":
        return "success";
      case "near_limit":
        return "warning";
      case "perfect_match":
        return "info";
      case "over_budget":
        return "error";
      default:
        return "primary";
    }
  };

  const totalBudget = summary.reduce((sum, item) => sum + item.budget, 0);

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Budget Summary
      </Typography>

      <TextField
        label="Select Month"
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        sx={{ mb: 3 }}
      />

      {totalBudget > income && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠ Total budget (₹{totalBudget}) exceeds your income (₹{income}) for {month}.
        </Alert>
      )}

      <Stack spacing={2}>
        {summary.map((item, idx) => (
          <Paper key={idx} sx={{ p: 2 }}>
            <Typography fontWeight={600} gutterBottom>
              {item.category}: ₹{item.spent} / ₹{item.budget}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(item.percentage_used, 100)}
              color={getBarColor(item.status)}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Remaining: ₹{item.remaining} — Status:{" "}
              {item.status.replace("_", " ").toUpperCase()}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
