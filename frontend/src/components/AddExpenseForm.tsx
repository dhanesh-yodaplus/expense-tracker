// import { useEffect, useState } from "react";
// import {
//   TextField,
//   Button,
//   Box,
//   Alert,
//   MenuItem,
//   CircularProgress,
// } from "@mui/material";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axiosInstance from "../services/axios";

// // Validation schema
// const schema = z.object({
//   title: z.string().min(1, "Title is required"),
//   amount: z.number().positive("Amount must be greater than 0"),
//   date: z.string().min(1, "Date is required"),
//   category: z.string().min(1, "Category is required"),
//   notes: z.string().optional(),
// });

// type FormData = z.infer<typeof schema>;

// type Category = {
//   id: number;
//   name: string;
// };

// export default function AddExpenseForm({ onClose }: { onClose: () => void }) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { category: "" },
//   });

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await axiosInstance.get<Category[]>(
//           "/categories/?type=expense"
//         );
//         setCategories(res.data);
//         if (res.data.length > 0) {
//           setValue("category", res.data[0].id.toString());
//         }
//       } catch (err) {
//         console.error("Category fetch error:", err);
//         setError("Failed to load categories.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, [setValue]);

//   const [submitting, setSubmitting] = useState(false);

//   const onSubmit = async (data: FormData) => {
//     setSubmitting(true);
  
//     const payload = {
//       ...data,
//       category_id: parseInt(data.category)
//  // ensure it's a number
//     };
  
//     console.log("Submitting data:", payload); // log for debugging
  
//     try {
//       await axiosInstance.post("/expenses/", payload);
//       setSuccess(true);
//       reset();
//       setTimeout(() => {
//         setSuccess(false);
//         onClose();
//       }, 1500);
//     } catch {
//       setError("Failed to add expense.");
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
  

//   return (
//     <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
//       {success && <Alert severity="success">Expense added successfully!</Alert>}
//       {error && <Alert severity="error">{error}</Alert>}

//       <TextField
//         fullWidth
//         label="Title"
//         margin="normal"
//         {...register("title")}
//         error={!!errors.title}
//         helperText={errors.title?.message}
//       />

//       <TextField
//         fullWidth
//         label="Amount"
//         type="number"
//         margin="normal"
//         {...register("amount", { valueAsNumber: true })}
//         error={!!errors.amount}
//         helperText={errors.amount?.message}
//       />

//       <TextField
//         fullWidth
//         type="date"
//         margin="normal"
//         {...register("date")}
//         error={!!errors.date}
//         helperText={errors.date?.message}
//       />

//       {loading ? (
//         <CircularProgress sx={{ display: "block", mx: "auto", mt: 2 }} />
//       ) : (
//         <TextField
//           fullWidth
//           select
//           label="Category"
//           margin="normal"
//           {...register("category")}
//           error={!!errors.category}
//           helperText={errors.category?.message}
//         >
//           {categories.map((cat) => (
//             <MenuItem key={cat.id} value={cat.id.toString()}>
//               {cat.name}
//             </MenuItem>
//           ))}
//         </TextField>
//       )}

//       <TextField
//         fullWidth
//         label="Notes (optional)"
//         margin="normal"
//         {...register("notes")}
//       />

//       <Button
//         variant="contained"
//         type="submit"
//         sx={{ mt: 2 }}
//         disabled={loading || submitting}
//         style={{
//           opacity: loading || submitting ? 0.6 : 1,
//           pointerEvents: loading || submitting ? "none" : "auto",
//         }}
//       >
//         {submitting ? "Submitting..." : "Submit"}
//       </Button>
//     </Box>
//   );
// }


import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
  Paper,
  Typography,
  InputAdornment,
  useTheme,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../services/axios";
import {
  AttachMoney,
  Category,
  Description,
  CalendarToday,
  Close,
  Save,
} from "@mui/icons-material";
import dayjs from "dayjs";

const schema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(50, "Title cannot exceed 50 characters"),
  amount: z.number()
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount seems too large"),
  date: z.string()
    .min(1, "Date is required")
    .refine(date => dayjs(date).isValid(), "Invalid date format"),
  category: z.string().min(1, "Category is required"),
  notes: z.string()
    .max(200, "Notes cannot exceed 200 characters")
    .optional(),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: number;
  name: string;
}

interface AddExpenseFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddExpenseForm({ onClose, onSuccess }: AddExpenseFormProps) {
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>("/categories/?type=expense");
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

  const onSubmit = async (data: FormData) => {
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

      await axiosInstance.post("/expenses/", payload);
      setSuccess(true);
      reset();
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to add expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const amountValue = watch("amount");

  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: 500,
        mx: 'auto',
        p: 0,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Add New Expense
        </Typography>
      </Box>

      {/* Form Content */}
      <CardContent>
        <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Status Alerts */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Expense added successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Title Field */}
          <TextField
            fullWidth
            label="Expense Title"
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

          {/* Amount and Date Row */}
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

          {/* Amount Preview */}
          {amountValue > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Amount: {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(amountValue)}
            </Typography>
          )}

          {/* Category Field */}
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

          {/* Notes Field */}
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<Close />}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || submitting || !isDirty}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
            >
              {submitting ? "Processing..." : "Save Expense"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}