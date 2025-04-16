import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../services/axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axiosInstance.post("/login-expense/", data);
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Login failed";
      toast.error(detail);
    }
  };

  return (
    <Container maxWidth="sm">
      <ToastContainer position="top-right" autoClose={2000}  aria-label="Login"/>
      <Box
  sx={(theme) => ({
    mt: 8,
    p: 4,
    borderRadius: 3,
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 12px rgba(0,0,0,0.7)"
        : "0 2px 10px rgba(0,0,0,0.1)",
    border: theme.palette.mode === "dark" ? "1px solid #2a2d35" : "none",
  })}
>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email", { required: "Email is required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}
