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
import EditIncomeForm from "./EditIncomeForm";

type Income = {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: { id: number; name: string } | null;
  notes?: string;
};

type SortableKeys = "amount" | "date";

type SortConfig = {
  key: SortableKeys;
  direction: "asc" | "desc";
};

export default function IncomeList() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const res = await axiosInstance.get("/incomes/");
        const sorted = res.data.sort(
          (a: Income, b: Income) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setIncomes(sorted);
      } catch {
        setError("Failed to load incomes.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories/?type=income");
        const names = res.data.map((cat: { name: string }) => cat.name);
        setAllCategories(names);
      } catch {
        console.error("Failed to fetch income categories");
      }
    };

    fetchIncomes();
    fetchCategories();
  }, []);

  const handleSort = (key: SortableKeys) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...incomes].sort((a, b) => {
      if (key === "amount") {
        return direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    });

    setIncomes(sorted);
    setSortConfig({ key, direction });
  };

  const handleUpdateIncome = async (updated: Income) => {
    try {
      const res = await axiosInstance.put(`/incomes/${updated.id}/`, updated);
      setIncomes((prev) =>
        prev.map((inc) => (inc.id === updated.id ? res.data : inc))
      );
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update income", err);
    }
  };

  const handleDeleteIncome = async (id: number) => {
    try {
      await axiosInstance.delete(`/incomes/${id}/`);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err) {
      console.error("Failed to delete income", err);
    }
  };

  const visibleIncomes = selectedCategory
    ? incomes.filter((i) => i.category?.name === selectedCategory)
    : incomes;

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
            {visibleIncomes.map((inc) => (
              <TableRow key={inc.id}>
                <TableCell>{inc.title}</TableCell>
                <TableCell>₹ {inc.amount}</TableCell>
                <TableCell>{new Date(inc.date).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>{inc.category?.name || "-"}</TableCell>
                <TableCell>{inc.notes || "-"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditingIncome(inc); setEditOpen(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteIncome(inc.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Income</DialogTitle>
        <DialogContent>
          {editingIncome && (
            <EditIncomeForm
              income={editingIncome}
              onCancel={() => setEditOpen(false)}
              onSave={handleUpdateIncome}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
