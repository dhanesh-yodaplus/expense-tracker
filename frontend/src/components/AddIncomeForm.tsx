import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../services/axios";
import {
  Description,
  AttachMoney,
  CalendarToday,
  Category,
  Save,
  Close,
} from "@mui/icons-material";
import dayjs from "dayjs";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title cannot exceed 50 characters"),
  amount: z.number().positive("Amount must be greater than 0").max(10000000, "Amount seems too large"),
  date: z.string().min(1, "Date is required").refine(date => dayjs(date).isValid(), "Invalid date format"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: number;
  name: string;
}

interface AddIncomeFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddIncomeForm({ onClose, onSuccess }: AddIncomeFormProps) {
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      amount: 0,
      date: dayjs().format("YYYY-MM-DD"),
      category: "",
      notes: "",
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salaryExists, setSalaryExists] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const amountValue = watch("amount");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>("/categories/?type=income");
        setCategories(res.data);
        if (res.data.length > 0) {
          setValue("category", res.data[0].id.toString());
        }
      } catch (err) {
        console.error("Category fetch error:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [setValue]);

  useEffect(() => {
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === watch("category")
    );

    if (selectedCategory?.name.toLowerCase() === "salary") {
      const selectedMonth = dayjs(watch("date")).format("YYYY-MM");

      axiosInstance
        .get(`/incomes/check-salary-exists/?month=${selectedMonth}`)
        .then((res) => {
          setSalaryExists(res.data.exists);
        })
        .catch((err) => {
          console.error("Salary check failed:", err);
        });
    } else {
      setSalaryExists(false);
    }
  }, [watch("date"), watch("category"), categories]);

  const handleIncomeSubmit = async (data: FormData & { _shouldClose?: boolean }) => {
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === data.category
    );

    const shouldClose = data._shouldClose !== false;

    if (selectedCategory?.name.toLowerCase() === "salary" && salaryExists) {
      setShowConfirm(true);
    } else {
      await submitIncome(data, shouldClose);
    }
  };

  const submitIncome = async (data: FormData, shouldClose: boolean) => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: data.title,
        amount: data.amount,
        date: data.date,
        category_id: parseInt(data.category),
        notes: data.notes,
      };

      await axiosInstance.post("/incomes/", payload);
      setSuccess(true);
      reset();
      onSuccess?.();

      if (shouldClose) {
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to add income. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevation={3} sx={{ width: '100%', maxWidth: 500, mx: 'auto', p: 0, borderRadius: 2, overflow: 'hidden' }}>
      <CardContent>
        <Stack spacing={3} component="form" onSubmit={handleSubmit((data) => handleIncomeSubmit({ ...data, _shouldClose: true }))}>
          {success && <Alert severity="success" onClose={() => setSuccess(false)}>Income added successfully!</Alert>}
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

          <TextField
            fullWidth
            label="Income Title"
            variant="outlined"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              variant="outlined"
              {...register("amount", { valueAsNumber: true })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              variant="outlined"
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {amountValue > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Amount: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amountValue)}
            </Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TextField
              fullWidth
              select
              label="Category"
              variant="outlined"
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category color="action" />
                  </InputAdornment>
                ),
              }}
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
            variant="outlined"
            multiline
            rows={3}
            {...register("notes")}
            error={!!errors.notes}
            helperText={errors.notes?.message}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
            <Button variant="outlined" onClick={onClose} startIcon={<Close />} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={loading || submitting || !isDirty}
              onClick={handleSubmit((data) => handleIncomeSubmit({ ...data, _shouldClose: false }))}
            >
              Save & Add Another
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || submitting || !isDirty}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
            >
              {submitting ? "Processing..." : "Save Income"}
            </Button>
          </Box>
        </Stack>
      </CardContent>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Duplicate Salary Entry</DialogTitle>
        <DialogContent>
          <Typography>
            A salary entry already exists for this month. Do you want to add another?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
            <Button onClick={() => setShowConfirm(false)} color="inherit" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setShowConfirm(false);
                await submitIncome(watch(), true);
              }}
              variant="contained"
              color="primary"
            >
              Add Anyway
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
