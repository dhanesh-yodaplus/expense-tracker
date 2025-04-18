import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useTheme,
    Box,
  } from "@mui/material";
  import CloseIcon from "@mui/icons-material/Close";
  import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
  } from "recharts";
  import { useEffect, useState } from "react";
  import axiosInstance from "../services/axios";
  
  type ChartType = "pie" | "bar" | "line" | "radar";
  
  interface ChartModalProps {
    open: boolean;
    onClose: () => void;
    type: ChartType;
  }
  
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
    "#ff6699",
  ];
  
  export default function ChartModal({ open, onClose, type }: ChartModalProps) {
    const theme = useTheme();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!open) return;
  
      const fetchData = async () => {
        setLoading(true);
        try {
          let res;
          const today = new Date();
          const monthParam = today.toISOString().slice(0, 7);
  
          if (type === "bar") {
            res = await axiosInstance.get("/expenses/monthly-summary/");
          } else if (type === "pie") {
            res = await axiosInstance.get(
              `/expenses/summary-by-category/?month=${monthParam}`
            );
          } else if (type === "line") {
            res = await axiosInstance.get(
              "/expenses/summary/income-vs-expense/"
            );
          } else if (type === "radar") {
            res = await axiosInstance.get(
              `/budgets/summary/?month=${monthParam}`
            );
          } else {
            res = { data: [] };
          }
  
          setData(res.data);
        } catch (err) {
          console.error("Error loading chart data:", err);
          setData([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [open, type]);
  
    const renderChart = () => {
      if (type === "bar") {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Spent" />
            </BarChart>
          </ResponsiveContainer>
        );
      }
  
      if (type === "pie") {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="total"
                data={data}
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }
  
      if (type === "line") {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#00C49F"
                name="Income"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#FF8042"
                name="Expense"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
  
      if (type === "radar") {
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis />
              <Radar
                name="Budget"
                dataKey="budget"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Spent"
                dataKey="spent"
                stroke="#FF8042"
                fill="#FF8042"
                fillOpacity={0.4}
              />
              <Legend />
              <Tooltip formatter={(value) => `₹${value}`} />
            </RadarChart>
          </ResponsiveContainer>
        );
      }
  
      return (
        <Box sx={{ py: 2 }}>
          Feature coming soon for <strong>{type}</strong> chart.
        </Box>
      );
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
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
          {type === "bar" && "Monthly Expense Trend"}
          {type === "pie" && "Category-wise Expense Distribution"}
          {type === "line" && "Income vs Expense (Last 6 Months)"}
          {type === "radar" && "Budget vs Actual (Radar Chart)"}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {loading ? "Loading..." : renderChart()}
        </DialogContent>
      </Dialog>
    );
  }
  