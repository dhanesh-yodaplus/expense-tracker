import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Verified as VerifiedIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  LockClock as LockClockIcon,
} from "@mui/icons-material";
import axiosInstance from "../services/axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("pending_email");

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axiosInstance.post("/verify-email/", { email, otp });
      setMessage(res.data.message || "Email verified successfully!");
      
      localStorage.setItem("email_verified", "true");
      
      setTimeout(() => {
        localStorage.removeItem("pending_email");
        navigate("/dashboard", { state: { emailVerified: true } });
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.otp?.[0] ||
        err.response?.data?.detail ||
        "Verification failed. Please check the OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setMessage("");
    
    try {
      await axiosInstance.post("/resend-otp/", { email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Failed to resend OTP. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center",
      padding: 2
    }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 0, // Square edges
          border: "1px solid #e0e0e0", // Thin square border
        }}
      >
        <Box textAlign="center" mb={3}>
          <VerifiedIcon
            color="primary"
            sx={{ fontSize: 60, mb: 1 }}
          />
          <Typography variant="h5" component="h1" fontWeight={600}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            We've sent a 6-digit code to <strong>{email}</strong>
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Verification Code"
          variant="outlined"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockClockIcon color="action" />
              </InputAdornment>
            ),
            style: { borderRadius: 0 } // Square input field
          }}
          placeholder="Enter 6-digit code"
          error={!!error}
          helperText={error ? "" : " "}
        />

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleVerify}
            disabled={loading || !otp || otp.length < 6}
            size="large"
            sx={{ 
              borderRadius: 0, // Square button
              height: 48
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify Email"
            )}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleResend}
            disabled={resending}
            size="large"
            sx={{ 
              borderRadius: 0, // Square button
              height: 48
            }}
          >
            {resending ? (
              <CircularProgress size={20} />
            ) : (
              "Resend OTP"
            )}
          </Button>
        </Stack>

        <Box mt={3} textAlign="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/register")}
            sx={{ 
              color: "text.secondary",
              borderRadius: 0 // Square button
            }}
          >
            Back to Registration
          </Button>
        </Box>

        {message && (
          <Alert
            severity="success"
            sx={{ mt: 3, borderRadius: 0 }} // Square alert
            icon={<EmailIcon fontSize="small" />}
          >
            {message}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 3, borderRadius: 0 }} // Square alert
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}