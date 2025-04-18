// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   Button,
//   Stack,
//   Typography,
//   Alert,
// } from "@mui/material";
// import axiosInstance from "../services/axios";
// import dayjs from "dayjs";

// type BudgetFormProps = {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// };

// type Category = {
//   id: number;
//   name: string;
// };

// export default function BudgetForm({
//   open,
//   onClose,
//   onSuccess,
// }: BudgetFormProps): JSX.Element {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryBudgets, setCategoryBudgets] = useState<Record<number, number>>({});
//   const [monthlyCap, setMonthlyCap] = useState<number>(0);
//   const [error, setError] = useState("");
//   const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

//   useEffect(() => {
//     axiosInstance
//       .get("/categories/?type=expense")
//       .then((res) => {
//         setCategories(res.data);
//         const initialBudgets: Record<number, number> = {};
//         res.data.forEach((cat: Category) => {
//           initialBudgets[cat.id] = 0;
//         });
//         setCategoryBudgets(initialBudgets);
//       })
//       .catch(() => setCategories([]));
//   }, []);

//   const handleCategoryChange = (id: number, value: number) => {
//     setCategoryBudgets((prev) => ({ ...prev, [id]: value }));
//   };

//   const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
//   const remaining = monthlyCap - totalAllocated;

//   const onSubmit = async () => {
//     setError("");

//     if (totalAllocated > monthlyCap) {
//       setError("Total exceeds monthly budget cap.");
//       return;
//     }

//     try {
//       // 1. Save MonthlyBudget
//       await axiosInstance.post("/budgets/monthlybudgets/", {
//         amount: monthlyCap,
//         month: `${month}-01`,
//       });

//       // 2. Save Budgets for each category
//       const payloads = Object.entries(categoryBudgets)
//         .filter(([_, value]) => value > 0)
//         .map(([catId, amount]) =>
//           axiosInstance.post("/budgets/", {
//             category: parseInt(catId),
//             amount,
//             month: `${month}-01`,
//           })
//         );

//       await Promise.all(payloads);

//       onSuccess();
//       onClose();
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Set Monthly Budget</DialogTitle>
//       <DialogContent>
//         <Stack spacing={2} mt={1}>
//           {error && <Alert severity="error">{error}</Alert>}

//           <TextField
//             label="Monthly Budget"
//             type="number"
//             value={monthlyCap}
//             onChange={(e) => setMonthlyCap(parseInt(e.target.value || "0"))}
//           />

//           <TextField
//             label="Month"
//             type="month"
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//           />

//           <Typography fontWeight={600}>Category Allocations</Typography>
//           {categories.map((cat) => (
//             <TextField
//               key={cat.id}
//               label={cat.name}
//               type="number"
//               value={categoryBudgets[cat.id] || 0}
//               onChange={(e) => handleCategoryChange(cat.id, parseInt(e.target.value || "0"))}
//             />
//           ))}

//           <Typography color={remaining < 0 ? "error" : "success.main"}>
//             Remaining Budget: ₹{remaining}
//           </Typography>

//           <Button
//             type="button"
//             variant="contained"
//             onClick={onSubmit}
//             disabled={remaining < 0}
//           >
//             Save
//           </Button>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }


// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   Button,
//   Stack,
//   Typography,
//   Alert,
// } from "@mui/material";
// import axiosInstance from "../services/axios";
// import dayjs from "dayjs";

// type BudgetFormProps = {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// };

// type Category = {
//   id: number;
//   name: string;
// };

// type ExistingBudget = {
//   id: number;
//   category: number;
//   amount: number;
// };

// export default function BudgetForm({
//   open,
//   onClose,
//   onSuccess,
// }: BudgetFormProps): JSX.Element {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryBudgets, setCategoryBudgets] = useState<Record<number, number>>({});
//   const [existingBudgets, setExistingBudgets] = useState<Record<number, ExistingBudget>>({});
//   const [monthlyCap, setMonthlyCap] = useState<number>(0);
//   const [error, setError] = useState("");
//   const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

//   const fetchAll = async () => {
//     try {
//       const [catRes, budgetRes, capRes] = await Promise.all([
//         axiosInstance.get("/categories/?type=expense"),
//         axiosInstance.get(`/budgets/by-month/?month=${month}`),
//         axiosInstance.get(`/budgets/monthlybudgets/?month=${month}-01`),
//       ]);

//       const catList: Category[] = catRes.data;
//       setCategories(catList);

//       const initialBudgets: Record<number, number> = {};
//       const existingMap: Record<number, ExistingBudget> = {};
//       budgetRes.data.forEach((b: ExistingBudget) => {
//         initialBudgets[b.category] = b.amount;
//         existingMap[b.category] = b;
//       });

