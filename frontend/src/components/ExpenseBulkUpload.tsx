import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../services/axios";

export default function ExpenseBulkUpload({
  onClose,
}: {
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ row: number; errors: string[] }[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "text/csv") {
      setFile(selected);
    } else {
      setFile(null);
      setGeneralError("Only CSV files are allowed.");
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
      setGeneralError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <Typography variant="h6">Bulk Upload Expenses</Typography>

      {successCount !== null && (
        <Alert severity="success">
          Successfully uploaded {successCount} expenses.
        </Alert>
      )}

      {generalError && <Alert severity="error">{generalError}</Alert>}

      {errors.length > 0 && (
        <Alert severity="error">
          {errors.length} row(s) failed.
          <ul style={{ marginTop: 4 }}>
            {errors.map((e, idx) => (
              <li key={idx}>
                Row {e.row}: {e.errors.join(", ")}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ marginTop: 8 }}
      />

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? <CircularProgress size={20} /> : "Upload CSV"}
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
