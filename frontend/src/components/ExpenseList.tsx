import { useEffect, useState } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../services/axios";
import EditExpenseForm from "./EditExpenseForm";

type Expense = {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: { id: number; name: string }; // Include id for mapping
  notes?: string;
};

type SortableKeys = "amount" | "date";

type SortConfig = {
  key: SortableKeys;
  direction: "asc" | "desc";
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axiosInstance.get("/expenses/");
        const sorted = res.data.sort(
          (a: Expense, b: Expense) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExpenses(sorted);
      } catch {
        setError("Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories/?type=expense");
        const categoryNames = res.data.map((cat: { name: string }) => cat.name);
        setAllCategories(categoryNames);
      } catch {
        console.error("Failed to load categories");
      }
    };

    fetchExpenses();
    fetchCategories();
  }, []);

  const handleSort = (key: SortableKeys) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedExpenses = [...expenses].sort((a, b) => {
      if (key === "amount") {
        return direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }

      if (key === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });

    setExpenses(sortedExpenses);
    setSortConfig({ key, direction });
  };

  const handleUpdateExpense = async (updated: Expense) => {
    try {
      const res = await axiosInstance.put(`/expenses/${updated.id}/`, updated);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === updated.id ? res.data : exp))
      );
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update expense", err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await axiosInstance.delete(`/expenses/${id}/`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const visibleExpenses = selectedCategory
    ? expenses.filter((e) => e.category?.name === selectedCategory)
    : expenses;

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 220, mb: 2 }}>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          displayEmpty
          renderValue={(selected) =>
            selected === "" ? "Filter by Category" : selected
          }
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {allCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell
                onClick={() => handleSort("amount")}
                style={{ cursor: "pointer" }}
              >
                Amount {sortConfig?.key === "amount" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("date")}
                style={{ cursor: "pointer" }}
              >
                Date {sortConfig?.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleExpenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.title}</TableCell>
                <TableCell>₹ {exp.amount}</TableCell>
                <TableCell>{new Date(exp.date).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>{exp.category?.name || "-"}</TableCell>
                <TableCell>{exp.notes || "-"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditingExpense(exp); setEditOpen(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteExpense(exp.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog now uses extracted EditExpenseForm */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          {editingExpense && (
            <EditExpenseForm
              expense={editingExpense}
              onCancel={() => setEditOpen(false)}
              onSave={handleUpdateExpense}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

