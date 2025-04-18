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
import EditIncomeForm from "./EditIncomeForm";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";

interface Category {
  id: number;
  name: string;
}

interface Income {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: Category | null;
  notes?: string;
}

type SortableKey = keyof Pick<Income, "amount" | "date">;

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

export default function IncomeList() {
  const theme = useTheme();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomesRes, categoriesRes] = await Promise.all([
          axiosInstance.get<Income[]>("/incomes/"),
          axiosInstance.get<Category[]>("/categories/?type=income"),
        ]);

        const sortedIncomes = [...incomesRes.data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setIncomes(sortedIncomes);
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

  const sortedIncomes = useMemo(() => {
    if (!sortConfig) return incomes;

    return [...incomes].sort((a, b) => {
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
  }, [incomes, sortConfig]);

  const filteredIncomes = useMemo(() => {
    let result = sortedIncomes;

    if (selectedCategory) {
      result = result.filter((inc) => inc.category?.id === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.title.toLowerCase().includes(term) ||
          (inc.category?.name.toLowerCase().includes(term)) ||
          (inc.notes && inc.notes.toLowerCase().includes(term))
      );
    }

    return result;
  }, [sortedIncomes, selectedCategory, searchTerm]);

  const handleUpdateIncome = async (updated: Income) => {
    try {
      const { data } = await axiosInstance.put<Income>(
        `/incomes/${updated.id}/`,
        updated
      );
      setIncomes((prev) =>
        prev.map((inc) => (inc.id === updated.id ? data : inc))
      );
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update income", err);
      setError("Failed to update income. Please try again.");
    }
  };

  const handleDeleteIncome = async (id: number) => {
    try {
      await axiosInstance.delete(`/incomes/${id}/`);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err) {
      console.error("Failed to delete income", err);
      setError("Failed to delete income. Please try again.");
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
          Income Records
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search incomes..."
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
        <Table sx={{ minWidth: 750 }} aria-label="incomes table">
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
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((inc) => (
                <TableRow key={inc.id} hover>
                  <TableCell>{inc.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatCurrency(inc.amount)}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(inc.date)}</TableCell>
                  <TableCell>
                    {inc.category ? (
                      <Chip
                        label={inc.category.name}
                        size="small"
                        sx={{ backgroundColor: theme.palette.action.hover }}
                      />
                    ) : (
                      "-"
                    )}
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
                      {inc.notes || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        setEditingIncome(inc);
                        setEditOpen(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteIncome(inc.id)}
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
                      ? "No matching incomes found"
                      : "No incomes recorded yet"}
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
            <Typography variant="h6">Edit Income</Typography>
            <IconButton onClick={() => setEditOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editingIncome && (
            <EditIncomeForm
              income={editingIncome}
              categories={categoryOptions}
              onCancel={() => setEditOpen(false)}
              onSave={handleUpdateIncome}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}