//       setCategoryBudgets(initialBudgets);
//       setExistingBudgets(existingMap);
//       setMonthlyCap(capRes.data[0]?.amount || 0);
//     } catch {
//       setCategories([]);
//     }
//   };

//   useEffect(() => {
//     if (open) fetchAll();
//   }, [open, month]);

//   const handleCategoryChange = (id: number, value: number) => {
//     setCategoryBudgets((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleDelete = async (catId: number) => {
//     try {
//       const id = existingBudgets[catId]?.id;
//       if (id) {
//         await axiosInstance.delete(`/budgets/${id}/`);
//         fetchAll();
//       }
//     } catch {
//       setError("Delete failed.");
//     }
//   };

//   const totalAllocated = Object.values(categoryBudgets).reduce(
//     (sum, val) => sum + (isNaN(val) ? 0 : val),
//     0
//   );
//   const remaining = monthlyCap - totalAllocated;

//   const onSubmit = async () => {
//     setError("");

//     if (totalAllocated > monthlyCap) {
//       setError("Total exceeds monthly budget cap.");
//       return;
//     }

//     try {
//       const capRes = await axiosInstance.get(`/budgets/monthlybudgets/?month=${month}-01`);
//       if (capRes.data.length > 0) {
//         await axiosInstance.put(`/budgets/monthlybudgets/${capRes.data[0].id}/`, {
//           amount: monthlyCap,
//           month: `${month}-01`,
//         });
//       } else {
//         await axiosInstance.post(`/budgets/monthlybudgets/`, {
//           amount: monthlyCap,
//           month: `${month}-01`,
//         });
//       }

//       const requests = Object.entries(categoryBudgets).map(([catIdStr, amount]) => {
//         const catId = parseInt(catIdStr);
//         if (existingBudgets[catId]) {
//           return axiosInstance.put(`/budgets/${existingBudgets[catId].id}/`, {
//             category: catId,
//             amount,
//             month: `${month}-01`,
//           });
//         } else if (amount > 0) {
//           return axiosInstance.post(`/budgets/`, {
//             category: catId,
//             amount,
//             month: `${month}-01`,
//           });
//         }
//         return Promise.resolve();
//       });

//       await Promise.all(requests);
//       onSuccess();
//       onClose();
//     } catch {
//       setError("Something went wrong.");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Set Monthly Budget</DialogTitle>
//       <DialogContent>
//         <Stack spacing={2} mt={1}>
//           {error && <Alert severity="error">{error}</Alert>}

//           <TextField
//             label="Monthly Budget"
//             type="number"
//             value={monthlyCap}
//             onChange={(e) => setMonthlyCap(parseInt(e.target.value || "0"))}
//           />

//           <TextField
//             label="Month"
//             type="month"
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//           />

//           <Typography fontWeight={600}>Category Allocations</Typography>
//           {categories.map((cat) => (
//             <Stack direction="row" alignItems="center" spacing={1} key={cat.id}>
//               <TextField
//                 label={cat.name}
//                 type="number"
//                 value={categoryBudgets[cat.id] || 0}
//                 onChange={(e) =>
//                   handleCategoryChange(cat.id, parseInt(e.target.value || "0"))
//                 }
//                 fullWidth
//               />
//               {existingBudgets[cat.id] && (
//                 <Button
//                   color="error"
//                   variant="outlined"
//                   onClick={() => handleDelete(cat.id)}
//                 >
//                   Delete
//                 </Button>
//               )}
//             </Stack>
//           ))}

//           <Typography color={remaining < 0 ? "error" : "success.main"}>
//             Remaining Budget: ₹{isNaN(remaining) ? 0 : remaining}
//           </Typography>

//           <Button
//             type="button"
//             variant="contained"
//             onClick={onSubmit}
//             disabled={remaining < 0}
//           >
//             Save
//           </Button>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }



import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  IconButton,
  Divider,
//   useTheme,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import axiosInstance from "../services/axios";
import dayjs from "dayjs";
import { Delete, Close } from "@mui/icons-material";

type BudgetFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Category = {
  id: number;
  name: string;
};

type ExistingBudget = {
  id: number;
  category: number;
  amount: number;
};

