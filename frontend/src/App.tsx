import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashborad";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./components/Registration";
import Layout from "./components/Layout";
import VerifyEmail from "./components/VerifyEmail";
import AboutUs from "./components/AboutUs";

export default function App() {
  return (
    <Routes>
      {/* Wrap all routes that need the navbar in Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/about" element={<AboutUs />} />
      </Route>

      {/* Public Routes outside Layout */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
}
