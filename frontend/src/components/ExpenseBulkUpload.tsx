import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import axiosInstance from "../services/axios";
import {
  CloudUpload,
  Close,
  Description,
  CheckCircle,
  Error,
} from "@mui/icons-material";

export default function ExpenseBulkUpload({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ row: number; errors: string[] }[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type === "text/csv" || selected.name.endsWith('.csv')) {
        setFile(selected);
        setGeneralError(null);
      } else {
        setFile(null);
        setGeneralError("Only CSV files are allowed.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setSuccessCount(null);
    setErrors([]);
    setGeneralError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosInstance.post("/expenses/upload/bulk/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessCount(res.data.success_count);
      setErrors(res.data.errors || []);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setGeneralError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSuccessCount(null);
    setErrors([]);
    setGeneralError(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        width: "100%",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight={600}>
          Bulk Expense Upload
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Upload a CSV file containing your expense records. The file should include
        columns for date, amount, category, and description.
      </Typography>

      {!file ? (
        <Card
          variant="outlined"
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            backgroundColor: theme.palette.action.hover,
            textAlign: "center",
            p: 4,
            mb: 3,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <label htmlFor="csv-upload">
            <Stack alignItems="center" spacing={2}>
              <CloudUpload fontSize="large" color="action" />
              <Typography variant="body1">
                Drag and drop your CSV file here, or click to browse
              </Typography>
              <Button variant="contained" component="span">
                Select File
              </Button>
            </Stack>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Description color="primary" />
                <div>
                  <Typography variant="body1">{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </div>
              </Box>
              <IconButton onClick={handleRemoveFile} size="small">
                <Close />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

      {successCount !== null && (
        <Alert
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ mb: 3 }}
        >
          <Typography fontWeight={600}>
            Successfully processed {successCount} expense records
          </Typography>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert
          severity="warning"
          icon={<Error fontSize="inherit" />}
          sx={{ mb: 3 }}
        >
          <Typography fontWeight={600} gutterBottom>
            {errors.length} record(s) had errors
          </Typography>
          <List dense sx={{ py: 0, maxHeight: 200, overflow: "auto" }}>
            {errors.map((e, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={`Row ${e.row}`}
                  secondary={e.errors.join(", ")}
                  secondaryTypographyProps={{ color: "error.main" }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          onClick={onClose}
          color="inherit"
          disabled={uploading}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={uploading ? null : <CloudUpload />}
        >
          {uploading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            "Upload File"
          )}
        </Button>
      </Stack>
    </Paper>
  );
}