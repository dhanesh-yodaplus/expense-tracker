import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../services/axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
} from "@mui/icons-material";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/login-expense/", data);
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Login failed. Please check your credentials.";
      toast.error(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        hideProgressBar={true}
        closeButton={false}
        toastStyle={{ borderRadius: "8px" }}
      />
      
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: "none",
            }}
          >
            <Box textAlign="center" mb={4}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to access your financial dashboard
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Email Address"
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 1 }}
              />

              <Box textAlign="right" mb={3}>
                <MuiLink 
                  component={Link} 
                  to="/forgot-password" 
                  variant="body2"
                  sx={{ textDecoration: "none" }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                Don't have an account?{" "}
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  }}
                >
                  Create one
                </MuiLink>
              </Typography>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}