export default function BudgetForm({
  open,
  onClose,
  onSuccess,
}: BudgetFormProps): JSX.Element {
//   const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<number, number>>({});
  const [existingBudgets, setExistingBudgets] = useState<Record<number, ExistingBudget>>({});
  const [monthlyCap, setMonthlyCap] = useState<number>(0);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [catRes, budgetRes, capRes] = await Promise.all([
        axiosInstance.get("/categories/?type=expense"),
        axiosInstance.get(`/budgets/by-month/?month=${month}`),
        axiosInstance.get(`/budgets/monthlybudgets/?month=${month}-01`),
      ]);

      const catList: Category[] = catRes.data;
      setCategories(catList);

      const initialBudgets: Record<number, number> = {};
      const existingMap: Record<number, ExistingBudget> = {};
      
      // Initialize all categories with 0
      catList.forEach(cat => {
        initialBudgets[cat.id] = 0;
      });
      
      // Override with existing budget values
      budgetRes.data.forEach((b: ExistingBudget) => {
        initialBudgets[b.category] = b.amount;
        existingMap[b.category] = b;
      });

      setCategoryBudgets(initialBudgets);
      setExistingBudgets(existingMap);
      setMonthlyCap(capRes.data[0]?.amount || 0);
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchAll();
  }, [open, month]);

  const handleCategoryChange = (id: number, value: number) => {
    const numericValue = isNaN(value) ? 0 : value;
    setCategoryBudgets(prev => ({ ...prev, [id]: numericValue }));
  };

  const handleDelete = async (catId: number) => {
    try {
      const id = existingBudgets[catId]?.id;
      if (id) {
        await axiosInstance.delete(`/budgets/${id}/`);
        setCategoryBudgets(prev => ({ ...prev, [catId]: 0 }));
        const newExisting = { ...existingBudgets };
        delete newExisting[catId];
        setExistingBudgets(newExisting);
      }
    } catch {
      setError("Failed to delete budget");
    }
  };

  const totalAllocated = Object.values(categoryBudgets).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const remaining = monthlyCap - totalAllocated;

  const onSubmit = async () => {
    setError("");
    setIsLoading(true);

    if (totalAllocated > monthlyCap) {
      setError("Total allocations exceed monthly budget cap");
      setIsLoading(false);
      return;
    }

    try {
      // Update or create monthly cap
      const capRes = await axiosInstance.get(`/budgets/monthlybudgets/?month=${month}-01`);
      if (capRes.data.length > 0) {
        await axiosInstance.put(`/budgets/monthlybudgets/${capRes.data[0].id}/`, {
          amount: monthlyCap,
          month: `${month}-01`,
        });
      } else {
        await axiosInstance.post(`/budgets/monthlybudgets/`, {
          amount: monthlyCap,
          month: `${month}-01`,
        });
      }

      // Process category budgets
      const requests = Object.entries(categoryBudgets).map(([catIdStr, amount]) => {
        const catId = parseInt(catIdStr);
        if (existingBudgets[catId]) {
          if (amount > 0) {
            return axiosInstance.put(`/budgets/${existingBudgets[catId].id}/`, {
              category: catId,
              amount,
              month: `${month}-01`,
            });
          } else {
            return axiosInstance.delete(`/budgets/${existingBudgets[catId].id}/`);
          }
        } else if (amount > 0) {
          return axiosInstance.post(`/budgets/`, {
            category: catId,
            amount,
            month: `${month}-01`,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(requests);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to save budget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Set Monthly Budget
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} mt={1}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Budget Period
              </Typography>
              <TextField
                fullWidth
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Monthly Budget Cap
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={monthlyCap}
                onChange={(e) => setMonthlyCap(parseFloat(e.target.value) || 0)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Category Allocations
              </Typography>
              
              <Stack spacing={2}>
                {categories.map((cat) => (
                  <Box key={cat.id}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {cat.name}
                      </Typography>
                      {existingBudgets[cat.id] && (
                        <Chip
                          label="Existing"
                          size="small"
                          color="info"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        fullWidth
                        type="number"
                        value={categoryBudgets[cat.id] || 0}
                        onChange={(e) =>
                          handleCategoryChange(
                            cat.id,
                            parseFloat(e.target.value)
                          )
                        }
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                        }}
                      />
                      {existingBudgets[cat.id] && (
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(cat.id)}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />
{/* 
            <Box
              bgcolor={
                remaining < 0
                  ? theme.palette.error.light
                  : theme.palette.success.light
              }
              p={2}
              borderRadius={1}
            > */}
              {/* { <Typography
                variant="body1"
                fontWeight={600}
                color={
                  remaining < 0 ? "error.main" : "success.dark"
                }
              >
                Remaining Budget: ₹{Math.max(remaining, 0).toLocaleString()}
              </Typography> }
              {remaining < 0 && (
                <Typography variant="caption" color="error.main">
                   You've exceeded your budget by ₹{Math.abs(remaining).toLocaleString()}
                 </Typography>
               )}
            </Box> */}

            <Button
              fullWidth
              variant="contained"
              onClick={onSubmit}
              disabled={remaining < 0 || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Saving..." : "Save Budget"}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}