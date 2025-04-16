import { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import axiosInstance from "../services/axios";

type Income = {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: number;
  notes?: string;
};

type Category = {
  id: number;
  name: string;
};

type Props = {
  income: Income;
  onCancel: () => void;
  onSave: (updated: any) => void;
};

export default function EditIncomeForm({ income, onCancel, onSave }: Props) {
  const [formData, setFormData] = useState<Income>(income);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    setFormData(income);
  }, [income]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories/?type=income");
        setAllCategories(res.data);
      } catch {
        console.error("Failed to load income categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field: keyof Income, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      category_id: formData.category,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField
        label="Title"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />
      <TextField
        label="Amount"
        type="number"
        value={formData.amount}
        onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
      />
      <TextField
        label="Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
      />
      <FormControl>
        <InputLabel>Category</InputLabel>
        <Select
          value={formData.category}
          label="Category"
          onChange={(e) => handleChange("category", parseInt(e.target.value))}
        >
          {allCategories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Notes"
        multiline
        rows={2}
        value={formData.notes || ""}
        onChange={(e) => handleChange("notes", e.target.value)}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
