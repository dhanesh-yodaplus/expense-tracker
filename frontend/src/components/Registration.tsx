import React from "react";
import { Link } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../services/axios";
import { useNavigate } from "react-router-dom";

// ✅ Zod schema without role
const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string().min(3, "Username must be at least 3 characters"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await axiosInstance.post("/register/", {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registered successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Username"
            fullWidth
            margin="normal"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            {...register("first_name")}
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />

          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            {...register("last_name")}
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("confirm_password")}
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
          <Box mt={2} textAlign="center">
            Already registered?{" "}
            <Link
              to="/"
              style={{ color: "#3f51b5", textDecoration: "underline" }}
            >
              Click here to login
            </Link>
          </Box>
        </form>
      </Box>
    </Container>
  );
}
