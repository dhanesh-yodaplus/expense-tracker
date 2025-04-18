import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../services/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Email,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Badge,
  HowToReg,
} from "@mui/icons-material";

const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    username: z.string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
    first_name: z.string()
      .min(1, "First name is required")
      .max(50, "First name cannot exceed 50 characters"),
    last_name: z.string()
      .min(1, "Last name is required")
      .max(50, "Last name cannot exceed 50 characters"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await axiosInstance.post("/register/", {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      toast.success("Registration successful! Please verify email with OTP...");
      setTimeout(() => navigate("/verify-email", { state: { email: data.email } }), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.email?.[0] || 
                         err.response?.data?.username?.[0] || 
                         err.response?.data?.detail || 
                         "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              <HowToReg fontSize="large" color="primary" sx={{ mb: 1 }} />
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                Create Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join us to start managing your finances
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register("first_name")}
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register("last_name")}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                </Grid>
              </Grid>

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
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                label="Username"
                fullWidth
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
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
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
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
                        aria-label="toggle confirm password visibility"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register("confirm_password")}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                startIcon={<HowToReg />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  mt: 3,
                }}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                Already have an account?{" "}
                <Link
                  to="/"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}