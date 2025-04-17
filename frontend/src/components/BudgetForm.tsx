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
} from "@mui/material";
import axiosInstance from "../services/axios";
import dayjs from "dayjs";

type BudgetFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Category = {
  id: number;
  name: string;
};

type BudgetItem = {
  id: number;
  category: number;
  amount: number;
};

export default function BudgetForm({
  open,
  onClose,
  onSuccess,
}: BudgetFormProps): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<number, number>>({});
  const [existingBudgetIds, setExistingBudgetIds] = useState<Record<number, number>>({});
  const [monthlyCap, setMonthlyCap] = useState<number>(0);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  // Fetch categories and budgets for selected month
  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      try {
        const catRes = await axiosInstance.get("/categories/?type=expense");
        setCategories(catRes.data);

        const budgetRes = await axiosInstance.get(`/budgets/by-month/?month=${month}`);
        const budgets: BudgetItem[] = budgetRes.data;

        const catBudgetMap: Record<number, number> = {};
        const idMap: Record<number, number> = {};

        budgets.forEach((b) => {
          catBudgetMap[b.category] = b.amount;
          idMap[b.category] = b.id;
        });

        setCategoryBudgets(catBudgetMap);
        setExistingBudgetIds(idMap);
      } catch {
        setCategories([]);
        setCategoryBudgets({});
        setExistingBudgetIds({});
      }
    };

    fetchAll();
  }, [open, month]);

  const handleCategoryChange = (id: number, value: number) => {
    setCategoryBudgets((prev) => ({ ...prev, [id]: value }));
  };

  const handleDelete = async (catId: number) => {
    const budgetId = existingBudgetIds[catId];
    if (!budgetId) return;

    try {
      await axiosInstance.delete(`/budgets/${budgetId}/`);
      setCategoryBudgets((prev) => {
        const updated = { ...prev };
        delete updated[catId];
        return updated;
      });
      setExistingBudgetIds((prev) => {
        const updated = { ...prev };
        delete updated[catId];
        return updated;
      });
    } catch {
      setError("Failed to delete budget.");
    }
  };

  const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
  const remaining = monthlyCap - totalAllocated;

  const onSubmit = async () => {
    setError("");

    if (totalAllocated > monthlyCap) {
      setError("Total exceeds monthly budget cap.");
      return;
    }

    try {
      await axiosInstance.post("/budgets/monthlybudgets/", {
        amount: monthlyCap,
        month: `${month}-01`,
      });

      const requests = Object.entries(categoryBudgets).map(async ([catId, amount]) => {
        const category = parseInt(catId);
        const budgetId = existingBudgetIds[category];

        const payload = {
          category,
          amount,
          month: `${month}-01`,
        };

        return budgetId
          ? axiosInstance.put(`/budgets/${budgetId}/`, payload)
          : axiosInstance.post("/budgets/", payload);
      });

      await Promise.all(requests);
      onSuccess();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Set Monthly Budget</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Monthly Budget"
            type="number"
            value={monthlyCap}
            onChange={(e) => setMonthlyCap(parseInt(e.target.value || "0"))}
          />

          <TextField
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <Typography fontWeight={600}>Category Allocations</Typography>
          {categories.map((cat) => {
            const value = categoryBudgets[cat.id] || "";
            const isSet = existingBudgetIds.hasOwnProperty(cat.id);

            return (
              <Stack key={cat.id} direction="row" spacing={2} alignItems="center">
                <TextField
                  label={cat.name}
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleCategoryChange(cat.id, parseInt(e.target.value || "0"))
                  }
                />
                {isSet && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(cat.id)}
                  >
                    Delete
                  </Button>
                )}
              </Stack>
            );
          })}

          <Typography color={remaining < 0 ? "error" : "success.main"}>
            Remaining Budget: ₹{remaining}
          </Typography>

          <Button
            type="button"
            variant="contained"
            onClick={onSubmit}
            disabled={remaining < 0}
          >
            Save
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
