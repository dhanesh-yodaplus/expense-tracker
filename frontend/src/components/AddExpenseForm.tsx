import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../services/axios";

// Validation schema
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Category = {
  id: number;
  name: string;
};

export default function AddExpenseForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "" },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>(
          "/categories/?type=expense"
        );
        setCategories(res.data);
        if (res.data.length > 0) {
          setValue("category", res.data[0].id.toString());
        }
      } catch (err) {
        console.error("Category fetch error:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [setValue]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
  
    const payload = {
      ...data,
      category_id: parseInt(data.category)
 // ensure it's a number
    };
  
    console.log("Submitting data:", payload); // log for debugging
  
    try {
      await axiosInstance.post("/expenses/", payload);
      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setError("Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };
  
  

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {success && <Alert severity="success">Expense added successfully!</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        fullWidth
        label="Title"
        margin="normal"
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        fullWidth
        label="Amount"
        type="number"
        margin="normal"
        {...register("amount", { valueAsNumber: true })}
        error={!!errors.amount}
        helperText={errors.amount?.message}
      />

      <TextField
        fullWidth
        type="date"
        margin="normal"
        {...register("date")}
        error={!!errors.date}
        helperText={errors.date?.message}
      />

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 2 }} />
      ) : (
        <TextField
          fullWidth
          select
          label="Category"
          margin="normal"
          {...register("category")}
          error={!!errors.category}
          helperText={errors.category?.message}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        label="Notes (optional)"
        margin="normal"
        {...register("notes")}
      />

      <Button
        variant="contained"
        type="submit"
        sx={{ mt: 2 }}
        disabled={loading || submitting}
        style={{
          opacity: loading || submitting ? 0.6 : 1,
          pointerEvents: loading || submitting ? "none" : "auto",
        }}
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </Box>
  );
}
