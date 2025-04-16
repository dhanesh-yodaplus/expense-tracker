import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../services/axios";
import {TextField,Button,Box,Typography,Container,Alert} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';


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
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axiosInstance.post("/login-expense/", data);
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
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
