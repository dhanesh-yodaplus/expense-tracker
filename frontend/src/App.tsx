import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashborad";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./components/Registration";
import Layout from "./components/Layout"; // Layout with dark mode toggle
import VerifyEmail from "./components/VerifyEmail"; // ✅ New component

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* ✅ OTP route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}
