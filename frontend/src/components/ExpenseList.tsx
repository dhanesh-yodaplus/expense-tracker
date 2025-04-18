import { useEffect, useState, useMemo } from "react";
import {
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TableSortLabel,
  InputAdornment,
  TextField,
  Button,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import axiosInstance from "../services/axios";
import EditExpenseForm from "./EditExpenseForm";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";

interface Category {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: Category;
  notes?: string;
}

type SortableKey = keyof Pick<Expense, "amount" | "date">;

interface SortConfig {
  key: SortableKey;
  direction: "asc" | "desc";
}

interface CategoryOption {
  id: number;
  name: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return dayjs(dateString).format("DD MMM YYYY");
};

export default function ExpenseList() {
  const theme = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          axiosInstance.get<Expense[]>("/expenses/"),
          axiosInstance.get<Category[]>("/categories/?type=expense"),
        ]);

        const sortedExpenses = [...expensesRes.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setExpenses(sortedExpenses);
        setCategoryOptions(categoriesRes.data);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key: SortableKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = useMemo(() => {
    if (!sortConfig) return expenses;

    return [...expenses].sort((a, b) => {
      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
  }, [expenses, sortConfig]);

  const filteredExpenses = useMemo(() => {
    let result = sortedExpenses;

    if (selectedCategory) {
      result = result.filter((exp) => exp.category.id === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.title.toLowerCase().includes(term) ||
          exp.category.name.toLowerCase().includes(term) ||
          (exp.notes && exp.notes.toLowerCase().includes(term))
      );
    }

    return result;
  }, [sortedExpenses, selectedCategory, searchTerm]);

  const handleUpdateExpense = async (updated: Expense) => {
    try {
      const { data } = await axiosInstance.put<Expense>(
        `/expenses/${updated.id}/`,
        updated
      );
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === updated.id ? data : exp))
      );
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update expense", err);
      setError("Failed to update expense. Please try again.");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await axiosInstance.delete(`/expenses/${id}/`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
      setError("Failed to delete expense. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ overflow: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight={600}>
          Expense Records
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              displayEmpty
              renderValue={(selected) =>
                selected === "" ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FilterIcon fontSize="small" />
                    <Typography>Filter by Category</Typography>
                  </Box>
                ) : (
                  categoryOptions.find((cat) => cat.id === selected)?.name
                )
              }
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 750 }} aria-label="expenses table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell sortDirection={sortConfig?.key === "amount" ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig?.key === "amount"}
                  direction={sortConfig?.key === "amount" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig?.key === "date" ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig?.key === "date"}
                  direction={sortConfig?.key === "date" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp) => (
                <TableRow key={exp.id} hover>
                  <TableCell>{exp.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatCurrency(exp.amount)}
                      color={
                        exp.amount > 5000
                          ? "error"
                          : exp.amount > 2000
                          ? "warning"
                          : "default"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(exp.date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={exp.category.name}
                      size="small"
                      sx={{ backgroundColor: theme.palette.action.hover }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 200,
                      }}
                    >
                      {exp.notes || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        setEditingExpense(exp);
                        setEditOpen(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteExpense(exp.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm || selectedCategory
                      ? "No matching expenses found"
                      : "No expenses recorded yet"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Edit Expense</Typography>
            <IconButton onClick={() => setEditOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editingExpense && (
            <EditExpenseForm
              expense={editingExpense}
              categories={categoryOptions}
              onCancel={() => setEditOpen(false)}
              onSave={handleUpdateExpense}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}